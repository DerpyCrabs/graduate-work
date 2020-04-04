CREATE TABLE olympiad_submitted_solution_answers (
  id SERIAL PRIMARY KEY,
  solution_id INTEGER NOT NULL REFERENCES olympiad_submitted_solutions(id) ON DELETE CASCADE,
  answer_id INTEGER NOT NULL REFERENCES olympiad_test_answers(id) ON DELETE CASCADE,
  score INTEGER NOT NULL
);
