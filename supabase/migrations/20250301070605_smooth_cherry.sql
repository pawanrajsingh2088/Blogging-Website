/*
  # Update storage policies for user avatars

  1. Storage Policies
    - Check if policies exist before creating them
    - Ensure proper access to user avatars
*/

-- Check and create policies using DO blocks to avoid errors if they already exist
DO $$
BEGIN
    -- Check if "Users can upload own avatar" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can upload own avatar'
        AND schemaname = 'storage'
    ) THEN
        -- Create policy for uploading avatars
        EXECUTE 'CREATE POLICY "Users can upload own avatar"
            ON storage.objects
            FOR INSERT
            TO authenticated
            WITH CHECK (
                bucket_id = ''user_avatars'' AND
                (storage.foldername(name))[1] = ''avatars''
            )';
    END IF;

    -- Check if "Users can update own avatar" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can update own avatar'
        AND schemaname = 'storage'
    ) THEN
        -- Create policy for updating avatars
        EXECUTE 'CREATE POLICY "Users can update own avatar"
            ON storage.objects
            FOR UPDATE
            TO authenticated
            USING (
                bucket_id = ''user_avatars'' AND
                (storage.foldername(name))[1] = ''avatars''
            )';
    END IF;

    -- Check if "Anyone can view avatars" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Anyone can view avatars'
        AND schemaname = 'storage'
    ) THEN
        -- Create policy for viewing avatars
        EXECUTE 'CREATE POLICY "Anyone can view avatars"
            ON storage.objects
            FOR SELECT
            TO authenticated
            USING (
                bucket_id = ''user_avatars'' AND
                (storage.foldername(name))[1] = ''avatars''
            )';
    END IF;

    -- Check if "Users can delete own avatar" policy exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can delete own avatar'
        AND schemaname = 'storage'
    ) THEN
        -- Create policy for deleting avatars
        EXECUTE 'CREATE POLICY "Users can delete own avatar"
            ON storage.objects
            FOR DELETE
            TO authenticated
            USING (
                bucket_id = ''user_avatars'' AND
                (storage.foldername(name))[1] = ''avatars''
            )';
    END IF;
END
$$;