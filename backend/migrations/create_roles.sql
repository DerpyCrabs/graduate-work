CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR UNIQUE NOT NULL
);

INSERT INTO roles (name)
  VALUES ('student'), ('teacher'), ('admin')