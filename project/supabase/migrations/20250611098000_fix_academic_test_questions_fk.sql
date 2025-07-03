-- Fix foreign key on question_id in academic_test_questions to reference academic_questions
ALTER TABLE academic_test_questions DROP CONSTRAINT IF EXISTS academic_test_questions_question_id_fkey;
ALTER TABLE academic_test_questions
    ADD CONSTRAINT academic_test_questions_question_id_fkey FOREIGN KEY (question_id)
    REFERENCES academic_questions(id) ON DELETE CASCADE; 