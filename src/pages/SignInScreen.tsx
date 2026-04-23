import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
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
      <div className="stagger-reveal" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '24rem', margin: '0 auto', width: '100%' }}>
        {/* Title */}
        <h1
          className="text-heading-h1"
          style={{ fontWeight: 700, letterSpacing: '0.05em', marginBottom: 'var(--spacing-200)', color: 'var(--text-header)' }}
        >
          Sign In
        </h1>
        <p className="text-paragraph-sm" style={{ marginBottom: 'var(--spacing-700)', color: 'var(--text-paragraph)' }}>
          Welcome back to CLEAR
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-600)' }}>
          <Card cornerSize="md" padding="md">
            {/* Email */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)', marginBottom: 'var(--spacing-400)' }}>
              <label className="text-paragraph-sm" style={{ display: 'block', color: 'var(--text-paragraph)' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-200)' }}>
              <label className="text-paragraph-sm" style={{ display: 'block', color: 'var(--text-paragraph)' }}>
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
                    style={{ opacity: 1 }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
            </div>
          </Card>

          {/* Stay logged in + Forgot Password */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-200)' }}>
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
              onClick={() => navigate("/forgot-password")}
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
