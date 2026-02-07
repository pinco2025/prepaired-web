import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRazorpay } from '../hooks/useRazorpay';
import PaymentSuccessOverlay from './PaymentSuccessOverlay';

const PricingPlans: React.FC = () => {
    const navigate = useNavigate();
    const { user, subscriptionType, refreshSubscription, isAuthenticated } = useAuth();
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

    const {
        initiateSubscription,
        loading: paymentLoading,
        error: paymentError,
        showSuccess,
        successPlanType,
        handleSuccessComplete
    } = useRazorpay({
        refreshSubscription,
        onPaymentSuccess: () => {
            // Navigate to dashboard or refresh page after success
            navigate('/question-set');
        }
    });

    const isCurrentPlan = (tier: string) => {
        if (!subscriptionType) return tier === 'free';
        return subscriptionType.toLowerCase() === tier.toLowerCase();
    };

    const handleUpgrade = async () => {
        if (!isAuthenticated || !user) {
            // Redirect to login if not authenticated
            navigate('/login');
            return;
        }

        const success = await initiateSubscription({
            userId: user.id,
            userEmail: user.email,
            userName: user.user_metadata?.full_name || user.user_metadata?.name
        });

        if (!success && !paymentError) {
            // User cancelled the payment modal
            console.log('Payment cancelled by user');
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative h-full">
            <div className="flex-1 overflow-y-auto sidebar-scroll">
                {/* Grid background - matching website design */}
                <div
                    className="absolute inset-0 grid-bg-light dark:grid-bg-dark opacity-60 dark:opacity-40 pointer-events-none h-[600px]"
                    style={{
                        maskImage: 'linear-gradient(to bottom, white, transparent)',
                        WebkitMaskImage: 'linear-gradient(to bottom, white, transparent)',
                    }}
                />

                <div className="relative max-w-7xl mx-auto flex flex-col gap-10 p-6 md:p-10 pb-20">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center gap-4 pt-4">
                        <h1 className="text-text-light dark:text-text-dark text-3xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
                            Invest in your future rank
                        </h1>
                        <p className="text-text-secondary-light dark:text-text-secondary-dark text-base md:text-lg font-normal leading-normal max-w-2xl">
                            Unlock the full potential of AI-driven preparation. Choose the plan that fits your ambition.
                        </p>

                        {/* Billing Toggle */}
                        <div className="mt-4 flex items-center bg-surface-light dark:bg-surface-dark rounded-full p-1.5 shadow-sm ring-1 ring-border-light dark:ring-border-dark">
                            <button
                                onClick={() => setBillingPeriod('monthly')}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${billingPeriod === 'monthly'
                                    ? 'bg-text-light dark:bg-text-dark text-white dark:text-gray-900 shadow-lg'
                                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                disabled
                                className="px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors text-text-secondary-light/50 dark:text-text-secondary-dark/50 cursor-not-allowed"
                            >
                                Yearly
                                <span className="material-symbols-outlined text-[16px]">lock</span>
                            </button>
                        </div>

                        {/* Payment Error Message */}
                        {paymentError && (
                            <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">error</span>
                                {paymentError}
                            </div>
                        )}
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start mt-4">
                        {/* Free Plan */}
                        <div className="relative flex flex-col rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-8 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-semibold text-text-secondary-light dark:text-text-secondary-dark">Free</h3>
                            <div className="mt-4 mb-6 flex items-baseline text-text-light dark:text-text-dark">
                                <span className="text-4xl font-bold tracking-tight">₹0</span>
                                <span className="ml-1 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">/month</span>
                            </div>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6 min-h-[40px]">
                                Essential tools for getting started with your JEE/NEET journey.
                            </p>
                            <button
                                disabled={isCurrentPlan('free')}
                                className={`mb-8 block w-full rounded-xl px-4 py-3 text-center text-sm font-semibold transition-colors ${isCurrentPlan('free')
                                    ? 'bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark cursor-default'
                                    : 'bg-gray-100 dark:bg-gray-800 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {isCurrentPlan('free') ? 'Current Plan' : 'Downgrade'}
                            </button>
                            <div className="space-y-4">
                                {['Daily Practice Questions', '2026 PYQs', 'In-Depth PYQ solutions', 'Limited access to Super-30'].map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark text-[20px] shrink-0">check</span>
                                        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lite Plan - Popular (formerly Pro) */}
                        <div className="relative flex flex-col rounded-2xl bg-surface-light dark:bg-surface-dark p-8 shadow-2xl ring-2 ring-primary transform md:scale-105 z-10" style={{ boxShadow: '0 0 40px -10px rgba(19,91,236,0.15)' }}>
                            <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white shadow-sm uppercase tracking-wide">
                                    Most Popular
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-primary">Lite</h3>
                            <div className="mt-4 mb-6 flex items-baseline text-text-light dark:text-text-dark gap-2">
                                <span className="text-2xl font-medium text-text-secondary-light dark:text-text-secondary-dark line-through">₹399</span>
                                <span className="text-5xl font-black tracking-tight">₹119</span>
                                <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">/month</span>
                            </div>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6 min-h-[40px]">
                                Handcrafted resources prepAIred by IITians.
                            </p>
                            <button
                                onClick={handleUpgrade}
                                disabled={isCurrentPlan('lite') || isCurrentPlan('ipft-01-2026') || paymentLoading}
                                className={`mb-8 w-full rounded-xl px-4 py-3.5 text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${(isCurrentPlan('lite') || isCurrentPlan('ipft-01-2026'))
                                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-default'
                                    : paymentLoading
                                        ? 'bg-primary/70 text-white cursor-wait'
                                        : 'bg-primary text-white shadow-primary/25 hover:bg-primary-dark hover:scale-[1.02]'
                                    }`}
                            >
                                {paymentLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Processing...
                                    </>
                                ) : (isCurrentPlan('lite') || isCurrentPlan('ipft-01-2026')) ? 'Current Plan' : 'Upgrade to Lite'}
                            </button>
                            <div className="space-y-4">
                                {[
                                    'Everything in Free',
                                    { text: 'Unlimited ', bold: 'Condensed PYQs' },
                                    { text: '', bold: 'Early Access to upcoming sets' },
                                    'High-quality, detailed solution showcase',
                                    'Access to upcoming Statement Based, Speed Booster & Level 2 PYQ sets',
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="rounded-full bg-primary/10 p-0.5 text-primary">
                                            <span className="material-symbols-outlined text-[18px] font-bold">check</span>
                                        </div>
                                        <span className="text-sm font-medium text-text-light dark:text-text-dark">
                                            {typeof feature === 'string' ? feature : (
                                                <>{feature.text}<span className="font-bold">{feature.bold}</span></>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Elite Plan - Coming Soon */}
                        <div className="relative flex flex-col rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark p-8 shadow-sm overflow-hidden">
                            {/* Coming Soon Overlay */}
                            <div className="absolute inset-0 bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 animate-premium-icon">
                                    <span className="material-symbols-outlined text-3xl text-white" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                                </div>
                                <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-2">Coming Soon</h3>
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center max-w-[200px]">
                                    Elite mentorship program launching soon!
                                </p>
                            </div>

                            {/* Card Content (blurred behind overlay) */}
                            <h3 className="text-lg font-semibold text-text-light dark:text-text-dark">Elite</h3>
                            <div className="mt-4 mb-6 flex items-baseline text-text-light dark:text-text-dark">
                                <span className="text-4xl font-bold tracking-tight">₹999</span>
                                <span className="ml-1 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">/month</span>
                            </div>
                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-6 min-h-[40px]">
                                Personalized mentorship for students aiming for top ranks.
                            </p>
                            <button className="mb-8 block w-full rounded-xl bg-white dark:bg-gray-800 border-2 border-text-light dark:border-text-dark px-4 py-3 text-center text-sm font-bold text-text-light dark:text-text-dark">
                                Get Elite
                            </button>
                            <div className="space-y-4">
                                {[
                                    'Everything in Lite',
                                    { text: '', bold: 'Super 30 Sets', suffix: ' (Curated)' },
                                    '1-on-1 Strategy Mentorship',
                                    'Priority Doubt Solving',
                                    'Offline Download Access',
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary text-[20px] shrink-0">check</span>
                                        <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                            {typeof feature === 'string' ? feature : (
                                                <><span className="font-bold">{feature.bold}</span>{feature.suffix}</>
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Success Overlay */}
            <PaymentSuccessOverlay
                isVisible={showSuccess}
                planType={successPlanType}
                onComplete={handleSuccessComplete}
                countdownSeconds={5}
            />
        </div>
    );
};

export default PricingPlans;
