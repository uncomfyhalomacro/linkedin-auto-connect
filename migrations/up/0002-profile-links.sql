CREATE TABLE
    profile_links (
        id UUID PRIMARY KEY,
        first_fetched_on TIMESTAMP NOT NULL DEFAULT CURRENT_DATE,
        last_fetched_on TIMESTAMP NOT NULL DEFAULT CURRENT_DATE,
        member_id_url TEXT NOT NULL,
        clean_profile_url TEXT NOT NULL,
        connected BOOLEAN DEFAULT false,
        pending BOOLEAN DEFAULT false,
        name TEXT NOT NULL,
        UNIQUE(member_id_url, clean_profile_url)
    );