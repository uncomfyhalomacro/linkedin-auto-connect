CREATE TABLE
    feeds (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
        post_url TEXT NOT NULL,
        first_fetched_on TIMESTAMP NOT NULL DEFAULT CURRENT_DATE,
        last_interacted_on TIMESTAMP NOT NULL DEFAULT CURRENT_DATE,
        note TEXT,
        UNIQUE (post_url)
    );