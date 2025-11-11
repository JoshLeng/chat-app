import { createClient } from '@supabase/supabase-js'

// Reemplaza con tus datos de Supabase
const SUPABASE_URL = 'https://dingwldvhiatuwbyywjq.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpbmd3bGR2aGlhdHV3Ynl5d2pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODg4MDgsImV4cCI6MjA3NzI2NDgwOH0.oUXVFY9aOBSB-Cg2BboYWwA5Eg_I_CvH2EfIecGKxMM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
