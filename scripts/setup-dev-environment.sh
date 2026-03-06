#!/bin/bash
# Complete Development Environment Setup Script for macOS
# For Next.js E-Commerce Project

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Next.js E-Commerce - Development Environment Setup      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Print status
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# 1. Check and Install Homebrew
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Checking Homebrew (Package Manager)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command_exists brew; then
    print_success "Homebrew is already installed"
    brew --version
else
    print_warning "Homebrew not found. Installing..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Add Homebrew to PATH for Apple Silicon Macs
    if [[ $(uname -m) == 'arm64' ]]; then
        echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
    
    print_success "Homebrew installed successfully"
fi

# 2. Check and Install Node.js
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. Checking Node.js (JavaScript Runtime)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REQUIRED_NODE_VERSION="20"

if command_exists node; then
    CURRENT_NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    print_success "Node.js is installed: $(node --version)"
    
    if [ "$CURRENT_NODE_VERSION" -lt "$REQUIRED_NODE_VERSION" ]; then
        print_warning "Node.js version is below v20. Upgrading..."
        brew upgrade node
    fi
else
    print_warning "Node.js not found. Installing Node.js v20 LTS..."
    brew install node@20
    brew link node@20
    print_success "Node.js installed successfully"
fi

# Verify installation
if command_exists node && command_exists npm; then
    print_success "Node.js: $(node --version)"
    print_success "npm: $(npm --version)"
else
    print_error "Node.js installation failed. Please install manually from https://nodejs.org/"
    exit 1
fi

# 3. Check and Install PostgreSQL
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. Checking PostgreSQL (Database)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command_exists psql; then
    print_success "PostgreSQL is already installed"
    psql --version
else
    print_warning "PostgreSQL not found. Installing PostgreSQL 15..."
    brew install postgresql@15
    brew services start postgresql@15
    
    # Add to PATH
    echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zprofile
    export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
    
    print_success "PostgreSQL installed and started"
fi

# 4. Check and Install Docker Desktop
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. Checking Docker (Optional but Recommended)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command_exists docker; then
    print_success "Docker is already installed"
    docker --version
else
    print_warning "Docker not found. You can install it from:"
    echo "   https://www.docker.com/products/docker-desktop"
    echo "   Or run: brew install --cask docker"
fi

# 5. Check Git
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. Checking Git"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command_exists git; then
    print_success "Git is already installed"
    git --version
else
    print_warning "Git not found. Installing..."
    brew install git
    print_success "Git installed successfully"
fi

# 6. Optional Tools
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. Optional Development Tools"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Python (for scripts)
if command_exists python3; then
    print_success "Python3 is installed: $(python3 --version)"
else
    print_warning "Python3 not found. Installing..."
    brew install python3
fi

# Check for useful tools
echo ""
print_status "Checking for recommended tools:"

if command_exists code; then
    print_success "VS Code is installed"
else
    echo "   - VS Code: brew install --cask visual-studio-code"
fi

if command_exists stripe; then
    print_success "Stripe CLI is installed"
else
    echo "   - Stripe CLI: brew install stripe/stripe-cli/stripe"
fi

# 7. Project Dependencies
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. Installing Project Dependencies"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

print_status "Installing npm packages (this may take a few minutes)..."
npm install

print_success "Project dependencies installed"

# 8. Environment Setup
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. Environment Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ ! -f .env ]; then
    print_status "Creating .env file from template..."
    cp .env.example .env
    print_success ".env file created"
    print_warning "⚠️  Please edit .env and add your configuration values"
else
    print_success ".env file already exists"
fi

# 9. Database Setup (Optional)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "9. Database Initialization"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "Do you want to set up the database now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Generating Prisma Client..."
    npx prisma generate
    
    print_status "Running database migrations..."
    npx prisma migrate dev
    
    print_status "Seeding database..."
    npm run db:seed
    
    print_success "Database setup complete"
else
    print_warning "Skipped database setup. Run 'make db-setup' later."
fi

# 10. Final Summary
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                  SETUP COMPLETE! ✅                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Installed Tools Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Homebrew:   $(brew --version | head -1)"
echo "✅ Node.js:    $(node --version)"
echo "✅ npm:        $(npm --version)"
echo "✅ PostgreSQL: $(psql --version | head -1)"
echo "✅ Git:        $(git --version)"
if command_exists docker; then
    echo "✅ Docker:     $(docker --version)"
fi
if command_exists python3; then
    echo "✅ Python:     $(python3 --version)"
fi
echo ""
echo "📚 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Edit .env file with your API keys and configuration"
echo "2. Start development server: npm run dev"
echo "   Or use Make: make dev"
echo ""
echo "3. Open browser: http://localhost:3000"
echo ""
echo "📖 Documentation:"
echo "   - Quick Start:    QUICKSTART.md"
echo "   - Full Setup:     docs/setup/DEV_SETUP.md"
echo "   - Commands:       docs/contributing/CHEAT_SHEET.md"
echo "   - Make commands:  make help"
echo ""
echo "🎉 Happy coding!"
echo ""
