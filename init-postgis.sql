-- This script runs when the PostgreSQL container starts up and initializes
-- It ensures the PostGIS extension is enabled in your database

-- Connect to your specific database (geospatial in your case)
\c geospatial;

-- Create the PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;
CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder;
