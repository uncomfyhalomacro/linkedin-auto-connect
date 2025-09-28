# LinkedIn Auto

## Prerequisites

> [!NOTE]
> Work in progress. We still have to
> 1. ~~Pass the `.env` values over e.g. in CI.~~ DONE
> 2. ~~Store LinkedIn profiles.~~

If you want to use and ensure that the project is working universally, you can use `docker` or `podman`. 

> [!NOTE] 
> Instructions on how to install `docker` or `podman` will not be provided.

Run each service in this order:

**Dev mode**

Terminal 1:

```bash
docker compose up --build db  # Wait until the service is up
```

Terminal 2:

You can run this command if you want to restart the database from scratch

```bash
docker compose build db-migrate-down
docker compose start db-migrate-down
```

Otherwise:

```bash
docker compose build db-migrate-up  # Optional. Sequelize `sync` runs anyway
docker compose start db-migrate-up
```

Terminal 3:

```bash
docker compose build app
docker compose start app
```

To manipulate the database, you can head inside the container.

```bash
docker ps  # To get the name of the container
```

Copy the name and use it to access the container's shell.

```bash
docker exec --interactive --tty $CONTAINER_NAME sh
```

In the shell, run the following command to access the database.

```bash
psql postgres://devuser:devpassword@db:5432/devdb
```

> [!WARNING]
> For now, this file is in non-production use. It's not advisable to
have the credentials for this database exposed in the compose file.


# TROUBLESHOOTING

## Playwright does not work inside container.

Try running it locally. First you have to expose the database's port (`db` service) in the `docker-compose.yml` file e.g. `5432:5432` and
restart the container. You can check that the port is exposed by checking with netcat e.g. `nc -vz localhost 5432`.

Edit the `.env.database` file by pointing `PGHOST` to `localhost` or any host machine's `$HOSTNAME` or `$HOST`.

Run the following commands.

```bash
source .env
source .env.database
npm run start https://linkedin.com
```

If necessary e.g. your storage state has expired, you can do the following to refresh your storage state by logging in again.

```bash
node src/runSaveState.ts
source .env
source .env.database
```

> [!IMPORTANT]
> If you logged in too many times, LinkedIn will likely
> limit your session time.
