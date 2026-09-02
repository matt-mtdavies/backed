-- Links a real identity (Supabase Auth's JWT `sub` claim, a uuid) to our own
-- users row, per ADR-0002's Consequences: keep users/profiles separate from
-- the auth provider, don't flatten. Nullable because existing rows (seed
-- data, and any user created before this migration) have no linked auth
-- account yet; not every users row is expected to gain one immediately.
ALTER TABLE users ADD COLUMN auth_user_id uuid UNIQUE;
