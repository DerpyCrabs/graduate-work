CREATE TABLE olympiad_participant_teams (
  id SERIAL PRIMARY KEY,
  consent BOOLEAN,
  olympiad_participant_id INTEGER NOT NULL REFERENCES olympiad_participants(id) ON DELETE CASCADE,
  participant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
);
