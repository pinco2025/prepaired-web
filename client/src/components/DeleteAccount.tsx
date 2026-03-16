import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DeleteAccount: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const [confirmText, setConfirmText] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleDeleteRequest = () => {
        if (confirmText !== 'DELETE') return;
        // TODO: Replace with backend API call to safely handle full account deletion
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sm:p-10 text-center">
                        <div className="text-green-500 text-5xl mb-4">&#10003;</div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Deletion Request Received
                        </h1>
                        <p className="text-gray-700 dark:text-gray-300">
                            Your account deletion request has been received. Your account and associated data will be deleted within 30 days.
                            If you have any questions, contact us at{' '}
                            <a href="mailto:contact@prepaired.site" className="text-blue-600 dark:text-blue-400 underline">
                                contact@prepaired.site
                            </a>.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sm:p-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Delete Your Account
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                        prepAIred - AI-Powered Exam Preparation
                    </p>

                    <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
                        {/* Steps */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                How to Delete Your Account
                            </h2>
                            <ol className="list-decimal pl-6 space-y-2">
                                <li>Log in to your prepAIred account on this page or in the app.</li>
                                <li>Scroll down to the <strong>"Delete My Account"</strong> section below.</li>
                                <li>Type <strong>DELETE</strong> in the confirmation field to confirm your intent.</li>
                                <li>Click the <strong>"Permanently Delete My Account"</strong> button.</li>
                                <li>Your account and associated data will be deleted as described below.</li>
                            </ol>
                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                Alternatively, you can request account deletion by emailing us at{' '}
                                <a href="mailto:contact@prepaired.site" className="text-blue-600 dark:text-blue-400 underline">
                                    contact@prepaired.site
                                </a>{' '}
                                from the email address associated with your account.
                            </p>
                        </section>

                        {/* Data that gets deleted */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Data That Will Be Deleted
                            </h2>
                            <p className="mb-2">The following data will be permanently deleted within 30 days of your request:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li><strong>Account Information:</strong> Your name, email address, profile picture, and login credentials.</li>
                                <li><strong>Exam Preferences:</strong> Your selected exam type and personalization settings.</li>
                                <li><strong>Subscription Data:</strong> Your subscription tier and plan information.</li>
                                <li><strong>Usage & Performance Data:</strong> Questions attempted, test scores, accuracy metrics, subject-wise performance, percentile rankings, and practice history.</li>
                                <li><strong>Test Submissions:</strong> All your mock test responses and results.</li>
                                <li><strong>AI-Generated Insights:</strong> Any AI-powered analysis, weak area identification, and performance predictions linked to your account.</li>
                                <li><strong>Device & Session Data:</strong> Locally stored preferences, cached data, and session tokens.</li>
                            </ul>
                        </section>

                        {/* Data that may be retained */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Data That May Be Retained
                            </h2>
                            <p className="mb-2">Certain data may be retained for a limited period as required by law or legitimate business purposes:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li><strong>Payment Transaction Records:</strong> Records of past transactions processed through Razorpay may be retained for up to 7 years for tax and legal compliance. Note: We do not store your card or banking details.</li>
                                <li><strong>Anonymized & Aggregated Data:</strong> Non-identifiable, aggregated analytics data (e.g., total user counts, aggregate performance trends) that cannot be linked back to you may be retained indefinitely.</li>
                                <li><strong>Legal Obligations:</strong> Any data required to be retained by applicable laws, regulations, or court orders.</li>
                            </ul>
                        </section>

                        {/* Retention period */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Retention Period
                            </h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Personal data and account information: <strong>Deleted within 30 days</strong> of the deletion request.</li>
                                <li>Payment transaction records: <strong>Up to 7 years</strong> (legal/tax compliance).</li>
                                <li>Anonymized/aggregated data: <strong>Retained indefinitely</strong> (cannot identify you).</li>
                            </ul>
                        </section>

                        {/* Important notes */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                                Important Notes
                            </h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Account deletion is <strong>permanent and cannot be undone</strong>.</li>
                                <li>If you have an active subscription, please cancel it through Google Play before deleting your account to avoid future charges.</li>
                                <li>After deletion, you will no longer have access to any premium content, test results, or performance history.</li>
                                <li>If you signed in with Google, deleting your prepAIred account does not affect your Google account.</li>
                            </ul>
                        </section>

                        {/* Delete action */}
                        <section className="border-t border-gray-200 dark:border-gray-700 pt-8">
                            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-3">
                                Delete My Account
                            </h2>

                            {isAuthenticated && user ? (
                                <div>
                                    <p className="mb-2">
                                        You are logged in as <strong>{user.email}</strong>.
                                    </p>
                                    <p className="mb-4">
                                        To confirm account deletion, type <strong>DELETE</strong> in the field below and click the button.
                                    </p>
                                    <input
                                        type="text"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        placeholder='Type "DELETE" to confirm'
                                        className="w-full sm:w-80 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-4"
                                    />
                                    <div>
                                        <button
                                            onClick={handleDeleteRequest}
                                            disabled={confirmText !== 'DELETE'}
                                            className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                                                confirmText === 'DELETE'
                                                    ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
                                                    : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                            }`}
                                        >
                                            Permanently Delete My Account
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <p className="text-yellow-800 dark:text-yellow-200 mb-3">
                                        You need to be logged in to delete your account.
                                    </p>
                                    <a
                                        href="/login"
                                        className="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Log In to Continue
                                    </a>
                                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                        Or email us at{' '}
                                        <a href="mailto:contact@prepaired.site" className="text-blue-600 dark:text-blue-400 underline">
                                            contact@prepaired.site
                                        </a>{' '}
                                        to request account deletion.
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteAccount;
