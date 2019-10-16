// these need to be accessed inside more than one function so we'll declare them first
let container;
let camera;
let controls;
let renderer;
let scene;

const mixers = [];
const clock = new THREE.Clock();

function init() {

  container = document.querySelector( '#scene-container' );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x000080 );

  createCamera();
  createControls();
  createLights();
  // loadModels();
  createSphere();
  createRenderer();

  renderer.setAnimationLoop( () => {

    update();
    render();

  } );

}

function createCamera() {

  camera = new THREE.PerspectiveCamera( 35, container.clientWidth / container.clientHeight, 0.1, 100 );
  camera.position.set( 0, 5, 5 );

}

function createControls() {

  controls = new THREE.OrbitControls( camera, container );

}

function createLights() {

  const ambientLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 3 );

  //const mainLight = new THREE.DirectionalLight( 0xffffff, 5 );
  //mainLight.position.set( 10, 10, 10 );

  scene.add( ambientLight); //, mainLight );

}

function createSphere() {

	var sphereRadius = 3;
	var sphereDetail = 7;

	var sphere_geometry = new THREE.IcosahedronGeometry(sphereRadius, sphereDetail);
	// var sphere_geometry = new THREE.SphereGeometry(1, 128, 128);
	var material = new THREE.MeshStandardMaterial({color: "orange"});
	material.flatShading = true;
	var sphere = new THREE.Mesh(sphere_geometry, material);

	var lS = 2;
	for (var i = 0; i < sphere.geometry.vertices.length; i++) {
    var p = sphere.geometry.vertices[i];
		p.normalize().multiplyScalar(1.01 + 0.1 * noise.perlin3(p.x*lS, p.y*lS,p.z*lS));
	}
	sphere.geometry.verticesNeedUpdate = true; //must be set or vertices will not update

	var mS = 10;
	for (var i = 0; i < sphere.geometry.vertices.length; i++) {
    var p = sphere.geometry.vertices[i];
		p.multiplyScalar(1.01 + 0.02 * noise.perlin3(p.x*mS, p.y*mS, p.z*mS));
	}
	sphere.geometry.verticesNeedUpdate = true; //must be set or vertices will not update

	sphere.geometry.faces.forEach(f=>{
    //get three verts for the face
    const a = sphere.geometry.vertices[f.a]
    // const b = sphere.geometry.vertices[f.b]
    // const c = sphere.geometry.vertices[f.c]

		var rad = Math.sqrt((a.x*a.x) + (a.y*a.y) + (a.z*a.z))
		// console.log(rad)

		if (rad <= 1) f.color.set(0x44ccff); // water
		if(rad > 1) f.color.set(0xeecc44) // dirt yellow
    if(rad > 1 + 0.01) f.color.set(0x228800) // grass green
    if(rad > 1 + 0.04) f.color.set(0x116600) // grey
		if (rad > 1.06) f.color.set(0x113300);

	})

	sphere.geometry.colorsNeedUpdate = true
	sphere.geometry.verticesNeedUpdate = true
	//required for flat shading
	sphere.geometry.computeFlatVertexNormals()
	const mesh = new THREE.Mesh(sphere.geometry, new THREE.MeshLambertMaterial({
		  // wireframe:true,
		  vertexColors: THREE.VertexColors,
		  //required for flat shading
		  flatShading:true,
	}))

	scene.add(mesh);

}

function loadModels() {

  const loader = new THREE.GLTFLoader();

  // A reusable function to set up the models. We're passing in a position parameter
  // so that they can be individually placed around the scene
  const onLoad = ( gltf, position ) => {

    const model = gltf.scene.children[ 0 ];
    model.position.copy( position );
    model.scale.set(0.05, 0.05, 0.05);

    const animation = gltf.animations[ 0 ];

    const mixer = new THREE.AnimationMixer( model );
    mixers.push( mixer );

    const action = mixer.clipAction( animation );
    action.play();

    scene.add( model );

  };

  // the loader will report the loading progress to this function
  const onProgress = () => {};

  // the loader will send any error messages to this function, and we'll log
  // them to to console
  const onError = ( errorMessage ) => { console.log( errorMessage ); };

  // load the first model. Each model is loaded asynchronously,
  // so don't make any assumption about which one will finish loading first
  const parrotPosition = new THREE.Vector3( -2, 2, 9 );
  loader.load( 'models/Parrot.glb', gltf => onLoad( gltf, parrotPosition ), onProgress, onError );

  const flamingoPosition = new THREE.Vector3( 7.5, 2, -4 );
  loader.load( 'models/Flamingo.glb', gltf => onLoad( gltf, flamingoPosition ), onProgress, onError );

  const storkPosition = new THREE.Vector3( -8, 2, -2 );
  loader.load( 'models/Stork.glb', gltf => onLoad( gltf, storkPosition ), onProgress, onError );
}

function createRenderer() {

  // create a WebGLRenderer and set its width and height
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( container.clientWidth, container.clientHeight );

  renderer.setPixelRatio( window.devicePixelRatio );

  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;

  renderer.physicallyCorrectLights = true;

  container.appendChild( renderer.domElement );

}

function update() {

  const delta = clock.getDelta();

  for ( const mixer of mixers ) {

    mixer.update( delta );

  }

}

function render() {

  renderer.render( scene, camera );

}

function onWindowResize() {

  camera.aspect = container.clientWidth / container.clientHeight;

  // update the camera's frustum
  camera.updateProjectionMatrix();

  renderer.setSize( container.clientWidth, container.clientHeight );

}

window.addEventListener( 'resize', onWindowResize );

init();
