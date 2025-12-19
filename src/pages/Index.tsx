import { useState, useRef } from "react";
import { GenerationScreen, WorkoutParams } from "@/pages/GenerationScreen";
import { ReviewScreen } from "@/pages/ReviewScreen";
import { WorkoutScreen, WorkoutNotes } from "@/pages/WorkoutScreen";
import { SummaryScreen } from "@/pages/SummaryScreen";
import { toast } from "sonner";
import { GeneratedWorkout, generateMockWorkout } from "@/types/workout";

type Screen = "generation" | "review" | "workout" | "summary";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("generation");
  const [workoutParams, setWorkoutParams] = useState<WorkoutParams | null>(null);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  const [workoutNotes, setWorkoutNotes] = useState<WorkoutNotes | null>(null);
  const workoutStartTime = useRef<number>(0);
  const [totalTime, setTotalTime] = useState(0);

  const handleGenerate = (params: WorkoutParams) => {
    setWorkoutParams(params);
    const workout = generateMockWorkout(params.intensity, params.anchor || "PULL");
    setGeneratedWorkout(workout);
    toast.success("Workout generated!", {
      description: `${params.anchor} focus at intensity ${params.intensity}`,
    });
    setCurrentScreen("review");
  };

  const handleBackToGeneration = () => {
    setCurrentScreen("generation");
  };

  const handleStartWorkout = () => {
    workoutStartTime.current = Date.now();
    setCurrentScreen("workout");
  };

  const handleExitWorkout = () => {
    setCurrentScreen("review");
  };

  const handleFinishWorkout = (notes: WorkoutNotes) => {
    const elapsed = Math.floor((Date.now() - workoutStartTime.current) / 1000);
    setTotalTime(elapsed);
    setWorkoutNotes(notes);
    setCurrentScreen("summary");
  };

  const handleSaveSession = () => {
    toast.success("Session saved!", {
      description: "Your workout has been recorded.",
    });
    // Reset to generation screen
    setCurrentScreen("generation");
    setGeneratedWorkout(null);
    setWorkoutNotes(null);
  };

  const handleDiscardSession = () => {
    toast.info("Session discarded");
    setCurrentScreen("generation");
    setGeneratedWorkout(null);
    setWorkoutNotes(null);
  };

  return (
    <>
      {currentScreen === "generation" && (
        <GenerationScreen onGenerate={handleGenerate} />
      )}
      {currentScreen === "review" && generatedWorkout && (
        <ReviewScreen 
          workout={generatedWorkout} 
          onBack={handleBackToGeneration}
          onStartWorkout={handleStartWorkout}
        />
      )}
      {currentScreen === "workout" && generatedWorkout && (
        <WorkoutScreen
          workout={generatedWorkout}
          onExit={handleExitWorkout}
          onFinish={handleFinishWorkout}
        />
      )}
      {currentScreen === "summary" && generatedWorkout && workoutNotes && (
        <SummaryScreen
          workout={generatedWorkout}
          notes={workoutNotes}
          totalTime={totalTime}
          onSave={handleSaveSession}
          onDiscard={handleDiscardSession}
        />
      )}
    </>
  );
};

export default Index;
