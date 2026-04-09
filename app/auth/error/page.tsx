'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, XCircle, RefreshCw, ArrowLeft, Mail, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const ErrorPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const [countdown, setCountdown] = useState(5);

    // Get error message based on error type
    const getErrorMessage = () => {
        switch (error) {
            case 'CredentialsSignin':
                return {
                    title: 'Invalid Credentials',
                    message: 'The email or password you entered is incorrect.',
                    details: 'Please check your credentials and try again.'
                };
            case 'AccessDenied':
                return {
                    title: 'Access Denied',
                    message: 'You do not have permission to sign in.',
                    details: 'Please contact support if you believe this is an error.'
                };
            case 'OAuthSignin':
            case 'OAuthCallback':
            case 'OAuthCreateAccount':
            case 'EmailCreateAccount':
            case 'Callback':
                return {
                    title: 'Authentication Failed',
                    message: 'There was a problem with the authentication service.',
                    details: 'Please try again or use a different sign-in method.'
                };
            case 'Default':
            default:
                return {
                    title: 'Sign In Failed',
                    message: 'Invalid email or password.',
                    details: 'Please check your credentials and try again.'
                };
        }
    };

    const errorInfo = getErrorMessage();

    useEffect(() => {
        // Auto redirect after 5 seconds
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Animated Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Animated Icon Section */}
                    <div className="relative h-40 bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 1
                            }}
                        >
                            <XCircle className="h-24 w-24 text-white" />
                        </motion.div>

                        {/* Floating particles */}
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-white/30 rounded-full"
                                animate={{
                                    y: [0, -100],
                                    x: [0, (i - 1) * 50],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.5
                                }}
                            />
                        ))}
                    </div>

                    {/* Content Section */}
                    <div className="p-8 text-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {errorInfo.title}
                            </h1>
                            <p className="text-gray-600 mb-6">
                                {errorInfo.message}
                            </p>
                        </motion.div>

                        {/* Animated Alert */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: 0.5
                            }}
                            className="bg-red-50 rounded-lg p-4 mb-6"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                >
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                </motion.div>
                                <p className="text-sm text-red-700 font-medium">
                                    {errorInfo.details}
                                </p>
                            </div>

                            {/* Additional tips for invalid credentials */}
                            {error === 'CredentialsSignin' && (
                                <div className="mt-3 pt-3 border-t border-red-100">
                                    <p className="text-xs text-red-600 mb-2">Common issues:</p>
                                    <ul className="text-xs text-red-500 space-y-1 text-left">
                                        <li className="flex items-center gap-2">
                                            <Mail className="h-3 w-3" />
                                            Check your email address spelling
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Lock className="h-3 w-3" />
                                            Ensure caps lock is off for password
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </motion.div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.back()}
                                className="w-full flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-800 transition-all"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Try Again
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => router.push('/')}
                                className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:border-black hover:text-black transition-all"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Sign In
                            </motion.button>
                        </div>

                        {/* Countdown Redirect */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-xs text-gray-500 mt-6"
                        >
                            Redirecting to home page in {countdown} seconds...
                        </motion.p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ErrorPage;