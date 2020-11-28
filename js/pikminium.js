import * as THREE from '../js/three.module.js';

//https://www.youtube.com/watch?v=H1etAFiAPYQ
var music = new Audio('assets/music/pikmin-music.mp3');
music.loop = true;
music.play();

//https://www.youtube.com/watch?v=EpHpmzpvaRo
var intro = new Audio('assets/music/pikmin-intro.mp3');
intro.volume = 0.3;
intro.play();

//https://www.myinstants.com/instant/pikmin-louie-whistle-14889/
var whistle = new Audio('assets/music/pikmin-whistle.mp3');
whistle.volume = 0.3;

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.xr.enabled = true;
renderer.shadowMap.enabled = true;

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 15;

var mouse = new THREE.Vector2();

window.addEventListener( 'click', getPos );

var vec = new THREE.Vector3();
var mousePos = new THREE.Vector3();

var movementSpeed = 0.03;
var positionTolerance = 0.3;

var pikminList = [];
var movingList = [];
var sceneryList = [];

var colors = [0xff0000, 0x0000ff, 0xffff00, 0x4B0082, 0x696969, 0xff69b4, 0xffffff];

camera.position.set(0, -8.5, 10);
camera.lookAt(0, 0, 0);

//https://www.mobygames.com/images/promo/original/1478917051-108691969.jpg
var skybox = new THREE.TextureLoader().load( "./assets/textures/wallpaper.jpg" );
skybox.wrapS = THREE.RepeatWrapping;
skybox.wrapT = THREE.RepeatWrapping;
scene.background = skybox;

spawnPikmin(100);
setUpScenery();

const geometrywhistle = new THREE.RingGeometry( 2.5, 3, 30 );
const materialwhistle = new THREE.MeshBasicMaterial( { color: 0xffa500, side: THREE.DoubleSide } );
const ringWhistleMesh = new THREE.Mesh( geometrywhistle, materialwhistle );

// used for lighting and to generate shadows
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(0, -20, 10);
light.target.position.set(0, 0, 0);
light.intensity = 1.4;
light.castShadow = true;
light.shadow.camera.left = -20;
light.shadow.camera.right = 20;
light.shadow.camera.top = 20;
scene.add(light);
scene.add(light.target);

// adds bulborb mesh and texture to scene in sent position
function addBulborb(x, y){
    var geometry = new THREE.SphereGeometry( 5*0.5, 32*0.5, 32*0.2 );
    //texture from https://www.pinterest.com/pin/473159504573928076/
    var material = new THREE.MeshPhongMaterial( {map: loadTexture("bulborb_polka_dot")} );
    var body = new THREE.Mesh( geometry, material );
    body.castShadow = true;
    body.position.x = x;
    body.position.y = y;
    body.position.z = 3;
    body.rotation.y = -1.5;
    scene.add( body );
    sceneryList.push(body);

    geometry = new THREE.CylinderGeometry( 0.4, 0.4, 11.5, 5);
    material = new THREE.MeshPhongMaterial( {color: 0xb97a57} );
    var leg1 = new THREE.Mesh( geometry, material );
    leg1.castShadow = true;
    leg1.position.x = x+1;
    leg1.position.y = y-1;
    leg1.rotation.x = 1.5;
    scene.add( leg1 );
    sceneryList.push(leg1);
    var leg2 = new THREE.Mesh( geometry, material );
    leg2.castShadow = true;
    leg2.position.x = x-1;
    leg2.position.y = y-1;
    leg2.rotation.x = 1.5;
    scene.add( leg2 );
    sceneryList.push(leg2);

    geometry = new THREE.SphereGeometry( 5*0.1, 32*0.2, 32*0.2 );
    material = new THREE.MeshPhongMaterial( {map: loadTexture("eye")} );
    var eye1 = new THREE.Mesh( geometry, material );
    eye1.position.x = x+1;
    eye1.position.y = y-0.7;
    eye1.rotation.z = -1.5;
    eye1.position.z = 6;
    scene.add( eye1 );
    sceneryList.push(eye1);
    var eye2 = new THREE.Mesh( geometry, material );
    eye2.position.x = x-1;
    eye2.position.y = y-0.7;
    eye2.rotation.z = -1.5;
    eye2.position.z = 6;
    scene.add( eye2 );
    sceneryList.push(eye2);

}

