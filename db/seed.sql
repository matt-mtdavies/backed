-- Seed identities intentionally use stable UUIDs for local/demo environments only.
INSERT INTO users(id,email) VALUES ('00000000-0000-4000-8000-000000000001','jason@example.test'),('00000000-0000-4000-8000-000000000002','matthew@example.test');
INSERT INTO profiles(user_id,first_name,display_name,slug) VALUES ('00000000-0000-4000-8000-000000000001','Jason','Jason','jason'),('00000000-0000-4000-8000-000000000002','Matthew','Matthew','matthew');
INSERT INTO promises(id,achiever_user_id,created_by_user_id,title,category,template_key,target_type,target_value,target_unit,deadline,success_criteria,verification_method,state,slug,accepted_at,activated_at,proof_submitted_at) VALUES ('10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','Run my first half marathon','running','first_half','distance',21.1,'km','2027-06-30T23:59:59Z','Complete an official half marathon before the deadline','Official race result','proof_pending','jason-first-half',now(),now(),now());
INSERT INTO backs(id,promise_id,backer_user_id,backer_name,achiever_user_id,amount_minor,currency,state,message) VALUES ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002','Matthew','00000000-0000-4000-8000-000000000001',25000,'USD','active','You’ve talked about doing this forever. Time to do it.');
INSERT INTO backing_commitments(back_id,provider,provider_customer_ref,commitment_state) VALUES ('20000000-0000-4000-8000-000000000001','alpha','alpha_20000000-0000-4000-8000-000000000001','pending');
INSERT INTO proof_submissions(id,promise_id,submitted_by,note,proof_url,state) VALUES ('30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','Official result posted. Half marathon complete before the deadline.','https://results.example.com/jason-half','pending');
-- A completed Promise, seeded so the achiever completion moment (proof
-- approved, backing not yet all released) has a real, always-current page to
-- exercise in CI without depending on the admin flow having been run first.
INSERT INTO users(id,email) VALUES ('00000000-0000-4000-8000-000000000003','priya@example.test');
INSERT INTO profiles(user_id,first_name,display_name,slug) VALUES ('00000000-0000-4000-8000-000000000003','Priya','Priya','priya');
INSERT INTO promises(id,achiever_user_id,created_by_user_id,title,category,target_type,deadline,success_criteria,verification_method,state,slug,accepted_at,activated_at,proof_submitted_at,verified_at,completed_at) VALUES ('10000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000003','Read one book a month for a year','reading',NULL,'2027-01-01T00:00:00Z','Twelve books logged with a short review','Reading log','completed','priya-reading',now(),now(),now(),now(),now());
INSERT INTO backs(id,promise_id,backer_user_id,backer_name,achiever_user_id,amount_minor,currency,state,message) VALUES
  ('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002',NULL,'Alex','00000000-0000-4000-8000-000000000003',15000,'USD','released','So proud of you.'),
  ('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002',NULL,'Jordan','00000000-0000-4000-8000-000000000003',10000,'USD','payable','Twelve books! Incredible.');
INSERT INTO backing_commitments(back_id,provider,provider_customer_ref,commitment_state) VALUES
  ('20000000-0000-4000-8000-000000000002','alpha','alpha_20000000-0000-4000-8000-000000000002','confirmed'),
  ('20000000-0000-4000-8000-000000000003','alpha','alpha_20000000-0000-4000-8000-000000000003','confirmed');
