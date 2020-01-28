var Water = function (x, y, z, width, depth, widthSegments, depthSegments) {

    this.x = x;
    this.y = y;
    this.waterLevel = z;
    this.width = width;
    this.depth = depth;
    this.widthSegments = widthSegments;
    this.depthSegments = depthSegments;

    // internals
    this.geometry;
    this.material;
    this.mesh;

    this.generateGeometry = function () {
        this.geometry = new THREE.PlaneGeometry(this.width, this.depth, this.widthSegments, this.depthSegments);

        for (vertex of this.geometry.vertices) {
            vertex.x += this.x
            vertex.y += this.y;
            vertex.z += this.waterLevel;
        }
    }

    this.generateMaterial = function () {
        this.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0x44CCFF),
            opacity: 0.8,
            transparent: true,
            flatShading: true
        });
    }

    this.generateMesh = function () {
        this.generateGeometry();
        this.generateMaterial();
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }

    this.addWaterToScene = function (scene) {
        scene.add(this.mesh);
    }

    this.generateMesh();
};
