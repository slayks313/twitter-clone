import { createClient } from "@supabase/supabase-js"

export const supabase = createClient(
  "https://alfqimfgcizokvuaowfa.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsZnFpbWZnY2l6b2t2dWFvd2ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5OTE0MjgsImV4cCI6MjA4NjU2NzQyOH0.hHtYEMpzJts-7vWGiO5QA_ukhlCdHwZrr2UKfXbqhEE"
)
