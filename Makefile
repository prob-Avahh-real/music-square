.PHONY: help install test backend ios clean

help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install backend dependencies
	cd backend && npm install

test: ## Run backend tests
	cd backend && npm test

backend: ## Start backend dev server
	cd backend && npm run dev

ios: ## Open iOS project
	open ios/*.xcodeproj 2>/dev/null || echo "No Xcode project found"

clean: ## Clean
	rm -rf backend/node_modules/
