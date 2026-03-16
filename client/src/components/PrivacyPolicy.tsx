import React from 'react';

const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 sm:p-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                        Last updated: March 16, 2026
                    </p>

                    <div className="space-y-8 text-gray-700 dark:text-gray-300 leading-relaxed">
                        {/* Introduction */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">1. Introduction</h2>
                            <p>
                                Welcome to <strong>prepAIred</strong> ("we," "our," or "us"). We are committed to protecting your privacy and ensuring
                                the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard
                                your information when you use our mobile application (available on Google Play) and our website at{' '}
                                <a href="https://www.prepaired.site" className="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noopener noreferrer">
                                    www.prepaired.site
                                </a>{' '}
                                (collectively, the "Service").
                            </p>
                            <p className="mt-2">
                                By using our Service, you agree to the collection and use of information in accordance with this policy. If you do not
                                agree with this policy, please do not use our Service.
                            </p>
                        </section>

                        {/* Information We Collect */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">2. Information We Collect</h2>

                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">2.1 Information You Provide</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li><strong>Account Information:</strong> Full name, email address, and password when you create an account.</li>
                                <li><strong>Google Sign-In Data:</strong> If you sign in with Google, we receive your name, email address, and profile picture from your Google account.</li>
                                <li><strong>Exam Preferences:</strong> Your target exam type (e.g., JEE, NEET, Board Exams) to personalize your experience.</li>
                                <li><strong>Payment Information:</strong> When you purchase a subscription or paid feature, payment is processed by our third-party payment processor (Razorpay). We do not store your credit/debit card details or banking information on our servers.</li>
                            </ul>

                            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">2.2 Information Collected Automatically</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li><strong>Usage Data:</strong> Information about how you interact with the Service, including questions attempted, test scores, accuracy metrics, time spent, and practice patterns.</li>
                                <li><strong>Performance Analytics:</strong> Subject-wise performance breakdowns, percentile rankings, focus areas, and learning progress data.</li>
                                <li><strong>Device Information:</strong> Device type, operating system version, unique device identifiers, and mobile network information.</li>
                                <li><strong>Log Data:</strong> IP address, browser type, access times, pages viewed, and referring URLs.</li>
                                <li><strong>Local Storage Data:</strong> We store certain data locally on your device (such as cached exam preferences and session data) to improve app performance.</li>
                            </ul>
                        </section>

                        {/* How We Use Information */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">3. How We Use Your Information</h2>
                            <p>We use the information we collect for the following purposes:</p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li><strong>Providing the Service:</strong> To create and manage your account, deliver practice questions, mock tests, previous year questions (PYQs), and personalized study content.</li>
                                <li><strong>Personalization:</strong> To tailor content and recommendations based on your exam type, performance, and learning patterns.</li>
                                <li><strong>AI-Powered Features:</strong> To power AI-driven test preparation, adaptive question recommendations, performance predictions, and weak area identification.</li>
                                <li><strong>Analytics & Insights:</strong> To generate performance dashboards, percentile rankings, accuracy reports, and subject mastery tracking.</li>
                                <li><strong>Payment Processing:</strong> To process subscriptions, in-app purchases, and paid features through our payment partners.</li>
                                <li><strong>Communication:</strong> To send you important updates, service notifications, and promotional materials (with your consent).</li>
                                <li><strong>Improvement:</strong> To analyze usage trends, debug issues, and improve the Service's features and performance.</li>
                                <li><strong>Security:</strong> To detect and prevent fraud, abuse, and unauthorized access.</li>
                            </ul>
                        </section>

                        {/* Paid Features and Subscriptions */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">4. Paid Features & Subscriptions</h2>
                            <p>
                                Our Service offers both free and paid tiers, including but not limited to:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Monthly and annual subscription plans with access to premium content, unlimited practice sets, detailed solutions, and advanced analytics.</li>
                                <li>One-time purchase options for specific test series, study materials, or premium question banks.</li>
                                <li>In-app purchases for additional features, mentorship sessions, or specialized preparation modules.</li>
                            </ul>
                            <p className="mt-2">
                                All payments are processed securely through <strong>Razorpay</strong>, our third-party payment gateway. We receive
                                transaction confirmation details (such as subscription ID and payment status) but do not have access to your
                                full payment card details. Razorpay's privacy policy governs the handling of your payment information.
                            </p>
                            <p className="mt-2">
                                Subscription management, including cancellation and renewal, is handled through the respective app store (Google Play)
                                or through our website. Refund policies are governed by the applicable app store's terms or our refund policy.
                            </p>
                        </section>

                        {/* Data Sharing */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">5. How We Share Your Information</h2>
                            <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>
                                    <strong>Service Providers:</strong> We share data with trusted third-party service providers who assist us in operating the Service:
                                    <ul className="list-disc pl-6 mt-1 space-y-1">
                                        <li><strong>Supabase</strong> — Authentication and database hosting</li>
                                        <li><strong>Razorpay</strong> — Payment processing</li>
                                        <li><strong>Google</strong> — Authentication (Google Sign-In)</li>
                                        <li><strong>Vercel</strong> — Web application hosting</li>
                                        <li><strong>Render</strong> — Backend API hosting</li>
                                    </ul>
                                </li>
                                <li><strong>Legal Requirements:</strong> If required by law, regulation, legal process, or governmental request.</li>
                                <li><strong>Safety:</strong> To protect the rights, property, or safety of prepAIred, our users, or the public.</li>
                                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, your information may be transferred as a business asset.</li>
                            </ul>
                        </section>

                        {/* Data Security */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">6. Data Security</h2>
                            <p>
                                We implement industry-standard security measures to protect your personal information, including:
                            </p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li>Encrypted data transmission (HTTPS/TLS) for all communications.</li>
                                <li>Secure password hashing and authentication through Supabase Auth.</li>
                                <li>Encrypted local storage for sensitive session data.</li>
                                <li>Regular security reviews and updates.</li>
                            </ul>
                            <p className="mt-2">
                                While we strive to protect your information, no method of electronic transmission or storage is 100% secure. We
                                cannot guarantee absolute security.
                            </p>
                        </section>

                        {/* Data Retention */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">7. Data Retention</h2>
                            <p>
                                We retain your personal information for as long as your account is active or as needed to provide you the Service.
                                We may also retain certain information as required by law or for legitimate business purposes (such as resolving
                                disputes or enforcing our agreements).
                            </p>
                            <p className="mt-2">
                                If you delete your account, we will delete or anonymize your personal information within 30 days, except where
                                retention is required by law.
                            </p>
                        </section>

                        {/* Your Rights */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">8. Your Rights</h2>
                            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data.</li>
                                <li><strong>Deletion:</strong> Request deletion of your personal data and account.</li>
                                <li><strong>Data Portability:</strong> Request a machine-readable copy of your data.</li>
                                <li><strong>Opt-Out:</strong> Opt out of promotional communications at any time.</li>
                                <li><strong>Withdraw Consent:</strong> Where processing is based on consent, you may withdraw it at any time.</li>
                            </ul>
                            <p className="mt-2">
                                To exercise any of these rights, please contact us at the email address provided below.
                            </p>
                        </section>

                        {/* Children's Privacy */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">9. Children's Privacy</h2>
                            <p>
                                Our Service is intended for students preparing for competitive exams and may be used by individuals under 18 years
                                of age. We do not knowingly collect personal information from children under 13 without parental consent. If we
                                become aware that we have collected personal information from a child under 13 without verification of parental
                                consent, we will take steps to delete that information.
                            </p>
                            <p className="mt-2">
                                If you are a parent or guardian and believe your child has provided us with personal information without your
                                consent, please contact us.
                            </p>
                        </section>

                        {/* Third-Party Links */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">10. Third-Party Links & Services</h2>
                            <p>
                                Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices
                                of these third parties. We encourage you to read the privacy policies of any third-party services you interact with.
                            </p>
                        </section>

                        {/* Permissions */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">11. App Permissions</h2>
                            <p>Our mobile application requests the following permissions:</p>
                            <ul className="list-disc pl-6 space-y-1 mt-2">
                                <li><strong>Internet Access:</strong> Required to load content, sync your progress, and communicate with our servers.</li>
                                <li><strong>Storage (Local):</strong> Used to cache data locally for offline access and improved performance.</li>
                            </ul>
                            <p className="mt-2">
                                We only request permissions that are necessary for the functioning of the Service. We do not request access to your
                                contacts, camera, microphone, or location.
                            </p>
                        </section>

                        {/* Changes to Policy */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">12. Changes to This Privacy Policy</h2>
                            <p>
                                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on
                                this page and updating the "Last updated" date. For significant changes, we may also notify you via email or an
                                in-app notification.
                            </p>
                            <p className="mt-2">
                                Your continued use of the Service after any changes constitutes your acceptance of the updated policy.
                            </p>
                        </section>

                        {/* Contact */}
                        <section>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">13. Contact Us</h2>
                            <p>
                                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please
                                contact us at:
                            </p>
                            <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="font-medium text-gray-900 dark:text-white">prepAIred</p>
                                <p className="mt-1">
                                    Email:{' '}
                                    <a href="mailto:contact@prepaired.site" className="text-blue-600 dark:text-blue-400 underline">
                                        contact@prepaired.site
                                    </a>
                                </p>
                                <p className="mt-1">
                                    Website:{' '}
                                    <a href="https://www.prepaired.site" className="text-blue-600 dark:text-blue-400 underline" target="_blank" rel="noopener noreferrer">
                                        www.prepaired.site
                                    </a>
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
