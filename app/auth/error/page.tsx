'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ErrorPage = () => {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Auto redirect after 5 seconds
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push('/signin');
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
                                Sign In Failed
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Invalid email or password. Please check your credentials and try again.
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
                            className="bg-red-50 rounded-lg p-4 mb-6 flex items-center gap-3"
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                            >
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            </motion.div>
                            <p className="text-sm text-red-700">
                                Please ensure your email and password are correct
                            </p>
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
                                onClick={() => router.push('/signin')}
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
                            Redirecting to sign in page in {countdown} seconds...
                        </motion.p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ErrorPage;