import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AuthLayout } from "@/layouts";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { Input } from "@/components/ui/input";

export const ForgotPasswordScreen = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error("Reset failed", { description: error.message });
        return;
      }

      setSent(true);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

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
          {sent
            ? "Check your inbox for a reset link"
            : "Enter your email to receive a reset link"}
        </p>

        {sent ? (
          <Card cornerSize="md" padding="md">
            <div
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--spacing-400)", padding: "var(--spacing-400) 0", color: "var(--text-paragraph)" }}
            >
              <CheckCircle size={40} style={{ color: "var(--color-green)" }} />
              <p className="text-paragraph-sm" style={{ textAlign: "center" }}>
                If an account exists for <strong>{email}</strong>, you'll receive a
                password reset link shortly.
              </p>
              <button
                type="button"
                onClick={() => navigate("/sign-in")}
                className="text-cta-sm transition-colors"
                style={{ color: "var(--text-cta)" }}
              >
                Back to Sign In
              </button>
            </div>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-600)" }}>
            <Card cornerSize="md" padding="md">
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-200)" }}>
                <label
                  className="text-paragraph-sm"
                  style={{ display: "block", color: "var(--text-paragraph)" }}
                >
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
              {isLoading ? "Sending..." : "Send Reset Link"}
            </CTAButton>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};
