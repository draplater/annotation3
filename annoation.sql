create table annotation(
    username char(255),
    lexicon char(255),
    frameset integer,
    frame char(255),
    confidence integer,
    PRIMARY KEY (username, lexicon, frameset, frame)
);

create table comment(
    username char(255),
    lexicon char(255),
    frameset integer,
    comment text,
    PRIMARY KEY (username, lexicon, frameset)
);
