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
      application_comments: {
        Row: {
          application_id: string
          author_id: string
          body: string
          created_at: string
          id: string
        }
        Insert: {
          application_id: string
          author_id: string
          body: string
          created_at?: string
          id?: string
        }
        Update: {
          application_id?: string
          author_id?: string
          body?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_comments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applicant_type: Database["public"]["Enums"]["applicant_type"]
          availability: string | null
          class: Database["public"]["Enums"]["wow_class"] | null
          created_at: string
          experience: string | null
          gearscore: number | null
          id: string
          logs_url: string | null
          previous_guild: string | null
          previous_server: string | null
          profile_id: string
          spec: string | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          applicant_type: Database["public"]["Enums"]["applicant_type"]
          availability?: string | null
          class?: Database["public"]["Enums"]["wow_class"] | null
          created_at?: string
          experience?: string | null
          gearscore?: number | null
          id?: string
          logs_url?: string | null
          previous_guild?: string | null
          previous_server?: string | null
          profile_id: string
          spec?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          applicant_type?: Database["public"]["Enums"]["applicant_type"]
          availability?: string | null
          class?: Database["public"]["Enums"]["wow_class"] | null
          created_at?: string
          experience?: string | null
          gearscore?: number | null
          id?: string
          logs_url?: string | null
          previous_guild?: string | null
          previous_server?: string | null
          profile_id?: string
          spec?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          gearscore: number
          id: string
          is_main: boolean
          name: string
          owner_id: string
          professions: string[]
          role: Database["public"]["Enums"]["character_role"]
          role_secondary: Database["public"]["Enums"]["character_role"] | null
          server_id: string
          spec_primary: string
          spec_secondary: string | null
          updated_at: string
        }
        Insert: {
          armory_url?: string | null
          class: Database["public"]["Enums"]["wow_class"]
          created_at?: string
          gearscore?: number
          id?: string
          is_main?: boolean
          name: string
          owner_id: string
          professions?: string[]
          role: Database["public"]["Enums"]["character_role"]
          role_secondary?: Database["public"]["Enums"]["character_role"] | null
          server_id: string
          spec_primary: string
          spec_secondary?: string | null
          updated_at?: string
        }
        Update: {
          armory_url?: string | null
          class?: Database["public"]["Enums"]["wow_class"]
          created_at?: string
          gearscore?: number
          id?: string
          is_main?: boolean
          name?: string
          owner_id?: string
          professions?: string[]
          role?: Database["public"]["Enums"]["character_role"]
          role_secondary?: Database["public"]["Enums"]["character_role"] | null
          server_id?: string
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
          {
            foreignKeyName: "characters_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_settings: {
        Row: {
          active_season_id: string | null
          discord_guild_id: string | null
          discord_raider_role_id: string | null
          guild_name: string
          id: number
          recruitment_message: string | null
          recruitment_open: boolean
          timezone: string
          updated_at: string
        }
        Insert: {
          active_season_id?: string | null
          discord_guild_id?: string | null
          discord_raider_role_id?: string | null
          guild_name?: string
          id?: number
          recruitment_message?: string | null
          recruitment_open?: boolean
          timezone?: string
          updated_at?: string
        }
        Update: {
          active_season_id?: string | null
          discord_guild_id?: string | null
          discord_raider_role_id?: string | null
          guild_name?: string
          id?: number
          recruitment_message?: string | null
          recruitment_open?: boolean
          timezone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_settings_active_season_id_fkey"
            columns: ["active_season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
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
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          profile_id: string
          read_at: string | null
          title: string
          url: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          profile_id: string
          read_at?: string | null
          title: string
          url?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          profile_id?: string
          read_at?: string | null
          title?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          discord_avatar_url: string | null
          discord_id: string | null
          discord_username: string
          guild_role: Database["public"]["Enums"]["guild_rank"]
          id: string
          is_trial: boolean
          known_as: string | null
        }
        Insert: {
          created_at?: string
          discord_avatar_url?: string | null
          discord_id?: string | null
          discord_username: string
          guild_role?: Database["public"]["Enums"]["guild_rank"]
          id: string
          is_trial?: boolean
          known_as?: string | null
        }
        Update: {
          created_at?: string
          discord_avatar_url?: string | null
          discord_id?: string | null
          discord_username?: string
          guild_role?: Database["public"]["Enums"]["guild_rank"]
          id?: string
          is_trial?: boolean
          known_as?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          profile_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          profile_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      raid_events: {
        Row: {
          announced_at: string | null
          created_at: string
          created_by: string
          id: string
          notes: string | null
          raid_size: number
          scheduled_at: string
          status: Database["public"]["Enums"]["raid_event_status"]
          title: string
        }
        Insert: {
          announced_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          notes?: string | null
          raid_size?: number
          scheduled_at: string
          status?: Database["public"]["Enums"]["raid_event_status"]
          title: string
        }
        Update: {
          announced_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          notes?: string | null
          raid_size?: number
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
      raid_schedule: {
        Row: {
          created_at: string
          end_time: string
          id: string
          label: string | null
          start_time: string
          weekday: number
        }
        Insert: {
          created_at?: string
          end_time: string
          id?: string
          label?: string | null
          start_time: string
          weekday: number
        }
        Update: {
          created_at?: string
          end_time?: string
          id?: string
          label?: string | null
          start_time?: string
          weekday?: number
        }
        Relationships: []
      }
      raid_signups: {
        Row: {
          character_id: string
          id: string
          raid_event_id: string
          signed_up_at: string
          slot_index: number | null
          status: Database["public"]["Enums"]["rsvp_status"]
        }
        Insert: {
          character_id: string
          id?: string
          raid_event_id: string
          signed_up_at?: string
          slot_index?: number | null
          status?: Database["public"]["Enums"]["rsvp_status"]
        }
        Update: {
          character_id?: string
          id?: string
          raid_event_id?: string
          signed_up_at?: string
          slot_index?: number | null
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
      recruitment_needs: {
        Row: {
          class: Database["public"]["Enums"]["wow_class"]
          id: string
          note: string | null
          priority: Database["public"]["Enums"]["recruitment_priority"]
          spec: string
        }
        Insert: {
          class: Database["public"]["Enums"]["wow_class"]
          id?: string
          note?: string | null
          priority?: Database["public"]["Enums"]["recruitment_priority"]
          spec: string
        }
        Update: {
          class?: Database["public"]["Enums"]["wow_class"]
          id?: string
          note?: string | null
          priority?: Database["public"]["Enums"]["recruitment_priority"]
          spec?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          bis_phase: Database["public"]["Enums"]["bis_phase"]
          created_at: string
          id: string
          name: string
          reset_time: string
          reset_weekday: number
          server_id: string
          started_on: string
        }
        Insert: {
          bis_phase?: Database["public"]["Enums"]["bis_phase"]
          created_at?: string
          id?: string
          name: string
          reset_time?: string
          reset_weekday?: number
          server_id: string
          started_on?: string
        }
        Update: {
          bis_phase?: Database["public"]["Enums"]["bis_phase"]
          created_at?: string
          id?: string
          name?: string
          reset_time?: string
          reset_weekday?: number
          server_id?: string
          started_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasons_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "servers"
            referencedColumns: ["id"]
          },
        ]
      }
      servers: {
        Row: {
          created_at: string
          id: string
          name: string
          uwu_server_key: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          uwu_server_key?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          uwu_server_key?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_approved: { Args: { uid: string }; Returns: boolean }
      is_guild_master: { Args: { uid: string }; Returns: boolean }
      is_officer: { Args: { uid: string }; Returns: boolean }
    }
    Enums: {
      applicant_type: "new_player" | "returning_player"
      application_status: "new" | "interview" | "trial" | "accepted" | "rejected"
      bis_phase: "pre_raid" | "t7" | "t8" | "t9" | "t10"
      character_role: "tank" | "healer" | "dps"
      guild_rank: "guild_master" | "officer" | "raider" | "applicant"
      raid_event_status: "scheduled" | "completed" | "cancelled"
      recruitment_priority: "high" | "medium" | "closed"
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
