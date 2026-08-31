ALTER TABLE promises ADD CONSTRAINT promises_title_length CHECK (length(title) <= 100);
ALTER TABLE promises ADD CONSTRAINT promises_success_criteria_length CHECK (length(success_criteria) <= 400);
ALTER TABLE promises ADD CONSTRAINT promises_verification_method_length CHECK (length(verification_method) <= 200);
