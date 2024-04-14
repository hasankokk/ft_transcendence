import * as THREE from "three";
import { CSS2DRenderer, CSS2DObject } from "three-css2drenderer";

const webgl_height = window.innerHeight / 1.5;
const webgl_aspect_ratio = 4 / 3;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, webgl_aspect_ratio, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
const labelRenderer = new CSS2DRenderer();
const clocks = {animation: null, match: null, ball: null, player0: null, player1: null};
const gameElements = {};
const motions = {
  camera: { key: null, code: null },
  player: { key: null, code: null },
};
const cameraKeySet = "rhjklnm";
const playerKeySet = "ws";
let clientPlayer;
let matchElapsed = 0;

function gameTestInit() {
  renderer.setSize(webgl_height * webgl_aspect_ratio, webgl_height);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

  const webtarget = document.getElementById("webgl");
  webtarget.focus();
  webtarget.innerHTML = "";
  webtarget.appendChild(renderer.domElement);

  webtarget.addEventListener("keydown", gameKeyDownEvents);
  webtarget.addEventListener("keyup", gameKeyUpEvents);

  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.setSize(webgl_height * webgl_aspect_ratio, webgl_height);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0px";
  labelRenderer.domElement.style.pointerEvents = "none";

  webtarget.appendChild(labelRenderer.domElement);

  clocks.animation = new THREE.Clock();
  clientPlayer = "player0";

  setSceneVariables();

  animate();
}

function animate() {
  if (onGamePage ?? true) {
    requestAnimationFrame(animate);
  }

  gameElements.cube.rotation.x += 0.01;
  gameElements.cube.rotation.y += 0.01;

  if (gameActive ?? false) {
    const ballDelta = clocks.ball.getDelta();
    const matchDelta = clocks.match.getDelta();
    matchElapsed += matchDelta;
    gameElements.timerLabel.element.textContent = matchElapsed.toFixed(1);
    moveBall(ballDelta);
  }

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
}

function setSceneVariables() {
  let geometry;
  let material;

  // Scene lights

  gameElements["ambientLight"] = new THREE.AmbientLight(0x404040); // soft white light
  scene.add(gameElements.ambientLight);

  gameElements["directionalLight"] = new THREE.DirectionalLight(0xfce570, 2.5);
  gameElements.directionalLight.position.set(0, -1, 2);
  gameElements.directionalLight.castShadow = true;
  scene.add(gameElements.directionalLight);

  gameElements["pointLight"] = new THREE.SpotLight(0xffffff, 250.0);
  gameElements.pointLight.position.set(0, 0, 20);
  gameElements.pointLight.castShadow = true;
  gameElements.pointLight.shadow.camera.near = 0.1; // default
  gameElements.pointLight.shadow.camera.far = 50000; // default
  scene.add(gameElements.pointLight);

  // Scene base

  geometry = new THREE.PlaneGeometry(50, 30);
  material = new THREE.MeshPhysicalMaterial({ color: 0xb0a0fa });
  gameElements["board"] = new THREE.Mesh(geometry, material);
  gameElements.board.receiveShadow = true;
  scene.add(gameElements.board);

  // Camera positioning

  camera.position.z =
    gameElements.board.geometry.parameters.width /
    2 /
    Math.tan(((camera.fov / 2.0) * Math.PI) / 180.0);
  camera.position.y -= camera.position.z * 0.5;
  camera.position.z -= camera.position.z * 0.1;
  camera.lookAt(0, 0, 0);
  gameElements["camera_defaults"] = {};
  gameElements["camera_defaults"]["position"] = camera.position.clone();

  // Default player setup

  gameElements["player0"] = makePlayer(2, 6, 0xff60a0, -24);
  scene.add(gameElements.player0.mesh);

  gameElements["player1"] = makePlayer(2, 6, 0xff60a0, 24);
  scene.add(gameElements.player1.mesh);
  gameElements.player1.label.element.textContent = "player1";

  // Default ball setup

  gameElements["ball"] = makeBall(2, 0x109440, 10, 5);
  scene.add(gameElements.ball.mesh);

  const radius = gameElements.ball.mesh.geometry.parameters.radius;
  geometry = new THREE.BoxGeometry(1, 1, 1);
  material = new THREE.MeshPhysicalMaterial({ color: 0xf0a0f0 });
  material.thickness = 1.0;
  material.roughness = 0.9;
  material.transmission = 0.70;
  material.clearcoat = 0.1;
  material.clearcoatRoughness = 0;
  material.ior = 1.25;
  gameElements["cube"] = new THREE.Mesh(geometry, material);
  gameElements.cube.position.set(0, 0, radius * 3 + radius * 2);
  scene.add(gameElements.cube);

  // Labels

  const board_height = gameElements.board.geometry.parameters.height;

  gameElements["timerLabel"] = {};

  gameElements.timerLabel["element"] = document.createElement("div");
  gameElements.timerLabel.element.className = "label";
  gameElements.timerLabel.element.textContent = "00:00";
  gameElements.timerLabel.element.style.backgroundColor = "green";
  gameElements.timerLabel.element.style.color = "white";
  gameElements.timerLabel.element.style.padding = "5px"

  gameElements.timerLabel["object"] = new CSS2DObject(gameElements.timerLabel.element);
  gameElements.timerLabel.object.position.set(0, board_height / 2, radius * 5);
  gameElements.board.add(gameElements.timerLabel.object);
}

