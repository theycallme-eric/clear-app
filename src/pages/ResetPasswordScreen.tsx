import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AuthLayout } from "@/layouts";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { Input } from "@/components/ui/input";

export const ResetPasswordScreen = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  // Listen for the PASSWORD_RECOVERY event from Supabase
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    // Also check if we already have a session (recovery link already processed)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in both fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        toast.error("Reset failed", { description: error.message });
        return;
      }

      toast.success("Password updated");
      navigate("/");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // If we haven't confirmed a recovery session, show a loading/invalid state
  if (!isRecovery) {
    return (
      <AuthLayout header={<PageHeader left="back" onBack={() => navigate("/sign-in")} />}>
        <div
          className="stagger-reveal"
          style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "24rem", margin: "0 auto", width: "100%" }}
        >
          <h1
            className="text-heading-h1"
            style={{ fontWeight: 700, letterSpacing: "0.05em", marginBottom: "var(--spacing-200)", color: "var(--text-header)" }}
          >
            Reset Password
          </h1>
          <p
            className="text-paragraph-sm"
            style={{ marginBottom: "var(--spacing-700)", color: "var(--text-paragraph)" }}
          >
            Verifying your reset link...
          </p>
          <Card cornerSize="md" padding="md">
            <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-700) 0" }}>
              <Loader2
                size={32}
                className="animate-spin"
                style={{ color: "var(--text-paragraph)" }}
              />
            </div>
          </Card>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout header={<PageHeader left="back" onBack={() => navigate("/sign-in")} />}>
      <div
        className="stagger-reveal"
        style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", maxWidth: "24rem", margin: "0 auto", width: "100%" }}
      >
        <h1
          className="text-heading-h1"
          style={{ fontWeight: 700, letterSpacing: "0.05em", marginBottom: "var(--spacing-200)", color: "var(--text-header)" }}
        >
          New Password
        </h1>
        <p
          className="text-paragraph-sm"
          style={{ marginBottom: "var(--spacing-700)", color: "var(--text-paragraph)" }}
        >
          Choose a new password for your account
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-600)" }}>
          <Card cornerSize="md" padding="md">
            {/* New Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-200)", marginBottom: "var(--spacing-400)" }}>
              <label
                className="text-paragraph-sm"
                style={{ display: "block", color: "var(--text-paragraph)" }}
              >
                New Password
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
                    style={{ opacity: 0.8 }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
            </div>

            {/* Confirm Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-200)" }}>
              <label
                className="text-paragraph-sm"
                style={{ display: "block", color: "var(--text-paragraph)" }}
              >
                Confirm Password
              </label>
              <Input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                disabled={isLoading}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{ opacity: 0.8 }}
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
            </div>
          </Card>

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
            {isLoading ? "Updating..." : "Update Password"}
          </CTAButton>
        </form>
      </div>
    </AuthLayout>
  );
};
