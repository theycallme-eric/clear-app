// User-facing anchor types (what user selects in UI)
export type AnchorType = 'LOWER BODY' | 'UPPER BODY' | 'FULL BODY' | 'POWER';

// Movement patterns (what gets sent to API and stored in DB)
export type MovementPattern = 'squat' | 'hinge' | 'press' | 'pull' | 'power';

// Per-set log data
export interface SetLog {
  setNumber: number;
  weight?: number;
  weightUnit?: 'lbs' | 'kg';
  reps?: number;
  rpe?: number;
}

// Aggregated set data for an exercise
export interface ExerciseSetData {
  sets: SetLog[];
  notes?: string;
}

// Exercise with logged data for history
export interface LoggedExercise {
  id: string;
  name: string;
  sets: number;
  reps: number | string; // can be "10 each" or similar
  weight?: string; // logged weight like "185lbs"
  note?: string; // user note for this exercise
  equipment?: string; // equipment used (e.g. "barbell", "dumbbells")
  setLogs?: SetLog[]; // per-set breakdown (new sessions)
}

// Structure result from a timed section (AMRAP/For Time/EMOM)
export interface LoggedStructureResult {
  structureType: string;
  roundsCompleted?: number | null;
  completionTimeSeconds?: number | null;
  completedUnderCap?: boolean | null;
  highestRung?: number | null;
  repScheme?: string | null;
  notes?: string | null;
}

// Section with logged exercises for history
export interface LoggedSection {
  id: string;
  name: string;
  exercises: LoggedExercise[];
  structureResult?: LoggedStructureResult;
}

// Completed workout history entry
export interface WorkoutHistoryEntry {
  id: string;
  date: Date;
  anchor: string; // Movement pattern stored in DB (squat, hinge, press, pull, power)
  intensity: number;
  duration: number; // in minutes
  goal?: string; // goal preset used
  mood?: number; // 1-5
  sessionNotes?: string;
  sections?: LoggedSection[]; // full workout data for detail view
}

// Streak data
export interface StreakData {
  currentStreak: number;
  lastWorkoutDate: Date | null;
  weekView: Record<string, 'workout' | 'rest' | null>; // ISO date string -> status
}

// Equipment tiers
export type EquipmentTier = 'minimal' | 'home' | 'building' | 'full';

// Equipment definitions by tier (cumulative)
export const EQUIPMENT_BY_TIER: Record<EquipmentTier, string[]> = {
  minimal: ['Bodyweight', 'Resistance Bands', 'Mat', 'Foam Roller'],
  home: ['Bodyweight', 'Resistance Bands', 'Mat', 'Foam Roller', 'Dumbbells', 'Kettlebells', 'Bench (flat)', 'Pull-up Bar', 'TRX / Suspension Trainer', 'Treadmill'],
  building: ['Bodyweight', 'Resistance Bands', 'Mat', 'Foam Roller', 'Dumbbells', 'Kettlebells', 'Bench (flat)', 'Pull-up Bar', 'TRX / Suspension Trainer', 'Treadmill', 'Barbell', 'Squat Rack / Cage', 'Cable Machine', 'Adjustable Bench', 'Lat Pulldown', 'Rowing Machine'],
  full: ['Bodyweight', 'Resistance Bands', 'Mat', 'Foam Roller', 'Dumbbells', 'Kettlebells', 'Bench (flat)', 'Pull-up Bar', 'TRX / Suspension Trainer', 'Treadmill', 'Barbell', 'Squat Rack / Cage', 'Cable Machine', 'Adjustable Bench', 'Lat Pulldown', 'Rowing Machine', 'Leg Press', 'Smith Machine', 'Hack Squat', 'Chest Press Machine', 'Shoulder Press Machine', 'Leg Curl / Extension', 'Pec Deck / Fly Machine', 'Assisted Pull-up/Dip', 'Battle Ropes', 'Assault Bike', 'Stair Climber'],
};

