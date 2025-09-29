CREATE TABLE
    profile_links (
        id UUID PRIMARY KEY,
        fetched_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        member_id_url TEXT NOT NULL,
        clean_url_profile TEXT NOT NULL,
        name TEXT NOT NULL,
        nonce INTEGER DEFAULT 0
    );