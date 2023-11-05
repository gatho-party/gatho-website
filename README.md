Gatho Events
================================================

> Invite friends to your event with a one-click RSVP link - no matter which chat/social app they use!

Gatho is an event planning app which works great standalone, but can integrate with a group chat
on Matrix. It is a side project by Jake Coppinger ([jakecoppinger.com](https://jakecoppinger.com)).

Jake previously hosted it at gatho.party but has since shut down that instance. Feel free to spin up your own using the below instructions.

# Architecture

Gatho uses Next.js in Typescript (React on the frontend), and Postgres as a database.

The matrix bot uses [matrix-bot-sdk](https://github.com/turt2live/matrix-bot-sdk) and sends RSVPs or
new events to the Gatho backend server.

# Architecture

It should work anywhere you can run a Next.js Node app.

- Gatho uses NextAuth.js for authentication so no passwords are required to be stored.
- API calls are checked for session token and that the requester owns the given event.
- Database calls use SQL parameters.
- No third party cookies are set and no third party JavaScript is run.

# Get started building
## Setting up database

Gatho uses Postgres. It gets the database location via the database URLs in the `.env` file.

Copy `example-.env` to `.env` as an example file to get started.

Make sure to populate all the example values.

See [docs/installing-postgres.md](docs/installing-postgres.md) for installation instructions if
you'd like to setup a local server.

### Creating the database tables
Run `./scripts/create-database-tables-local.sh`

## Running website dev server
- `npm i`
- `npm run build`
- `npm run dev`

# Debugging
## Prisma

Gatho currently uses NextAuth.js for authentication. This reqires using a NextAuth database
adapter - I haven't written my own at this stage so I used Prisma. This comes with some quirks.

Update: A vanilla postgres adapter has been merged - this could be used to remove Prisma usage: https://github.com/nextauthjs/next-auth/pull/4933#event-10444245176

### Error creating shadow database

I encountered this when using Heroku during development. See
https://github.com/prisma/prisma/issues/4571#issuecomment-925249761

- Change your prisma `.env` file to local db (`mydb`)
- Delete `prisma/migrations` folder if any
- Run `npx prisma migrate dev --preview-feature` to start a new migration

- Change your prisma `.env` file back to the development db
- Run `npx prisma migrate resolve --applied "{{MIGRATION_FOLDER_NAME_GENERATED_BY_STEP_4}}" --preview-feature`

- `npx prisma migrate reset`


## Debugging database issues

Some SQL tables use `SERIAL` keywords. If you delete a record the counter can become outdated.
Run this snippet replacing `"events"` with the table you're having issues with

```
SELECT SETVAL((SELECT PG_GET_SERIAL_SEQUENCE('"events"', 'id')), (SELECT (MAX("id") + 1) FROM "events"), FALSE);
```

# License

[GNU Affero General Public License v3.0](https://choosealicense.com/licenses/agpl-3.0/). See LICENSE.

# Original author
Jake Coppinger ([jakecoppinger.com](https://jakecoppinger.com)).
