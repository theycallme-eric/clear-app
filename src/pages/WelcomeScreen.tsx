import { ArrowRight } from "lucide-react";
import { CTAButton } from "@/components/CTAButton";

interface WelcomeScreenProps {
  onSignIn: () => void;
  onCreateAccount: () => void;
}

export const WelcomeScreen = ({ onSignIn, onCreateAccount }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen grain-overlay flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Logo */}
        <h1
          className="text-heading-h1 font-bold tracking-wider mb-4"
          style={{ color: 'var(--text-header)' }}
        >
          CLEAR
        </h1>

        {/* Tagline */}
        <p className="text-paragraph-lg mb-12" style={{ color: 'var(--text-paragraph)' }}>
          Strength training, simplified.
        </p>

        {/* Buttons */}
        <div className="w-full space-y-4">
          <CTAButton
            onClick={onCreateAccount}
            size="lg"
            fullWidth
            iconRight={<ArrowRight size={20} />}
          >
            Create Account
          </CTAButton>

          <CTAButton
            onClick={onSignIn}
            variant="secondary"
            size="lg"
            fullWidth
          >
            Sign In
          </CTAButton>
        </div>
      </div>
    </div>
  );
};
