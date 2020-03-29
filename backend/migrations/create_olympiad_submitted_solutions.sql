CREATE TABLE olympiad_submitted_solutions (
  id SERIAL PRIMARY KEY,
  olympiad_id INTEGER NOT NULL REFERENCES olympiads(id) ON DELETE CASCADE,
  participant_id INTEGER NOT NULL REFERENCES olympiad_participants(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP NOT NULL
);
