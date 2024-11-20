# Base image
FROM node:lts-jod

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Compile TypeScript
RUN npm run build

# Expose the port
EXPOSE ${PORT}

# Run the server
CMD ["node", "dist/src/bin/www.js"]