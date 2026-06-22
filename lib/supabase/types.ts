export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      card_projects: {
        Row: {
          id: string;
          title: string;
          topic: string;
          content_type: string;
          card_count: number | null;
          status: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          topic: string;
          content_type: string;
          card_count?: number | null;
          status?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          topic?: string;
          content_type?: string;
          card_count?: number | null;
          status?: string | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: never[];
      };
      card_drafts: {
        Row: {
          id: string;
          project_id: string | null;
          cards_json: Json;
          source_docs: Json | null;
          generation_prompt: string | null;
          model: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          cards_json: Json;
          source_docs?: Json | null;
          generation_prompt?: string | null;
          model?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          cards_json?: Json;
          source_docs?: Json | null;
          generation_prompt?: string | null;
          model?: string | null;
          created_at?: string | null;
        };
        Relationships: never[];
      };
      copy_revisions: {
        Row: {
          id: string;
          project_id: string | null;
          card_number: number;
          previous_text: string | null;
          revised_text: string | null;
          feedback_text: string | null;
          approved: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          card_number: number;
          previous_text?: string | null;
          revised_text?: string | null;
          feedback_text?: string | null;
          approved?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          card_number?: number;
          previous_text?: string | null;
          revised_text?: string | null;
          feedback_text?: string | null;
          approved?: boolean | null;
          created_at?: string | null;
        };
        Relationships: never[];
      };
      image_prompt_revisions: {
        Row: {
          id: string;
          project_id: string | null;
          card_number: number;
          previous_prompt: string | null;
          revised_prompt: string | null;
          previous_negative_prompt: string | null;
          revised_negative_prompt: string | null;
          feedback_text: string | null;
          approved: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          card_number: number;
          previous_prompt?: string | null;
          revised_prompt?: string | null;
          previous_negative_prompt?: string | null;
          revised_negative_prompt?: string | null;
          feedback_text?: string | null;
          approved?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          card_number?: number;
          previous_prompt?: string | null;
          revised_prompt?: string | null;
          previous_negative_prompt?: string | null;
          revised_negative_prompt?: string | null;
          feedback_text?: string | null;
          approved?: boolean | null;
          created_at?: string | null;
        };
        Relationships: never[];
      };
      generated_character_images: {
        Row: {
          id: string;
          project_id: string | null;
          card_number: number;
          prompt: string | null;
          negative_prompt: string | null;
          provider: string | null;
          model: string | null;
          image_url: string | null;
          approved: boolean | null;
          rejected_reason: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          card_number: number;
          prompt?: string | null;
          negative_prompt?: string | null;
          provider?: string | null;
          model?: string | null;
          image_url?: string | null;
          approved?: boolean | null;
          rejected_reason?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          card_number?: number;
          prompt?: string | null;
          negative_prompt?: string | null;
          provider?: string | null;
          model?: string | null;
          image_url?: string | null;
          approved?: boolean | null;
          rejected_reason?: string | null;
          created_at?: string | null;
        };
        Relationships: never[];
      };
      rendered_cards: {
        Row: {
          id: string;
          project_id: string | null;
          card_number: number;
          top_text: string | null;
          character_image_url: string | null;
          rendered_image_url: string | null;
          template_type: string | null;
          approved: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          card_number: number;
          top_text?: string | null;
          character_image_url?: string | null;
          rendered_image_url?: string | null;
          template_type?: string | null;
          approved?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          card_number?: number;
          top_text?: string | null;
          character_image_url?: string | null;
          rendered_image_url?: string | null;
          template_type?: string | null;
          approved?: boolean | null;
          created_at?: string | null;
        };
        Relationships: never[];
      };
      final_card_sets: {
        Row: {
          id: string;
          project_id: string | null;
          final_cards_json: Json | null;
          final_image_urls: Json | null;
          rating: number | null;
          is_jejal_like: boolean | null;
          why_good: string | null;
          what_to_improve: string | null;
          approved: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          final_cards_json?: Json | null;
          final_image_urls?: Json | null;
          rating?: number | null;
          is_jejal_like?: boolean | null;
          why_good?: string | null;
          what_to_improve?: string | null;
          approved?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          final_cards_json?: Json | null;
          final_image_urls?: Json | null;
          rating?: number | null;
          is_jejal_like?: boolean | null;
          why_good?: string | null;
          what_to_improve?: string | null;
          approved?: boolean | null;
          created_at?: string | null;
        };
        Relationships: never[];
      };
      approved_examples: {
        Row: {
          id: string;
          project_id: string | null;
          title: string | null;
          topic: string | null;
          reusable_pattern: string | null;
          final_cards_json: Json | null;
          final_image_urls: Json | null;
          why_it_works: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          title?: string | null;
          topic?: string | null;
          reusable_pattern?: string | null;
          final_cards_json?: Json | null;
          final_image_urls?: Json | null;
          why_it_works?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          title?: string | null;
          topic?: string | null;
          reusable_pattern?: string | null;
          final_cards_json?: Json | null;
          final_image_urls?: Json | null;
          why_it_works?: string | null;
          created_at?: string | null;
        };
        Relationships: never[];
      };
      rejected_examples: {
        Row: {
          id: string;
          project_id: string | null;
          reason: string | null;
          cards_json: Json | null;
          image_urls: Json | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          reason?: string | null;
          cards_json?: Json | null;
          image_urls?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          reason?: string | null;
          cards_json?: Json | null;
          image_urls?: Json | null;
          created_at?: string | null;
        };
        Relationships: never[];
      };
      figma_exports: {
        Row: {
          id: string;
          project_id: string | null;
          figma_file_id: string | null;
          figma_file_url: string | null;
          figma_page_id: string | null;
          export_status: string | null;
          exported_at: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          figma_file_id?: string | null;
          figma_file_url?: string | null;
          figma_page_id?: string | null;
          export_status?: string | null;
          exported_at?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          figma_file_id?: string | null;
          figma_file_url?: string | null;
          figma_page_id?: string | null;
          export_status?: string | null;
          exported_at?: string | null;
          created_at?: string | null;
        };
        Relationships: never[];
      };
    };
  };
}

