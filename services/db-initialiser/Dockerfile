# Use Node.js as the base image
FROM node:lts-jod

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Run the createTables script
CMD ["npx", "ts-node", "./setupLocalDb.ts"]