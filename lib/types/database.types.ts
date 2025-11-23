// Types générés depuis le schéma Supabase
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
      profiles: {
        Row: {
          id: string
          email: string
          pseudo: string
          prenom: string
          nom: string
          avatar_url: string | null
          strava_id: number | null
          strava_access_token: string | null
          strava_refresh_token: string | null
          strava_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          pseudo: string
          prenom: string
          nom: string
          avatar_url?: string | null
          strava_id?: number | null
          strava_access_token?: string | null
          strava_refresh_token?: string | null
          strava_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          pseudo?: string
          prenom?: string
          nom?: string
          avatar_url?: string | null
          strava_id?: number | null
          strava_access_token?: string | null
          strava_refresh_token?: string | null
          strava_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cols: {
        Row: {
          id: string
          nom: string
          altitude: number
          latitude: number
          longitude: number
          denivele: number
          distance_km: number
          pente_moyenne: number | null
          pente_max: number | null
          pays: string
          region: string | null
          description: string | null
          difficulte: 'facile' | 'moyen' | 'difficile' | 'hc' | null
          strava_segment_id: number | null
          created_at: string
        }
        Insert: {
          id?: string
          nom: string
          altitude: number
          latitude: number
          longitude: number
          denivele: number
          distance_km: number
          pente_moyenne?: number | null
          pente_max?: number | null
          pays: string
          region?: string | null
          description?: string | null
          difficulte?: 'facile' | 'moyen' | 'difficile' | 'hc' | null
          strava_segment_id?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          nom?: string
          altitude?: number
          latitude?: number
          longitude?: number
          denivele?: number
          distance_km?: number
          pente_moyenne?: number | null
          pente_max?: number | null
          pays?: string
          region?: string | null
          description?: string | null
          difficulte?: 'facile' | 'moyen' | 'difficile' | 'hc' | null
          strava_segment_id?: number | null
          created_at?: string
        }
      }
      ascensions: {
        Row: {
          id: string
          user_id: string
          col_id: string
          date_ascension: string
          temps_secondes: number | null
          vitesse_moyenne_kmh: number | null
          frequence_cardiaque_moyenne: number | null
          puissance_moyenne_watts: number | null
          strava_activity_id: number | null
          validee: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          col_id: string
          date_ascension: string
          temps_secondes?: number | null
          vitesse_moyenne_kmh?: number | null
          frequence_cardiaque_moyenne?: number | null
          puissance_moyenne_watts?: number | null
          strava_activity_id?: number | null
          validee?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          col_id?: string
          date_ascension?: string
          temps_secondes?: number | null
          vitesse_moyenne_kmh?: number | null
          frequence_cardiaque_moyenne?: number | null
          puissance_moyenne_watts?: number | null
          strava_activity_id?: number | null
          validee?: boolean
          created_at?: string
        }
      }
      cols_epingles: {
        Row: {
          id: string
          user_id: string
          col_id: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          col_id: string
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          col_id?: string
          note?: string | null
          created_at?: string
        }
      }
      favoris: {
        Row: {
          id: string
          user_id: string
          favori_user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          favori_user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          favori_user_id?: string
          created_at?: string
        }
      }
    }
    Views: {
      user_statistics: {
        Row: {
          id: string | null
          pseudo: string | null
          cols_gravis: number | null
          nombre_ascensions: number | null
          denivele_total: number | null
          nombre_sorties: number | null
        }
      }
    }
    Functions: {
      get_total_cols_count: {
        Args: Record<string, never>
        Returns: number
      }
      generate_test_ascensions: {
        Args: {
          p_user_id: string
          p_nombre_cols?: number
        }
        Returns: void
      }
    }
  }
}

// Types utilitaires pour l'application
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Col = Database['public']['Tables']['cols']['Row']
export type Ascension = Database['public']['Tables']['ascensions']['Row']
export type ColEpingle = Database['public']['Tables']['cols_epingles']['Row']
export type Favori = Database['public']['Tables']['favoris']['Row']
export type UserStatistics = Database['public']['Views']['user_statistics']['Row']

// Types enrichis pour l'UI
export interface ColWithStatus extends Col {
  gravi: boolean
  nombreAscensions?: number
  derniereDateAscension?: string
  epingle?: boolean
}

export interface UserWithStats extends Profile {
  stats?: UserStatistics
  isFavorite?: boolean
}

export interface AscensionWithDetails extends Ascension {
  col?: Col
  profile?: Profile
}