// adds flower mesh and texture to scene in sent position
function addFlower(x, y){
    var geometry = new THREE.CylinderGeometry( 0.5, 0.5, 5, 8);
    var material = new THREE.MeshPhongMaterial( {color: 0x006600} );
    var plant = new THREE.Mesh( geometry, material );
    plant.receiveShadow = true;
    plant.castShadow = true;
    plant.position.x = x;
    plant.position.y = y;
    plant.rotation.x = 1.5;
    scene.add( plant );
    sceneryList.push(plant);

    geometry = new THREE.SphereGeometry( 5*0.2, 32*0.2, 32*0.2 );
    material = new THREE.MeshPhongMaterial( {color: colors[Math.floor((Math.random() * 6))]} );
    var circle = new THREE.Mesh( geometry, material );
    circle.receiveShadow = true;
    circle.castShadow = true;
    circle.position.x = x;
    circle.position.y = y;
    circle.position.z = 3;
    scene.add( circle );
    sceneryList.push(circle);

    const geometryFlowerLeaves = new THREE.RingGeometry( 0.1, 1.5, 30 );
    const materialFlowerLeaves = new THREE.MeshPhongMaterial( { color: 0xffffff, side: THREE.DoubleSide } );
    var flowerLeaves = new THREE.Mesh( geometryFlowerLeaves, materialFlowerLeaves );
    flowerLeaves.receiveShadow = true;
    flowerLeaves.castShadow = true;
    flowerLeaves.position.x = x;
    flowerLeaves.position.y = y;
    flowerLeaves.position.z = 3;
    flowerLeaves.rotation.x = 1;
    scene.add( flowerLeaves );
    sceneryList.push(flowerLeaves);
}

// shows whistle pointer in sent position
function showWhistle(x, y, z){
    scene.remove(ringWhistleMesh);
    ringWhistleMesh.position.x = x;
    ringWhistleMesh.position.y = y;
    ringWhistleMesh.position.z = z;
    scene.add(ringWhistleMesh);
}

// loads texture from assets
function loadTexture(textureName){
    var newTexture = new THREE.TextureLoader().load( "./assets/textures/" + textureName + ".png" );
    newTexture.wrapS = THREE.RepeatWrapping;
    newTexture.wrapT = THREE.RepeatWrapping;
    return newTexture;
}

// adds bush mesh and texture to scene in sent position
function addBush(x, y, z, scale){
    var geometry = new THREE.SphereGeometry( 5*scale, 32*scale, 32*scale );
    //https://www.deviantart.com/kuschelirmel-stock/art/texture-leaves-33294198
    var material = new THREE.MeshPhongMaterial( {map: loadTexture("tree_leaves")} );
    var bush = new THREE.Mesh( geometry, material );
    bush.castShadow = true;
    bush.position.x = x;
    bush.position.y = y;
    bush.position.z = z;
    scene.add( bush );
    sceneryList.push(bush);
}

// adds tree mesh and texture to scene in sent position
function addTree(x, y){
    var geometry = new THREE.CylinderGeometry( 1, 1, 14, 8);
    // https://www.klipartz.com/en/sticker-png-tonla
    var material = new THREE.MeshPhongMaterial( { map: loadTexture("tree_bark") } );
    var tree = new THREE.Mesh( geometry, material );
    tree.castShadow = true;
    tree.receiveShadow = true;
    tree.position.x = x;
    tree.position.y = y;
    tree.rotation.x = 1.5;
    scene.add( tree );
    sceneryList.push(tree);

    addBush(tree.position.x, tree.position.y, 10, 1);
}

// sets up scenery mesh and textures by calling functions
function setUpScenery(){
    // https://www.textures-resource.com/gamecube/pikmin2/texture/1127/
    var ground = new THREE.TextureLoader().load( "./assets/textures/ground.png" );
    ground.wrapS = THREE.RepeatWrapping;
    ground.wrapT = THREE.RepeatWrapping;
    ground.repeat.set( 5, 5 );

    var geometry = new THREE.PlaneGeometry( 40, 20, 32 );
    var material = new THREE.MeshPhongMaterial( {map: ground} );
    var plane = new THREE.Mesh( geometry, material );
    plane.receiveShadow = true;
    scene.add( plane );
    plane.position.z -= 0.18;

    addTree(0, 8);
    addTree(-12, 8);
    addTree(12, 8);
    addTree(17, 1);
    addTree(-17, 1);
    addFlower(17, 6);
    addFlower(6, 8);
    addFlower(-6, 8);
    addFlower(-17, 6);
    addFlower(-17, -8);
    addFlower(-17, -3);
    addFlower(17, -8);
    addFlower(17, -3);

    addBulborb(-9,0);
    addBulborb(9,0);
}

