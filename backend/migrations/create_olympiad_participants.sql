CREATE TABLE olympiad_participants (
  id SERIAL PRIMARY KEY,
  name VARCHAR,
  olympiad_id INTEGER NOT NULL REFERENCES olympiads(id) ON DELETE CASCADE
);
