-- 0001_extensions.sql
-- Enable the Postgres extensions the rest of the schema relies on.
-- pgcrypto provides gen_random_uuid(); uuid-ossp is kept for compatibility.

create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";
