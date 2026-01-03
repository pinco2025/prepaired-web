import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const PaymentPage: React.FC = () => {
  const { user, subscriptionType } = useAuth();
  const navigate = useNavigate();

  // Redirect if already subscribed
  useEffect(() => {
    if (subscriptionType && subscriptionType !== 'free') {
      navigate('/dashboard');
    }
  }, [subscriptionType, navigate]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpay();

    if (!res) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    // Razorpay options
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_RzH77YIQvKB8er", // Use env var or fallback to the provided key
      amount: "50000", // 500.00 INR
      currency: "INR",
      name: "prepAIred",
      description: "Upgrade to Premium Plan",
      image: "https://drive.google.com/thumbnail?id=1yLtX3YxubbDBsKYDj82qiaGbSkSX7aLv&sz=w1000",
      handler: async function (response: any) {
        // alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        try {
          if (user) {
            // SECURITY WARNING:
            // Updating the subscription tier directly from the client is insecure and should only be used for testing/prototyping.
            // In a production environment, you must handle payment verification (signature check) and database updates
            // on a secure backend (e.g., Supabase Edge Functions or a Node.js server) using a service role key.
            // This prevents users from manually calling this update function to bypass payment.

            // 1. Try to update user metadata (this usually works for the user themselves)
            const { error: metaError } = await supabase.auth.updateUser({
              data: { subscription_tier: 'IPFT-01-2026' }
            });

            if (metaError) console.error('Error updating metadata:', metaError);

            // 2. Try to update the 'users' table
            const { error: tableError } = await supabase
              .from('users')
              .update({ subscription_tier: 'IPFT-01-2026' })
              .eq('id', user.id);

            if (tableError) {
                console.error('Error updating users table:', tableError);
            }

            if (metaError && tableError) {
                alert('Payment successful, but failed to update subscription status. Please contact support.');
            } else {
                // Do not reload. AuthContext listens to onAuthStateChange (triggered by updateUser)
                // and will update the state. The useEffect above will then redirect to /dashboard.
                // We add a small manual delay or check just in case, but usually unnecessary.
            }
          }
        } catch (err) {
          console.error(err);
          alert('An error occurred while updating your subscription.');
        }
      },
      prefill: {
        name: user?.user_metadata?.full_name || "",
        email: user?.email || "",
        contact: ""
      },
      theme: {
        color: "#3B82F6"
      }
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary opacity-[0.05] blur-[100px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 opacity-[0.05] blur-[100px] rounded-full"></div>
        </div>

      <div className="max-w-md w-full bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl p-8 border border-border-light dark:border-border-dark">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary bg-opacity-10 mb-4">
             <span className="material-icons-outlined text-3xl text-primary">diamond</span>
          </div>
          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark mb-2">Upgrade to Premium</h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark">
            Unlock full access to tests, analytics, and study plans.
          </p>
        </div>

        <div className="space-y-4 mb-8">
            <div className="flex items-center p-3 rounded-lg bg-background-light dark:bg-background-dark">
                <span className="material-icons-outlined text-green-500 mr-3">check_circle</span>
                <span className="text-text-light dark:text-text-dark font-medium">Unlimited Practice Tests</span>
            </div>
            <div className="flex items-center p-3 rounded-lg bg-background-light dark:bg-background-dark">
                <span className="material-icons-outlined text-green-500 mr-3">check_circle</span>
                <span className="text-text-light dark:text-text-dark font-medium">Detailed Performance Analytics</span>
            </div>
            <div className="flex items-center p-3 rounded-lg bg-background-light dark:bg-background-dark">
                <span className="material-icons-outlined text-green-500 mr-3">check_circle</span>
                <span className="text-text-light dark:text-text-dark font-medium">Personalized Study Plans</span>
            </div>
        </div>

        <div className="bg-background-light dark:bg-background-dark rounded-lg p-4 mb-6 flex justify-between items-center border border-border-light dark:border-border-dark">
             <div>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">Total Amount</p>
                <p className="text-xl font-bold text-text-light dark:text-text-dark">₹500.00</p>
             </div>
             <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs font-bold">
                 ONE-TIME
             </div>
        </div>

        <button
          onClick={handlePayment}
          className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl shadow-lg transform transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Pay Now
        </button>

        <div className="mt-4 text-center">
             <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                 Secure payment via Razorpay
             </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
