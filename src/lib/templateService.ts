import { supabase } from './supabase';
import type { Database } from './database.types';

type RoomTemplate = Database['public']['Tables']['room_templates']['Row'];
type RoomTemplateInsert = Database['public']['Tables']['room_templates']['Insert'];
type RoomTemplateUpdate = Database['public']['Tables']['room_templates']['Update'];

export interface TemplateData {
  name: string;
  roomName: string;
  foodMode?: string | null;
  selectedCuisines?: string[];
  priceRange?: string[];
  radius?: number | null;
  participantLimit?: number | null;
  timerOption?: string | null;
  customDuration?: string | null;
  durationUnit?: string | null;
  deadline?: string | null;
  reminders?: boolean;
  accessControl?: string | null;
  selectedContacts?: string[];
  description?: string | null;
  isPublic?: boolean;
}

export class TemplateService {
  /**
   * Save a room configuration as a template
   */
  static async saveTemplate(templateData: TemplateData): Promise<{ success: boolean; template?: RoomTemplate; error?: string }> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      const templateInsert: RoomTemplateInsert = {
        name: templateData.name,
        created_by: user.id,
        room_name: templateData.roomName,
        food_mode: templateData.foodMode || null,
        selected_cuisines: templateData.selectedCuisines || [],
        price_range: templateData.priceRange || [],
        radius: templateData.radius || null,
        participant_limit: templateData.participantLimit || null,
        timer_option: templateData.timerOption || null,
        custom_duration: templateData.customDuration || null,
        duration_unit: templateData.durationUnit || null,
        deadline: templateData.deadline || null,
        reminders: templateData.reminders || false,
        access_control: templateData.accessControl || null,
        selected_contacts: templateData.selectedContacts || [],
        description: templateData.description || null,
        is_public: templateData.isPublic || false,
        usage_count: 0
      };

      const { data, error } = await supabase
        .from('room_templates')
        .insert(templateInsert)
        .select()
        .single();

      if (error) {
        console.error('Error saving template:', error);
        return { success: false, error: error.message };
      }

      return { success: true, template: data };
    } catch (error) {
      console.error('Error saving template:', error);
      return { success: false, error: 'Failed to save template' };
    }
  }

  /**
   * Get user's templates
   */
  static async getUserTemplates(): Promise<{ success: boolean; templates?: RoomTemplate[]; error?: string }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('room_templates')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        return { success: false, error: error.message };
      }

      return { success: true, templates: data || [] };
    } catch (error) {
      console.error('Error fetching templates:', error);
      return { success: false, error: 'Failed to fetch templates' };
    }
  }

  /**
   * Get public templates (for discovery)
   */
  static async getPublicTemplates(limit: number = 10): Promise<{ success: boolean; templates?: RoomTemplate[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('room_templates')
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching public templates:', error);
        return { success: false, error: error.message };
      }

      return { success: true, templates: data || [] };
    } catch (error) {
      console.error('Error fetching public templates:', error);
      return { success: false, error: 'Failed to fetch public templates' };
    }
  }

  /**
   * Load a template by ID
   */
  static async getTemplate(templateId: string): Promise<{ success: boolean; template?: RoomTemplate; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('room_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        console.error('Error fetching template:', error);
        return { success: false, error: error.message };
      }

      return { success: true, template: data };
    } catch (error) {
      console.error('Error fetching template:', error);
      return { success: false, error: 'Failed to fetch template' };
    }
  }

  /**
   * Update template usage count when it's used
   */
  static async incrementUsageCount(templateId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .rpc('increment_template_usage', { template_id: templateId });

      if (error) {
        console.error('Error incrementing usage count:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error incrementing usage count:', error);
      return { success: false, error: 'Failed to update usage count' };
    }
  }

  /**
   * Delete a template
   */
  static async deleteTemplate(templateId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('room_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Error deleting template:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting template:', error);
      return { success: false, error: 'Failed to delete template' };
    }
  }

  /**
   * Update a template
   */
  static async updateTemplate(templateId: string, updates: Partial<TemplateData>): Promise<{ success: boolean; template?: RoomTemplate; error?: string }> {
    try {
      const templateUpdate: RoomTemplateUpdate = {
        ...(updates.name && { name: updates.name }),
        ...(updates.roomName && { room_name: updates.roomName }),
        ...(updates.foodMode !== undefined && { food_mode: updates.foodMode }),
        ...(updates.selectedCuisines && { selected_cuisines: updates.selectedCuisines }),
        ...(updates.priceRange && { price_range: updates.priceRange }),
        ...(updates.radius !== undefined && { radius: updates.radius }),
        ...(updates.participantLimit !== undefined && { participant_limit: updates.participantLimit }),
        ...(updates.timerOption !== undefined && { timer_option: updates.timerOption }),
        ...(updates.customDuration !== undefined && { custom_duration: updates.customDuration }),
        ...(updates.durationUnit !== undefined && { duration_unit: updates.durationUnit }),
        ...(updates.deadline !== undefined && { deadline: updates.deadline }),
        ...(updates.reminders !== undefined && { reminders: updates.reminders }),
        ...(updates.accessControl !== undefined && { access_control: updates.accessControl }),
        ...(updates.selectedContacts && { selected_contacts: updates.selectedContacts }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.isPublic !== undefined && { is_public: updates.isPublic })
      };

      const { data, error } = await supabase
        .from('room_templates')
        .update(templateUpdate)
        .eq('id', templateId)
        .select()
        .single();

      if (error) {
        console.error('Error updating template:', error);
        return { success: false, error: error.message };
      }

      return { success: true, template: data };
    } catch (error) {
      console.error('Error updating template:', error);
      return { success: false, error: 'Failed to update template' };
    }
  }
}

export default TemplateService; 