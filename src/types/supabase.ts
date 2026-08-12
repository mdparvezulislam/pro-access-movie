export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ContentStatus = 'draft' | 'review' | 'published' | 'archived'

export interface Database {
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      genres: {
        Row: {
          id: string
          slug: string
          name: string
          name_bn: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          name_bn?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          name_bn?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      languages: {
        Row: {
          id: string
          code: string
          name: string
          name_bn: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          name_bn?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          name_bn?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      countries: {
        Row: {
          id: string
          code: string
          name: string
          name_bn: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          name_bn?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          name_bn?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      movies: {
        Row: {
          id: string
          title: string
          title_bn: string | null
          slug: string
          status: ContentStatus
          original_title: string | null
          release_year: number | null
          duration_minutes: number | null
          description: string | null
          description_bn: string | null
          tagline: string | null
          rating: number | null
          content_rating: string | null
          original_language_id: string | null
          country_id: string | null
          trailer_url: string | null
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string | null
          aliases: Json
          search_keywords: string | null
          external_ids: Json
          media: Json
          created_by: string | null
          created_at: string
          updated_at: string
          published_at: string | null
          published_content_fts: unknown | null
        }
        Insert: {
          id?: string
          title: string
          title_bn?: string | null
          slug: string
          status?: ContentStatus
          original_title?: string | null
          release_year?: number | null
          duration_minutes?: number | null
          description?: string | null
          description_bn?: string | null
          tagline?: string | null
          rating?: number | null
          content_rating?: string | null
          original_language_id?: string | null
          country_id?: string | null
          trailer_url?: string | null
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          aliases?: Json
          search_keywords?: string | null
          external_ids?: Json
          media?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          title_bn?: string | null
          slug?: string
          status?: ContentStatus
          original_title?: string | null
          release_year?: number | null
          duration_minutes?: number | null
          description?: string | null
          description_bn?: string | null
          tagline?: string | null
          rating?: number | null
          content_rating?: string | null
          original_language_id?: string | null
          country_id?: string | null
          trailer_url?: string | null
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          aliases?: Json
          search_keywords?: string | null
          external_ids?: Json
          media?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      series: {
        Row: {
          id: string
          title: string
          title_bn: string | null
          slug: string
          status: ContentStatus
          original_title: string | null
          release_year: number | null
          description: string | null
          description_bn: string | null
          tagline: string | null
          rating: number | null
          content_rating: string | null
          original_language_id: string | null
          country_id: string | null
          trailer_url: string | null
          seo_title: string | null
          seo_description: string | null
          seo_keywords: string | null
          aliases: Json
          search_keywords: string | null
          external_ids: Json
          media: Json
          created_by: string | null
          created_at: string
          updated_at: string
          published_at: string | null
          published_content_fts: unknown | null
        }
        Insert: {
          id?: string
          title: string
          title_bn?: string | null
          slug: string
          status?: ContentStatus
          original_title?: string | null
          release_year?: number | null
          description?: string | null
          description_bn?: string | null
          tagline?: string | null
          rating?: number | null
          content_rating?: string | null
          original_language_id?: string | null
          country_id?: string | null
          trailer_url?: string | null
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          aliases?: Json
          search_keywords?: string | null
          external_ids?: Json
          media?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          title_bn?: string | null
          slug?: string
          status?: ContentStatus
          original_title?: string | null
          release_year?: number | null
          description?: string | null
          description_bn?: string | null
          tagline?: string | null
          rating?: number | null
          content_rating?: string | null
          original_language_id?: string | null
          country_id?: string | null
          trailer_url?: string | null
          seo_title?: string | null
          seo_description?: string | null
          seo_keywords?: string | null
          aliases?: Json
          search_keywords?: string | null
          external_ids?: Json
          media?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      seasons: {
        Row: {
          id: string
          series_id: string
          season_number: number
          title: string | null
          description: string | null
          status: ContentStatus
          media: Json
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          series_id: string
          season_number: number
          title?: string | null
          description?: string | null
          status?: ContentStatus
          media?: Json
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          series_id?: string
          season_number?: number
          title?: string | null
          description?: string | null
          status?: ContentStatus
          media?: Json
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      episodes: {
        Row: {
          id: string
          season_id: string
          episode_number: number
          title: string
          title_bn: string | null
          description: string | null
          duration_minutes: number | null
          air_date: string | null
          status: ContentStatus
          media: Json
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          season_id: string
          episode_number: number
          title: string
          title_bn?: string | null
          description?: string | null
          duration_minutes?: number | null
          air_date?: string | null
          status?: ContentStatus
          media?: Json
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          season_id?: string
          episode_number?: number
          title?: string
          title_bn?: string | null
          description?: string | null
          duration_minutes?: number | null
          air_date?: string | null
          status?: ContentStatus
          media?: Json
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      people: {
        Row: {
          id: string
          name: string
          name_bn: string | null
          slug: string
          bio: string | null
          photo_url: string | null
          external_ids: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          name_bn?: string | null
          slug: string
          bio?: string | null
          photo_url?: string | null
          external_ids?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          name_bn?: string | null
          slug?: string
          bio?: string | null
          photo_url?: string | null
          external_ids?: Json
          created_at?: string
          updated_at?: string
        }
      }
      cast: {
        Row: {
          id: string
          movie_id: string | null
          series_id: string | null
          person_id: string
          character_name: string | null
          ordering: number
        }
        Insert: {
          id?: string
          movie_id?: string | null
          series_id?: string | null
          person_id: string
          character_name?: string | null
          ordering?: number
        }
        Update: {
          id?: string
          movie_id?: string | null
          series_id?: string | null
          person_id?: string
          character_name?: string | null
          ordering?: number
        }
      }
      crew: {
        Row: {
          id: string
          movie_id: string | null
          series_id: string | null
          person_id: string
          role: string
          ordering: number
        }
        Insert: {
          id?: string
          movie_id?: string | null
          series_id?: string | null
          person_id: string
          role: string
          ordering?: number
        }
        Update: {
          id?: string
          movie_id?: string | null
          series_id?: string | null
          person_id?: string
          role?: string
          ordering?: number
        }
      }
      collections: {
        Row: {
          id: string
          slug: string
          title: string
          description: string | null
          sort_order: number
          status: ContentStatus
          featured: boolean
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          description?: string | null
          sort_order?: number
          status?: ContentStatus
          featured?: boolean
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          description?: string | null
          sort_order?: number
          status?: ContentStatus
          featured?: boolean
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          display_name: string | null
          avatar_url: string | null
          language_preference: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          avatar_url?: string | null
          language_preference?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          avatar_url?: string | null
          language_preference?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string
        }
      }
      media_files: {
        Row: {
          id: string
          bucket: "flex-posters" | "flex-backdrops" | "flex-people" | "flex-trailers"
          path: string
          original_name: string
          mime_type: string
          size_bytes: number
          width: number | null
          height: number | null
          content_type: "poster" | "backdrop" | "photo" | "trailer"
          movie_id: string | null
          series_id: string | null
          person_id: string | null
          status: "active" | "archived"
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          bucket: "flex-posters" | "flex-backdrops" | "flex-people" | "flex-trailers"
          path: string
          original_name: string
          mime_type: string
          size_bytes: number
          width?: number | null
          height?: number | null
          content_type: "poster" | "backdrop" | "photo" | "trailer"
          movie_id?: string | null
          series_id?: string | null
          person_id?: string | null
          status?: "active" | "archived"
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          bucket?: "flex-posters" | "flex-backdrops" | "flex-people" | "flex-trailers"
          path?: string
          original_name?: string
          mime_type?: string
          size_bytes?: number
          width?: number | null
          height?: number | null
          content_type?: "poster" | "backdrop" | "photo" | "trailer"
          movie_id?: string | null
          series_id?: string | null
          person_id?: string | null
          status?: "active" | "archived"
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_watchlist: {
        Row: {
          id: string
          user_id: string
          movie_id: string | null
          series_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          movie_id?: string | null
          series_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          movie_id?: string | null
          series_id?: string | null
          created_at?: string
        }
      }
      user_watch_history: {
        Row: {
          id: string
          user_id: string
          movie_id: string | null
          episode_id: string | null
          progress_seconds: number
          duration_seconds: number
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          movie_id?: string | null
          episode_id?: string | null
          progress_seconds?: number
          duration_seconds?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          movie_id?: string | null
          episode_id?: string | null
          progress_seconds?: number
          duration_seconds?: number
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      playback_sources: {
        Row: {
          id: string
          movie_id: string | null
          episode_id: string | null
          label: string
          quality: "1080p" | "720p" | "480p" | "360p" | "auto"
          url: string
          format: "hls" | "mp4" | "embed"
          provider_name: string
          priority: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          movie_id?: string | null
          episode_id?: string | null
          label: string
          quality: "1080p" | "720p" | "480p" | "360p" | "auto"
          url: string
          format?: "hls" | "mp4" | "embed"
          provider_name?: string
          priority?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          movie_id?: string | null
          episode_id?: string | null
          label?: string
          quality?: "1080p" | "720p" | "480p" | "360p" | "auto"
          url?: string
          format?: "hls" | "mp4" | "embed"
          provider_name?: string
          priority?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ad_campaigns: {
        Row: {
          id: string
          name: string
          status: "active" | "paused" | "completed"
          start_date: string | null
          end_date: string | null
          frequency_cap: Json
          targeting: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          status?: "active" | "paused" | "completed"
          start_date?: string | null
          end_date?: string | null
          frequency_cap?: Json
          targeting?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          status?: "active" | "paused" | "completed"
          start_date?: string | null
          end_date?: string | null
          frequency_cap?: Json
          targeting?: Json
          created_at?: string
          updated_at?: string
        }
      }
      ad_creatives: {
        Row: {
          id: string
          campaign_id: string | null
          title: string
          type: "banner" | "card" | "video" | "overlay"
          media_url: string
          destination_url: string
          cta_text: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id?: string | null
          title: string
          type: "banner" | "card" | "video" | "overlay"
          media_url: string
          destination_url: string
          cta_text?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string | null
          title?: string
          type?: "banner" | "card" | "video" | "overlay"
          media_url?: string
          destination_url?: string
          cta_text?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ad_placements: {
        Row: {
          id: string
          key: string
          name: string
          type: "banner" | "card" | "mid_roll" | "overlay"
          frequency_cap_minutes: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          name: string
          type: "banner" | "card" | "mid_roll" | "overlay"
          frequency_cap_minutes?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          name?: string
          type?: "banner" | "card" | "mid_roll" | "overlay"
          frequency_cap_minutes?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ad_events: {
        Row: {
          id: string
          ad_id: string | null
          campaign_id: string | null
          placement_key: string
          event_type: "adSelected" | "adImpression" | "adClicked" | "adGateCompleted" | "adGateSkipped"
          user_id: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          ad_id?: string | null
          campaign_id?: string | null
          placement_key: string
          event_type: "adSelected" | "adImpression" | "adClicked" | "adGateCompleted" | "adGateSkipped"
          user_id?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          ad_id?: string | null
          campaign_id?: string | null
          placement_key?: string
          event_type?: "adSelected" | "adImpression" | "adClicked" | "adGateCompleted" | "adGateSkipped"
          user_id?: string | null
          metadata?: Json
          created_at?: string
        }
      }
    }
    Functions: {
      is_admin: {
        Args: { check_user_id?: string }
        Returns: boolean
      }
      make_admin: {
        Args: { target_user_id: string }
        Returns: void
      }
    }
  }
}
