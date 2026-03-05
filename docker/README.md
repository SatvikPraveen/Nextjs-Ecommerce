# 🐳 Docker Configuration

This folder contains Docker-related files for containerization and deployment.

## Files

### Dockerfile
Production-ready Docker image configuration for the Next.js application.

**Features:**
- Multi-stage build for optimized image size
- Node.js 22 Alpine base image
- Automated dependency installation
- Production build optimization
- Security best practices

**Usage:**
```bash
# Build the image
docker build -f docker/Dockerfile -t nextjs-ecommerce .

# Or use docker-compose (recommended)
docker-compose up --build
```

## Docker Compose

The main `docker-compose.yml` is located in the root directory and includes:
- **PostgreSQL 15** - Database service
- **Redis 7** - Caching layer
- **Next.js App** - Application service (uses this Dockerfile)
- **Nginx** - Reverse proxy (optional)

## Quick Start with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean everything (including volumes)
docker-compose down -v
```

## Make Commands

```bash
make docker-up       # Start all Docker services
make docker-down     # Stop all services
make docker-rebuild  # Rebuild and restart
make docker-clean    # Remove containers and volumes
make docker-db       # Start only PostgreSQL
```

## Environment Variables

The Docker setup uses environment variables from:
1. `.env.production` (for production)
2. `.env` (for development/testing)

Make sure to configure these before running Docker services.

## Production Deployment

For production deployment:

1. **Build the image:**
   ```bash
   docker build -f docker/Dockerfile -t your-registry/nextjs-ecommerce:latest .
   ```

2. **Push to registry:**
   ```bash
   docker push your-registry/nextjs-ecommerce:latest
   ```

3. **Deploy:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Health Checks

The Dockerfile includes health checks for:
- Application readiness
- Database connectivity
- Service availability

## Security

- Non-root user for running the application
- Minimal Alpine Linux base
- Only production dependencies included
- Security headers configured
- No unnecessary ports exposed

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs app

# Inspect container
docker inspect nextjs-ecommerce
```

### Database connection issues
```bash
# Verify PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres
```

### Build fails
```bash
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache
```

## Documentation

- [../README.md](../README.md) - Main documentation
- [../docs/setup/DEV_SETUP.md](../docs/setup/DEV_SETUP.md) - Development setup
- [docker-compose.yml](../docker-compose.yml) - Service configuration

---

**Docker Version:** Requires Docker 20.10+ and Docker Compose V2
