import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface PaymentParams {
    userId: string;
    planType: string;
    amount: number; // in paise
    userEmail?: string;
    userName?: string;
}

interface UseRazorpayReturn {
    initiatePayment: (params: PaymentParams) => Promise<boolean>;
    loading: boolean;
    error: string | null;
}

const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const useRazorpay = (): UseRazorpayReturn => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initiatePayment = useCallback(async (params: PaymentParams): Promise<boolean> => {
        const { userId, planType, amount, userEmail, userName } = params;
        setLoading(true);
        setError(null);

        try {
            // Load Razorpay SDK
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
            }

            // Call backend to create order
            const requestBody = {
                userId: userId,
                planType: planType,
                amount: amount
            };

            console.log('Creating order with body:', requestBody);

            const response = await fetch('https://prepaired-backend.onrender.com/api/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                // If the API doesn't exist yet, fall back to direct payment (for testing)
                console.warn('create-order API not available, using direct payment mode');
            }

            let orderId: string | undefined;
            try {
                const orderData = await response.json();
                console.log('Order data:', orderData);
                orderId = orderData.orderId; // Backend returns camelCase 'orderId'
            } catch {
                // API might not exist yet - continue without order_id for testing
                console.warn('Could not get order_id, proceeding in test mode');
            }

            // Open Razorpay checkout
            return new Promise((resolve) => {
                const options = {
                    key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_RzH77YIQvKB8er',
                    amount: amount.toString(),
                    currency: 'INR',
                    name: 'prepAIred',
                    description: `Upgrade to ${planType}`,
                    image: 'https://drive.google.com/thumbnail?id=1yLtX3YxubbDBsKYDj82qiaGbSkSX7aLv&sz=w1000',
                    order_id: orderId,
                    handler: async function (response: any) {
                        try {
                            // Update user subscription in Supabase
                            // 1. Update user metadata
                            const { error: metaError } = await supabase.auth.updateUser({
                                data: { subscription_tier: planType }
                            });

                            if (metaError) {
                                console.error('Error updating metadata:', metaError);
                            }

                            // 2. Update users table
                            const { error: tableError } = await supabase
                                .from('users')
                                .update({ subscription_tier: planType })
                                .eq('id', userId);

                            if (tableError) {
                                console.error('Error updating users table:', tableError);
                            }

                            if (metaError && tableError) {
                                setError('Payment successful, but failed to update subscription. Please contact support.');
                                resolve(false);
                            } else {
                                // Success - reload page to update auth state
                                window.location.reload();
                                resolve(true);
                            }
                        } catch (err) {
                            console.error('Error updating subscription:', err);
                            setError('An error occurred while updating your subscription.');
                            resolve(false);
                        }
                    },
                    prefill: {
                        name: userName || '',
                        email: userEmail || '',
                        contact: ''
                    },
                    theme: {
                        color: '#3B82F6'
                    },
                    modal: {
                        ondismiss: function () {
                            setLoading(false);
                            resolve(false);
                        }
                    }
                };

                const paymentObject = new window.Razorpay(options);
                paymentObject.on('payment.failed', function (response: any) {
                    setError(`Payment failed: ${response.error.description}`);
                    setLoading(false);
                    resolve(false);
                });
                paymentObject.open();
            });
        } catch (err: any) {
            setError(err.message || 'An error occurred during payment.');
            setLoading(false);
            return false;
        }
    }, []);

    return { initiatePayment, loading, error };
};

export default useRazorpay;
