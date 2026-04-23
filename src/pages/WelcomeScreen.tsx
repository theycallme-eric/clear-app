import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ClearLogo } from "@/components/ClearLogo";
import { CTAButton } from "@/components/CTAButton";
import { AuthLayout } from "@/layouts";

export const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '24rem' }}>
          <ClearLogo size="xl" boot style={{ marginBottom: 'var(--spacing-400)' }} />

          <p className="text-paragraph-lg" style={{ marginBottom: 'var(--spacing-1000)', color: 'var(--text-paragraph)' }}>
            Strength training, simplified.
          </p>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-400)' }}>
            <CTAButton
              onClick={() => navigate("/create-account")}
              size="lg"
              fullWidth
              iconRight={<ArrowRight size={20} />}
            >
              Create Account
            </CTAButton>

            <CTAButton
              onClick={() => navigate("/sign-in")}
              variant="secondary"
              size="lg"
              fullWidth
            >
              Sign In
            </CTAButton>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
