require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function runSQL() {
  try {
    await client.connect();
    
    // 1. Fix services RLS
    await client.query(`
      CREATE POLICY "Allow salon owners to manage services"
      ON public.services
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.salons 
          WHERE salons.id = services.salon_id 
          AND salons.owner_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.salons 
          WHERE salons.id = services.salon_id 
          AND salons.owner_id = auth.uid()
        )
      );
    `).catch(e => console.log("Services policy might already exist:", e.message));

    // 2. Add duration_minutes to services if missing
    await client.query(`
      ALTER TABLE public.services
      ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 30;
    `).catch(e => console.log("Error adding duration_minutes:", e.message));

    // 3. Fix RPC for staff
    await client.query(`
      CREATE OR REPLACE FUNCTION create_artist_user(
          p_email text,
          p_password text,
          p_first_name_ar text,
          p_first_name_en text,
          p_mobile text,
          p_salon_id uuid,
          p_avatar_url text,
          p_bio_ar text DEFAULT NULL,
          p_bio_en text DEFAULT NULL
      ) RETURNS uuid
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
          v_user_id uuid;
          v_encrypted_password text;
      BEGIN
          IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
              RAISE EXCEPTION 'User with this email already exists';
          END IF;

          v_user_id := gen_random_uuid();
          v_encrypted_password := crypt(p_password, gen_salt('bf'));

          INSERT INTO auth.users (
              instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
              raw_app_meta_data, raw_user_meta_data, created_at, updated_at
          )
          VALUES (
              '00000000-0000-0000-0000-000000000000', v_user_id, 'authenticated', 'authenticated', p_email, v_encrypted_password, now(),
              '{"provider":"email","providers":["email"]}', '{}', now(), now()
          );

          INSERT INTO auth.identities (
              id, user_id, identity_data, provider, created_at, updated_at
          )
          VALUES (
              gen_random_uuid(), v_user_id, format('{"sub":"%s","email":"%s"}', v_user_id::text, p_email)::jsonb, 'email', now(), now()
          );

          INSERT INTO public.profiles (
              id, role, email, mobile, first_name_ar, first_name_en, salon_id, avatar_url, bio_ar, bio_en
          ) VALUES (
              v_user_id, 'artist', p_email, p_mobile, p_first_name_ar, p_first_name_en, p_salon_id, p_avatar_url, p_bio_ar, p_bio_en
          );

          INSERT INTO public.staff (
              profile_id, salon_id
          ) VALUES (
              v_user_id, p_salon_id
          );

          RETURN v_user_id;
      END;
      $$;
    `).catch(e => console.log("Error updating RPC:", e.message));

    console.log("Database fixes applied successfully!");
  } catch (err) {
    console.error("Connection error:", err);
  } finally {
    await client.end();
  }
}

runSQL();
