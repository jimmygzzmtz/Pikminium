import * as THREE from '../js/three.module.js';
import { VRButton } from '../js/VRButton.js';

//https://www.youtube.com/watch?v=H1etAFiAPYQ
var audio = new Audio('assets/music/pikmin-music.mp3');
audio.loop = true;
audio.play();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.xr.enabled = true;
document.body.appendChild(VRButton.createButton(renderer));

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 15;

var mouse = new THREE.Vector2();

window.addEventListener( 'click', getPos );

var vec = new THREE.Vector3(); // create once and reuse
var mousePos = new THREE.Vector3(); // create once and reuse

var movementSpeed = 0.03;
var positionTolerance = 0.3;

var pikminList = [];
var movingList = [];
var sceneryList = [];

var colors = [0xff0000, 0x0000ff, 0xffff00, 0x4B0082, 0xffffff];

camera.position.set(0, -8.5, 10);
camera.lookAt(0, 0, 0);

//https://ekostories.com/pikmin-3-wallpaper-jpg/
var skybox = new THREE.TextureLoader().load( "./assets/textures/wallpaper.png" );
skybox.wrapS = THREE.RepeatWrapping;
skybox.wrapT = THREE.RepeatWrapping;
scene.background = skybox;
//scene.background = texture;

spawnPikmin(100);
setUpScenery();

//controls = new THREE.OrbitControls( camera, renderer.domElement );

function loadTexture(textureName){
    var newTexture = new THREE.TextureLoader().load( "./assets/textures/" + textureName + ".png" );
    newTexture.wrapS = THREE.RepeatWrapping;
    newTexture.wrapT = THREE.RepeatWrapping;
    return newTexture;
}

function addBush(x, y, z, scale){
    var geometry = new THREE.SphereGeometry( 5*scale, 32*scale, 32*scale );
    //https://www.deviantart.com/kuschelirmel-stock/art/texture-leaves-33294198
    var material = new THREE.MeshBasicMaterial( {map: loadTexture("tree_leaves")} );
    var bush = new THREE.Mesh( geometry, material );
    bush.position.x = x;
    bush.position.y = y;
    bush.position.z = z;
    scene.add( bush );
    sceneryList.push(bush);
}

function addTree(x, y){
    var geometry = new THREE.CylinderGeometry( 1, 1, 14, 8);
    //https://www.klipartz.com/en/sticker-png-tonla
    var material = new THREE.MeshBasicMaterial( { map: loadTexture("tree_bark") } );
    var tree = new THREE.Mesh( geometry, material );
    tree.position.x = x;
    tree.position.y = y;
    tree.rotation.x = 1.5;
    scene.add( tree );
    sceneryList.push(tree);

    addBush(tree.position.x, tree.position.y, 10, 1);
}

function setUpScenery(){
    //ground
    //https://www.textures-resource.com/gamecube/pikmin2/texture/1127/
    var ground = new THREE.TextureLoader().load( "./assets/textures/ground.png" );
    ground.wrapS = THREE.RepeatWrapping;
    ground.wrapT = THREE.RepeatWrapping;
    ground.repeat.set( 5, 5 );

    var geometry = new THREE.PlaneGeometry( 40, 20, 32 );
    var material = new THREE.MeshBasicMaterial( {map: ground} );
    var plane = new THREE.Mesh( geometry, material );
    scene.add( plane );
    plane.position.z -= 0.18;

    addTree(0, 8);
    addTree(-12, 8);
    addTree(12, 8);
    addTree(17, 1);
    addTree(-17, 1);
    addBush(17, 6, 0, 0.5);
    addBush(6, 8, 0, 0.5);
    addBush(-6, 8, 0, 0.5);
    addBush(-17, 6, 0, 0.5);
    addBush(-17, -8, 0, 0.5);
    addBush(-17, -3, 0, 0.5);
    addBush(17, -8, 0, 0.5);
    addBush(17, -3, 0, 0.5);
}

