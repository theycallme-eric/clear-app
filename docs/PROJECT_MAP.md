# Project Map: 5-3-1 Workout Generator

**Goal:** This document provides a high-level overview of the codebase for designers and developers new to the project.

## 1. Tech Stack Scan
**Frontend Framework:** **React (v19)** with **Vite**.
**Styling:** **Tailwind CSS**.
**Backend/Database:** **Supabase** (PostgreSQL + Edge Functions).
**Routing:** Custom state-based routing within `Index.tsx` (Single Page Application behavior).

**Key Libraries:**
*   **`@supabase/supabase-js`**: Connects the app to the database and handles login.
*   **`sonner`**: Displays the "toast" notifications (popups like "Workout Saved").
*   **`lucide-react`**: Provides the icons used throughout the app (Zap, Dumbbell, etc.).
*   **`clsx` / `tailwind-merge`**: Utilities for combining CSS classes dynamically.
*   **`class-variance-authority`**: Manages different visual styles of components (like button variants).

## 2. Data Flow: "Generate Workout"
Here is how the application creates a workout for the user:

1.  **User Action:** User clicks "Generate Workout" on the Home Screen.
2.  **Navigation:** The app switches the view to the Generation Screen (handled in `src/pages/Index.tsx`).
3.  **Configuration:** User selects muscle focus (Anchor), intensity, and time.
4.  **Submission:** User clicks "Generate".
5.  **API Call:**
    *   The app calls `generateWorkout` in `src/lib/workout-api.ts`.
    *   This function securely calls a Supabase Edge Function named `generate-workout`.
    *   *Note: This is where the AI logic lives (server-side).*
6.  **Database Save:**
    *   If successful, the app immediately saves the new workout to the `workout_sessions` table in Supabase via `saveGeneratedWorkout`.
7.  **Response:** The app receives the workout data and displays the Review Screen.

**Main Logic File:** `src/pages/Index.tsx` (Orchestrates the entire flow) & `src/lib/workout-api.ts` (Talks to the backend).

## 3. Environment & Safety Check
*   **API Keys:** ✅ Safe. No hardcoded keys found. usage of `import.meta.env.VITE_SUPABASE_URL` is correct.
*   **Type Safety:** ✅ Good.
    *   `src/types/database.ts`: Contains strict definitions for your Database tables (auto-generated).
    *   `src/types/workout.ts`: Defines the shape of workout objects used in the UI.

## 4. File Glossary (The Top 5)
If you want to change the design, these are the files you will touch most often:

1.  **`src/pages/Index.tsx`**: The "Main Controller". It decides which screen is visible (Home, Generation, Workout, etc.) and manages the app's global state.
2.  **`src/pages/HomeScreen.tsx`**: The dashboard. Shows streaks/history and the main "Generate" button.
3.  **`src/index.css`**: Global styles. This is where the master definitions for colors, fonts, and base Tailwind settings live.
4.  **`src/components/`**: The folder containing reusable UI blocks (Buttons, Cards, Headers).
5.  **`src/lib/workout-api.ts`**: The bridge between the Frontend and the AI/Database.

## 5. Risk Report
*   **Custom Routing:** The app uses a simple "switch" statement in `Index.tsx` to change screens (`currentScreen` state). As the app grows, this file is becoming very large (800+ lines). It may become hard to maintain.
*   **Data Fetching:** The app manually fetches data in `useEffect` hooks. Most modern React apps use a library like `React Query` (which is installed but appears under-utilized in the main logic) to handle caching and loading states better.
*   **Type Casting:** There is some manual "casting" (forcing types) in the API response logic, which could hide bugs if the Backend changes its response format.

---
*Audit completed by Antigravity.*
