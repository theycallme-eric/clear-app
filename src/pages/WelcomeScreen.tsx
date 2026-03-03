import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CTAButton } from "@/components/CTAButton";
import { AuthLayout } from "@/layouts";

export const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center text-center max-w-sm">
          <h1
            className="text-heading-h1 font-bold tracking-wider mb-4"
            style={{ color: 'var(--text-header)' }}
          >
            CLEAR
          </h1>

          <p className="text-paragraph-lg mb-12" style={{ color: 'var(--text-paragraph)' }}>
            Strength training, simplified.
          </p>

          <div className="w-full space-y-4">
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
