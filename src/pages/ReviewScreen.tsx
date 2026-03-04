import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { PageHeader } from "@/components/PageHeader";
import { AppLayout } from "@/layouts";
import { WorkoutOverview } from "@/components/WorkoutOverview";
import { WorkoutSectionCard } from "@/components/WorkoutSectionCard";
import { StartWorkoutButton } from "@/components/StartWorkoutButton";
import { useWorkoutFlowContext } from "@/contexts/WorkoutFlowContext";

export const ReviewScreen = () => {
  const navigate = useNavigate();
  const { generatedWorkout, handleStartWorkout } = useWorkoutFlowContext();

  if (!generatedWorkout) {
    return <Navigate to="/generate" replace />;
  }

  const handleRandomizeSection = (sectionId: string) => {
    toast.info("Section randomized", {
      description: `${sectionId} has been regenerated`,
    });
  };

  return (
    <AppLayout
      header={<PageHeader left="back" onBack={() => navigate("/generate")} right="menu" onMenu={() => navigate("/settings")} />}
      footer={<StartWorkoutButton onClick={() => handleStartWorkout(() => navigate("/workout"))} />}
    >
      <div className="pt-6 space-y-6">
        <WorkoutOverview workout={generatedWorkout} />

        <div className="space-y-4">
          {generatedWorkout.sections.map((section) => (
            <WorkoutSectionCard
              key={section.id}
              section={section}
              onRandomize={() => handleRandomizeSection(section.name)}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};
