CREATE TABLE invites (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), back_id uuid NOT NULL REFERENCES backs(id), promise_id uuid NOT NULL REFERENCES promises(id), token_hash text NOT NULL, expires_at timestamptz NOT NULL, accepted_at timestamptz, revoked_at timestamptz, created_at timestamptz NOT NULL DEFAULT now());
CREATE UNIQUE INDEX invites_token_hash_unique ON invites(token_hash);
CREATE INDEX invites_back_id_idx ON invites(back_id);
CREATE INDEX invites_promise_id_idx ON invites(promise_id);
