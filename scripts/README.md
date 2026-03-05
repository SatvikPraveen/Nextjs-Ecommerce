# 🔨 Scripts

Utility scripts for development, testing, and maintenance.

## Available Scripts

### generate-project-structure.sh
Generates a visual representation of the project structure.

**Usage:**
```bash
bash scripts/generate-project-structure.sh
```

**Output:**
Creates a tree-like structure showing all files and folders in the project, useful for documentation and understanding the codebase organization.

**Options:**
```bash
# Generate full structure
bash scripts/generate-project-structure.sh

# Save to file
bash scripts/generate-project-structure.sh > PROJECT_STRUCTURE.txt

# Exclude node_modules and other large folders (recommended)
bash scripts/generate-project-structure.sh --exclude-deps
```

## Adding New Scripts

When adding new scripts to this folder:

1. **Use descriptive names:**
   ```bash
   seed-database.sh
   backup-production.sh
   generate-types.sh
   ```

2. **Make them executable:**
   ```bash
   chmod +x scripts/your-script.sh
   ```

3. **Add a header comment:**
   ```bash
   #!/bin/bash
   # Description: What this script does
   # Usage: bash scripts/your-script.sh [options]
   # Author: Your Name
   ```

4. **Update this README** with the new script documentation

## Common Script Patterns

### Database Scripts
```bash
# Backup database
scripts/backup-db.sh

# Restore database
scripts/restore-db.sh backup-file.sql

# Reset to seed data
scripts/reset-db.sh
```

### Development Scripts
```bash
# Generate TypeScript types from Prisma
scripts/generate-types.sh

# Check for outdated dependencies
scripts/check-deps.sh

# Clean all caches
scripts/clean-all.sh
```

### Deployment Scripts
```bash
# Pre-deployment checks
scripts/pre-deploy.sh

# Deploy to staging
scripts/deploy-staging.sh

# Deploy to production
scripts/deploy-production.sh
```

## Best Practices

1. **Error Handling:**
   ```bash
   set -e  # Exit on error
   set -u  # Error on undefined variables
   set -o pipefail  # Pipe errors
   ```

2. **Logging:**
   ```bash
   echo "[INFO] Starting process..."
   echo "[ERROR] Something went wrong" >&2
   ```

3. **Argument Validation:**
   ```bash
   if [ $# -eq 0 ]; then
     echo "Usage: $0 <argument>"
     exit 1
   fi
   ```

4. **Cross-platform Compatibility:**
   - Test on both macOS and Linux
   - Use POSIX-compliant commands when possible
   - Document platform-specific requirements

## Integration with Makefile

Scripts in this folder can be added to the Makefile for easier access:

```makefile
# In Makefile
generate-structure: ## Generate project structure
	@bash scripts/generate-project-structure.sh

.PHONY: generate-structure
```

Then use:
```bash
make generate-structure
```

## Script Categories

### 📊 Analysis & Reporting
- `generate-project-structure.sh` - Project structure visualization

### 🗄️ Database
- (Add database-related scripts here)

### 🚀 Deployment
- (Add deployment scripts here)

### 🧹 Maintenance
- (Add maintenance scripts here)

### 🧪 Testing
- (Add testing scripts here)

## Python Scripts

If you're using the Python virtual environment (venv), you can also create Python scripts:

```bash
# Activate venv first
source ../venv/bin/activate

# Run Python script
python scripts/your-script.py
```

## Documentation

For more information:
- [../README.md](../README.md) - Main documentation
- [../docs/setup/DEV_SETUP.md](../docs/setup/DEV_SETUP.md) - Development setup
- [../Makefile](../Makefile) - Available make commands

---

**Note:** Always test scripts in a development environment before running in production!
