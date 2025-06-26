/**
 * Supabase Client Configuration
 * Handles connection to Supabase for form submissions
 */

// Supabase configuration
export const SUPABASE_CONFIG = {
  url: 'https://xkovwklvxvuehxpsxvwk.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrb3Z3a2x2eHZ1ZWh4cHN4dndrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MjE1OTksImV4cCI6MjA2NjQ5NzU5OX0.cM5mFSMQH_Pd448ZQDR7YfxSTWrD_s4dZYsEX7qHsAs'
};

// Create Supabase client instance
let supabaseClient = null;

/**
 * Initialize Supabase client
 * @returns {Promise<Object>} Supabase client instance
 */
export async function initSupabase() {
  if (supabaseClient) return supabaseClient;
  
  try {
    // Dynamically import Supabase client from CDN
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
    
    supabaseClient = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: {
        persistSession: false, // Don't persist auth session for anonymous submissions
        autoRefreshToken: false
      }
    });
    
    return supabaseClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    throw error;
  }
}

/**
 * Submit form data to Supabase
 * @param {Object} formData - The form data to submit
 * @returns {Promise<Object>} Submission result
 */
export async function submitToSupabase(formData) {
  try {
    const supabase = await initSupabase();
    
    // Extract attachments if they exist
    const attachments = formData.attachments || [];
    
    // Remove attachments from formData to avoid duplication
    const cleanFormData = { ...formData };
    delete cleanFormData.attachments;
    
    // Prepare the submission data
    const submission = {
      request_type: formData.reqArea,
      form_data: cleanFormData,
      requesting_email: formData.requestingEmail,
      requesting_name: formData.rName,
      occurrence_number: formData.occNumber || null,
      status: 'pending',
      attachments: attachments // Add attachments to the submission
    };
    
    // Insert into form_submissions table
    const { data, error } = await supabase
      .from('form_submissions')
      .insert([submission])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase submission error:', error);
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Failed to submit to Supabase:', error);
    throw error;
  }
}

/**
 * Get submissions by email
 * @param {string} email - The email to filter by
 * @returns {Promise<Array>} Array of submissions
 */
export async function getSubmissionsByEmail(email) {
  try {
    const supabase = await initSupabase();
    
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('requesting_email', email)
      .order('submitted_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Failed to fetch submissions:', error);
    throw error;
  }
}

/**
 * Get submission by ID
 * @param {string} id - The submission ID
 * @returns {Promise<Object>} Submission data
 */
export async function getSubmissionById(id) {
  try {
    const supabase = await initSupabase();
    
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching submission:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch submission:', error);
    throw error;
  }
}