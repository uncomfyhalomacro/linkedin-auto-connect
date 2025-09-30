# --- Configuration ---
set dotenv-path := ".env.database"

# Detects whether to use 'docker' or 'podman'
docker_cmd := shell("command -v docker >/dev/null && echo docker || echo podman")


# --- Main Workflows ---

# Run this once to build images, start the DB, and run migrations
setup: build db-up db-migrate
    @echo "✅ Setup complete. You can now run 'just start'"

# Use this for your daily development to start the application
start:
    {{docker_cmd}} compose run app

# Stop all services and remove volumes
down:
    {{docker_cmd}} compose down -v


# --- Individual & Helper Recipes ---

# Build all images defined in docker-compose.yml
build:
    {{docker_cmd}} compose build

# Start the database service in the background
db-up:
    {{docker_cmd}} compose up -d db

# Stop the database service
db-down:
    {{docker_cmd}} compose stop db

# Run database migrations (waits for DB to be healthy automatically)
db-migrate:
    {{docker_cmd}} compose run --rm db-migrate-up

# Roll back database migrations
db-migrate-down:
    {{docker_cmd}} compose run --rm db-migrate-down

# Clean up stopped containers
prune:
    {{docker_cmd}} container prune -f

# Application-specific command
refresh-save-state:
    npm run saveState


# Justfile specific
migrate-up:
    just migrations/up/all

migrate-down:
    just migrations/down/all