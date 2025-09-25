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

```
node src/runSaveState.ts
```

This will open a Chromium browser that requires you to login. Input the account's login information.

This should save the file inside `src/storage_state.json`.

2. Run the following command replacing `profileName` with a valid result to a LinkedIn Profile.

```
node src/index.ts 'https://www.linkedin.com/in/profileName/' src/storage_state.json
```

This should give you an output similar to

```
✅ Invite sent to LinkedIn Profile.
```

Of course, this fails if the user has set their profile private or is already a connection.


