\set ON_ERROR_STOP true

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	email TEXT NOT NULL
);

CREATE TABLE guests (
	id SERIAL PRIMARY KEY,
	displayname TEXT,
	matrix_username TEXT,
	magic_code TEXT, -- The code required to "auth" as the user
	phone_number TEXT
);

CREATE TABLE events (
	id SERIAL PRIMARY KEY,
	host INT NOT NULL,
	code TEXT NOT NULL,
	name TEXT,
	description TEXT,
	time TEXT,
	place TEXT,

	-- Looks like
	-- !blah:domain
	matrix_room_address TEXT,
	matrix_rsvp_message TEXT,
	FOREIGN KEY (host) REFERENCES users(id)
);

CREATE TABLE event_guests (
	event INT NOT NULL,
	guest INT NOT NULL,
	-- role TEXT NOT NULL,
	status TEXT NOT NULL,
	PRIMARY KEY (
		event,
		guest
	),
	FOREIGN KEY (guest) REFERENCES guests(id),
	FOREIGN KEY (event) REFERENCES events(id)
);

--- Created by Postico, from the generated Prisma schema

CREATE TABLE "User" (
    id text PRIMARY KEY,
    name text,
    email text,
    "emailVerified" timestamp(3) without time zone,
    image text
);

CREATE TABLE "Account" (
    id text PRIMARY KEY,
    "userId" text NOT NULL REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);

CREATE TABLE "Session" (
    id text PRIMARY KEY,
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE,
    expires timestamp(3) without time zone NOT NULL
);

CREATE TABLE "VerificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


-- Set the correct timezone for timestamps
SET timezone = 'Australia/Sydney';