// creates pikmin, adds to scene and pikmin list
function addPikmin(color, x, y){

   var leaf = new THREE.Mesh(new THREE.PlaneGeometry( 0.25, 0.4, 0.5 ));
   leaf.rotation.x += 1.5;
   leaf.position.z += 2;
   var antenna = new THREE.Mesh(new THREE.SphereGeometry( 0.5, 32, 32 ));
   antenna.scale.set(0.1,0.1,0.8);
   antenna.position.z += 1.5;
   var head = new THREE.Mesh(new THREE.SphereGeometry( 0.5, 32, 32 ));
   head.position.z += 1;
   head.scale.set(0.4,0.4,0.7);
   var body = new THREE.Mesh(new THREE.SphereGeometry( 0.5, 32, 32 ));
   body.position.z += 0.5;
   body.scale.set(0.3,0.3,1);
   var leg1 = new THREE.Mesh(new THREE.SphereGeometry( 0.5, 32, 32 ));
   leg1.position.z += 0;
   leg1.position.x += 0.1;
   leg1.scale.set(0.1,0.1,0.8);
   var leg2 = new THREE.Mesh(new THREE.SphereGeometry( 0.5, 32, 32 ));
   leg2.position.z += 0;
   leg2.position.x -= 0.1;
   leg2.scale.set(0.1,0.1,0.8);
   var arm1 = new THREE.Mesh(new THREE.SphereGeometry( 0.5, 32, 32 ));
   arm1.position.z += 0.5;
   arm1.position.x += 0.15;
   arm1.rotation.y -= 0.5;
   arm1.scale.set(0.1,0.1,0.6);
   var arm2 = new THREE.Mesh(new THREE.SphereGeometry( 0.5, 32, 32 ));
   arm2.position.z += 0.5;
   arm2.position.x -= 0.15;
   arm2.rotation.y += 0.5;
   arm2.scale.set(0.1,0.1,0.6);
   
   var geom = new THREE.Geometry();
   geom.mergeMesh(antenna);
   geom.mergeMesh(head);
   geom.mergeMesh(body);
   geom.mergeMesh(leg1);
   geom.mergeMesh(leg2);
   geom.mergeMesh(arm1);
   geom.mergeMesh(arm2);
   geom.mergeVertices();
   var material = new THREE.MeshPhongMaterial( {color: color} );
   var pikmin = new THREE.Mesh(geom, material);
   pikmin.receiveShadow = true;
   pikmin.scale.set(0.8, 0.8, 0.8)
   pikmin.position.x = x;
   pikmin.position.y = y;
   scene.add(pikmin);
   pikminList.push(pikmin);
   movingList.push(false);
}

// spawns "num" amount of pikmin
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

// gets mouse poition in normalized device coordinates
// https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
function getPos( event ) {

    whistle.play();

    vec.set(( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );

    vec.unproject( camera );
    vec.sub( camera.position ).normalize();
    var distance = - camera.position.z / vec.z;
    mousePos.copy( camera.position ).add( vec.multiplyScalar( distance ) );

    if(mousePos.x < -17){
        mousePos.x = -17;
    }
    if(mousePos.x > 17){
        mousePos.x = 17;
    }
    if(mousePos.y > 7){
        mousePos.y = 7;
    }

    // add ring whistle
    showWhistle(mousePos.x, mousePos.y, mousePos.z);

    for(var i = 0; i < pikminList.length; i++){
        movingList[i] = true;
    }

}

// checks if pikmin is colliding with another pikmin
function isColliding(pikmin){
    for(var j = 0; j < pikminList.length; j++){
        var pikmin2 = pikminList[j];
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

// fixes collision by moving pikmin to a free place
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

// moves every pikmin to the mouse position, also fixes collision
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
                scene.remove(ringWhistleMesh);
                fixCollision(pikmin);
            }
        }

    }
}

// moves pikmin and camera to click position every animation loop
renderer.setAnimationLoop( function () {

    moveToPos();
    renderer.render( scene, camera );
    camera.position.x = (pikminList[0].position.x);

} );