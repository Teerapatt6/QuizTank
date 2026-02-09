ALTER TABLE challenges DROP CONSTRAINT IF EXISTS challenges_difficulty_check;

ALTER TABLE challenges ADD CONSTRAINT challenges_difficulty_check 
CHECK (difficulty IN ('Very Easy', 'Easy', 'Medium', 'Hard', 'Very Hard'));
