# Use the official Node.js 22 image based on Debian Linux
FROM node:bookworm

RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/node/app/node_modules && \
    mkdir -p /home/node/.cache/ms-playwright && \
    chown -R node:node /home/node/app && \
    chown -R node:node /home/node/.cache

# Set the working directory inside the container
WORKDIR /home/node/app

RUN npx playwright install-deps chromium 

USER node

COPY --chown=node:node . .

RUN rm -rf node_modules && npm install && \
    npx playwright install  --no-shell chromium

# Expose the port your Node.js app will run on
EXPOSE 3000

CMD npx playwright --version

