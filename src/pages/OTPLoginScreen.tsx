import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { AuthLayout } from "@/layouts";
import { supabase } from "@/lib/supabase";
import { logger } from "@/lib/logger";
import { toast } from "@/components/ui/sonner";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { Input } from "@/components/ui/input";

type Step = "email" | "code";

const RESEND_COOLDOWN_SECONDS = 60;

export const OTPLoginScreen = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const codeInputRef = useRef<HTMLInputElement>(null);

  // Focus code input when transitioning to code step
  useEffect(() => {
    if (step === "code") {
      // Small delay to allow transition
      const timer = setTimeout(() => codeInputRef.current?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const startResendCooldown = useCallback(() => {
    setResendCountdown(RESEND_COOLDOWN_SECONDS);
  }, []);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);
    logger.auth.info("OTP send code started", { email });

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });

      if (error) {
        logger.auth.error("OTP send code failed", { error: error.message });
        toast.error("Failed to send code", { description: error.message });
        return;
      }

      logger.auth.info("OTP code sent", { email });
      toast.success("Code sent", { description: "Check your email for a 6-digit code" });
      setStep("code");
      startResendCooldown();
    } catch (err) {
      logger.auth.error("OTP send code exception", {
        error: err instanceof Error ? err.message : String(err),
      });
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6) return;

    setIsLoading(true);
    logger.auth.info("OTP verify started", { email });

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: codeToVerify,
        type: "email",
      });

      if (error) {
        logger.auth.error("OTP verify failed", { error: error.message });
        toast.error("Verification failed", { description: error.message });
        setCode("");
        return;
      }

      logger.auth.info("OTP verify succeeded", { email });
      toast.success("Welcome!");
      // AuthContext handles redirect via SIGNED_IN event
    } catch (err) {
      logger.auth.error("OTP verify exception", {
        error: err instanceof Error ? err.message : String(err),
      });
      toast.error("An unexpected error occurred");
      setCode("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        toast.error("Failed to resend code", { description: error.message });
      } else {
        toast.success("Code resent");
        startResendCooldown();
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);

    // Auto-submit when 6 digits entered
    if (digits.length === 6) {
      handleVerifyCode(digits);
    }
  };

  const handleBack = () => {
    if (step === "code") {
      setStep("email");
      setCode("");
    } else {
      navigate("/welcome");
    }
  };

  return (
    <AuthLayout header={<PageHeader left="back" onBack={handleBack} />}>
      <div
        className="stagger-reveal"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          maxWidth: "24rem",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {step === "email" ? (
          <>
            <h1
              className="text-heading-h1"
              style={{
                fontWeight: 700,
                letterSpacing: "0.05em",
                marginBottom: "var(--spacing-200)",
                color: "var(--text-header)",
              }}
            >
              Sign In
            </h1>
            <p
              className="text-paragraph-sm"
              style={{
                marginBottom: "var(--spacing-700)",
                color: "var(--text-paragraph)",
              }}
            >
              Enter your email to receive a code
            </p>

            <form
              onSubmit={handleSendCode}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-600)",
              }}
            >
              <Card cornerSize="md" padding="md">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-200)",
                  }}
                >
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
                    autoFocus
                  />
                </div>
              </Card>

              <CTAButton
                type="submit"
                disabled={isLoading || !email}
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
                {isLoading ? "Sending..." : "Send Code"}
              </CTAButton>
            </form>
          </>
        ) : (
          <>
            <h1
              className="text-heading-h1"
              style={{
                fontWeight: 700,
                letterSpacing: "0.05em",
                marginBottom: "var(--spacing-200)",
                color: "var(--text-header)",
              }}
            >
              Enter Code
            </h1>
            <p
              className="text-paragraph-sm"
              style={{
                marginBottom: "var(--spacing-700)",
                color: "var(--text-paragraph)",
              }}
            >
              6-digit code sent to {email}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyCode(code);
              }}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--spacing-600)",
              }}
            >
              <Card cornerSize="md" padding="md">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-200)",
                  }}
                >
                  <label
                    className="text-paragraph-sm"
                    style={{ display: "block", color: "var(--text-paragraph)" }}
                  >
                    Code
                  </label>
                  <Input
                    ref={codeInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={code}
                    onChange={(e) => handleCodeChange(e.target.value)}
                    placeholder="000000"
                    disabled={isLoading}
                    autoComplete="one-time-code"
                  />
                </div>
              </Card>

              <CTAButton
                type="submit"
                disabled={isLoading || code.length !== 6}
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
                {isLoading ? "Verifying..." : "Verify"}
              </CTAButton>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-cta-sm transition-colors"
                  style={{ color: "var(--text-cta)" }}
                >
                  Use Different Email
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCountdown > 0 || isLoading}
                  className="text-cta-sm transition-colors"
                  style={{
                    color:
                      resendCountdown > 0
                        ? "var(--text-disabled)"
                        : "var(--text-cta)",
                  }}
                >
                  {resendCountdown > 0
                    ? `Resend (${resendCountdown}s)`
                    : "Resend Code"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </AuthLayout>
  );
};
