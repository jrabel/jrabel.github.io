var Water = function (scene, x, y, z, width, depth, widthSegments, depthSegments) {

    this.scene = scene;
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
        this.mesh.frustumCulled = false;
        this.scene.add(this.mesh);
    }

    this.updateWater = function (centerPosition) {

        var xDisplacement = centerPosition.x - this.x;
        var yDisplacement = centerPosition.y - this.y;

        this.x = centerPosition.x;
        this.y = centerPosition.y;

        for (vertex of this.geometry.vertices) {
            vertex.x += xDisplacement;
            vertex.y += yDisplacement;
        }
        this.geometry.verticesNeedUpdate = true;
    }

    this.generateMesh();
};
