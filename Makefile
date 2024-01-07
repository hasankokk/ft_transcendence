WEB_PATH=src/web/ft_transcendence

all: start

start:
	docker-compose up

stop:
	docker-compose down

refresh:
	docker image rm -f ft_transcendence-web
	docker system prune
	docker volume rm -f ft_transcendence_postgres
	find $(WEB_PATH) -path "*/migrations/*.py" -not -name "__init__.py" -delete
	find $(WEB_PATH) -path "*/migrations/*.pyc" -delete

up: start
down: stop
re: refresh

migrations:
	find $(WEB_PATH) -path "*/migrations/*.py" -not -name "__init__.py"
	find $(WEB_PATH) -path "*/migrations/*.pyc"

.PHONY: all start stop refresh up down re
