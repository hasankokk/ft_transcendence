WEB_PATH=src/user-web/ft_transcendence
PARENT_DIR=$(notdir $(CURDIR))

all: start

start:
	mkdir -p $(WEB_PATH)/staticfiles
	docker-compose up

stop:
	docker-compose down

refresh:
	docker image rm -f $(PARENT_DIR)-user-web # Add more for new web microservices
	docker system prune
	docker volume rm -f $(PARENT_DIR)_user-postgres # Add more for new web microservices
	find $(WEB_PATH) -path "*/migrations/*.py" -not -name "__init__.py" -delete
	find $(WEB_PATH) -path "*/migrations/*.pyc" -delete
	find $(WEB_PATH)/staticfiles -delete

up: start
down: stop
re: refresh

migrations:
	find $(WEB_PATH) -path "*/migrations/*.py" -not -name "__init__.py"
	find $(WEB_PATH) -path "*/migrations/*.pyc"

.PHONY: all start stop refresh up down re
