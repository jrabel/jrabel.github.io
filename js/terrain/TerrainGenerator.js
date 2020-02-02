var TerrainGenerator = function (scene, widthPatches, depthPatches, patchWidth, patchDepth) {

    this.scene = scene;
    this.widthPatches = widthPatches;
    this.depthPatches = depthPatches;
    this.patchWidth = patchWidth;
    this.patchDepth = patchDepth;

    // internal 
    this.totalWidth = this.patchWidth * this.widthPatches;
    this.totalDepth = this.patchDepth * this.depthPatches;
    this.terrainPatches = new Array;
    this.patchWidthSegments = 10;
    this.patchDepthSegments = 10;

    this.maxHeight = Math.floor((this.patchWidth + this.patchDepth) / 2);
    this.waterLevel = - (1 / 2) * this.maxHeight;

    this.perlin = new Perlin();
    this.perlin.seed(Math.random());

    this.water = new Water(this.scene, this.totalWidth / 2, this.totalDepth / 2, this.waterLevel, this.totalWidth, this.totalDepth, 2, 2);

    // this.combinedTerrainMesh;

    this.terrainPatchMap = new Map();
    this.oldTerrainPatchMap = new Map();


    this.calculateTerrainPatchCenters = function (combinedPatchCenter) {
        var newTerrainPatchCenterKeys = new Set();
        for (var j = 0; j < this.depthPatches; j++) {
            for (var i = 0; i < this.widthPatches; i++) {
                var patchX = combinedPatchCenter.x + i * this.patchWidth - (this.patchWidth * (this.widthPatches - 1) / 2);
                var patchY = combinedPatchCenter.y + j * this.patchDepth - (this.patchDepth * (this.depthPatches - 1) / 2);
                var patchCenter = new THREE.Vector2(patchX, patchY);

                newTerrainPatchCenterKeys.add(JSON.stringify(patchCenter));
            }
        }
        // console.log("TerrainGenerator::calculateTerrainPatchCenters: newTerrainPatchCenterKeys ="), console.log(newTerrainPatchCenterKeys);
        return newTerrainPatchCenterKeys;
    }

    this.updateTerrainPatchCenters = function (newTerrainPatchCenterKeys) {
        // create new terrain patch map
        // old terrain patch map will only contain patches no longer used

        newTerrainPatchMap = new Map();

        var patchesToAddToScene = new Array();

        for (newTerrainPatchCenterKey of newTerrainPatchCenterKeys) {
            // if terrain patch is already in map
            if (this.terrainPatchMap.has(newTerrainPatchCenterKey)) {
                // add terrain patch to new map
                newTerrainPatchMap.set(newTerrainPatchCenterKey, this.terrainPatchMap.get(newTerrainPatchCenterKey));
                // remove terrain patch from old map
                this.terrainPatchMap.delete(newTerrainPatchCenterKey);
            }
            else {
                // create new terrain patch if old terrain patch map does not contain it
                var newPatchCenter = JSON.parse(newTerrainPatchCenterKey);
                var newTerrainPatch = this.createTerrainPatch(newPatchCenter.x, newPatchCenter.y);
                newTerrainPatchMap.set(newTerrainPatchCenterKey, newTerrainPatch);
                patchesToAddToScene.push(newTerrainPatch);
            }
        }

        var patchesToRemoveFromScene = Array.from(this.terrainPatchMap.values());

        this.addTerrainPatchesToScene(patchesToAddToScene);
        this.removeTerrainpatchesFromScene(patchesToRemoveFromScene);

        this.terrainPatchMap = newTerrainPatchMap;

        // console.log("TerrainGenerator::updateTerrainPatchCenters: patchesToAddToScene = "), console.log(patchesToAddToScene);
        // console.log("TerrainGenerator::updateTerrainPatchCenters: patchesToRemoveFromScene = "), console.log(patchesToRemoveFromScene);
        // console.log("TerrainGenerator::updateTerrainPatchCenters: this.terrainPatchMap = "), console.log(this.terrainPatchMap);
    }


    this.createTerrainPatch = function (patchX, patchY) {
        var patchZ = 0;
        var patch = new TerrainPatch(patchX, patchY, patchZ, this.patchWidth, this.patchDepth, this.patchWidthSegments,
            this.patchDepthSegments, this.perlin, this.maxHeight, this.waterLevel);
        return patch;
    }

    this.addTerrainPatchesToScene = function (patchesToAddToScene) {
        for (terrain of patchesToAddToScene) {
            scene.add(terrain.getMesh());
        }
    }

    this.removeTerrainpatchesFromScene = function (patchesToRemoveFromScene) {
        for (terrain of patchesToRemoveFromScene) {
            scene.remove(terrain.getMesh());
        }
    }

    this.updateTerrain = function (centerPosition) {
        var centerX = Math.round(centerPosition.x / this.patchWidth) * this.patchWidth;
        var centerY = Math.round(centerPosition.y / this.patchDepth) * this.patchDepth;
        var centerZ = 0;
        var combinedPatchCenter = new THREE.Vector3(centerX, centerY, centerZ);
        var newTerrainPatchCenters = this.calculateTerrainPatchCenters(combinedPatchCenter);
        this.updateTerrainPatchCenters(newTerrainPatchCenters);
        this.water.updateWater(combinedPatchCenter);
    }

    // this.createTerrainPatches = function (cameraPosition) {
    //     for (var j = 0; j < this.depthPatches; j++) {
    //         for (var i = 0; i < this.widthPatches; i++) {
    //             var patchX = cameraPosition.x + i * this.patchWidth - (this.patchWidth * (this.widthPatches - 1) / 2);
    //             var patchY = cameraPosition.y + j * this.patchDepth - (this.patchDepth * (this.depthPatches - 1) / 2);
    //             var patchZ = 0;

    //             var patch = new TerrainPatch(patchX, patchY, patchZ, this.patchWidth, this.patchDepth, this.patchWidthSegments,
    //                 this.patchDepthSegments, this.perlin, this.maxHeight, this.waterLevel);

    //             this.terrainPatches.push(patch);
    //         }
    //     }
    // }


    // this.createCombinedTerrain = function () {
    //     var patchGeometries = new Array;
    //     for (terrain of this.terrainPatches) {
    //         patchGeometries.push(terrain.getMesh().geometry);
    //     }

    //     var combinedTerrainGeometry = BufferGeometryUtils.mergeBufferGeometries(patchGeometries);

    //     material = new THREE.MeshStandardMaterial({ color: "green" });
    //     material.flatShading = true;
    //     // this.material.wireframe = true;

    //     this.combinedTerrainMesh = new THREE.Mesh(combinedTerrainGeometry, material);
    // }

    // this.addCombinedTerrainToScene = function (scene) {
    //     scene.add(this.combinedTerrainMesh);
    // }

    // this.createTerrainPatches();
    // this.createCombinedTerrain();

};