# Keycloak + OpenFGA workshop. Run `make` to list the targets.

NETWORK    := keycloak-openfga-workshop_default
TEST_IMAGE := twogenidentity/keycloak-openfga-workshop-tests

.DEFAULT_GOAL := help
.PHONY: help up down restart logs test clean

help: ## List the targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F ':.*## ' '{printf "  make %-8s %s\n", $$1, $$2}'

up: ## Build and start the workshop
	docker compose up -d --build

down: ## Stop the workshop and delete its data
	docker compose down -v

restart: down up ## Start again from scratch

logs: ## Follow the logs (make logs s=keycloak for one service)
	docker compose logs -f $(s)

test: ## Run the end-to-end tests against the running workshop
	docker build -q -t $(TEST_IMAGE) tests
	docker run --rm --network $(NETWORK) $(TEST_IMAGE)

clean: down ## Stop the workshop and remove the built images
	docker image rm -f $(TEST_IMAGE) 2>/dev/null || true
	docker compose down --rmi local
