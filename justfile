
set dotenv-path := ".env.database"

docker_cmd := shell("command -v docker >/dev/null && echo docker || echo podman")

migrate-up:
    just migrations/up/all

migrate-down:
    just migrations/down/all

run-app *argument:
    {{docker_cmd}} compose up {{ argument }} app

down-app:
    {{docker_cmd}} compose down -v

refresh-save-state:
    npm run saveState

db-migrate-up:
    {{docker_cmd}} compose up db-migrate-up

db-migrate-down:
    {{docker_cmd}} compose up db-migrate-down

run-database *argument:
    {{docker_cmd}} compose up {{ argument }} db