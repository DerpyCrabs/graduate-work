CREATE TABLE olympiad_test_answers (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER NOT NULL REFERENCES olympiad_participants(id) ON DELETE CASCADE,
  test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  code VARCHAR NOT NULL
);
