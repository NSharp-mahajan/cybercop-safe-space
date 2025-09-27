-- Check the current structure of the profiles table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if there are any existing rows
SELECT COUNT(*) as row_count FROM public.profiles;

-- Check the first few rows to see the data structure
SELECT * FROM public.profiles LIMIT 5;
