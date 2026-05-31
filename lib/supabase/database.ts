export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          auth_user_id: string | null;
          avatar: string;
          bio: string;
          company: string;
          contact_links: Json;
          created_at: string;
          email: string | null;
          id: string;
          interests: string[];
          is_discoverable: boolean;
          name: string;
          role: string;
          sponsor_id: string | null;
          updated_at: string;
          visible_contact_fields: string[];
          app_role: "attendee" | "speaker" | "sponsor" | "host" | "admin";
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          avatar: string;
          bio: string;
          company: string;
          id: string;
          interests?: string[];
          is_discoverable: boolean;
          name: string;
          role: string;
          visible_contact_fields: string[];
          app_role: "attendee" | "speaker" | "sponsor" | "host" | "admin";
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      venues: {
        Row: {
          address: string;
          campus: string | null;
          id: string;
          lat: number;
          lng: number;
          map_link: string | null;
          name: string;
          accessibility_notes: string | null;
          parking_notes: string | null;
          transit_notes: string | null;
        };
        Insert: Database["public"]["Tables"]["venues"]["Row"];
        Update: Partial<Database["public"]["Tables"]["venues"]["Row"]>;
      };
      sponsors: {
        Row: {
          contact_links: Json;
          description: string;
          featured_session_ids: string[];
          id: string;
          logo: string;
          name: string;
          slug: string;
          tier: string;
          track: string | null;
        };
        Insert: Database["public"]["Tables"]["sponsors"]["Row"];
        Update: Partial<Database["public"]["Tables"]["sponsors"]["Row"]>;
      };
      sessions: {
        Row: {
          attendee_count: number;
          capacity: number | null;
          created_at: string | null;
          day: "mon" | "tue" | "wed" | "thu" | "fri";
          description: string;
          end_time: string;
          external_registration_url: string | null;
          format: string | null;
          host_notes: string | null;
          id: string;
          is_featured: boolean;
          is_sponsored: boolean;
          logistics_notes: string | null;
          owner_profile_id: string | null;
          room: string;
          slug: string;
          source_submission_id: string | null;
          speaker_ids: string[];
          sponsor_id: string | null;
          start_time: string;
          tags: string[];
          title: string;
          audience: string | null;
          published_at: string | null;
          last_schedule_change_at: string | null;
          updated_at: string | null;
          venue_id: string;
        };
        Insert: Database["public"]["Tables"]["sessions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["sessions"]["Row"]>;
      };
      speakers: {
        Row: {
          avatar: string;
          bio: string;
          company: string;
          created_at: string | null;
          email: string | null;
          id: string;
          name: string;
          profile_id: string | null;
          role: string;
          updated_at: string | null;
        };
        Insert: Database["public"]["Tables"]["speakers"]["Row"];
        Update: Partial<Database["public"]["Tables"]["speakers"]["Row"]>;
      };
      saved_schedule: {
        Row: {
          created_at: string;
          profile_id: string;
          session_id: string;
        };
        Insert: Database["public"]["Tables"]["saved_schedule"]["Row"];
        Update: Partial<Database["public"]["Tables"]["saved_schedule"]["Row"]>;
      };
      sponsor_events: {
        Row: {
          created_at: string;
          event_type:
            | "profile_view"
            | "contact_click"
            | "session_view"
            | "map_pin_tap"
            | "cta_click";
          id: string;
          profile_id: string | null;
          sponsor_id: string;
          metadata: Json;
        };
        Insert: Partial<Database["public"]["Tables"]["sponsor_events"]["Row"]> & {
          event_type:
            | "profile_view"
            | "contact_click"
            | "session_view"
            | "map_pin_tap"
            | "cta_click";
          sponsor_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["sponsor_events"]["Row"]>;
      };
      session_events: {
        Row: {
          created_at: string;
          event_type: "detail_view" | "save" | "remove";
          id: string;
          metadata: Json;
          profile_id: string | null;
          session_id: string;
        };
        Insert: Partial<Database["public"]["Tables"]["session_events"]["Row"]> & {
          event_type: "detail_view" | "save" | "remove";
          session_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["session_events"]["Row"]>;
      };
      session_submissions: {
        Row: {
          company: string;
          created_at: string;
          decision_note: string;
          format: string;
          full_description: string;
          id: string;
          intended_audience: string;
          internal_notes: string;
          last_reviewed_at: string | null;
          linked_session_id: string | null;
          logistics_needs: string;
          requested_day: "mon" | "tue" | "wed" | "thu" | "fri" | null;
          speaker_details: string;
          status:
            | "submitted"
            | "needs_info"
            | "in_review"
            | "approved"
            | "rejected"
            | "scheduled";
          submission_resources: Json;
          submitter_email: string;
          submitter_name: string;
          submitter_profile_id: string | null;
          summary: string;
          themes: string[];
          title: string;
          track: string;
          assigned_reviewer: string | null;
        };
        Insert: Database["public"]["Tables"]["session_submissions"]["Row"];
        Update: Partial<Database["public"]["Tables"]["session_submissions"]["Row"]>;
      };
      schedule_controls: {
        Row: {
          announcement: string;
          has_unpublished_changes: boolean;
          id: string;
          is_published: boolean;
          last_edited_at: string | null;
          last_published_by: string | null;
          locked_at: string | null;
          published_at: string | null;
          release_version: number;
        };
        Insert: Database["public"]["Tables"]["schedule_controls"]["Row"];
        Update: Partial<Database["public"]["Tables"]["schedule_controls"]["Row"]>;
      };
      attachments: {
        Row: {
          created_at: string;
          featured: boolean;
          file_name: string | null;
          id: string;
          kind: "file" | "link";
          mime_type: string | null;
          owner_id: string;
          owner_type: "session" | "sponsor";
          title: string;
          uploaded_by: string | null;
          url: string;
          visibility: "public" | "internal";
        };
        Insert: Database["public"]["Tables"]["attachments"]["Row"];
        Update: Partial<Database["public"]["Tables"]["attachments"]["Row"]>;
      };
      schedule_changes: {
        Row: {
          change_type: "time" | "venue" | "room" | "title" | "description" | "status" | "materials";
          created_at: string;
          created_by: string | null;
          id: string;
          is_published: boolean;
          release_version: number;
          session_id: string;
          summary: string;
        };
        Insert: Database["public"]["Tables"]["schedule_changes"]["Row"];
        Update: Partial<Database["public"]["Tables"]["schedule_changes"]["Row"]>;
      };
    };
  };
};