// Experience levels
export type ExperienceLevel = 'new' | 'some' | 'confident';

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: 'new', label: 'New to This', description: 'Still learning the movements. More guidance is helpful.' },
  { value: 'some', label: 'Some Experience', description: 'Know the basics. Comfortable with common exercises.' },
  { value: 'confident', label: 'Confident', description: "Just tell me what to do. I'll figure it out." },
];

// Goal presets
export type GoalPreset = 'strength' | 'hypertrophy' | 'conditioning' | 'balanced' | 'active_recovery';

export const GOAL_PRESETS: { value: GoalPreset; label: string; description: string }[] = [
  { value: 'strength', label: 'Strength', description: 'Heavy lifts, long rest' },
  { value: 'hypertrophy', label: 'Hypertrophy', description: 'Volume & time under tension' },
  { value: 'conditioning', label: 'Conditioning', description: 'Circuits, AMRAPs, keep moving' },
  { value: 'balanced', label: 'Balanced', description: 'Strength + mobility + conditioning. Adapts to your week.' },
  { value: 'active_recovery', label: 'Recovery', description: 'Gentle movement & mobility' },
];

// Workout sections
export type SectionType = 'warmup' | 'mobility' | 'primary' | 'accessory' | 'skill' | 'carries' | 'core' | 'stability' | 'conditioning' | 'cooldown';

export const WORKOUT_SECTIONS: { id: SectionType; name: string; description: string }[] = [
  { id: 'warmup', name: 'Warm-up', description: 'Light movement to get your body ready' },
  { id: 'mobility', name: 'Mobility', description: 'Focused flexibility and range of motion work' },
  { id: 'primary', name: 'Primary Lift', description: 'The main heavy movement — squats, deadlifts, presses' },
  { id: 'accessory', name: 'Accessory', description: 'Supporting work for the primary lift' },
  { id: 'skill', name: 'Skill / Power', description: 'Explosive movements — jumps, throws, Olympic lifts' },
  { id: 'carries', name: 'Carries', description: "Loaded carries — farmer's walks, suitcase carry" },
  { id: 'core', name: 'Core', description: 'Rotational and stability work for your midsection' },
  { id: 'stability', name: 'Stability / Balance', description: 'Single-leg work, proprioception focus' },
  { id: 'conditioning', name: 'Conditioning', description: 'Cardio, circuits, or higher-intensity finishers' },
  { id: 'cooldown', name: 'Cooldown', description: 'Stretching and recovery to end the session' },
];

// Sections enabled by goal preset
export const SECTIONS_BY_GOAL: Record<GoalPreset, SectionType[]> = {
  strength: ['warmup', 'primary', 'accessory', 'core', 'cooldown'],
  hypertrophy: ['warmup', 'primary', 'accessory', 'core', 'cooldown'],
  conditioning: ['warmup', 'conditioning', 'core', 'cooldown'],
  balanced: ['warmup', 'mobility', 'primary', 'accessory', 'core', 'conditioning', 'cooldown'],
  active_recovery: ['warmup', 'mobility', 'cooldown'],
};

// Intensity range constraints per goal
export const INTENSITY_RANGE_BY_GOAL: Record<GoalPreset, { min: number; max: number; default: number }> = {
  strength: { min: 3, max: 10, default: 6 },
  hypertrophy: { min: 3, max: 9, default: 6 },
  conditioning: { min: 4, max: 10, default: 7 },
  balanced: { min: 1, max: 10, default: 5 },
  active_recovery: { min: 1, max: 3, default: 2 },
};

// Location saved by user
export interface UserLocation {
  id: string;
  name: string;
  tier: EquipmentTier;
  equipment: string[];
}

// Full user preferences
export interface UserPreferences {
  onboardingComplete: boolean;
  locations: UserLocation[];
  defaultLocationId: string | null;
  experienceLevel: ExperienceLevel | null;
  goal: GoalPreset | null;
  sections: SectionType[];
  limitations: string;
}

