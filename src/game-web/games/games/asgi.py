"""
ASGI config for games project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

from pong.routing import websocket_urlpatterns

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "games.settings")

http_application = get_asgi_application()

application = ProtocolTypeRouter({
    "http": http_application,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
    ),
})
