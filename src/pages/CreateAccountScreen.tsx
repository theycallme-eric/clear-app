import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AuthLayout } from "@/layouts";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { toast } from "@/components/ui/sonner";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { Input } from "@/components/ui/input";

export const CreateAccountScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    if (!email || !password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error("Sign up failed", {
          description: error.message,
        });
        return;
      }

      if (data.user) {
        toast.success("Account created!", {
          description: "Let's set up your profile.",
        });
        // Auth listener + route guards will redirect to /onboarding
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
      logger.auth.error('Account creation failed', { error: err instanceof Error ? err.message : String(err) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout header={<PageHeader left="back" onBack={() => navigate("/welcome")} />}>
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {/* Title */}
        <h1
          className="text-heading-h1 font-bold tracking-wider mb-2"
          style={{ color: 'var(--text-header)' }}
        >
          Create Account
        </h1>
        <p className="text-paragraph-sm mb-8" style={{ color: 'var(--text-paragraph)' }}>
          Start your training journey
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card cornerSize="md" padding="md">
            {/* Email */}
            <div className="space-y-2 mb-4">
              <label className="block text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div className="space-y-2 mb-4">
              <label className="block text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>
                Password
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                disabled={isLoading}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:opacity-80"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>
                Confirm Password
              </label>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                disabled={isLoading}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="hover:opacity-80"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
            </div>
          </Card>

          {/* Submit Button */}
          <CTAButton
            type="submit"
            disabled={isLoading}
            size="lg"
            fullWidth
            className="mt-8"
            iconRight={
              isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <ArrowRight size={20} />
              )
            }
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </CTAButton>
        </form>

        {/* Terms */}
        <p
          className="text-label-xs text-center mt-6"
          style={{ color: 'var(--text-disabled)' }}
        >
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </AuthLayout>
  );
};
