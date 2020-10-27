var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 10;

var mouse = new THREE.Vector2();

window.addEventListener( 'click', getPos );

var vec = new THREE.Vector3(); // create once and reuse
var mousePos = new THREE.Vector3(); // create once and reuse

var movementSpeed = 0.03;
var positionTolerance = 0.3;

var pikminList = [];

var movingList = [];

var colors = [0xff0000, 0x0000ff, 0xffff00, 0x4B0082, 0xffffff];

spawnPikmin(150);

//creates pikmin, adds to scene and pikmin list
function addPikmin(color, x, y){
    var geometry = new THREE.ConeGeometry( 0.5, 0.5, 3 );
    var material = new THREE.MeshBasicMaterial( { color: color } );
    var pikmin = new THREE.Mesh( geometry, material );
    pikmin.position.x = x;
    pikmin.position.y = y;
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
    for(pikmin of pikminList){
        fixCollision(pikmin);
    }
}

//gets mouse poition in normalized device coordinates
//https://stackoverflow.com/questions/13055214/mouse-canvas-x-y-to-three-js-world-x-y-z
function getPos( event ) {
	// calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components

    vec.set(( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );

    vec.unproject( camera );
    vec.sub( camera.position ).normalize();
    var distance = - camera.position.z / vec.z;
    mousePos.copy( camera.position ).add( vec.multiplyScalar( distance ) );

    for(var i = 0; i < pikminList.length; i++){
        movingList[i] = true;
        //console.log("started moving");
    }

}

//checks if pikmin is colliding with another pikmin
function isColliding(pikmin){
    for(pikmin2 of pikminList){
        //console.log(pikmin2);
        if(pikmin != pikmin2 && Math.abs(pikmin.position.x - pikmin2.position.x) < 0.3 && Math.abs(pikmin.position.y - pikmin2.position.y) < 0.3){
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

var animate = function () {
    requestAnimationFrame( animate );
    moveToPos();
    renderer.render( scene, camera );
};

animate();