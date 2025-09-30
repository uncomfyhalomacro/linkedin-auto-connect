CREATE TABLE
    feeds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        post_url TEXT,
        fetched_at TIMESTAMP NOT NULL,
        interacted_on TIMESTAMP NOT NULL,
        nonce INTEGER DEFAULT 0
    );