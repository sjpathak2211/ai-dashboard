-- FINAL Fix: Remove google_id and all dependent policies
-- Then recreate the policies correctly

-- Step 1: Drop all the old policies that depend on google_id
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own requests" ON public.requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.requests;
DROP POLICY IF EXISTS "Users can create requests" ON public.requests;
DROP POLICY IF EXISTS "Admins can update requests" ON public.requests;
DROP POLICY IF EXISTS "Users can view own request history" ON public.request_history;
DROP POLICY IF EXISTS "Admins can view all request history" ON public.request_history;

-- Step 2: Now drop the google_id column
ALTER TABLE public.users DROP COLUMN IF EXISTS google_id;

-- Step 3: Recreate the policies using id instead of google_id
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Step 4: Check if 'requests' table exists and create policies if it does
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'requests') THEN
    EXECUTE 'CREATE POLICY "Users can view own requests" ON public.requests
      FOR SELECT
      USING (user_id = auth.uid())';

    EXECUTE 'CREATE POLICY "Users can create requests" ON public.requests
      FOR INSERT
      WITH CHECK (user_id = auth.uid())';

    EXECUTE 'CREATE POLICY "Admins can view all requests" ON public.requests
      FOR SELECT
      USING (public.is_admin() = true)';

    EXECUTE 'CREATE POLICY "Admins can update requests" ON public.requests
      FOR UPDATE
      USING (public.is_admin() = true)';

    RAISE NOTICE '✅ Created policies for requests table';
  END IF;
END $$;

-- Step 5: Check if 'request_history' table exists and create policies if it does
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'request_history') THEN
    EXECUTE 'CREATE POLICY "Users can view own request history" ON public.request_history
      FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM public.requests
        WHERE requests.id = request_history.request_id
        AND requests.user_id = auth.uid()
      ))';

    EXECUTE 'CREATE POLICY "Admins can view all request history" ON public.request_history
      FOR SELECT
      USING (public.is_admin() = true)';

    RAISE NOTICE '✅ Created policies for request_history table';
  END IF;
END $$;

-- Verify the schema
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- Success!
DO $$
BEGIN
  RAISE NOTICE '✅ google_id column removed successfully!';
  RAISE NOTICE '✅ All policies recreated without google_id dependency';
  RAISE NOTICE '📝 User creation should now work!';
END $$;
