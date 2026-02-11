import { toast } from "@/components/ui/sonner";
import { ReviewHeader } from "@/components/ReviewHeader";
import { WorkoutOverview } from "@/components/WorkoutOverview";
import { WorkoutSectionCard } from "@/components/WorkoutSectionCard";
import { StartWorkoutButton } from "@/components/StartWorkoutButton";
import { GeneratedWorkout } from "@/types/workout";

interface ReviewScreenProps {
  workout: GeneratedWorkout;
  onBack: () => void;
  onStartWorkout: () => void;
}

export const ReviewScreen = ({ workout, onBack, onStartWorkout }: ReviewScreenProps) => {
  const handleRandomizeSection = (sectionId: string) => {
    toast.info("Section randomized", {
      description: `${sectionId} has been regenerated`,
    });
    // TODO: Implement actual randomization logic
  };

  return (
    <div className="min-h-screen grain-overlay">
      <div className="max-w-md mx-auto pb-24">
        <ReviewHeader onBack={onBack} />
        
        <div className="px-4 space-y-6">
          <WorkoutOverview workout={workout} />
          
          <div className="space-y-4">
            {workout.sections.map((section) => (
              <WorkoutSectionCard
                key={section.id}
                section={section}
                onRandomize={() => handleRandomizeSection(section.name)}
              />
            ))}
          </div>
        </div>
        
        <StartWorkoutButton onClick={onStartWorkout} />
      </div>
    </div>
  );
};
