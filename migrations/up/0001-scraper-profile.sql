CREATE TABLE scraper_profiles (
    id      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    secret     TEXT    NOT NULL,
    first_used  TIMESTAMP NOT NULL,
    last_used   TIMESTAMP NOT NULL,
    connections INT DEFAULT 0,
    nonce       INTEGER     DEFAULT 0
);