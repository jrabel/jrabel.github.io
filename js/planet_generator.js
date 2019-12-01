// these need to be accessed inside more than one function so we'll declare them first
let container;
let camera;
let controls;
let renderer;
let scene;

let planet;

const clock = new THREE.Clock();

function init() {

  container = document.querySelector('#planet-container');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000060);

  createCamera();
  createControls();
  createLights();
  createPlanet();
  createRenderer();

  renderer.setAnimationLoop(() => {

    update();
    render();

  });

}

function createCamera() {

  camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 5, 5);

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

function createPlanet() {

  var sphereRadius = 3;
  var sphereDetail = 7;

  planet = new Planet(sphereRadius, sphereDetail);

  scene.add(planet.mesh);

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

  planet.mesh.rotation.y += 0.005;

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
