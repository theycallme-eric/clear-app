export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      exercise_anchors: {
        Row: {
          anchor: Database["public"]["Enums"]["anchor_type"]
          created_at: string | null
          exercise_id: string
          id: string
          is_primary: boolean | null
        }
        Insert: {
          anchor: Database["public"]["Enums"]["anchor_type"]
          created_at?: string | null
          exercise_id: string
          id?: string
          is_primary?: boolean | null
        }
        Update: {
          anchor?: Database["public"]["Enums"]["anchor_type"]
          created_at?: string | null
          exercise_id?: string
          id?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_anchors_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_anchors_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_definitions_with_anchors"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_definitions: {
        Row: {
          can_be_primary: boolean
          coaching_cues: string[] | null
          created_at: string
          default_equipment: string
          equipment_display_names: Json | null
          equipment_options: string[]
          id: string
          name: string
          pattern_id: string
          progression: string | null
          regression: string | null
          sections: Database["public"]["Enums"]["section_type"][]
          updated_at: string
        }
        Insert: {
          can_be_primary?: boolean
          coaching_cues?: string[] | null
          created_at?: string
          default_equipment: string
          equipment_display_names?: Json | null
          equipment_options: string[]
          id: string
          name: string
          pattern_id: string
          progression?: string | null
          regression?: string | null
          sections: Database["public"]["Enums"]["section_type"][]
          updated_at?: string
        }
        Update: {
          can_be_primary?: boolean
          coaching_cues?: string[] | null
          created_at?: string
          default_equipment?: string
          equipment_display_names?: Json | null
          equipment_options?: string[]
          id?: string
          name?: string
          pattern_id?: string
          progression?: string | null
          regression?: string | null
          sections?: Database["public"]["Enums"]["section_type"][]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_definitions_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "movement_patterns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_definitions_progression_fkey"
            columns: ["progression"]
            isOneToOne: false
            referencedRelation: "exercise_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_definitions_progression_fkey"
            columns: ["progression"]
            isOneToOne: false
            referencedRelation: "exercise_definitions_with_anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_definitions_regression_fkey"
            columns: ["regression"]
            isOneToOne: false
            referencedRelation: "exercise_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_definitions_regression_fkey"
            columns: ["regression"]
            isOneToOne: false
            referencedRelation: "exercise_definitions_with_anchors"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          coaching_cues: string | null
          created_at: string
          effort_percent: number | null
          equipment_used: string
          exercise_id: string
          exercise_notes: string | null
          id: string
          order_index: number
          reps: string
          rest_seconds: number | null
          section_id: string
          sets: number | null
          tempo: string | null
          updated_at: string
          weight_logged: string | null
        }
        Insert: {
          coaching_cues?: string | null
          created_at?: string
          effort_percent?: number | null
          equipment_used: string
          exercise_id: string
          exercise_notes?: string | null
          id?: string
          order_index: number
          reps: string
          rest_seconds?: number | null
          section_id: string
          sets?: number | null
          tempo?: string | null
          updated_at?: string
          weight_logged?: string | null
        }
        Update: {
          coaching_cues?: string | null
          created_at?: string
          effort_percent?: number | null
          equipment_used?: string
          exercise_id?: string
          exercise_notes?: string | null
          id?: string
          order_index?: number
          reps?: string
          rest_seconds?: number | null
          section_id?: string
          sets?: number | null
          tempo?: string | null
          updated_at?: string
          weight_logged?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_definitions_with_anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "workout_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          created_at: string
          equipment: string[]
          id: string
          is_default: boolean
          name: string
          tier: Database["public"]["Enums"]["equipment_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          equipment?: string[]
          id?: string
          is_default?: boolean
          name: string
          tier: Database["public"]["Enums"]["equipment_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          equipment?: string[]
          id?: string
          is_default?: boolean
          name?: string
          tier?: Database["public"]["Enums"]["equipment_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      movement_patterns: {
        Row: {
          anchor: Database["public"]["Enums"]["anchor_type"]
          category: Database["public"]["Enums"]["movement_category"]
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          anchor: Database["public"]["Enums"]["anchor_type"]
          category: Database["public"]["Enums"]["movement_category"]
          created_at?: string
          description?: string | null
          id: string
          name: string
        }
        Update: {
          anchor?: Database["public"]["Enums"]["anchor_type"]
          category?: Database["public"]["Enums"]["movement_category"]
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          consecutive_rest_days: number
          created_at: string
          default_location_id: string | null
          enabled_sections: Database["public"]["Enums"]["section_type"][] | null
          experience_level:
            | Database["public"]["Enums"]["experience_level"]
            | null
          goal_preset: Database["public"]["Enums"]["goal_preset"] | null
          id: string
          limitations: string | null
          onboarding_completed: boolean
          streak_count: number
          streak_pause_reason:
            | Database["public"]["Enums"]["streak_pause_reason"]
            | null
          streak_pause_start: string | null
          streak_start_date: string | null
          streak_status: Database["public"]["Enums"]["streak_status"]
          updated_at: string
        }
        Insert: {
          consecutive_rest_days?: number
          created_at?: string
          default_location_id?: string | null
          enabled_sections?:
            | Database["public"]["Enums"]["section_type"][]
            | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          goal_preset?: Database["public"]["Enums"]["goal_preset"] | null
          id: string
          limitations?: string | null
          onboarding_completed?: boolean
          streak_count?: number
          streak_pause_reason?:
            | Database["public"]["Enums"]["streak_pause_reason"]
            | null
          streak_pause_start?: string | null
          streak_start_date?: string | null
          streak_status?: Database["public"]["Enums"]["streak_status"]
          updated_at?: string
        }
        Update: {
          consecutive_rest_days?: number
          created_at?: string
          default_location_id?: string | null
          enabled_sections?:
            | Database["public"]["Enums"]["section_type"][]
            | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          goal_preset?: Database["public"]["Enums"]["goal_preset"] | null
          id?: string
          limitations?: string | null
          onboarding_completed?: boolean
          streak_count?: number
          streak_pause_reason?:
            | Database["public"]["Enums"]["streak_pause_reason"]
            | null
          streak_pause_start?: string | null
          streak_start_date?: string | null
          streak_status?: Database["public"]["Enums"]["streak_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_default_location"
            columns: ["default_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      structure_results: {
        Row: {
          completed_under_cap: boolean | null
          completion_time_seconds: number | null
          created_at: string | null
          highest_rung: number | null
          id: string
          notes: string | null
          rep_scheme: string | null
          rounds_completed: number | null
          section_id: string | null
          structure_type: string
        }
        Insert: {
          completed_under_cap?: boolean | null
          completion_time_seconds?: number | null
          created_at?: string | null
          highest_rung?: number | null
          id?: string
          notes?: string | null
          rep_scheme?: string | null
          rounds_completed?: number | null
          section_id?: string | null
          structure_type: string
        }
        Update: {
          completed_under_cap?: boolean | null
          completion_time_seconds?: number | null
          created_at?: string | null
          highest_rung?: number | null
          id?: string
          notes?: string | null
          rep_scheme?: string | null
          rounds_completed?: number | null
          section_id?: string | null
          structure_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "structure_results_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "workout_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sections: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          order_index: number
          section_notes: string | null
          section_type: Database["public"]["Enums"]["section_type"]
          session_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["section_status"] | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          order_index: number
          section_notes?: string | null
          section_type: Database["public"]["Enums"]["section_type"]
          session_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["section_status"] | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          order_index?: number
          section_notes?: string | null
          section_type?: Database["public"]["Enums"]["section_type"]
          session_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["section_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sections_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          anchor: Database["public"]["Enums"]["anchor_type"]
          completed_at: string | null
          counts_for_streak: boolean
          created_at: string
          date: string
          duration_mins: number | null
          generation_notes: string | null
          goal_preset: Database["public"]["Enums"]["goal_preset"] | null
          id: string
          intensity: number
          is_rest_day: boolean
          location_id: string | null
          mood: string | null
          prompt_version: string | null
          rest_day_reason: Database["public"]["Enums"]["rest_day_reason"] | null
          session_notes: string | null
          time_target_mins: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          anchor: Database["public"]["Enums"]["anchor_type"]
          completed_at?: string | null
          counts_for_streak?: boolean
          created_at?: string
          date: string
          duration_mins?: number | null
          generation_notes?: string | null
          goal_preset?: Database["public"]["Enums"]["goal_preset"] | null
          id?: string
          intensity: number
          is_rest_day?: boolean
          location_id?: string | null
          mood?: string | null
          prompt_version?: string | null
          rest_day_reason?:
            | Database["public"]["Enums"]["rest_day_reason"]
            | null
          session_notes?: string | null
          time_target_mins?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          anchor?: Database["public"]["Enums"]["anchor_type"]
          completed_at?: string | null
          counts_for_streak?: boolean
          created_at?: string
          date?: string
          duration_mins?: number | null
          generation_notes?: string | null
          goal_preset?: Database["public"]["Enums"]["goal_preset"] | null
          id?: string
          intensity?: number
          is_rest_day?: boolean
          location_id?: string | null
          mood?: string | null
          prompt_version?: string | null
          rest_day_reason?:
            | Database["public"]["Enums"]["rest_day_reason"]
            | null
          session_notes?: string | null
          time_target_mins?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_sessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      exercise_definitions_with_anchors: {
        Row: {
          anchors: Database["public"]["Enums"]["anchor_type"][] | null
          can_be_primary: boolean | null
          coaching_cues: string[] | null
          created_at: string | null
          default_equipment: string | null
          equipment_display_names: Json | null
          equipment_options: string[] | null
          id: string | null
          name: string | null
          pattern_id: string | null
          primary_anchor: Database["public"]["Enums"]["anchor_type"] | null
          progression: string | null
          regression: string | null
          sections: Database["public"]["Enums"]["section_type"][] | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_definitions_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "movement_patterns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_definitions_progression_fkey"
            columns: ["progression"]
            isOneToOne: false
            referencedRelation: "exercise_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_definitions_progression_fkey"
            columns: ["progression"]
            isOneToOne: false
            referencedRelation: "exercise_definitions_with_anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_definitions_regression_fkey"
            columns: ["regression"]
            isOneToOne: false
            referencedRelation: "exercise_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_definitions_regression_fkey"
            columns: ["regression"]
            isOneToOne: false
            referencedRelation: "exercise_definitions_with_anchors"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises_with_context: {
        Row: {
          anchor: Database["public"]["Enums"]["anchor_type"] | null
          coaching_cues: string | null
          created_at: string | null
          effort_percent: number | null
          equipment_used: string | null
          exercise_id: string | null
          exercise_name: string | null
          exercise_notes: string | null
          id: string | null
          order_index: number | null
          pattern_id: string | null
          reps: string | null
          rest_seconds: number | null
          section_id: string | null
          section_type: Database["public"]["Enums"]["section_type"] | null
          sets: number | null
          tempo: string | null
          updated_at: string | null
          user_id: string | null
          weight_logged: string | null
          workout_date: string | null
          workout_intensity: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_definitions_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "movement_patterns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercise_definitions_with_anchors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercises_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "workout_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      complete_onboarding: {
        Args: {
          p_equipment: string[]
          p_experience_level: Database["public"]["Enums"]["experience_level"]
          p_goal_preset: Database["public"]["Enums"]["goal_preset"]
          p_limitations?: string
          p_location_name: string
          p_location_tier: Database["public"]["Enums"]["equipment_tier"]
          p_sections: Database["public"]["Enums"]["section_type"][]
          p_user_id: string
        }
        Returns: string
      }
      save_generated_workout: {
        Args: {
          p_anchor: Database["public"]["Enums"]["anchor_type"]
          p_date: string
          p_goal_preset?: Database["public"]["Enums"]["goal_preset"]
          p_intensity: number
          p_location_id: string
          p_prompt_version?: string
          p_sections: Json
          p_time_target_mins?: number
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      anchor_type:
        | "squat"
        | "hinge"
        | "press"
        | "pull"
        | "power"
        | "surprise"
        | "upper_body"
        | "lower_body"
        | "full_body"
      equipment_tier: "minimal" | "home" | "building" | "full"
      experience_level: "new" | "some" | "confident"
      goal_preset:
        | "strength"
        | "balanced"
        | "conditioning"
        | "quick"
        | "hypertrophy"
        | "active_recovery"
      movement_category: "lower_body" | "upper_body" | "core" | "full_body"
      rest_day_reason: "rest" | "injury" | "sick"
      section_status: "not_started" | "completed" | "skipped"
      section_type:
        | "warmup"
        | "mobility"
        | "primary_lift"
        | "accessory"
        | "skill_power"
        | "carries"
        | "core"
        | "stability_balance"
        | "conditioning"
        | "cooldown"
      streak_pause_reason: "injury" | "sick" | "vacation"
      streak_status: "active" | "paused"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      anchor_type: [
        "squat",
        "hinge",
        "press",
        "pull",
        "power",
        "surprise",
        "upper_body",
        "lower_body",
        "full_body",
      ],
      equipment_tier: ["minimal", "home", "building", "full"],
      experience_level: ["new", "some", "confident"],
      goal_preset: [
        "strength",
        "balanced",
        "conditioning",
        "quick",
        "hypertrophy",
        "active_recovery",
      ],
      movement_category: ["lower_body", "upper_body", "core", "full_body"],
      rest_day_reason: ["rest", "injury", "sick"],
      section_status: ["not_started", "completed", "skipped"],
      section_type: [
        "warmup",
        "mobility",
        "primary_lift",
        "accessory",
        "skill_power",
        "carries",
        "core",
        "stability_balance",
        "conditioning",
        "cooldown",
      ],
      streak_pause_reason: ["injury", "sick", "vacation"],
      streak_status: ["active", "paused"],
    },
  },
} as const

