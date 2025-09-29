CREATE TABLE
    feeds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        fetched_at TIMESTAMP NOT NULL,
        interacted_on TIMESTAMP NOT NULL
    );