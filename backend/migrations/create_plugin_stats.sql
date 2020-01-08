CREATE TABLE plugin_stats (
  id SERIAL PRIMARY KEY,
  plugin_id VARCHAR NOT NULL,
  plugin_name VARCHAR NOT NULL,
  start_time TIMESTAMP NOT NULL,
  diff_time BIGINT NOT NULL,
  input VARCHAR NOT NULL,
  output VARCHAR NOT NULL,
  stats VARCHAR
);