//creates pikmin, adds to scene and pikmin list
function addPikmin(color, x, y){
    //var geometry = new THREE.ConeGeometry( 0.5, 0.5, 3 );
    var geometry = new THREE.CylinderGeometry( 0.1, 0.2, 0.5, 0.3);
    var material = new THREE.MeshBasicMaterial( { color: color } );
    var pikmin = new THREE.Mesh( geometry, material );
    pikmin.position.x = x;
    pikmin.position.y = y;
    pikmin.rotation.x = 1.5;
    scene.add( pikmin );
    pikminList.push(pikmin);
    movingList.push(false);
}

//spawns "num" amount of pikmin
function spawnPikmin(num){
    for(var i = 0; i < num; i++){
        var color = colors[Math.floor((Math.random() * colors.length))];
        addPikmin(color, 0, 0);
    }
    for(var j = 0; j < pikminList.length; j++){
        var pikmin = pikminList[j];
        fixCollision(pikmin);
    }
}

//gets mouse poition in normalized device coordinates
//https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
function getPos( event ) {
	// calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    //camera.rotation.x += 0.1;

    //console.log("test");

    vec.set(( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );

    vec.unproject( camera );
    vec.sub( camera.position ).normalize();
    var distance = - camera.position.z / vec.z;
    mousePos.copy( camera.position ).add( vec.multiplyScalar( distance ) );

    //console.log(mousePos)
    if(mousePos.x < -17){
        mousePos.x = -17;
    }
    if(mousePos.x > 17){
        mousePos.x = 17;
    }
    if(mousePos.y > 7){
        mousePos.y = 7;
    }

    for(var i = 0; i < pikminList.length; i++){
        movingList[i] = true;
        //console.log("started moving");
    }

}

//checks if pikmin is colliding with another pikmin
function isColliding(pikmin){
    for(var j = 0; j < pikminList.length; j++){
        var pikmin2 = pikminList[j];
        //console.log(pikmin2);
        if(pikmin != pikmin2 && Math.abs(pikmin.position.x - pikmin2.position.x) < 0.3 && Math.abs(pikmin.position.y - pikmin2.position.y) < 0.3){
            return true;
        }
    }
    for(var i = 0; i < sceneryList.length; i++){
        var object = sceneryList[i];
        if(Math.abs(pikmin.position.x - object.position.x) < 1 && Math.abs(pikmin.position.y - object.position.y) < 1){
            return true;
        }
    }
    return false;
}

//fixes collision by moving pikmin to a free place
function fixCollision(pikmin){
   while(isColliding(pikmin) == true){
        var choose = Math.floor((Math.random() * 4) + 1);

        if(choose == 1){
            pikmin.position.x += 0.5;
        }
        if(choose == 2){
            pikmin.position.x -= 0.5;
        }
        if(choose == 3){
            pikmin.position.y += 0.5;
        }
        if(choose == 4){
            pikmin.position.y -= 0.5;
        }

   }
}

//moves every pikmin to the mouse position, also fixes collision
function moveToPos(){
    for(var i = 0; i < pikminList.length; i++){
        var pikmin = pikminList[i];

        if(movingList[i] == true){
            var moveX = false;
            var moveY = false;
            if(Math.abs(mousePos.x - pikmin.position.x) > positionTolerance){
                if(mousePos.x > pikmin.position.x){
                    pikmin.position.x += movementSpeed;
                }
                else{
                    pikmin.position.x -= movementSpeed;
                }
            }
            else{
                moveX = true;
            }
    
            if(Math.abs(mousePos.y - pikmin.position.y) > positionTolerance){
                if(mousePos.y > pikmin.position.y){
                    pikmin.position.y += movementSpeed;
                }
                else{
                    pikmin.position.y -= movementSpeed;
                } 
            } 
            else{
                moveY = true;
            }

            if(moveX == true && moveY == true){
                movingList[i] = false;
                //console.log("stopped moving");
                fixCollision(pikmin);
            }
        }

    }
}

renderer.setAnimationLoop( function () {

    moveToPos();
    renderer.render( scene, camera );
    camera.position.x = (pikminList[0].position.x);

} );

/*
var animate = function () {
    requestAnimationFrame( animate );
    moveToPos();
    renderer.render( scene, camera );
    camera.position.x = (pikminList[0].position.x);
    //controls.update();
};

animate();
*/

/*
renderer.setAnimationLoop( function () {

    requestAnimationFrame( animate );
    moveToPos();
	renderer.render( scene, camera );

} );
*/