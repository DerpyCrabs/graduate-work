CREATE TABLE olympiad_collaborators (
  id SERIAL PRIMARY KEY,
  collaborator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  olympiad_id INTEGER NOT NULL REFERENCES olympiads(id) ON DELETE CASCADE
);
