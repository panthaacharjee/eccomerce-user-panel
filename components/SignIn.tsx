// components/SignIn.tsx
import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import ForgotPassword from "./ForgotPassword";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { signIn, useSession } from "next-auth/react";
import toast from "react-hot-toast";

type AuthView = "signin" | "forgot-password";

const SignIn = () => {
  const { status } = useSession();
  const router = useRouter();

  const [authView, setAuthView] = useState<AuthView>("signin");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        type: "Login",
      });

      console.log("SignIn result:", result);

      if (result?.error) {
        // Handle different error messages
        const errorMessage = result.error;

        if (errorMessage.includes("Invalid email or password")) {
          toast.error("Invalid email or password. Please try again.");
        } else if (errorMessage.includes("User not found")) {
          toast.error("No account found with this email. Please sign up first.");
          // Optional: Redirect to signup after 2 seconds
          setTimeout(() => {
            router.push("/signup");
          }, 2000);
        } else if (errorMessage.includes("Network error")) {
          toast.error("Network error. Please check your connection.");
        } else {
          toast.error(errorMessage || "Authentication failed. Please try again.");
        }
      } else if (result?.ok) {
        // Success!
        toast.success("Login successful! Redirecting...");

        // Redirect to home after short delay
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      console.error("SignIn error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPasswordClick = () => {
    setAuthView("forgot-password");
  };

  const handleBackToSignIn = () => {
    setAuthView("signin");
  };

  // Slide variants
  const slideVariants = {
    initial: {
      x: 100,
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      x: 100,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  }as const;

  const fadeVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  return (
    <div className="mx-auto w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {authView === "forgot-password" ? (
          <motion.div
            key="forgot-password"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ForgotPassword onBackToSignIn={handleBackToSignIn} />
          </motion.div>
        ) : (
          <motion.div
            key="signin"
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-8"
          >
            {/* Header */}
            <motion.div variants={fadeVariants} className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to your account to continue
              </p>
            </motion.div>

            {/* Form */}
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="bg-white py-8 px-6 shadow-lg rounded-xl space-y-6">
                {/* Email Input */}
                <motion.div variants={fadeVariants} className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                </motion.div>

                {/* Password Input */}
                <motion.div variants={fadeVariants} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPasswordClick}
                      className="text-sm font-medium text-black hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10 pr-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Remember Me */}
                <motion.div
                  variants={fadeVariants}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <label
                      htmlFor="rememberMe"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={fadeVariants}>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-white font-medium ${isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-black hover:opacity-90 transition-opacity"
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </motion.div>
              </div>

              {/* Divider */}
              <motion.div variants={fadeVariants} className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </motion.div>

              {/* Social Login */}
              <motion.div
                variants={fadeVariants}
                className="grid grid-cols-2 gap-3"
              >
                <button
                  type="button"
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                  className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 outline-none cursor-pointer transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => signIn("github", { callbackUrl: "/" })}
                  className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 outline-none cursor-pointer transition-colors"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </button>
              </motion.div>

              {/* Sign Up Link */}
              <motion.div variants={fadeVariants} className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="font-medium text-black hover:underline transition-colors ml-1"
                    onClick={() => router.push("/signup")}
                  >
                    Sign up
                  </button>
                </p>
              </motion.div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SignIn;