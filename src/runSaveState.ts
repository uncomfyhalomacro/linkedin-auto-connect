import saveState from "./saveAuthState.ts";

await saveState().catch((err) => console.error(err));
