
set dotenv-path := ".env.database"

docker_cmd := shell("command -v podman >/dev/null && echo podman || echo docker")

migrate-up:
    just migrations/up/all

migrate-down:
    just migrations/down/all

run-app *argument:
    {{docker_cmd}} compose up app {{ argument }}


down-app:
    {{docker_cmd}} compose down -v

refresh-save-state:
    npm run saveState