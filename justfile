
set dotenv-path := ".env.database"

docker_cmd := shell("command -v podman >/dev/null && echo podman || echo docker")

migrate-up:
    just migrations/up/all

migrate-down:
    just migrations/down/all

[positional-arguments]
run-app argument:
    {{docker_cmd}} compose up app "$1" "$2"

[positional-arguments]
cols argument:
    ls | column $1

refresh-save-state:
    npm run saveState