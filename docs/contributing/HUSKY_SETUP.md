# Pre-commit Hooks Setup Guide

This guide explains how to set up Git pre-commit hooks using Husky to maintain code quality.

## What Are Pre-commit Hooks?

Pre-commit hooks automatically run checks before each commit, ensuring:
- Code is properly formatted
- Tests pass
- No TypeScript errors
- No linting violations

This prevents broken code from being committed.

---

## Installation

### 1. Install Husky

```bash
npm install --save-dev husky
```

### 2. Initialize Husky

```bash
npx husky install
```

### 3. Add Husky to package.json

Add this to the `scripts` section in `package.json`:

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

This ensures Husky is installed automatically when someone runs `npm install`.

### 4. Create Pre-commit Hook

```bash
# Create the pre-commit hook file
npx husky add .husky/pre-commit "npm run pre-commit"
```

### 5. Add Pre-commit Script to package.json

Add this to the `scripts` section:

```json
{
  "scripts": {
    "pre-commit": "npm run format:check && npm run lint && npm run type-check"
  }
}
```

---

## Alternative: Lightweight Setup (No Husky)

If you prefer not to use Husky, you can manually run checks before committing:

```bash
# Add this alias to your shell config (~/.zshrc or ~/.bashrc)
alias pre-commit="npm run format:check && npm run lint && npm run type-check && npm run test:unit"

# Usage
pre-commit && git commit -m "your message"
```

---

## Recommended Pre-commit Checks

### Minimal (Fast)

```json
{
  "scripts": {
    "pre-commit": "npm run lint && npm run type-check"
  }
}
```

Checks:
- ✅ Linting
- ✅ Type checking

**Time:** ~10 seconds

### Balanced (Recommended)

```json
{
  "scripts": {
    "pre-commit": "npm run format:check && npm run lint && npm run type-check"
  }
}
```

Checks:
- ✅ Code formatting
- ✅ Linting
- ✅ Type checking

**Time:** ~15 seconds

### Comprehensive (Slow but thorough)

```json
{
  "scripts": {
    "pre-commit": "npm run format:check && npm run lint && npm run type-check && npm run test:unit"
  }
}
```

Checks:
- ✅ Code formatting
- ✅ Linting
- ✅ Type checking
- ✅ Unit tests

**Time:** ~30-60 seconds

---

## Advanced Setup with lint-staged

For faster pre-commit hooks that only check changed files:

### 1. Install lint-staged

```bash
npm install --save-dev lint-staged
```

### 2. Add Configuration

Create `.lintstagedrc.json`:

```json
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md,mdx,yml,yaml}": [
    "prettier --write"
  ]
}
```

### 3. Update Pre-commit Hook

```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

This only runs checks on staged files, making commits much faster!

---

## Bypassing Hooks (When Necessary)

In rare cases, you may need to bypass pre-commit hooks:

```bash
# Use with caution!
git commit --no-verify -m "emergency fix"
```

**Note:** Only use this for genuine emergencies. Don't make it a habit!

---

## Troubleshooting

### Hook not running

1. Check if `.husky/pre-commit` exists
2. Ensure it's executable:
   ```bash
   chmod +x .husky/pre-commit
   ```
3. Re-initialize Husky:
   ```bash
   npx husky install
   ```

### Hooks running twice

Make sure you don't have both Husky and native Git hooks configured.

### Slow pre-commit checks

- Use lint-staged to only check changed files
- Run tests in CI instead of pre-commit
- Consider the "Balanced" setup instead of "Comprehensive"

---

## CI/CD Integration

Even with pre-commit hooks, always run checks in CI/CD:

```yaml
# .github/workflows/ci.yml
- name: Run lint
  run: npm run lint

- name: Run type check
  run: npm run type-check

- name: Run tests
  run: npm test
```

Pre-commit hooks are a safety net, but CI is the final authority!

---

## Summary

| Setup | Speed | Protection |
|-------|-------|------------|
| No hooks | ⚡ Fast | ❌ None |
| Minimal | ⚡ Fast | ✅ Basic |
| Balanced | 🐢 Medium | ✅✅ Good |
| Comprehensive | 🐌 Slow | ✅✅✅ Best |
| lint-staged | ⚡ Fast | ✅✅ Good |

**Recommendation:** Start with the **Balanced** setup, then add **lint-staged** if commits feel slow.

---

## Additional Tools

### Commitlint

Enforce conventional commit messages:

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional

npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

### Commit Message Template

Create `.gitmessage`:

```
# <type>(<scope>): <subject>
#
# <body>
#
# <footer>
#
# Types: feat, fix, docs, style, refactor, test, chore
# Example: feat(auth): add Google OAuth integration
```

Set it globally:
```bash
git config --global commit.template .gitmessage
```

---

**Happy Committing! ✨**
