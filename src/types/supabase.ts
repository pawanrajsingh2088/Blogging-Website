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
      posts: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string
          featured_image: string | null
          author_id: string
          created_at: string
          updated_at: string
          published: boolean
          slug: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt?: string
          featured_image?: string | null
          author_id: string
          created_at?: string
          updated_at?: string
          published?: boolean
          slug?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string
          featured_image?: string | null
          author_id?: string
          created_at?: string
          updated_at?: string
          published?: boolean
          slug?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string
          avatar_url: string | null
          website: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
          created_at?: string
        }
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
  }
}