// Convenience row types
export type CardProject = Database["public"]["Tables"]["card_projects"]["Row"];
export type CardProjectInsert = Database["public"]["Tables"]["card_projects"]["Insert"];
export type CardProjectUpdate = Database["public"]["Tables"]["card_projects"]["Update"];

export type CardDraft = Database["public"]["Tables"]["card_drafts"]["Row"];
export type CardDraftInsert = Database["public"]["Tables"]["card_drafts"]["Insert"];

export type CopyRevision = Database["public"]["Tables"]["copy_revisions"]["Row"];
export type CopyRevisionInsert = Database["public"]["Tables"]["copy_revisions"]["Insert"];

export type ImagePromptRevision = Database["public"]["Tables"]["image_prompt_revisions"]["Row"];
export type ImagePromptRevisionInsert = Database["public"]["Tables"]["image_prompt_revisions"]["Insert"];

export type GeneratedCharacterImage = Database["public"]["Tables"]["generated_character_images"]["Row"];
export type GeneratedCharacterImageInsert = Database["public"]["Tables"]["generated_character_images"]["Insert"];

export type RenderedCard = Database["public"]["Tables"]["rendered_cards"]["Row"];
export type RenderedCardInsert = Database["public"]["Tables"]["rendered_cards"]["Insert"];

export type FinalCardSet = Database["public"]["Tables"]["final_card_sets"]["Row"];
export type FinalCardSetInsert = Database["public"]["Tables"]["final_card_sets"]["Insert"];

export type ApprovedExample = Database["public"]["Tables"]["approved_examples"]["Row"];
export type ApprovedExampleInsert = Database["public"]["Tables"]["approved_examples"]["Insert"];

export type RejectedExample = Database["public"]["Tables"]["rejected_examples"]["Row"];
export type RejectedExampleInsert = Database["public"]["Tables"]["rejected_examples"]["Insert"];

export type FigmaExport = Database["public"]["Tables"]["figma_exports"]["Row"];
export type FigmaExportInsert = Database["public"]["Tables"]["figma_exports"]["Insert"];

export const PROJECT_STATUSES = [
  "draft",
  "story",
  "copy",
  "prompts",
  "images",
  "cards",
  "figma",
  "approved",
  "rejected",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const CONTENT_TYPE_VALUES = [
  "pov",
  "situation",
  "warning",
  "meetup",
  "study",
  "mensa",
  "team",
] as const;

export type ContentType = (typeof CONTENT_TYPE_VALUES)[number];
