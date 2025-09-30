CREATE TABLE
    scraper_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        secret TEXT NOT NULL,
        first_used TIMESTAMP NOT NULL DEFAULT CURRENT_DATE,
        last_used TIMESTAMP NOT NULL DEFAULT CURRENT_DATE,
        connections INT DEFAULT 0
    );