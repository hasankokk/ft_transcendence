# Microservice Descriptions

## User Management and Authentication Microservices
<strong>Function:</strong> Manages user registrations, login processes and OAuth authentication. <br>
<strong>Technologies:</strong> Django, 2FA, OAuth 2.0. <br>
<strong>Features:</strong> User registration, login, profile management, friend lists.

## Security and Monitoring Microservices
<strong>Function:</strong> It monitors and prevents security breaches and ensures the security of user data. <br>
<strong>Techonologies:</strong> WAF/ModSecurity, HashiCorp Vault. <br>
<strong>Features:</strong> SQL injection and XSS protection, HTTPS and wss connections, strong password hashing.

## Game Server Microservices
<strong>Function:</strong> Manages server-side logic and other game mechanics of the Pong game. <br>
<strong>Technologies:</strong> Django, WebSocket (to support the real-time nature of the game). <br>
<strong>Features:</strong> Player matchmaking, score keeping, game state management.

## Frontend and Graphics Microservices
<strong>Function:</strong> Manages the user interface and game graphics. <br>
<strong>Technologies:</strong> JavaScript, HTML5, CSS, Bootstrap, ThreeJS/WebGL. <br>
<strong>Features:</strong> 3D graphics, user interface elements, game appearance.

## Infrastructure and DevOps Microservices
<strong>Function:</strong> Supports log management, system monitoring and microservice infrastructure. <br>
<strong>Techonologies:</strong> Docker, ELK Stack, Prometheus, Grafana. <br>
<strong>Features:</strong> Log management, system monitoring, container orchestration.