export type ExerciseStructure =
  | { type: 'standard' }
  | { type: 'superset'; paired_with: string; group_id: string }
  | { type: 'circuit'; circuit_id: string; rounds: number; group_id: string }
  | { type: 'emom'; minutes: number; group_id: string }
  | { type: 'amrap'; minutes: number; group_id: string }
  | { type: 'for_time'; time_cap_mins: number; group_id: string };

export interface StructureResult {
  id: string;
  section_id: string;
  structure_type: 'circuit' | 'emom' | 'amrap' | 'for_time';
  completion_time_seconds?: number;
  completed_under_cap?: boolean;
  rounds_completed?: number;
  rep_scheme?: string;
  highest_rung?: number;
  notes?: string;
  created_at: string;
}

export type SectionStatus = 'not_started' | 'completed' | 'skipped';

export interface Exercise {
  id: string;
  name: string;
  sets: number | null; // Nullable for circuits/timed
  reps: string; // Changed to string for flexibility
  effort?: string;
  tempo?: string;
  rest?: string;
  lastWeight?: string;
  lastNotes?: string;
  lastSetData?: SetLog[]; // Per-set pre-fill from previous session
  exerciseDefinitionId?: string; // exercise_definitions.exercise_id for pre-fill lookup
  coachingCues?: string[]; // Changed to array
  regression?: string;
  progression?: string;
  equipment?: string;
  structure?: ExerciseStructure;
  is_interval_exercise?: boolean;
  weight_logged?: string; // User input
}

export interface WorkoutSection {
  id: string;
  name: string;
  type: SectionType; // Use the specific SectionType
  exercises: Exercise[];
  status: SectionStatus;
  started_at?: string;
  completed_at?: string;
  previousBest?: { structureType: string; value: number };
}

export interface GeneratedWorkout {
  id: string;
  title: string;
  description: string;
  duration: string;
  intensity: number;
  anchor: string;
  goal?: string;
  sections: WorkoutSection[];
  /** Running log of session notes from all previous completions (favorites only) */
  sessionNotesHistory?: Array<{ date: string; notes: string }>;
}

// Generation parameters (what user selects before generating)
// Goal is read from user profile, not selected per-workout
export interface WorkoutParams {
  intensity: number;
  anchor: AnchorType;
  location: string;
  time: string;
  notes: string;
}

// Workout notes collected during and after workout
export interface WorkoutNotes {
  loggedData: Record<string, { weight?: string; reps?: string; notes?: string }>;
  setLogData?: Record<string, ExerciseSetData>; // Per-set data keyed by exercise row UUID
  structureResults: Record<string, {
    structure_type: string;
    rounds_completed?: number;
    completion_time_seconds?: number;
    completed_under_cap?: boolean;
    rep_scheme?: string;
    highest_rung?: number | null;
    notes?: string | null;
  }>;
  durationSeconds: number;
}

