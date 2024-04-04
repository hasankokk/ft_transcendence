import * as THREE from "three";

//default
let scene;
let camera;
let render;
let skor = {player_1_skor:0, player_2_skor:0};
let player_info = {
    player_speed:0.05
}

//light
let light;

//floor
let floor = {
    floor_model: undefined,
    floor_lenght:9,
    floor_width:0.1,
    floor_height:7
}

//ball
let ball = {
    ball_model:undefined,
    ball_radius:0.2,
    ball_is_move:0,
    ball_speed:0.02,
    ball_x_direction:1,
    ball_z_direction:-1,
    ball_bounce:0
}

//player_1
let player_1 = {
    player_model:undefined,
    player_length:2,
    player_width:0.5,
    player_color:0xabc0efa,
    player_start_x:0,
    player_start_y:0.6,
    player_start_z:4,
    player_max_x:0,
    player_min_x:0,
    player_move_key:0,
    player_max_length:0,
    player_min_length:0
}

//player_2
let player_2 = {
    player_model:undefined,
    player_length:2,
    player_width:0.5,
    player_color:0xabc0efa,
    player_start_x:0,
    player_start_y:0.6,
    player_start_z:-4,
    player_max_x:0,
    player_min_x:0,
    player_move_key:0,
    player_max_length:0,
    player_min_length:0
}


function pong_start()
{
    create_scene();
    player_1.player_model = create_player(player_1.player_length, player_1.player_width, player_1.player_width, player_1.player_color , player_1.player_start_x, player_1.player_start_y, player_1.player_start_z);
    player_2.player_model = create_player(player_2.player_length, player_2.player_width, player_2.player_width, player_2.player_color , player_2.player_start_x, player_2.player_start_y, player_2.player_start_z);
    floor.floor_model = create_floor();
    ball.ball_model = create_ball(0, 0.2, 0, 0xfffab);
    //ball_first_move();
    create_light();

    const gameInstance = document.getElementById("webgl");

    gameInstance.addEventListener("keydown", key_down);
    gameInstance.addEventListener("keyup", key_up);

    pong_update();
}

function pong_update()
{
    requestAnimationFrame(pong_update);
    player_move();
    player_length();
    if (ball.ball_is_move == 0)
    {
        ball_move();
    }
    //floor.rotation.x += 0.01;
    //console.log(floor.rotation.x);
    console.log(player_1.player_model.position);
    render.render(scene, camera);
}

//---------default---------
function create_scene()
{
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );

    render = new THREE.WebGLRenderer();
    render.setSize( window.innerWidth, window.innerHeight );
    document.getElementById("webgl").appendChild(render.domElement);

    render.shadowMap.enabled = true;
    render.shadowMap.type = THREE.PCFSoftShadowMap;
    camera.position.x = 0;
    camera.position.y = 10;
    camera.position.z = 0;

    camera.rotation.x = -Math.PI / 2; //radyan cinsinden döndürdüm
    camera.rotation.y = 0;
    camera.rotation.z = Math.PI / 2; //radyan cinsinden döndürdüm
    //camera.lookAt(new THREE.Vector3(0, 0, 0));
}

//---------light---------
function create_light()
{
    let di = new THREE.DirectionalLight(0xffffff);
    di.position.set(15, 75, -15);
    di.castShadow = true;

    di.shadow.mapSize.width = 5000;
    di.shadow.mapSize.height = 5000;
    di.intensity = 1;
    di.shadow.camera.left = -20;
    di.shadow.camera.right = 20;
    di.shadow.camera.top = 20;
    di.shadow.camera.bottom = -20;
    di.shadow.camera.near = 0.5;
    di.shadow.camera.far = 100;
    scene.add(di);
}

//---------floor------------
function create_floor()
{
    let geometry = new THREE.BoxGeometry(floor.floor_height, floor.floor_width, floor.floor_lenght);
    let material = new THREE.MeshStandardMaterial({color:0xffffff});
    let mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    scene.add(mesh);
    mesh.position.x = 0;
    mesh.position.y = 0;
    mesh.position.z = 0;

    mesh.rotation.x = 0;
    mesh.rotation.y = 0;
    mesh.rotation.z = 0;
    return mesh;
}

//-----------player----------
function create_player(x, y, z, color , start_x, start_y, start_z)
{
    let geometry = new THREE.BoxGeometry(x, y, z);
    let material = new THREE.MeshStandardMaterial({color:color});
    let mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    scene.add(mesh);
    mesh.position.x = start_x;
    mesh.position.y = start_y;
    mesh.position.z = start_z;

    mesh.rotation.x = 0;
    mesh.rotation.y = 0;
    mesh.rotation.z = 0;
    return mesh;
}

function player_length()
{
    player_1.player_min_length = player_1.player_model.position.x - player_1.player_length / 2;
    player_1.player_max_length = player_1.player_model.position.x + player_1.player_length / 2;
    player_2.player_min_length = player_2.player_model.position.x - player_2.player_length / 2;
    player_2.player_max_length = player_2.player_model.position.x + player_2.player_length / 2;
}

