export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      boss_kills: {
        Row: {
          boss_name: string
          id: string
          is_realm_first: boolean
          killed_at: string
          pull_count: number | null
          raid_event_id: string
        }
        Insert: {
          boss_name: string
          id?: string
          is_realm_first?: boolean
          killed_at?: string
          pull_count?: number | null
          raid_event_id: string
        }
        Update: {
          boss_name?: string
          id?: string
          is_realm_first?: boolean
          killed_at?: string
          pull_count?: number | null
          raid_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "boss_kills_raid_event_id_fkey"
            columns: ["raid_event_id"]
            isOneToOne: false
            referencedRelation: "raid_events"
            referencedColumns: ["id"]
          },
        ]
      }
      characters: {
        Row: {
          armory_url: string | null
          class: Database["public"]["Enums"]["wow_class"]
          created_at: string
          id: string
          ilvl: number
          is_main: boolean
          name: string
          owner_id: string
          professions: string[]
          role: Database["public"]["Enums"]["character_role"]
          spec_primary: string
          spec_secondary: string | null
          updated_at: string
        }
        Insert: {
          armory_url?: string | null
          class: Database["public"]["Enums"]["wow_class"]
          created_at?: string
          id?: string
          ilvl?: number
          is_main?: boolean
          name: string
          owner_id: string
          professions?: string[]
          role: Database["public"]["Enums"]["character_role"]
          spec_primary: string
          spec_secondary?: string | null
          updated_at?: string
        }
        Update: {
          armory_url?: string | null
          class?: Database["public"]["Enums"]["wow_class"]
          created_at?: string
          id?: string
          ilvl?: number
          is_main?: boolean
          name?: string
          owner_id?: string
          professions?: string[]
          role?: Database["public"]["Enums"]["character_role"]
          spec_primary?: string
          spec_secondary?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "characters_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      loot_items: {
        Row: {
          awarded_at: string
          awarded_by: string | null
          boss_name: string | null
          character_id: string
          id: string
          item_name: string
          notes: string | null
          raid_event_id: string | null
          wowhead_item_id: number | null
        }
        Insert: {
          awarded_at?: string
          awarded_by?: string | null
          boss_name?: string | null
          character_id: string
          id?: string
          item_name: string
          notes?: string | null
          raid_event_id?: string | null
          wowhead_item_id?: number | null
        }
        Update: {
          awarded_at?: string
          awarded_by?: string | null
          boss_name?: string | null
          character_id?: string
          id?: string
          item_name?: string
          notes?: string | null
          raid_event_id?: string | null
          wowhead_item_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loot_items_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loot_items_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loot_items_raid_event_id_fkey"
            columns: ["raid_event_id"]
            isOneToOne: false
            referencedRelation: "raid_events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          discord_avatar_url: string | null
          discord_username: string
          guild_role: Database["public"]["Enums"]["guild_role"]
          id: string
        }
        Insert: {
          created_at?: string
          discord_avatar_url?: string | null
          discord_username: string
          guild_role?: Database["public"]["Enums"]["guild_role"]
          id: string
        }
        Update: {
          created_at?: string
          discord_avatar_url?: string | null
          discord_username?: string
          guild_role?: Database["public"]["Enums"]["guild_role"]
          id?: string
        }
        Relationships: []
      }
      raid_events: {
        Row: {
          created_at: string
          created_by: string
          id: string
          notes: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["raid_event_status"]
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["raid_event_status"]
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["raid_event_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "raid_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      raid_signups: {
        Row: {
          character_id: string
          id: string
          raid_event_id: string
          signed_up_at: string
          status: Database["public"]["Enums"]["rsvp_status"]
        }
        Insert: {
          character_id: string
          id?: string
          raid_event_id: string
          signed_up_at?: string
          status?: Database["public"]["Enums"]["rsvp_status"]
        }
        Update: {
          character_id?: string
          id?: string
          raid_event_id?: string
          signed_up_at?: string
          status?: Database["public"]["Enums"]["rsvp_status"]
        }
        Relationships: [
          {
            foreignKeyName: "raid_signups_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raid_signups_raid_event_id_fkey"
            columns: ["raid_event_id"]
            isOneToOne: false
            referencedRelation: "raid_events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_guild_master: { Args: { uid: string }; Returns: boolean }
      is_officer: { Args: { uid: string }; Returns: boolean }
    }
    Enums: {
      character_role: "tank" | "healer" | "dps"
      guild_role: "officer" | "raider" | "trial" | "applicant" | "guild_master"
      raid_event_status: "scheduled" | "completed" | "cancelled"
      rsvp_status: "confirmed" | "tentative" | "absent" | "bench"
      wow_class:
        | "warrior"
        | "paladin"
        | "hunter"
        | "rogue"
        | "priest"
        | "death_knight"
        | "shaman"
        | "mage"
        | "warlock"
        | "druid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]
export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T]
