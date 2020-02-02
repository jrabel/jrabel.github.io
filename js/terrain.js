var container;

var camera, controls, scene, renderer;

var mesh;

var clock = new THREE.Clock();

var terrainGenerator;

init();
animate();

function init() {

    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 50000);

    scene = new THREE.Scene();

    var backgroundColor = 0x87ceeb;
    scene.background = new THREE.Color(backgroundColor);

    // scene.fog = new THREE.Fog(backgroundColor, 5000, 10000);

    camera.position.x = 0;
    camera.position.y = -15000;
    camera.position.z = 15000;
    camera.up = new THREE.Vector3(0, 0, 1);

    var cylinderGeometry = new THREE.CylinderGeometry(50, 50, 1000, 32);
    var cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    var cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinderMesh.rotation.x = Math.PI / 2;
    scene.add(cylinderMesh);


    var widthPatches = 30, depthPatches = 20;
    var patchWidth = 1000, patchDepth = 1000;

    terrainGenerator = new TerrainGenerator(scene, widthPatches, depthPatches, patchWidth, patchDepth);
    terrainGenerator.updateTerrain(camera.position);

    console.log(camera.position);

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(container.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    console.log(container.clientWidth);
    console.log(container.clientHeight);
    container.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, 0, 0);

    const ambientLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 3);

    scene.add(ambientLight);

    window.addEventListener('resize', onWindowResize, false);

}

function getCameraGroundPlaneIntersection() {
    var cameraAxisVector = new THREE.Vector3(0, 0, -1);
    cameraAxisVector.applyQuaternion(camera.quaternion);

    var distanceAlongVectorToPlane = (0 - camera.position.z) / cameraAxisVector.z;

    var intersectionPointX = camera.position.x + distanceAlongVectorToPlane * cameraAxisVector.x;
    var intersectionPointY = camera.position.y + distanceAlongVectorToPlane * cameraAxisVector.y;
    var intersectionPointZ = camera.position.z + distanceAlongVectorToPlane * cameraAxisVector.z;
    var intersectionPoint = new THREE.Vector3(intersectionPointX, intersectionPointY, intersectionPointZ);

    return intersectionPoint;
}

function onWindowResize() {

    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.clientWidth, container.clientHeight);

}

function animate() {

    requestAnimationFrame(animate);

    render();

}

function render() {
    var cameraPlaneIntersectionPoint = getCameraGroundPlaneIntersection();
    terrainGenerator.updateTerrain(cameraPlaneIntersectionPoint);

    controls.update(clock.getDelta());
    renderer.render(scene, camera);

}
