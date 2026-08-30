-- Visual QA fixtures only. Never run against production. Exercises: long
-- names/titles (clipping), a dense Wall of Belief (50+ backers), a custom
-- goal with no structured target, and a non-USD currency.

-- Long names / long title scenario
INSERT INTO users(id,email) VALUES
  ('a0000000-0000-4000-8000-000000000001','alexandria@example.test'),
  ('a0000000-0000-4000-8000-000000000002','montgomery@example.test');
INSERT INTO profiles(user_id,first_name,last_name,display_name,slug) VALUES
  ('a0000000-0000-4000-8000-000000000001','Alexandria','Fitzgerald-Whitmore','Alexandria Fitzgerald-Whitmore','alexandria'),
  ('a0000000-0000-4000-8000-000000000002','Montgomery','Blackwood-Chamberlain','Montgomery Blackwood-Chamberlain','montgomery');
INSERT INTO promises(id,achiever_user_id,created_by_user_id,title,category,template_key,target_type,target_value,target_unit,deadline,success_criteria,verification_method,state,slug,accepted_at,activated_at) VALUES
  ('b0000000-0000-4000-8000-000000000001','a0000000-0000-4000-8000-000000000001',NULL,'Complete my first international triathlon and qualify for the age-group world championship series','running','first_marathon','distance',42.2,'km','2027-09-30T23:59:59Z','Officially finish a full-distance triathlon within the qualifying window for the world championship series','Official race timing chip result and federation qualification letter','active','alexandria-triathlon-qualifier',now(),now());
INSERT INTO backs(id,promise_id,backer_user_id,backer_name,achiever_user_id,amount_minor,currency,state,message) VALUES
  ('c0000000-0000-4000-8000-000000000001','b0000000-0000-4000-8000-000000000001',NULL,'Montgomery Blackwood-Chamberlain','a0000000-0000-4000-8000-000000000001',75000,'USD','active','I know you have been dreaming about qualifying for this since we watched the championship together three years ago, and I am beyond proud of every early morning you have put into this.');

-- Custom goal, no structured target (checks null targetLabel handling)
INSERT INTO users(id,email) VALUES ('a0000000-0000-4000-8000-000000000003','priya@example.test');
INSERT INTO profiles(user_id,first_name,display_name,slug) VALUES ('a0000000-0000-4000-8000-000000000003','Priya','Priya','priya-custom');
INSERT INTO promises(id,achiever_user_id,created_by_user_id,title,category,template_key,deadline,success_criteria,verification_method,state,slug,accepted_at,activated_at) VALUES
  ('b0000000-0000-4000-8000-000000000002','a0000000-0000-4000-8000-000000000003',NULL,'Finish writing my first novel','general','custom','2027-03-31T23:59:59Z','Complete a full manuscript of at least 70,000 words and submit it to three literary agents','Screenshot of manuscript word count and agent submission confirmations','active','priya-first-novel',now(),now());
INSERT INTO backs(id,promise_id,backer_user_id,backer_name,achiever_user_id,amount_minor,currency,state,message) VALUES
  ('c0000000-0000-4000-8000-000000000002','b0000000-0000-4000-8000-000000000002',NULL,'Sam','a0000000-0000-4000-8000-000000000003',5000,'USD','active','Go write that book.');

-- Non-USD currency scenario (GBP)
INSERT INTO users(id,email) VALUES ('a0000000-0000-4000-8000-000000000004','tom@example.test');
INSERT INTO profiles(user_id,first_name,display_name,slug) VALUES ('a0000000-0000-4000-8000-000000000004','Tom','Tom','tom-gbp');
INSERT INTO promises(id,achiever_user_id,created_by_user_id,title,category,template_key,target_type,target_value,target_unit,deadline,success_criteria,verification_method,state,slug,accepted_at,activated_at) VALUES
  ('b0000000-0000-4000-8000-000000000003','a0000000-0000-4000-8000-000000000004',NULL,'Run my first 10K','running','first_10k','distance',10,'km','2027-05-31T23:59:59Z','Complete an official 10K before the deadline','Official race result','active','tom-first-10k',now(),now());
INSERT INTO backs(id,promise_id,backer_user_id,backer_name,achiever_user_id,amount_minor,currency,state,message) VALUES
  ('c0000000-0000-4000-8000-000000000003','b0000000-0000-4000-8000-000000000003',NULL,'Liv','a0000000-0000-4000-8000-000000000004',5000,'GBP','active','Go on then.');

-- Dense Wall of Belief: 52 backers on one promise
INSERT INTO users(id,email) VALUES ('a0000000-0000-4000-8000-000000000005','dana@example.test');
INSERT INTO profiles(user_id,first_name,display_name,slug) VALUES ('a0000000-0000-4000-8000-000000000005','Dana','Dana','dana-crowd');
INSERT INTO promises(id,achiever_user_id,created_by_user_id,title,category,template_key,target_type,target_value,target_unit,deadline,success_criteria,verification_method,state,slug,accepted_at,activated_at) VALUES
  ('b0000000-0000-4000-8000-000000000004','a0000000-0000-4000-8000-000000000005',NULL,'Run my first marathon','running','first_marathon','distance',42.2,'km','2027-10-31T23:59:59Z','Complete an official marathon before the deadline','Official race result','active','dana-first-marathon',now(),now());
INSERT INTO backs(id,promise_id,backer_user_id,backer_name,achiever_user_id,amount_minor,currency,state,message,created_at)
SELECT gen_random_uuid(),'b0000000-0000-4000-8000-000000000004',NULL,
  (ARRAY['Jordan','Sam','Alex','Riley','Casey','Morgan','Taylor','Jamie','Drew','Quinn','Avery','Reese','Skyler','Cameron','Peyton','Dakota','Rowan','Finley','Emerson','Blake'])[1+((n-1)%20)] || ' ' || (ARRAY['Chen','Okafor','Martinez','Nguyen','Andersson','Kowalski','Silva','Haddad','Novak','Petrov'])[1+((n-1)%10)],
  'a0000000-0000-4000-8000-000000000005',
  (500+(n*137)%9500),
  'USD','active',
  CASE WHEN n%4=0 THEN 'You''ve got this!' WHEN n%4=1 THEN NULL WHEN n%4=2 THEN 'So proud of you.' ELSE 'Behind you all the way.' END,
  now() - (n || ' hours')::interval
FROM generate_series(1,52) AS n;