function key_down(event)
{
    if (event.key == "s")
    {
        player_1.player_move_key = "s";
    }
    if (event.key == "w")
    {
        player_1.player_move_key = "w";
    }
    if (event.key == "ArrowDown" )
    {
        player_2.player_move_key = "ArrowUp";
    }
    if (event.key == "ArrowUp")
    {
        player_2.player_move_key = "ArrowDown";
    }
}

function key_up(event)
{
    if (event.key == "w")
    {
        player_1.player_move_key = "";
    }
    if (event.key == "s")
    {
        player_1.player_move_key = "";
    }
    if (event.key == "ArrowUp")
    {
        player_2.player_move_key = "";
    }
    if (event.key == "ArrowDown")
    {
        player_2.player_move_key = "";
    }
}

function player_move()
{
    if (player_1.player_move_key == "s" && player_1.player_model.position.x + player_1.player_length / 2 < floor.floor_height / 2)
    {
        player_1.player_model.position.x += player_info.player_speed;
    }
    if (player_1.player_move_key == "w"  && player_1.player_model.position.x - player_1.player_length / 2 > (floor.floor_height / 2) * -1)
    {
        player_1.player_model.position.x -= player_info.player_speed;
    }
    if (player_2.player_move_key == "ArrowUp" && player_2.player_model.position.x + player_2.player_length / 2 < floor.floor_height / 2)
    {
        player_2.player_model.position.x += player_info.player_speed;
    }
    if (player_2.player_move_key == "ArrowDown" && player_2.player_model.position.x - player_2.player_length / 2 > (floor.floor_height / 2) * -1)
    {
        player_2.player_model.position.x -= player_info.player_speed;
    }
}

//----------ball------------
function create_ball(x, y, z, color)
{
    //let ball_geometry = new THREE.CircleGeometry(ball.ball_radius, 32);
    let ball_geometry = new THREE.SphereGeometry(ball.ball_radius, 32, 32);
    let ball_material = new THREE.MeshStandardMaterial({ color: color, side: THREE.DoubleSide });
    let ball_mesh = new THREE.Mesh(ball_geometry, ball_material);
    scene.add(ball_mesh);
    ball_mesh.castShadow = true;
    ball_mesh.position.x = x;
    ball_mesh.position.y = y;
    ball_mesh.position.z = z;
    //ball_mesh.rotation.x = 90;
    return ball_mesh;
}

function ball_first_move()
{
    let min = 1;
    let max = 2;
    ball.ball_is_move = (Math.random() * (max - min)) + min;
    ball.ball_is_move = Math.round(ball.ball_is_move);
    if (ball.ball_is_move != 1)
        ball.ball_x_direction *= -1;
}

function ball_move()
{
    if (ball.ball_model.position.x - ball.ball_radius <= (floor.floor_height / 2) * -1)
    {
        ball.ball_x_direction *= -1;
    }
    if (ball.ball_model.position.x + ball.ball_radius >= (floor.floor_height / 2))
    {
        ball.ball_x_direction *= -1;
    }


    if ((ball.ball_model.position.z + ball.ball_radius <= player_2.player_model.position.z + player_2.player_width) && (ball.ball_model.position.x - ball.ball_radius <= player_2.player_max_length && ball.ball_model.position.x + ball.ball_radius >= player_2.player_min_length) && ball.ball_bounce == 0)
    {
        ball.ball_bounce = 1;
        ball.ball_z_direction *= -1;
    }
    else if ((ball.ball_model.position.z + ball.ball_radius <= player_2.player_model.position.z + player_2.player_width) && (ball.ball_model.position.x >= player_2.player_max_length || ball.ball_model.position.x <= player_2.player_min_length))
    {
        ball.ball_model.position.z = 0;
        ball.ball_model.position.x = 0;
    }

    if ((ball.ball_model.position.z - ball.ball_radius >= player_1.player_model.position.z - player_2.player_width) && (ball.ball_model.position.x - ball.ball_radius <= player_1.player_max_length && ball.ball_model.position.x + ball.ball_radius >= player_1.player_min_length) && ball.ball_bounce == 1)
    {
        ball.ball_bounce = 0;
        ball.ball_z_direction *= -1;
    }
    else if ((ball.ball_model.position.z - ball.ball_radius >= player_1.player_model.position.z - player_2.player_width) && (ball.ball_model.position.x <= player_1.player_max_length || ball.ball_model.position.x >= player_1.player_min_length))
    {
        ball.ball_model.position.z = 0;
        ball.ball_model.position.x = 0;
    }
    ball.ball_model.position.x += ball.ball_speed * ball.ball_x_direction;
    ball.ball_model.position.z += ball.ball_speed * ball.ball_z_direction;
}

window.pong_start = pong_start;