// Mock data generator for prototype
// Generate mock workout history with full detail data
export const generateMockWorkoutHistory = (): WorkoutHistoryEntry[] => {
  const today = new Date();

  return [
    {
      id: crypto.randomUUID(),
      date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      anchor: 'hinge',
      intensity: 7,
      duration: 42,
      goal: 'Balanced',
      mood: 4,
      sessionNotes: 'Good session. Deadlifts felt strong today.',
      sections: [
        {
          id: 'warmup',
          name: 'Warm-up',
          exercises: [
            { id: 'w1', name: 'Cat-Cow', sets: 2, reps: 10 },
            { id: 'w2', name: 'Hip Circles', sets: 2, reps: '10 each' },
          ],
        },
        {
          id: 'primary',
          name: 'Primary Lift',
          exercises: [
            { id: 'p1', name: 'Conventional Deadlift', sets: 4, reps: 6, weight: '225lbs', note: 'Felt heavy but moved well' },
          ],
        },
        {
          id: 'accessory',
          name: 'Accessory',
          exercises: [
            { id: 'a1', name: 'Romanian Deadlift', sets: 3, reps: 10, weight: '135lbs' },
            { id: 'a2', name: 'Leg Curl', sets: 3, reps: 12, weight: '90lbs' },
          ],
        },
        {
          id: 'core',
          name: 'Core',
          exercises: [
            { id: 'c1', name: 'Dead Bug', sets: 3, reps: '8 each' },
            { id: 'c2', name: 'Pallof Press', sets: 3, reps: '10 each' },
          ],
        },
        {
          id: 'cooldown',
          name: 'Cooldown',
          exercises: [
            { id: 'cd1', name: 'Pigeon Pose', sets: 1, reps: '60s each' },
            { id: 'cd2', name: 'Hamstring Stretch', sets: 1, reps: '45s each' },
          ],
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      anchor: 'squat',
      intensity: 8,
      duration: 51,
      goal: 'Strength',
      mood: 5,
      sessionNotes: 'PR day! Hit 185 for 6 reps on back squat.',
      sections: [
        {
          id: 'warmup',
          name: 'Warm-up',
          exercises: [
            { id: 'w1', name: 'Goblet Squat Hold', sets: 2, reps: '30s' },
            { id: 'w2', name: 'Leg Swings', sets: 2, reps: '10 each' },
          ],
        },
        {
          id: 'primary',
          name: 'Primary Lift',
          exercises: [
            { id: 'p1', name: 'Barbell Back Squat', sets: 4, reps: 6, weight: '185lbs', note: 'New PR!' },
          ],
        },
        {
          id: 'accessory',
          name: 'Accessory',
          exercises: [
            { id: 'a1', name: 'Bulgarian Split Squat', sets: 3, reps: '10 each', weight: '35lbs' },
            { id: 'a2', name: 'Leg Press', sets: 3, reps: 12, weight: '180lbs' },
          ],
        },
        {
          id: 'core',
          name: 'Core',
          exercises: [
            { id: 'c1', name: 'Plank', sets: 3, reps: '45s' },
          ],
        },
        {
          id: 'conditioning',
          name: 'Conditioning',
          exercises: [
            { id: 'co1', name: 'Bike Intervals', sets: 6, reps: '30s on/30s off' },
          ],
        },
        {
          id: 'cooldown',
          name: 'Cooldown',
          exercises: [
            { id: 'cd1', name: 'Couch Stretch', sets: 1, reps: '90s each' },
          ],
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      anchor: 'press',
      intensity: 6,
      duration: 38,
      goal: 'Balanced',
      mood: 3,
      sections: [
        {
          id: 'warmup',
          name: 'Warm-up',
          exercises: [
            { id: 'w1', name: 'Arm Circles', sets: 2, reps: 15 },
            { id: 'w2', name: 'Band Pull-Aparts', sets: 2, reps: 15 },
          ],
        },
        {
          id: 'primary',
          name: 'Primary Lift',
          exercises: [
            { id: 'p1', name: 'Overhead Press', sets: 4, reps: 8, weight: '95lbs' },
          ],
        },
        {
          id: 'accessory',
          name: 'Accessory',
          exercises: [
            { id: 'a1', name: 'Incline Dumbbell Press', sets: 3, reps: 10, weight: '50lbs' },
            { id: 'a2', name: 'Lateral Raises', sets: 3, reps: 12, weight: '15lbs' },
          ],
        },
        {
          id: 'core',
          name: 'Core',
          exercises: [
            { id: 'c1', name: 'Ab Wheel Rollout', sets: 3, reps: 10 },
          ],
        },
        {
          id: 'cooldown',
          name: 'Cooldown',
          exercises: [
            { id: 'cd1', name: 'Shoulder Stretch', sets: 1, reps: '45s each' },
          ],
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      anchor: 'pull',
      intensity: 7,
      duration: 44,
      goal: 'Balanced',
      mood: 4,
      sections: [
        {
          id: 'primary',
          name: 'Primary Lift',
          exercises: [
            { id: 'p1', name: 'Barbell Row', sets: 4, reps: 8, weight: '135lbs' },
          ],
        },
        {
          id: 'accessory',
          name: 'Accessory',
          exercises: [
            { id: 'a1', name: 'Lat Pulldown', sets: 3, reps: 12, weight: '120lbs' },
            { id: 'a2', name: 'Face Pulls', sets: 3, reps: 15, weight: '40lbs' },
          ],
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      date: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      anchor: 'power',
      intensity: 5,
      duration: 35,
      goal: 'Conditioning',
      mood: 4,
    },
    // November entries
    {
      id: crypto.randomUUID(),
      date: new Date(today.getFullYear(), today.getMonth() - 1, 28), // Last month
      anchor: 'pull',
      intensity: 7,
      duration: 44,
      goal: 'Balanced',
      mood: 4,
    },
    {
      id: crypto.randomUUID(),
      date: new Date(today.getFullYear(), today.getMonth() - 1, 25),
      anchor: 'squat',
      intensity: 6,
      duration: 40,
      goal: 'Strength',
      mood: 3,
    },
    {
      id: crypto.randomUUID(),
      date: new Date(today.getFullYear(), today.getMonth() - 1, 22),
      anchor: 'hinge',
      intensity: 8,
      duration: 48,
      goal: 'Balanced',
      mood: 5,
    },
  ];
};

// Generate mock streak data
export const generateMockStreakData = (): StreakData => {
  const today = new Date();
  const weekView: Record<string, 'workout' | 'rest' | null> = {};

  // Get Monday of current week
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  // Fill in the week view (Mon-Sun)
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];

    if (date > today) {
      weekView[dateKey] = null; // Future days
    } else if (i === 2) {
      weekView[dateKey] = 'rest'; // Wednesday was rest
    } else if (date <= today) {
      weekView[dateKey] = 'workout'; // Workout days
    }
  }

  return {
    currentStreak: 12,
    lastWorkoutDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
    weekView,
  };
};

// Get suggested anchor based on least recently worked body region
export const getSuggestedAnchor = (history: WorkoutHistoryEntry[]): AnchorType => {
  if (history.length === 0) {
    return 'FULL BODY'; // Default for new users
  }

  // Categorize recent workouts by body region
  const recentPatterns = history.slice(0, 5).map(w => w.anchor.toLowerCase());

  // Find last occurrence of each category
  let lastLower = -1;
  let lastUpper = -1;
  let lastFull = -1;

  recentPatterns.forEach((pattern, index) => {
    if (pattern === 'squat' || pattern === 'hinge') {
      if (lastLower === -1) lastLower = index;
    } else if (pattern === 'press' || pattern === 'pull') {
      if (lastUpper === -1) lastUpper = index;
    } else if (pattern === 'power') {
      if (lastFull === -1) lastFull = index;
    }
  });

  // Suggest the category that was least recently used (or never used)
  // -1 means never used, which is highest priority
  if (lastLower === -1) return 'LOWER BODY';
  if (lastUpper === -1) return 'UPPER BODY';
  if (lastFull === -1) return 'FULL BODY';

  // All categories have been used, pick the one done longest ago
  const maxIndex = Math.max(lastLower, lastUpper, lastFull);
  if (maxIndex === lastLower) return 'LOWER BODY';
  if (maxIndex === lastUpper) return 'UPPER BODY';
  return 'FULL BODY';
};

// Get suggested intensity (from last workout)
export const getSuggestedIntensity = (history: WorkoutHistoryEntry[]): number => {
  if (history.length === 0) return 7; // Default
  return history[0].intensity;
};

// Mock user preferences for returning users
export const getMockUserPreferences = (): UserPreferences => {
  return {
    onboardingComplete: true, // Set to true so we see Home screen
    locations: [
      {
        id: crypto.randomUUID(),
        name: 'Building Gym',
        tier: 'building',
        equipment: EQUIPMENT_BY_TIER.building,
      },
    ],
    defaultLocationId: null, // Will be set to first location's id
    experienceLevel: 'confident',
    goal: 'balanced' as GoalPreset,
    sections: SECTIONS_BY_GOAL.balanced,
    limitations: '',
  };
};

// Get default/empty preferences for new users
export const getDefaultUserPreferences = (): UserPreferences => {
  return {
    onboardingComplete: false,
    locations: [],
    defaultLocationId: null,
    experienceLevel: null,
    goal: null,
    sections: [],
    limitations: '',
  };
};

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
        status: "not_started",
        exercises: [
          {
            id: "w1",
            name: "Band Pull-Aparts",
            sets: 2,
            reps: "15",
            tempo: "1-0-1",
            rest: "30s",
            coachingCues: ["Squeeze shoulder blades together at end range"],
            regression: "Lighter band tension",
            structure: { type: 'standard' }
          },
          {
            id: "w2",
            name: "Cat-Cow Stretch",
            sets: 2,
            reps: "10",
            tempo: "2-1-2",
            rest: "0s",
            coachingCues: ["Full spinal flexion and extension"],
            structure: { type: 'standard' }
          }
        ]
      },
      {
        id: "primary",
        name: "Primary Lift",
        type: "primary",
        status: "not_started",
        exercises: [
          {
            id: "p1",
            name: "Barbell Bent-Over Row",
            sets: 4,
            reps: "8",
            effort: "65%",
            tempo: "2-1-2",
            rest: "90s",
            lastWeight: "115-135lbs",
            coachingCues: ["Neutral spine, bar to ribcage"],
            regression: "Seated Cable Row",
            progression: "Pendlay Row",
            structure: { type: 'standard' }
          }
        ]
      },
      {
        id: "accessory",
        name: "Accessory Block",
        type: "accessory",
        status: "not_started",
        exercises: [
          {
            id: "a1",
            name: "Lat Pulldown",
            sets: 3,
            reps: "12",
            effort: "RPE 7",
            tempo: "2-0-2",
            rest: "60s",
            lastWeight: "120-140lbs",
            coachingCues: ["Drive elbows down toward hips"],
            regression: "Assisted Pull-Up Machine",
            structure: { type: 'standard' }
          },
          {
            id: "a2",
            name: "Face Pulls",
            sets: 3,
            reps: "15",
            tempo: "1-1-1",
            rest: "45s",
            coachingCues: ["External rotation at peak contraction"],
            regression: "Band Face Pulls",
            structure: { type: 'standard' }
          }
        ]
      },
      {
        id: "rotational",
        name: "Rotational/Stance",
        type: "core", /* Replaced invalid 'rotational' with 'core' */
        status: "not_started",
        exercises: [
          {
            id: "r1",
            name: "Single-Arm Cable Row",
            sets: 3,
            reps: "10",
            tempo: "2-1-2",
            rest: "45s",
            lastWeight: "40-50lbs",
            coachingCues: ["Anti-rotation through core, staggered stance"],
            structure: { type: 'standard' }
          }
        ]
      },
      {
        id: "conditioning",
        name: "Conditioning",
        type: "conditioning",
        status: "not_started",
        exercises: [
          {
            id: "c1",
            name: "Rowing Machine Intervals",
            sets: 5,
            reps: "1",
            effort: "85%",
            rest: "60s",
            coachingCues: ["250m sprints, focus on leg drive"],
            structure: { type: 'standard' }
          }
        ]
      },
      {
        id: "cooldown",
        name: "Cooldown",
        type: "cooldown",
        status: "not_started",
        exercises: [
          {
            id: "cd1",
            name: "Child's Pose",
            sets: 1,
            reps: "1",
            rest: "60s",
            coachingCues: ["Deep breathing, lat stretch"],
            structure: { type: 'standard' }
          },
          {
            id: "cd2",
            name: "Thread the Needle",
            sets: 1,
            reps: "8",
            rest: "0s",
            coachingCues: ["Hold 5 seconds each side"],
            structure: { type: 'standard' }
          }
        ]
      }
    ]
  };
};
