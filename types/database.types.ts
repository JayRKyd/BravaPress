export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      press_releases: {
        Row: {
          id: string
          user_id: string
          status: string
          title: string
          twitter_title: string
          summary: string
          body: string
          company_info: string
          news_event: string
          location: string
          timezone: string
          contact_info: string
          website: string
          created_at: string
          updated_at: string
          published_at: string | null
          validation_feedback: string | null
          is_compliant: boolean
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          title: string
          twitter_title: string
          summary: string
          body: string
          company_info: string
          news_event: string
          location: string
          timezone: string
          contact_info: string
          website: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
          validation_feedback?: string | null
          is_compliant?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          title?: string
          twitter_title?: string
          summary?: string
          body?: string
          company_info?: string
          news_event?: string
          location?: string
          timezone?: string
          contact_info?: string
          website?: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
          validation_feedback?: string | null
          is_compliant?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "press_releases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      submissions: {
        Row: {
          id: string
          press_release_id: string
          ein_submission_id: string | null
          status: string
          confirmation_pdf: string | null
          report_url: string | null
          report_sent: boolean
          submission_error: string | null
          retry_count: number
          last_retry_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          press_release_id: string
          ein_submission_id?: string | null
          status?: string
          confirmation_pdf?: string | null
          report_url?: string | null
          report_sent?: boolean
          submission_error?: string | null
          retry_count?: number
          last_retry_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          press_release_id?: string
          ein_submission_id?: string | null
          status?: string
          confirmation_pdf?: string | null
          report_url?: string | null
          report_sent?: boolean
          submission_error?: string | null
          retry_count?: number
          last_retry_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_press_release_id_fkey"
            columns: ["press_release_id"]
            isOneToOne: false
            referencedRelation: "press_releases"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
