WEB_PATHS=src/chat-web/chat src/user-web/ft_transcendence src/game-web/games
STATIC_FILES=$(addsuffix /staticfiles, $(WEB_PATHS))
PARENT_DIR=$(notdir $(CURDIR))

all: start

start: $(STATIC_FILES)
	docker-compose up

build: $(STATIC_FILES)
	docker-compose up --build

$(STATIC_FILES):
	mkdir -p $@

stop:
	docker-compose down

refresh:
	docker image rm -f $(PARENT_DIR)-user-web # Add more for new web microservices
	docker image rm -f $(PARENT_DIR)-chat-web
	docker image rm -f $(PARENT_DIR)-game-web
	docker system prune
	docker volume rm -f $(PARENT_DIR)_user-postgres # Add more for new web microservices
	rm -f src/chat-web/chat/db.sqlite3
	rm -f src/game-web/games/db.sqlite3
	$(foreach dir, $(WEB_PATHS), find $(dir) -path "*/migrations/*.py" -not -name "__init__.py" -delete ;)
	$(foreach dir, $(WEB_PATHS), find $(dir) -path "*/migrations/*.pyc" -delete ;)
	$(foreach dir, $(WEB_PATHS), find $(dir)/staticfiles -delete ;)

up: start
down: stop
re: refresh

migrations:
	$(foreach dir, $(WEB_PATHS), find $(dir) -path "*/migrations/*.py" -not -name "__init__.py" ;)
	$(foreach dir, $(WEB_PATHS), find $(dir) -path "*/migrations/*.pyc" ;)
	$(foreach dir, $(WEB_PATHS), find $(dir)/staticfiles -maxdepth 0 ;)

.PHONY: all start build stop refresh up down re
