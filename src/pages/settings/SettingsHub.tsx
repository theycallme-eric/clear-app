import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { CTAButton } from "@/components/CTAButton";
import { Card } from "@/components/Card";
import { RadioButton } from "@/components/RadioButton";
import {
  UserPreferences,
  UserLocation,
  GOAL_PRESETS,
} from "@/types/workout";
import { toast } from "@/components/ui/sonner";
import { getTheme, setTheme, type ThemeMode } from "@/lib/theme";

interface SettingsHubProps {
  preferences: UserPreferences;
  defaultLocation: UserLocation | undefined;
  onNavigateLocations: () => void;
  onNavigateStructure: () => void;
  onNavigateLimitations: () => void;
  onOpenDeveloper?: () => void;
  onLaunchTestWorkout?: () => void;
  onSignOutRequest: () => void;
}

export const SettingsHub = ({
  preferences,
  defaultLocation,
  onNavigateLocations,
  onNavigateStructure,
  onNavigateLimitations,
  onOpenDeveloper,
  onLaunchTestWorkout,
  onSignOutRequest,
}: SettingsHubProps) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getTheme);

  const handleThemeChange = (mode: ThemeMode) => {
    setTheme(mode);
    setThemeMode(mode);
  };

  return (
    <div className="space-y-6">
      {/* Workout Setup Section */}
      <div>
        <p className="text-label-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-card-label)' }}>
          Workout Setup
        </p>
        <div className="space-y-2">
          {/* Locations */}
          <Card onClick={onNavigateLocations} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-sm uppercase" style={{ color: 'var(--text-header)' }}>
                  Locations / Equipment
                </p>
                <p className="text-paragraph-sm mt-0.5" style={{ color: 'var(--text-paragraph)' }}>
                  {defaultLocation?.name || "Not set"}
                </p>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: 'var(--icon-cta)' }} />
            </div>
          </Card>

          {/* Workout Structure */}
          <Card onClick={onNavigateStructure} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-sm uppercase" style={{ color: 'var(--text-header)' }}>
                  Workout Structure
                </p>
                <p className="text-paragraph-sm mt-0.5" style={{ color: 'var(--text-paragraph)' }}>
                  {GOAL_PRESETS.find(g => g.value === preferences.goal)?.label || "Not set"} • {preferences.sections.length} sections
                </p>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: 'var(--icon-cta)' }} />
            </div>
          </Card>

          {/* Limitations */}
          <Card onClick={onNavigateLimitations} padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-sm uppercase" style={{ color: 'var(--text-header)' }}>
                  Limitations
                </p>
                <p className="text-paragraph-sm mt-0.5 truncate max-w-[250px]" style={{ color: 'var(--text-paragraph)' }}>
                  {preferences.limitations ? `"${preferences.limitations.slice(0, 30)}${preferences.limitations.length > 30 ? '...' : ''}"` : "None set"}
                </p>
              </div>
              <ChevronRight className="w-5 h-5" style={{ color: 'var(--icon-cta)' }} />
            </div>
          </Card>
        </div>
      </div>

      {/* Appearance Section */}
      <div>
        <p className="text-label-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-card-label)' }}>
          Appearance
        </p>
        <div className="flex gap-2">
          <RadioButton
            selected={themeMode === 'orange'}
            onClick={() => handleThemeChange('orange')}
            label="Orange"
            className="flex-1"
          />
          <RadioButton
            selected={themeMode === 'blue'}
            onClick={() => handleThemeChange('blue')}
            label="Blue"
            className="flex-1"
          />
        </div>
      </div>

      {/* About Section */}
      <div>
        <p className="text-label-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-card-label)' }}>
          About
        </p>
        <div className="space-y-2">
          <Card onClick={() => toast.info("Feedback form coming soon!")} padding="md">
            <div className="flex items-center justify-between">
              <p className="text-label-sm uppercase" style={{ color: 'var(--text-header)' }}>
                Send Feedback
              </p>
              <ChevronRight className="w-5 h-5" style={{ color: 'var(--icon-cta)' }} />
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-label-sm uppercase" style={{ color: 'var(--text-header)' }}>
                  About Clear
                </p>
                <p className="text-paragraph-sm mt-0.5" style={{ color: 'var(--text-paragraph)' }}>
                  Version 1.0.0
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Developer Section */}
      {(onOpenDeveloper || onLaunchTestWorkout) && (
        <div>
          <p className="text-label-xs uppercase tracking-widest mb-3" style={{ color: 'var(--text-card-label)' }}>
            Developer
          </p>
          <div className="space-y-2">
            {onOpenDeveloper && (
              <Card onClick={onOpenDeveloper} padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label-sm uppercase" style={{ color: 'var(--text-header)' }}>
                      Component Gallery
                    </p>
                    <p className="text-paragraph-sm mt-0.5" style={{ color: 'var(--text-paragraph)' }}>
                      Audit design system components
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--icon-cta)' }} />
                </div>
              </Card>
            )}
            {onLaunchTestWorkout && (
              <Card onClick={onLaunchTestWorkout} padding="md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-label-sm uppercase" style={{ color: 'var(--text-header)' }}>
                      Test Workout
                    </p>
                    <p className="text-paragraph-sm mt-0.5" style={{ color: 'var(--text-paragraph)' }}>
                      All structure types in one session
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: 'var(--icon-cta)' }} />
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Sign Out */}
      <div
        className="pt-4"
        style={{ '--text-cta': 'var(--text-cta-destructive)', '--text-cta-hover': 'var(--text-cta-destructive-hover)' } as React.CSSProperties}
      >
        <CTAButton
          onClick={onSignOutRequest}
          variant="secondary"
          size="md"
          fullWidth
        >
          Sign Out
        </CTAButton>
      </div>
    </div>
  );
};
