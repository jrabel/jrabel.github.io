// these need to be accessed inside more than one function so we'll declare them first
let container;
let camera;
let controls;
let renderer;
let scene;

let bodies;
let forceVecs;

const clock = new THREE.Clock();

function init() {

  container = document.querySelector('#gravity-container');

  scene = new THREE.Scene();
  scene.background = new THREE.Color("black");

  createCamera();
  createControls();
  createLights();
  createBodies();
  createForceVectors();
  createRenderer();

  renderer.setAnimationLoop(() => {

    update();
    render();

  });

}

function createCamera() {

  camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 20);

}

function createControls() {

  controls = new THREE.OrbitControls(camera, container);

}

function createLights() {

  const ambientLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 3);

  //const mainLight = new THREE.DirectionalLight( 0xffffff, 5 );
  //mainLight.position.set( 10, 10, 10 );

  scene.add(ambientLight); //, mainLight );

}

function createBodies() {
  const mass1 = 100;
  const mass2 = 10;
  const mass3 = 10;

  var sphere1 = new Body(1, "red", mass1, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  var sphere2 = new Body(2, "blue", mass2, 5, 0, 0, 0, 1, 0, 0, 0, 0);
  var sphere3 = new Body(3, "green", mass3, -5, 0, 0, 0, -1, 0, 0, 0, 0);

  bodies = [sphere1, sphere2, sphere3];

  scene.add(sphere1.getMesh());
  scene.add(sphere2.getMesh());
  scene.add(sphere3.getMesh());

}

function createForceVectors() {
  forceVecs = [];
  for (var i = 0; i < bodies.length; i++) {
    var dir = new THREE.Vector3(bodies[i].ddx, bodies[i].ddy, bodies[i].ddz);
    dir.normalize();
    var origin = new THREE.Vector3(bodies[i].x, bodies[i].y, bodies[i].z);
    var length = 1;
    var color = "white";

    var arrowHelper = new THREE.ArrowHelper(dir, origin, length, color);
    forceVecs.push(arrowHelper);
    scene.add(arrowHelper);
  }
}

function createRenderer() {

  // create a WebGLRenderer and set its width and height
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);

  renderer.setPixelRatio(window.devicePixelRatio);

  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;

  renderer.physicallyCorrectLights = true;

  container.appendChild(renderer.domElement);

}

function update() {

  const delta = clock.getDelta();

  for (var i = 0; i < bodies.length; i++) {
    bodies[i].calculateState(bodies);
  }

  for (var i = 0; i < bodies.length; i++) {
    bodies[i].update(delta);
  }

  updateForceVecs();

}

function updateForceVecs() {
  for (var i = 0; i < forceVecs.length; i++) {

    var pos = new THREE.Vector3(bodies[i].x, bodies[i].y, bodies[i].z);
    forceVecs[i].position.copy(pos);

    var mag = Math.sqrt((bodies[i].ddx * bodies[i].ddx) + (bodies[i].ddy * bodies[i].ddy) + (bodies[i].ddz * bodies[i].ddz));

    if (mag === 0) mag = bodies[i].radius * 0.5; // hide arrow
    else if (mag < bodies[i].radius) mag = bodies[i].radius * 1.5; // min arrow length

    forceVecs[i].setLength(mag);

    var dir = new THREE.Vector3(bodies[i].ddx, bodies[i].ddy, bodies[i].ddz);
    dir = dir.normalize();
    forceVecs[i].setDirection(dir);

  }
}

function render() {

  renderer.render(scene, camera);

}

function onWindowResize() {

  camera.aspect = container.clientWidth / container.clientHeight;

  // update the camera's frustum
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);

}

window.addEventListener('resize', onWindowResize);

init();
