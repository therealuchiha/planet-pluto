/**
 * Hand-written Supabase types matching `supabase/migrations/*_init_anitrack.sql`.
 * Regenerate with: `npx supabase gen types typescript --project-id <id> > src/lib/database.types.ts`
 */

export const LIST_STATUSES = ["CURRENT", "COMPLETED", "PAUSED", "DROPPED", "PLANNING"] as const;
export type ListStatus = (typeof LIST_STATUSES)[number];

export const STATUS_LABELS: Record<ListStatus, string> = {
  CURRENT: "Watching",
  COMPLETED: "Completed",
  PAUSED: "Paused",
  DROPPED: "Dropped",
  PLANNING: "Planning",
};

export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type ListEntry = {
  id: string;
  user_id: string;
  media_id: number;
  title: string;
  cover_image: string | null;
  total_episodes: number | null;
  status: ListStatus;
  progress: number;
  score: number | null;
  notes: string | null;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Omit<Profile, "id">> & { id: string };
        Update: Partial<Profile>;
        Relationships: [];
      };
      user_anime_list: {
        Row: ListEntry;
        Insert: Omit<ListEntry, "id" | "updated_at" | "progress" | "status" | "score" | "notes"> &
          Partial<Pick<ListEntry, "id" | "updated_at" | "progress" | "status" | "score" | "notes">>;
        Update: Partial<ListEntry>;
        Relationships: [
          {
            foreignKeyName: "user_anime_list_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
