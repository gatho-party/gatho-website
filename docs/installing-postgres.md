Installing Postgres
===================

Gatho uses Postgres. It gets the database location via the database URLs in the .env file

PRs very welcome to improve these instructions!

# Postgres Mac installation (Homebrew)
```
brew install postgresql
```

To have launchd start postgresql now and restart at login:

```
brew services start postgresql
```

Or, if you don't want/need a background service you can just run:              
  /opt/homebrew/opt/postgresql/bin/postgres -D /opt/homebrew/var/postgres

# Postgres Linux installation

Install:
`
sudo apt-get install postgresql libpq-dev postgresql-client postgresql-client-common -y
`

Find out your postgres version:
`
ls /etc/postgresql
`

Then insert version into the below statement.
Update the pg_hba.conf file to give your local account permissions
`
sudo vim /etc/postgresql/[version]/main/pg_hba.conf`

Change the following line:

`local   all             all                                    md5`
to:
`local   all             all                                     peer`


Start the server
`
service postgresql start
`

Make sure your local account has permissions to delete the database
`
ALTER DATABASE matrix-events OWNER TO [user];
`

Make sure you have permissions to create a database:
`
ALTER USER [user] createdb;
`