function makeBall(radius, color, vel_x = 1, vel_y = 1) {
  const geometry = new THREE.SphereGeometry(radius, 20, 16);
  let material = new THREE.MeshPhysicalMaterial({ color: color });
  material.roughness = 0.3;
  material.clearcoat = 0.2;
  material.clearcoatRoughness = 0;
  const ball = new THREE.Mesh(geometry, material);
  ball.position.set(0, 0, ball.geometry.parameters.radius);
  ball.castShadow = true; //default is false
  ball.receiveShadow = true;
  return {mesh: ball, velocity: new THREE.Vector3(vel_x, vel_y, 0) };
}

function makePlayer(width, height, color, posx, velocity = 0.2) {
  const geometry = new THREE.BoxGeometry(width, height, 2);
  const material = new THREE.MeshPhysicalMaterial({ color: color });
  const player = new THREE.Mesh(geometry, material);
  player.position.set(posx, 0, geometry.parameters.depth * 0.15 + geometry.parameters.depth / 2);
  player.castShadow = true;
  player.receiveShadow = true;

  const playerDiv = document.createElement("div");
  playerDiv.textContent = "player0";
  playerDiv.style.color = "#ff0000";
  const label = new CSS2DObject(playerDiv);
  label.position.z = player.position.z * 5;
  player.add(label);

  return {mesh: player, velocity: velocity, label: {object: label, element: playerDiv}};
}

function gameKeyDownEvents(event) {
  if (cameraKeySet.includes(event.key)) {
    motions.camera.key = event.key;
    motions.camera.code = event.code;
    moveGameCamera();
  } else if (playerKeySet.includes(event.key)) {
    motions.player.key = event.key;
    motions.player.code = event.code;
    movePlayer();
  } else if (event.key === "t") {
    toggleMatch();
  } else if (event.key === "x") {
    if (matchStarted) {
      matchFinish();
    } else {
      matchStart();
    }
  }
}

function gameKeyUpEvents(event) {
  if (cameraKeySet.includes(event.key)) {
    motions.camera.key = null;
    motions.camera.code = null;
  } else if (playerKeySet.includes(event.key)) {
    motions.player.key = null;
    motions.player.code = null;
  }
}

