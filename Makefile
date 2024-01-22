WEB_PATH=src/web/ft_transcendence
PARENT_DIR=$(notdir $(CURDIR))

all: start

start:
	docker-compose up

stop:
	docker-compose down

refresh:
	docker image rm -f $(PARENT_DIR)-web
	docker system prune
	docker volume rm -f $(PARENT_DIR)_postgres
	find $(WEB_PATH) -path "*/migrations/*.py" -not -name "__init__.py" -delete
	find $(WEB_PATH) -path "*/migrations/*.pyc" -delete

up: start
down: stop
re: refresh

migrations:
	find $(WEB_PATH) -path "*/migrations/*.py" -not -name "__init__.py"
	find $(WEB_PATH) -path "*/migrations/*.pyc"

.PHONY: all start stop refresh up down re
