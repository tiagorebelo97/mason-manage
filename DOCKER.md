# Docker Setup for Mason Manage

This document describes how to run the Mason Manage application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (v2 or later)

## Quick Start

### Production Build

To build and run the application in production mode:

```bash
# Build the Docker image
docker build -t mason-manage .

# Run the container
docker run -p 80:80 mason-manage
```

Or use Docker Compose:

```bash
# Build and start the production service
docker compose up web
```

The application will be available at `http://localhost`

### Development Mode

To run the application in development mode with hot reload:

```bash
# Start the development service
docker compose up dev
```

The development server will be available at `http://localhost:8080`

## Docker Files

### Dockerfile

The `Dockerfile` uses a multi-stage build:
1. **Build stage**: Installs dependencies and builds the Vite application
2. **Production stage**: Serves the built static files using nginx

### docker-compose.yml

The `docker-compose.yml` defines two services:
- **web**: Production build served with nginx on port 80
- **dev**: Development server with hot reload on port 8080 (matching vite.config.ts configuration)

## Environment Variables

You can pass environment variables to the containers:

```bash
docker compose up web -e VITE_SUPABASE_URL=your_url
```

Or create a `.env` file in the project root (already supported by docker-compose).

## Troubleshooting

### SSL Certificate Issues

If you encounter SSL certificate errors during the build, the Dockerfile includes a workaround that disables strict SSL checking for npm (`npm config set strict-ssl false`). This is necessary in some corporate or restricted network environments with proxy servers or self-signed certificates.

**Security Note**: For production deployments in secure environments, you should:
1. Remove the `npm config set strict-ssl false` line from the Dockerfile
2. Properly configure CA certificates in the build environment
3. Or use build arguments to make SSL verification optional

To build without the SSL workaround (if your environment supports it):
```bash
# Edit Dockerfile and remove the "npm config set strict-ssl false" line
# Then rebuild
docker build -t mason-manage .
```

### Build Cache

To force a clean build without using cache:

```bash
docker build --no-cache -t mason-manage .
```

### npm install failures

If npm install fails in the container, ensure you have sufficient disk space and memory allocated to Docker.

## Notes

- The `.dockerignore` file excludes unnecessary files from the Docker build context
- DOCKER.md is included in the container for reference
- Node modules are installed inside the container, not copied from the host
- The development service uses a named volume for node_modules to persist dependencies and improve startup time
- The development service mounts the source code as a volume for hot reload
- Both services include SSL workarounds for restricted network environments - remove these for secure production deployments
