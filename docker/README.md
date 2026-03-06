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

## Prerequisites

Before running Docker services, ensure you have:
1. Docker and Docker Compose installed
2. `.env.production` file configured (template provided in root)
3. All required environment variables set

## Quick Start with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up --build

# Clean everything (including volumes)
docker-compose down -v

# View specific service logs
docker-compose logs -f app
```

## Running Database Migrations

After starting services, run Prisma migrations:

```bash
# Execute migrations in the app container
docker-compose exec app npx prisma migrate deploy

# Or seed the database
docker-compose exec app npm run db:seed
```

## Environment Variables

The Docker setup uses environment variables from:
1. `.env.production` (for production)
2. `.env` (for development/testing)

Make sure to configure these before running Docker services.

## Production Deployment

For production deployment:

1. **Configure production environment:**
   - Update `.env.production` with actual credentials
   - Ensure all required API keys are set

2. **Build the image:**
   ```bash
   docker build -f docker/Dockerfile -t your-registry/nextjs-ecommerce:latest .
   ```

3. **Push to registry:**
   ```bash
   docker push your-registry/nextjs-ecommerce:latest
   ```

4. **Deploy with docker-compose:**
   ```bash
   docker-compose up -d
   ```

5. **Run migrations:**
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

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
