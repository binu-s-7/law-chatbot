export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      api_keys: {
        Row: {
          api_key: string | null
          created_at: string
          enabled: boolean | null
          id: number
          service: string | null
          user_id: string | null
        }
        Insert: {
          api_key?: string | null
          created_at?: string
          enabled?: boolean | null
          id?: number
          service?: string | null
          user_id?: string | null
        }
        Update: {
          api_key?: string | null
          created_at?: string
          enabled?: boolean | null
          id?: number
          service?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_api_keys_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_message: {
        Row: {
          branch_id: string | null
          branch_parent_chat_id: string | null
          branch_parent_id: string | null
          chat_id: string | null
          cost: number | null
          created_date: string | null
          llm_id: string | null
          message_id: string
          original_message_id: string | null
          previous_message_id: string | null
          summerized: boolean | null
          summerized_id: string | null
          text: string | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          branch_id?: string | null
          branch_parent_chat_id?: string | null
          branch_parent_id?: string | null
          chat_id?: string | null
          cost?: number | null
          created_date?: string | null
          llm_id?: string | null
          message_id?: string
          original_message_id?: string | null
          previous_message_id?: string | null
          summerized?: boolean | null
          summerized_id?: string | null
          text?: string | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          branch_id?: string | null
          branch_parent_chat_id?: string | null
          branch_parent_id?: string | null
          chat_id?: string | null
          cost?: number | null
          created_date?: string | null
          llm_id?: string | null
          message_id?: string
          original_message_id?: string | null
          previous_message_id?: string | null
          summerized?: boolean | null
          summerized_id?: string | null
          text?: string | null
          user_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_message_branch_parent_id_fkey"
            columns: ["branch_parent_id"]
            isOneToOne: false
            referencedRelation: "chat_message"
            referencedColumns: ["message_id"]
          },
          {
            foreignKeyName: "chat_message_llm_id_fkey"
            columns: ["llm_id"]
            isOneToOne: false
            referencedRelation: "llm"
            referencedColumns: ["llm_id"]
          },
          {
            foreignKeyName: "chat_message_original_message_id_fkey"
            columns: ["original_message_id"]
            isOneToOne: false
            referencedRelation: "chat_message"
            referencedColumns: ["message_id"]
          },
          {
            foreignKeyName: "chat_message_previous_message_id_fkey"
            columns: ["previous_message_id"]
            isOneToOne: false
            referencedRelation: "chat_message"
            referencedColumns: ["message_id"]
          },
          {
            foreignKeyName: "chat_message_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "public_chat_message_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chat_session"
            referencedColumns: ["chat_id"]
          },
        ]
      }
      chat_session: {
        Row: {
          chat_id: string
          chat_name: string | null
          created_date: string | null
          project_id: number | null
          updated_date: string | null
        }
        Insert: {
          chat_id?: string
          chat_name?: string | null
          created_date?: string | null
          project_id?: number | null
          updated_date?: string | null
        }
        Update: {
          chat_id?: string
          chat_name?: string | null
          created_date?: string | null
          project_id?: number | null
          updated_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_chat_session_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          chat_id: string | null
          comment: string | null
          created_at: string
          id: number
          like: boolean | null
          message_id: string | null
          user_id: string | null
        }
        Insert: {
          chat_id?: string | null
          comment?: string | null
          created_at?: string
          id?: number
          like?: boolean | null
          message_id?: string | null
          user_id?: string | null
        }
        Update: {
          chat_id?: string | null
          comment?: string | null
          created_at?: string
          id?: number
          like?: boolean | null
          message_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_feedback_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chat_session"
            referencedColumns: ["chat_id"]
          },
          {
            foreignKeyName: "public_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_message"
            referencedColumns: ["message_id"]
          },
          {
            foreignKeyName: "public_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string | null
          description: string | null
          extension: string | null
          extracted_data: string | null
          file_id: number
          file_name: string | null
          link: string | null
          project_id: number | null
          title: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          extension?: string | null
          extracted_data?: string | null
          file_id?: never
          file_name?: string | null
          link?: string | null
          project_id?: number | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          extension?: string | null
          extracted_data?: string | null
          file_id?: never
          file_name?: string | null
          link?: string | null
          project_id?: number | null
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      llm: {
        Row: {
          created_date: string | null
          llm_id: string
          name: string | null
          origin: string | null
          show_name: string | null
          version: string | null
        }
        Insert: {
          created_date?: string | null
          llm_id?: string
          name?: string | null
          origin?: string | null
          show_name?: string | null
          version?: string | null
        }
        Update: {
          created_date?: string | null
          llm_id?: string
          name?: string | null
          origin?: string | null
          show_name?: string | null
          version?: string | null
        }
        Relationships: []
      }
      llm_fixed: {
        Row: {
          created_date: string | null
          llm_id: string
          name: string | null
          origin: string | null
          version: string | null
        }
        Insert: {
          created_date?: string | null
          llm_id?: string
          name?: string | null
          origin?: string | null
          version?: string | null
        }
        Update: {
          created_date?: string | null
          llm_id?: string
          name?: string | null
          origin?: string | null
          version?: string | null
        }
        Relationships: []
      }
      multimedia_attachment: {
        Row: {
          attachment_id: string
          created_date: string | null
          file_path: string | null
          file_type: string | null
          message_id: string | null
        }
        Insert: {
          attachment_id: string
          created_date?: string | null
          file_path?: string | null
          file_type?: string | null
          message_id?: string | null
        }
        Update: {
          attachment_id?: string
          created_date?: string | null
          file_path?: string | null
          file_type?: string | null
          message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "multimedia_attachment_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_message"
            referencedColumns: ["message_id"]
          },
        ]
      }
      personalization: {
        Row: {
          about_me: string | null
          chat_id: string | null
          created_at: string
          general: boolean
          respond_as: string | null
          user_id: string
        }
        Insert: {
          about_me?: string | null
          chat_id?: string | null
          created_at?: string
          general?: boolean
          respond_as?: string | null
          user_id: string
        }
        Update: {
          about_me?: string | null
          chat_id?: string | null
          created_at?: string
          general?: boolean
          respond_as?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "public_personalization_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chat_session"
            referencedColumns: ["chat_id"]
          },
          {
            foreignKeyName: "public_personalization_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          image: string | null
          last_name: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          image?: string | null
          last_name?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          image?: string | null
          last_name?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          description: string | null
          id: number
          name: string | null
        }
        Insert: {
          description?: string | null
          id?: never
          name?: string | null
        }
        Update: {
          description?: string | null
          id?: never
          name?: string | null
        }
        Relationships: []
      }
      summerized: {
        Row: {
          chat_id: string | null
          created_date: string | null
          message_id: string
          text: string | null
        }
        Insert: {
          chat_id?: string | null
          created_date?: string | null
          message_id?: string
          text?: string | null
        }
        Update: {
          chat_id?: string | null
          created_date?: string | null
          message_id?: string
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_summerized_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chat_session"
            referencedColumns: ["chat_id"]
          },
        ]
      }
      template: {
        Row: {
          created_at: string
          id: number
          template: string | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          template?: string | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          template?: string | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "public_template_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_projects: {
        Row: {
          project_id: number
          role: string | null
          user_id: string
        }
        Insert: {
          project_id: number
          role?: string | null
          user_id: string
        }
        Update: {
          project_id?: number
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_projects_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      hnswhandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      ivfflathandler: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      match_documents: {
        Args: {
          query_embedding: string
          filter?: Json
        }
        Returns: {
          id: string
          content: string
          metadata: Json
          similarity: number
        }[]
      }
      vector_avg: {
        Args: {
          "": number[]
        }
        Returns: string
      }
      vector_dims: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_norm: {
        Args: {
          "": string
        }
        Returns: number
      }
      vector_out: {
        Args: {
          "": string
        }
        Returns: unknown
      }
      vector_send: {
        Args: {
          "": string
        }
        Returns: string
      }
      vector_typmod_in: {
        Args: {
          "": unknown[]
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
