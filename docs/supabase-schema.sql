-- FVU Request System - Supabase Database Schema
-- Run this in Supabase SQL Editor to create the form_submissions table

-- Create form_submissions table
CREATE TABLE IF NOT EXISTS form_submissions (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Request metadata
  request_type TEXT NOT NULL CHECK (request_type IN ('upload', 'analysis', 'recovery')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),

  -- Key searchable fields (extracted for easy querying)
  requesting_email TEXT NOT NULL,
  requesting_name TEXT NOT NULL,
  occurrence_number TEXT NOT NULL,
  occurrence_date DATE,
  occurrence_type TEXT,

  -- Complete form data as JSONB (stores all fields from the form)
  -- This includes: badge, bagNumber, city, fileDetails, fileNames,
  -- lockerNumber, occDate, occType, offenceType, recordingDate,
  -- requestDetails, requestingPhone, serviceRequired, videoLocation,
  -- videoSeizedFrom, and all other form-specific fields
  form_data JSONB NOT NULL,

  -- Attachments (PDF and JSON exports)
  -- Structure: [
  --   {
  --     "type": "pdf",
  --     "filename": "FVU_Analysis_Request_PR123456.pdf",
  --     "data": "base64_encoded_data...",
  --     "size": 24250
  --   },
  --   {
  --     "type": "json",
  --     "filename": "FVU_Analysis_Request_PR123456.json",
  --     "data": "base64_encoded_data...",
  --     "size": 2487
  --   }
  -- ]
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Timestamps
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_form_submissions_email ON form_submissions(requesting_email);
CREATE INDEX IF NOT EXISTS idx_form_submissions_occurrence ON form_submissions(occurrence_number);
CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON form_submissions(request_type);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_date ON form_submissions(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_data ON form_submissions USING GIN (form_data);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
CREATE TRIGGER update_form_submissions_updated_at
  BEFORE UPDATE ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comment to the table
COMMENT ON TABLE form_submissions IS 'FVU Request System - Stores form submissions from Upload, Analysis, and Recovery forms with PDF/JSON attachments';

-- Example query to verify table was created
SELECT
  tablename,
  schemaname
FROM pg_tables
WHERE tablename = 'form_submissions';

-- Example query to check indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'form_submissions';
