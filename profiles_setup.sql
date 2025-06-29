-- Step 1: Ensure profiles table has the correct structure with a foreign key to auth.users.id
-- First, check if the profiles table exists and create it if it doesn't
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- If the table already exists but doesn't have the foreign key constraint, add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_id_fkey' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles 
    ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Step 2: Create a function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create a trigger to automatically call this function when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Set up Row Level Security (RLS) policies for the profiles table
-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist already
DO $$
BEGIN
  -- Check and create policy for users to view their own profile
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can view their own profile"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;

  -- Check and create policy for users to update their own profile
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can update their own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;

  -- Check and create policy for service role to create profiles
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can create profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Service role can create profiles"
      ON public.profiles FOR INSERT
      WITH CHECK (true);
  END IF;
END
$$;

-- Step 5: Create an index on the email column for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);

-- Step 6: Backfill existing users who don't have profiles yet
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
