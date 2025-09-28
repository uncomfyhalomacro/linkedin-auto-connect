CREATE TABLE profile_links (
    id UUID         PRIMARY     KEY,
    fetched_at      TIMESTAMP   NOT NULL,
    updated_at      TIMESTAMP   NOT NULL,
    memberIdUrl     TEXT        NOT NULL,
    cleanProfileUrl TEXT        NOT NULL,  
    name            TEXT        NOT NULL         
);