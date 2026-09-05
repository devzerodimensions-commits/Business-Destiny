CREATE SCHEMA IF NOT EXISTS business_destiny;
REVOKE ALL ON SCHEMA business_destiny FROM PUBLIC;
CREATE TABLE IF NOT EXISTS business_destiny.content (
  id TEXT PRIMARY KEY, value TEXT NOT NULL, updated BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS business_destiny.sessions (
  token TEXT PRIMARY KEY, expires BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS business_destiny.settings (
  id TEXT PRIMARY KEY, value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS business_destiny.enquiries (
  id TEXT PRIMARY KEY, data TEXT NOT NULL, created BIGINT NOT NULL
);
CREATE TABLE IF NOT EXISTS business_destiny.limits (
  id TEXT PRIMARY KEY, count INTEGER NOT NULL, expires BIGINT NOT NULL
);
