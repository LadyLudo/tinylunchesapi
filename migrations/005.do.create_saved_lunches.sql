CREATE TABLE saved_lunches (
    id INTEGER GENERATED BY DEFAULT AS IDENTITY,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    item_1 TEXT,
    item_2 TEXT,
    item_3 TEXT,
    item_4 TEXT,
    item_5 TEXT,
    item_6 TEXT,
    item_7 TEXT,
    item_8 TEXT,
    item_9 TEXT,
    item_10 TEXT,
    item_11 TEXT,
    item_12 TEXT,
    item_13 TEXT,
    item_14 TEXT,
    item_15 TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
);