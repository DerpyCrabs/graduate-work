CREATE TABLE olympiad_test_answers (
  id SERIAL PRIMARY KEY,
  submitted_solution_id INTEGER REFERENCES olympiad_submitted_solutions(id) ON DELETE CASCADE,
  participant_id INTEGER NOT NULL REFERENCES olympiad_participants(id) ON DELETE CASCADE,
  test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  code VARCHAR NOT NULL,
  score INTEGER,
  submitted_at TIMESTAMP NOT NULL
);
