# Base image for building the app
FROM node:lts-jod AS build

# Set working directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Inject environment variables at build time
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Compile TypeScript and build Vue app
RUN npm run build

# Base image for serving the app
FROM nginx:stable-alpine-slim

# Copy Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy app code to nginx dir
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Expose the port
EXPOSE ${PORT}

# Serve the client
CMD ["nginx", "-g", "daemon off;"]