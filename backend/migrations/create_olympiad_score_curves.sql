CREATE TABLE olympiad_score_curves (
  id SERIAL PRIMARY KEY,
  olympiad_id INTEGER NOT NULL REFERENCES olympiads(id) ON DELETE CASCADE,
  place REAL NOT NULL,
  coefficient REAL NOT NULL
);
