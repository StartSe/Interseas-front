FRONTEND_HOST_PORT = 8080
FRONTEND_DOCKER_NAME = interseas-front


web-run:
	@echo "> Starting Frontend..."
	@echo "> Frontend will be running on http://localhost:${FRONTEND_HOST_PORT}"
	@WEB_PORT=${FRONTEND_HOST_PORT} \
	COMPOSE_PROJECT_NAME=${FRONTEND_DOCKER_NAME} \
	docker compose up --watch --build


web-stop:
	@echo "> Stopping Frontend..."
	@docker compose down
	@echo "> Frontend stopped"


help:
	@echo "Docker-based Frontend (for Flowise Embed) setup"
	@echo ""
	@echo "Usage: make <command>"
	@echo ""
	@echo "Available commands:"
	@echo " - web-run ................ Run Frontend container and build Embed"
	@echo " - web-stop ............... Stop Frontend container"
	@echo " - help ................... Show this help message"