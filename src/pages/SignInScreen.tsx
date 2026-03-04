import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PageHeading } from "@/components/PageHeading";
import { AuthLayout } from "@/layouts";
import { supabase } from "@/lib/supabase";
import { getStayLoggedIn, setStayLoggedIn } from "@/lib/auth-storage";
import { logger } from "@/lib/logger";
import { toast } from "@/components/ui/sonner";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { Checkbox } from "@/components/Checkbox";
import { Input } from "@/components/ui/input";

export const SignInScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stayLoggedIn, setStayLoggedInState] = useState(getStayLoggedIn);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setStayLoggedIn(stayLoggedIn);
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
        // Auth listener (AuthContext) will handle route guards
      }
    } catch (err) {
      logger.auth.error('Sign-in exception', { error: err instanceof Error ? err.message : String(err) });
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout header={<PageHeader left="back" onBack={() => navigate("/welcome")} />}>
      <div className="flex-1 flex flex-col justify-center">
        <PageHeading level="h1" className="-mx-6 px-6 mb-2">Sign In</PageHeading>
        <p className="text-paragraph-sm mb-8 text-center" style={{ color: 'var(--text-paragraph)' }}>
          Welcome back to CLEAR
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto w-full">
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
            <div className="space-y-2">
              <label className="block text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>
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

          {/* Stay logged in + Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={stayLoggedIn}
                onChange={(val) => {
                  setStayLoggedInState(val);
                  setStayLoggedIn(val);
                }}
                disabled={isLoading}
              />
              <span className="text-paragraph-sm" style={{ color: 'var(--text-paragraph)' }}>
                Stay logged in
              </span>
            </div>

            <button
              type="button"
              onClick={() => toast.info("Password reset", { description: "Enter your email on the sign in screen to reset." })}
              className="text-cta-sm transition-colors"
              style={{ color: 'var(--text-cta)' }}
            >
              Forgot password?
            </button>
          </div>

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
    </AuthLayout>
  );
};
