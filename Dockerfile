# Use the official Node.js 22 image based on Alpine Linux
FROM node:22-alpine

RUN apk add --no-cache git  # Install git to clone repositories if needed or run husky

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of your application source code
COPY . .

# Expose the port your Node.js app will run on
EXPOSE 3000

# The command to run your application
CMD ["npm", "install"]    # for now run npm install to install dependencies
# CMD ["npm", "start"]      # Uncomment this line to run the app