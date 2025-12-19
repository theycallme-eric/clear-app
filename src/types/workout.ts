export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  effort?: string;
  tempo?: string;
  rest?: string;
  lastWeight?: string;
  coachingCues?: string;
  regression?: string;
  progression?: string;
}

export interface WorkoutSection {
  id: string;
  name: string;
  type: 'warmup' | 'primary' | 'accessory' | 'rotational' | 'conditioning' | 'cooldown';
  exercises: Exercise[];
}

export interface GeneratedWorkout {
  id: string;
  title: string;
  description: string;
  duration: string;
  intensity: number;
  anchor: string;
  sections: WorkoutSection[];
}

// Mock data generator for prototype
export const generateMockWorkout = (intensity: number, anchor: string): GeneratedWorkout => {
  return {
    id: crypto.randomUUID(),
    title: `High Intensity ${anchor} Focus`,
    description: "This workout emphasizes compound pulling movements with progressive overload. Focus on controlled eccentrics and full range of motion to maximize back development.",
    duration: "45m",
    intensity,
    anchor,
    sections: [
      {
        id: "warmup",
        name: "Warm-Up",
        type: "warmup",
        exercises: [
          {
            id: "w1",
            name: "Band Pull-Aparts",
            sets: 2,
            reps: 15,
            tempo: "1-0-1",
            rest: "30s",
            coachingCues: "Squeeze shoulder blades together at end range",
            regression: "Lighter band tension"
          },
          {
            id: "w2",
            name: "Cat-Cow Stretch",
            sets: 2,
            reps: 10,
            tempo: "2-1-2",
            rest: "0s",
            coachingCues: "Full spinal flexion and extension"
          }
        ]
      },
      {
        id: "primary",
        name: "Primary Lift",
        type: "primary",
        exercises: [
          {
            id: "p1",
            name: "Barbell Bent-Over Row",
            sets: 4,
            reps: 8,
            effort: "65%",
            tempo: "2-1-2",
            rest: "90s",
            lastWeight: "115-135lbs",
            coachingCues: "Neutral spine, bar to ribcage",
            regression: "Seated Cable Row",
            progression: "Pendlay Row"
          }
        ]
      },
      {
        id: "accessory",
        name: "Accessory Block",
        type: "accessory",
        exercises: [
          {
            id: "a1",
            name: "Lat Pulldown",
            sets: 3,
            reps: 12,
            effort: "RPE 7",
            tempo: "2-0-2",
            rest: "60s",
            lastWeight: "120-140lbs",
            coachingCues: "Drive elbows down toward hips",
            regression: "Assisted Pull-Up Machine"
          },
          {
            id: "a2",
            name: "Face Pulls",
            sets: 3,
            reps: 15,
            tempo: "1-1-1",
            rest: "45s",
            coachingCues: "External rotation at peak contraction",
            regression: "Band Face Pulls"
          }
        ]
      },
      {
        id: "rotational",
        name: "Rotational/Stance",
        type: "rotational",
        exercises: [
          {
            id: "r1",
            name: "Single-Arm Cable Row",
            sets: 3,
            reps: 10,
            tempo: "2-1-2",
            rest: "45s",
            lastWeight: "40-50lbs",
            coachingCues: "Anti-rotation through core, staggered stance"
          }
        ]
      },
      {
        id: "conditioning",
        name: "Conditioning",
        type: "conditioning",
        exercises: [
          {
            id: "c1",
            name: "Rowing Machine Intervals",
            sets: 5,
            reps: 1,
            effort: "85%",
            rest: "60s",
            coachingCues: "250m sprints, focus on leg drive"
          }
        ]
      },
      {
        id: "cooldown",
        name: "Cooldown",
        type: "cooldown",
        exercises: [
          {
            id: "cd1",
            name: "Child's Pose",
            sets: 1,
            reps: 1,
            rest: "60s",
            coachingCues: "Deep breathing, lat stretch"
          },
          {
            id: "cd2",
            name: "Thread the Needle",
            sets: 1,
            reps: 8,
            rest: "0s",
            coachingCues: "Hold 5 seconds each side"
          }
        ]
      }
    ]
  };
};
