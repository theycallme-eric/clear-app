import { useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { toast } from "@/components/ui/sonner";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { Input } from "@/components/ui/input";

interface SignInScreenProps {
  onBack: () => void;
  onSuccess: () => void;  // No longer passes onboardingComplete - AuthContext handles navigation
  onForgotPassword: () => void;
}

export const SignInScreen = ({ onBack, onSuccess, onForgotPassword }: SignInScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    logger.auth.info('Sign-in attempt started', { email });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        logger.auth.error('Sign-in failed', { error: error.message });
        toast.error("Sign in failed", {
          description: error.message,
        });
        return;
      }

      if (data.user) {
        // Don't fetch profile here - AuthContext handles it via SIGNED_IN event
        // This prevents a race condition where both SignInScreen and AuthContext
        // fetch the profile simultaneously
        logger.auth.info('Sign-in succeeded, AuthContext will handle profile fetch', { userId: data.user.id });
        toast.success("Welcome back!");
        onSuccess();
      }
    } catch (err) {
      logger.auth.error('Sign-in exception', { error: err instanceof Error ? err.message : String(err) });
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grain-overlay flex flex-col px-6 py-8">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={20} />
        <span className="font-body">Back</span>
      </button>

      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {/* Title */}
        <h1 className="text-heading-h1 font-bold tracking-wider text-foreground mb-2">
          Sign In
        </h1>
        <p className="text-foreground/60 mb-8">
          Welcome back to CLEAR
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card cornerSize="md" padding="md">
            {/* Email */}
            <div className="space-y-2 mb-4">
              <label className="block text-paragraph-sm text-foreground">
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
            <div className="space-y-2">
              <label className="block text-paragraph-sm text-foreground">
                Password
              </label>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
          </Card>

          {/* Forgot Password */}
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-accent hover:text-accent/80 transition-colors"
          >
            Forgot password?
          </button>

          {/* Submit Button */}
          <CTAButton
            type="submit"
            disabled={isLoading}
            size="lg"
            fullWidth
            iconRight={
              isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <ArrowRight size={20} />
              )
            }
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </CTAButton>
        </form>
      </div>
    </div>
  );
};
