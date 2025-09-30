CREATE TABLE
    profile_links (
        id UUID PRIMARY KEY,
        fetched_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        member_id_url TEXT NOT NULL,
        clean_profile_url TEXT NOT NULL,
        connected BOOLEAN DEFAULT false,
        pending BOOLEAN DEFAULT false,
        name TEXT NOT NULL,
        nonce INTEGER DEFAULT 0
    );