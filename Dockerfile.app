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

COPY . .

RUN rm -rf node_modules && npm install
#    mkdir -p /home/node/.cache/ms-playwright/chromium_headless_shell-1193/ && \
#    ln -svf /home/node/.cache/ms-playwright/chromium-1193/chrome-linux /home/node/.cache/ms-playwright/chromium_headless_shell-1193/chrome-linux && \
#    cp -v /home/node/.cache/ms-playwright/chromium_headless_shell-1193/chrome-linux/chrome \
#    /home/node/.cache/ms-playwright/chromium_headless_shell-1193/chrome-linux/headless_shell && \
#    chmod -v +x /home/node/.cache/ms-playwright/chromium_headless_shell-1193/chrome-linux/headless_shell

# Expose the port your Node.js app will run on
EXPOSE 3000

CMD npx playwright --version

