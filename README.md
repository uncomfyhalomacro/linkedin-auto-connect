# LinkedIn Auto

## Prerequisites

Ensure you have an Ubuntu installation. Use [distrobox](https://distrobox.it) if you are in another distribution.

Install dependencies by running the following commands in **Bash** or any POSIX compatible shell:

```bash
npm install
npx playwright install --with-deps
```

Also do this before you contribute to this repository. See [CONTRIBUTING.md](./docs/CONTRIBUTING.md) on how to contribute.

## How to use

1. Save an account's session informatoin to do the auto connection.

```bash
node src/runSaveState.ts
```

This will open a Chromium browser that requires you to login. Input the account's login information.

This should save the file as a `.env` at the project root.

2. Run the following command replacing `profileName` with a valid result to a LinkedIn Profile.

> [!IMPORTANT]
> Ensure that your `.env` file exists and is generated prior this step.

```bash
node src/index.ts 'https://www.linkedin.com/in/profileName/'
```

This should give you an output similar to

```
✅ Invite sent to LinkedIn Profile.
```

Of course, this fails if the user has set their profile private or is already a connection.

# Containerised Solution

> [!NOTE]
> Work in progress. We still have to
> 1. ~~Pass the `.env` values over e.g. in CI.~~ DONE
> 2. Store LinkedIn profiles.

If you want to use and ensure that the project is working universally, you can use `docker` or `podman`. 

> [!NOTE] 
> Instructions on how to install `docker` or `podman` will not be provided.

This will install an Alpine image of both PostgreSQL and NodeJS. Then it will run the database in the background.

```bash
docker compose up
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

Try running it locally. First you have to expose the database's port in the `docker-compose.yml` file e.g. `5432:5432` and
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
