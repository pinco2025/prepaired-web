import { useState, useCallback } from 'react';
import { supabase } from '../utils/supabaseClient';

declare global {
    interface Window {
        Razorpay: any;
    }
}



interface SubscriptionParams {
    userId: string;
    userEmail?: string;
    userName?: string;
}

interface UseRazorpayConfig {
    refreshSubscription?: () => Promise<void>;
    onPaymentSuccess?: () => void;
}

interface UseRazorpayReturn {
    initiateSubscription: (params: SubscriptionParams) => Promise<boolean>;
    loading: boolean;
    error: string | null;
    showSuccess: boolean;
    successPlanType: string;
    handleSuccessComplete: () => void;
}

// Cloudflare Workers backend URL for subscription payments
const PAYMENT_API_URL = process.env.REACT_APP_PAYMENT_API_URL || 'https://razorpay-worker.achonam69.workers.dev';

// Razorpay branding
const RAZORPAY_LOGO = 'https://www.prepaired.site/logo.png';
const RAZORPAY_THEME_COLOR = '#3B82F6';

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

export const useRazorpay = (config: UseRazorpayConfig = {}): UseRazorpayReturn => {
    const { refreshSubscription, onPaymentSuccess } = config;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successPlanType, setSuccessPlanType] = useState('');

    // Handler to complete success flow (called when countdown ends)
    const handleSuccessComplete = useCallback(() => {
        setShowSuccess(false);
        setSuccessPlanType('');
        if (onPaymentSuccess) {
            onPaymentSuccess();
        }
    }, [onPaymentSuccess]);

    // Poll for subscription update after Razorpay payment
    // The webhook will update subscription_tier to the expected value
    const pollForSubscriptionUpdate = useCallback(async (
        userId: string,
        expectedPlan: string,
        maxRetries: number = 10,
        delayMs: number = 2000
    ): Promise<boolean> => {
        for (let i = 0; i < maxRetries; i++) {
            // Wait before checking
            await new Promise(resolve => setTimeout(resolve, delayMs));

            try {
                const { data } = await supabase
                    .from('users')
                    .select('subscription_tier')
                    .eq('id', userId)
                    .single();

                // Check if subscription is updated to expected plan by webhook
                if (data?.subscription_tier?.toLowerCase() === expectedPlan.toLowerCase()) {
                    return true;
                }
            } catch (err) {
                console.error('Error polling subscription:', err);
            }
        }
        return false;
    }, []);

    // Subscription flow via Cloudflare backend (for prepAIred Lite recurring subscription)
    const initiateSubscription = useCallback(async (params: SubscriptionParams): Promise<boolean> => {
        const { userId, userEmail, userName } = params;
        setLoading(true);
        setError(null);

        try {
            // Load Razorpay SDK
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
            }

            // Call Cloudflare backend to create subscription
            const response = await fetch(`${PAYMENT_API_URL}/create-subscription`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Subscription API Error:', errorText);
                throw new Error('Failed to create subscription. Please try again.');
            }

            const { subscriptionId } = await response.json();

            if (!subscriptionId) {
                throw new Error('Invalid subscription response from server.');
            }

            // Open Razorpay checkout in subscription mode
            return new Promise((resolve) => {
                const options = {
                    key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_live_RzY00fyQy6Y9XD',
                    subscription_id: subscriptionId,
                    name: 'prepAIred',
                    description: 'prepAIred Lite - Monthly Subscription',
                    image: RAZORPAY_LOGO,
                    handler: async function (_response: any) {
                        try {
                            // DO NOT directly update the database here
                            // The Razorpay webhook will handle updating subscription_tier to 'lite'

                            // Poll the database to wait for webhook to process
                            const subscriptionUpdated = await pollForSubscriptionUpdate(userId, 'lite');

                            if (!subscriptionUpdated) {
                                // Even if polling didn't detect the update, the payment was successful
                                // The webhook might just be delayed - show success anyway
                                console.warn('Polling timeout - webhook may still be processing');
                            }

                            // Refresh auth context to pick up new subscription
                            if (refreshSubscription) {
                                await refreshSubscription();
                            }

                            // Show success overlay
                            setSuccessPlanType('prepAIred Lite');
                            setShowSuccess(true);

                            setLoading(false);
                            resolve(true);
                        } catch (err) {
                            console.error('Error processing subscription:', err);
                            setError('Payment successful! Your subscription will be activated shortly.');
                            setLoading(false);
                            resolve(true); // Still resolve true since payment was successful
                        }
                    },
                    prefill: {
                        name: userName || '',
                        email: userEmail || '',
                        contact: ''
                    },
                    theme: {
                        color: RAZORPAY_THEME_COLOR
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
    }, [pollForSubscriptionUpdate, refreshSubscription]);

    return {
        initiateSubscription,
        loading,
        error,
        showSuccess,
        successPlanType,
        handleSuccessComplete
    };
};

export default useRazorpay;
