# Use the official Node.js 22 image based on Debian Linux
FROM node:22-bookworm-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends git just && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/node/app/node_modules && \
    mkdir -p /home/node/.cache/ms-playwright && \
    chown -R node:node /home/node/app && \
    chown -R node:node /home/node/.cache

# Set the working directory inside the container
WORKDIR /home/node/app

RUN npx playwright install-deps chromium

USER node

COPY --chown=node:node package*.json ./

RUN npm install && \
    npx playwright install chromium

COPY --chown=node:node . .

# Expose the port your Node.js app will run on
EXPOSE 3000

CMD npx playwright --version

