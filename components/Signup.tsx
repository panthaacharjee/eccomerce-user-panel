// components/SignUp.tsx
import React, { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const SignUp: React.FC = () => {
  const { status } = useSession();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = () => {
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return false;
    }

    // Check password strength
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return false;
    }

    // Check if password has uppercase and number
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);

    if (!hasUpperCase || !hasNumber) {
      toast.error("Password must contain at least one uppercase letter and one number!");
      return false;
    }

    // Check terms agreement
    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        type: "Register",
      });

      console.log("SignUp result:", result);

      if (result?.error) {
        const errorMessage = result.error;

        if (errorMessage.includes("User already exists")) {
          toast.error("An account with this email already exists. Please sign in instead.");
          // Redirect to signin after 2 seconds
          setTimeout(() => {
            router.push("/signin");
          }, 2000);
        } else if (errorMessage.includes("Invalid")) {
          toast.error(errorMessage);
        } else if (errorMessage.includes("Network error")) {
          toast.error("Network error. Please check your connection.");
        } else {
          toast.error(errorMessage || "Registration failed. Please try again.");
        }
      } else if (result?.ok) {
        // Success!
        toast.success("Account created successfully! Redirecting to sign in...");

        // Redirect to signin after short delay
        setTimeout(() => {
          router.push("/signin");
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      console.error("SignUp error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const fadeVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  return (
    <div className="max-w-md mx-auto w-full space-y-8 mt-10">
      {/* Header */}
      <motion.div
        variants={fadeVariants}
        initial="initial"
        animate="animate"
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
        <p className="mt-2 text-sm text-gray-600">Join our community today</p>
      </motion.div>

      {/* Form */}
      <form className="mt-3" onSubmit={handleSubmit}>
        <motion.div
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          className="bg-white py-8 px-6 shadow-lg rounded-xl space-y-6"
        >
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-gray-700"
              >
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  placeholder="John"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-gray-700"
              >
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="pl-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
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
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="pl-10 pr-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                placeholder="Create a password"
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
            <p className="text-xs text-gray-500">
              Must be at least 8 characters with a number and uppercase letter
            </p>
          </div>

          {/* Confirm Password Input */}
          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="pl-10 pr-10 w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                )}
              </button>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start">
            <input
              id="agreeToTerms"
              name="agreeToTerms"
              type="checkbox"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded mt-1"
            />
            <label
              htmlFor="agreeToTerms"
              className="ml-2 block text-sm text-gray-700"
            >
              I agree to the{" "}
              <a href="#" className="text-black hover:underline font-medium">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-black hover:underline font-medium">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit Button */}
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
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </button>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/signin")}
                className="font-medium text-black hover:underline transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>
        </motion.div>
      </form>
    </div>
  );
};

export default SignUp;