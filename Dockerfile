# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Workaround for SSL certificate issues in restricted network environments
# This is necessary when building behind corporate proxies or in environments with self-signed certificates
# For production use in secure environments, consider removing this line or using a CA bundle
RUN npm config set strict-ssl false

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application using npm script which handles PATH correctly
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
