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
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full stagger-reveal">
        <h1
          className="text-heading-h1 font-bold tracking-wider mb-2"
          style={{ color: "var(--text-header)" }}
        >
          Reset Password
        </h1>
        <p className="text-paragraph-sm mb-8" style={{ color: "var(--text-paragraph)" }}>
          {sent
            ? "Check your inbox for a reset link"
            : "Enter your email to receive a reset link"}
        </p>

        {sent ? (
          <Card cornerSize="md" padding="md">
            <div
              className="flex flex-col items-center gap-4 py-4"
              style={{ color: "var(--text-paragraph)" }}
            >
              <CheckCircle size={40} style={{ color: "var(--color-green)" }} />
              <p className="text-paragraph-sm text-center">
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card cornerSize="md" padding="md">
              <div className="space-y-2">
                <label
                  className="block text-paragraph-sm"
                  style={{ color: "var(--text-paragraph)" }}
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
