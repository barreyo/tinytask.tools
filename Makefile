.PHONY: help dev build preview lint lint-fix format format-check test test-watch test-coverage test-e2e test-e2e-ui check

.DEFAULT_GOAL := help

help: ## Show this help message
	@grep -E '^[a-zA-Z0-9_-]+:.*##' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*##"}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}' \
		| sort

dev: ## Start the development server
	npm run dev

build: ## Build for production
	npm run build

preview: ## Preview the production build locally
	npm run preview

lint: ## Run ESLint
	npm run lint

lint-fix: ## Run ESLint and auto-fix violations
	npm run lint:fix

format: ## Format all files with Prettier
	npm run format

format-check: ## Check formatting without writing changes
	npm run format:check

test: ## Run unit tests (Vitest)
	npm run test

test-watch: ## Run unit tests in watch mode
	npm run test:watch

test-coverage: ## Run unit tests with V8 coverage report
	npm run test:coverage

test-e2e: ## Run end-to-end tests (Playwright, headless)
	npm run test:e2e

test-e2e-ui: ## Run end-to-end tests with the Playwright UI
	npm run test:e2e:ui

check: lint format-check test ## Run all checks (lint + format + unit tests)