function moveGameCamera() {
  const movementFactor = 0.1;

  // TODO: camera movement could be improved to keep a certain distance

  if (motions.camera.key === "r") {
    camera.position.set(
      gameElements.camera_defaults.position.x,
      gameElements.camera_defaults.position.y,
      gameElements.camera_defaults.position.z
    );
  } else if (motions.camera.key === "h") {
    camera.position.x -= movementFactor;
  } else if (motions.camera.key === "l") {
    camera.position.x += movementFactor;
  } else if (motions.camera.key === "j") {
    camera.position.y -= movementFactor;
  } else if (motions.camera.key === "k") {
    camera.position.y += movementFactor;
  } else if (motions.camera.key === "n") {
    camera.position.z -= movementFactor;
  } else if (motions.camera.key === "m") {
    camera.position.z += movementFactor;
  }

  camera.lookAt(0, 0, 0);

  if (cameraKeySet.includes(motions.camera.key)) {
    setTimeout(moveGameCamera, 10);
  }
}

function movePlayer() {
  const movementFactor = 1;

  if (!matchStarted) {
    if (motions.player.key === "w") {
      gameElements[clientPlayer].mesh.position.y += movementFactor;
    } else if (motions.player.key === "s") {
      gameElements[clientPlayer].mesh.position.y -= movementFactor;
    }
  } else {
    if (pongSocket.readyState ?? null === WebSocket.OPEN) {
      const toUp = true ? motions.player.key === "w" : false;

      pongSocket.send(JSON.stringify({type: "pong.move", toUp: toUp}));
    }
  }
}

function moveBall(timeDelta) {
  const newPos = gameElements.ball.mesh.position.clone();
  newPos.add(
    gameElements.ball.velocity.clone().multiplyScalar(timeDelta)
  );

  gameElements.ball.mesh.position.copy(newPos);

  const height = gameElements.board.geometry.parameters.height;
  const width = gameElements.board.geometry.parameters.width;

  if (Math.abs(newPos.y) > height / 2) {
    gameElements.ball.velocity.y *= -1;
  }
  if (Math.abs(newPos.x) > width / 2) {
    gameElements.ball.velocity.x *= -1;
  }

  const radius = gameElements.ball.mesh.geometry.parameters.radius;

  gameElements.cube.position.copy(gameElements.ball.mesh.position);
  gameElements.cube.position.setZ(radius * 3 + radius * 2);
}

function resetPositions() {
  const ball_radius = gameElements.ball.mesh.geometry.parameters.radius;
  const board_widthd2 = gameElements.board.geometry.parameters.width / 2;
  const player_widthd2 = gameElements.player0.mesh.geometry.parameters.width / 2;
  const player1_posx = board_widthd2 - player_widthd2;
  const player_depthd2 = gameElements.player0.mesh.geometry.parameters.depth / 2;
  const player_posz = player_depthd2 * 0.3 + player_depthd2;
  gameElements.ball.mesh.position.set(0,0, ball_radius);
  gameElements.player0.mesh.position.set(-player1_posx, 0, player_posz);
  gameElements.player1.mesh.position.set(player1_posx, 0, player_posz);
}

function matchStart() {
  clocks.match = new THREE.Clock();
  clocks.ball = new THREE.Clock();
  clocks.player0 = new THREE.Clock();
  clocks.player1 = new THREE.Clock();

  resetPositions();

  matchElapsed = 0.0;
  matchStarted = true;
  gameActive = true;
}

function toggleMatch() {
  if (!gameActive) {
    clocks.ball.getDelta(); // Reset clock.oldtime
    clocks.player0.getDelta();
    clocks.player1.getDelta();
    clocks.match.getDelta();
  }

  gameActive = !gameActive;
}

function matchFinish() {
  clocks.match = null;
  clocks.ball = null;
  clocks.player0 = null;
  clocks.player1 = null;

  matchElapsed = null;
  matchStarted = false;
  gameActive = false;
}

function setPlayer(player, pos) {
  gameElements[player].mesh.position.set(pos.x,pos.y,pos.z);

  // TODO: add smooth animation
}

function setBall(pos, vel) {
  gameElements.ball.mesh.position.set(pos.x,pos.y,pos.z);
  gameElements.ball.velocity.set(vel.x,vel.y,vel.z);
}

let matchStarted;
let gameActive;
window.gameTestInit = gameTestInit;
window.gameSetPlayer = setPlayer;
window.gameSetBall = setBall;
