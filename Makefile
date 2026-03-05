# Makefile for Next.js E-Commerce Development
# Usage: make <target>

.PHONY: help install dev build start test clean

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Setup & Installation
install: ## Install dependencies
	npm install

setup: ## Complete initial setup (install, env, database)
	@echo "🚀 Setting up development environment..."
	npm install
	@if [ ! -f .env ]; then \
		echo "📝 Creating .env file..."; \
		cp .env.example .env; \
		echo "⚠️  Please edit .env with your configuration"; \
	fi
	@echo "✅ Setup complete! Run 'make db-setup' to initialize the database."

# Development
dev: ## Start development server
	npm run dev

build: ## Build for production
	npm run build

start: ## Start production server
	npm start

# Database
db-setup: ## Setup database (migrate + seed)
	@echo "🗄️  Setting up database..."
	npx prisma generate
	npx prisma migrate dev
	npm run db:seed
	@echo "✅ Database ready!"

db-migrate: ## Run database migrations
	npx prisma migrate dev

db-reset: ## Reset database (WARNING: deletes all data)
	@echo "⚠️  This will delete all data. Press Ctrl+C to cancel, or Enter to continue."
	@read confirm
	npx prisma migrate reset --force

db-seed: ## Seed database with sample data
	npm run db:seed

db-studio: ## Open Prisma Studio to view/edit data
	npm run db:studio

db-generate: ## Generate Prisma Client
	npx prisma generate

# Docker
docker-up: ## Start all Docker services
	docker-compose up -d

docker-down: ## Stop all Docker services
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

docker-rebuild: ## Rebuild and restart Docker services
	docker-compose down
	docker-compose up --build -d

docker-db: ## Start only the database container
	docker-compose up -d postgres

docker-clean: ## Remove all Docker containers and volumes
	docker-compose down -v

# Testing
test: ## Run all tests
	npm test

test-unit: ## Run unit tests
	npm run test:unit

test-watch: ## Run tests in watch mode
	npm run test:watch

test-e2e: ## Run E2E tests with Cypress
	npm run test:e2e

test-e2e-open: ## Open Cypress UI
	npm run test:e2e:open

test-a11y: ## Run accessibility tests
	npm run test:a11y

# Code Quality
lint: ## Run linter
	npm run lint

lint-fix: ## Fix linting issues
	npm run lint -- --fix

format: ## Format code with Prettier
	npm run format

format-check: ## Check code formatting
	npm run format:check

type-check: ## Run TypeScript type checking
	npm run type-check

# Quality Checks (run before commit)
check: ## Run all quality checks (lint, format, type-check)
	@echo "🔍 Running quality checks..."
	npm run format:check
	npm run lint
	npm run type-check
	@echo "✅ All checks passed!"

pre-commit: ## Run pre-commit checks (same as above + tests)
	@echo "🔍 Running pre-commit checks..."
	npm run format:check
	npm run lint
	npm run type-check
	npm run test:unit
	@echo "✅ Ready to commit!"

# Cleanup
clean: ## Clean build artifacts and caches
	@echo "🧹 Cleaning..."
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf coverage
	rm -rf dist
	rm -rf build
	rm -rf .turbo
	@echo "✅ Cleaned!"

clean-all: clean ## Clean everything including node_modules
	@echo "🧹 Deep cleaning..."
	rm -rf node_modules
	@echo "✅ Deep cleaned! Run 'make install' to reinstall."

# Python venv (if using Python scripts)
venv: ## Create Python virtual environment
	python3 -m venv venv
	@echo "✅ Virtual environment created. Activate with: source venv/bin/activate"

# Utility
logs: ## View application logs (if using PM2 or similar)
	@if command -v pm2 >/dev/null 2>&1; then \
		pm2 logs; \
	else \
		echo "PM2 not installed. Use 'docker-compose logs' for Docker logs."; \
	fi

open: ## Open the application in browser
	@echo "Opening http://localhost:3000..."
	@open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null || echo "Please open http://localhost:3000 in your browser"

# Production
prod-build: ## Build for production with optimizations
	@echo "🏗️  Building for production..."
	NODE_ENV=production npm run build
	@echo "✅ Production build complete!"

prod-start: ## Start production server
	@echo "🚀 Starting production server..."
	NODE_ENV=production npm start

# Git helpers
git-reset-hard: ## Reset to last commit (WARNING: loses changes)
	@echo "⚠️  This will discard all uncommitted changes. Press Ctrl+C to cancel, or Enter to continue."
	@read confirm
	git reset --hard HEAD

git-clean: ## Remove untracked files
	git clean -fd

# Quick common workflows
quick-start: ## Quick start for daily development
	@echo "🚀 Starting development environment..."
	@make docker-db
	@sleep 3
	@make dev

fresh-start: ## Fresh start (reset + setup + start)
	@echo "🔄 Fresh start..."
	@make clean
	@make install
	@make db-reset
	@make db-seed
	@make dev

# Info
info: ## Show project information
	@echo "📦 Project: Next.js E-Commerce"
	@echo "📍 Directory: $$(pwd)"
	@echo "\n📊 Statistics:"
	@echo "  Node version: $$(node --version 2>/dev/null || echo 'Not installed')"
	@echo "  npm version: $$(npm --version 2>/dev/null || echo 'Not installed')"
	@echo "  PostgreSQL: $$(psql --version 2>/dev/null | head -1 || echo 'Not installed')"
	@echo "  Docker: $$(docker --version 2>/dev/null || echo 'Not installed')"
	@echo "\n📝 Files:"
	@echo "  TypeScript: $$(find . -name '*.ts' -o -name '*.tsx' | grep -v node_modules | wc -l | tr -d ' ') files"
	@echo "  Components: $$(find components -name '*.tsx' 2>/dev/null | wc -l | tr -d ' ') files"
	@echo "  Tests: $$(find tests -name '*.test.*' 2>/dev/null | wc -l | tr -d ' ') files"
