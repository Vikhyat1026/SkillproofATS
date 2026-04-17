import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qkwctkamgatfqlvgnfij.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrd2N0a2FtZ2F0ZnFsdmduZmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMTQwNjEsImV4cCI6MjA5MTg5MDA2MX0.Z-HuwIdbyLAQ3UgKCsjMA5L-NblX-m-WxVtfIzuNZAc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
