import { ArrowRight } from "lucide-react";

interface WelcomeScreenProps {
  onSignIn: () => void;
  onCreateAccount: () => void;
}

export const WelcomeScreen = ({ onSignIn, onCreateAccount }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen grain-overlay flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-sm">
        {/* Logo */}
        <h1 className="font-display text-6xl font-bold tracking-wider text-foreground mb-4">
          CLEAR
        </h1>

        {/* Tagline */}
        <p className="text-lg text-foreground/70 mb-12">
          Strength training, simplified.
        </p>

        {/* Buttons */}
        <div className="w-full space-y-4">
          <button
            onClick={onCreateAccount}
            className="glow-button w-full h-14 font-display text-lg font-bold uppercase tracking-wider text-foreground flex items-center justify-center gap-2"
          >
            Create Account
            <ArrowRight size={20} />
          </button>

          <button
            onClick={onSignIn}
            className="w-full h-14 font-display text-lg font-bold uppercase tracking-wider text-foreground/80 hover:text-foreground border border-foreground/20 hover:border-foreground/40 transition-colors flex items-center justify-center gap-2"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
