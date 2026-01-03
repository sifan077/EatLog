-- Create todos table
CREATE TABLE IF NOT EXISTS public.todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations on todos table
CREATE POLICY "Enable all access for all users" ON public.todos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create index on created_at for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(created_at DESC);