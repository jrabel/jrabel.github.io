var TerrainPatch = function (x, y, z, width, depth, widthSegments, depthSegments, perlin, maxHeight, waterLevel) {

    this.x = x;
    this.y = y;
    this.z = z;
    this.width = width;
    this.depth = depth;
    this.widthSegments = widthSegments;
    this.depthSegments = depthSegments;
    this.perlin = perlin;
    this.maxHeight = maxHeight;
    this.waterLevel = waterLevel;

    // internals
    this.geometry;
    this.material;
    this.mesh;

    this.generateHeight = function () {
        var size = this.widthSegments * this.depthSegments;
        var data = new Float32Array(size);

        var noiseConstant = this.maxHeight;
        var densityConstant = 1 / ((this.width + this.depth) / 2);

        // noise gains control the amplitude of the mesh height for a given noise cycle
        noiseGains = [2, 0.5, 0.2, 0.1];
        // density gains control the density of peaks and troughs (higher is more dense)
        densityGains = [0.2, 0.5, 1, 2];
        var cycles = noiseGains.length;
        if (cycles != densityGains.length) throw Error("TerrainPatch::generateHeight: Length of noise gains must equal length of density gains");

        for (var cycle = 0; cycle < cycles; cycle++) {
            var index = 0;

            var noiseFactor = noiseConstant * noiseGains[cycle];
            var densityFactor = densityConstant * densityGains[cycle];

            // odd for loop order to ensure we loop through buffergeometry correctly
            for (var j = this.depthSegments - 1; j >= 0; j--) {
                for (var i = 0; i < this.widthSegments; i++) {

                    var x = i * this.width / (this.widthSegments - 1) + this.x;
                    var y = j * this.depth / (this.depthSegments - 1) + this.y;
                    x *= densityFactor;
                    y *= densityFactor;
                    var noiseValue = perlin.perlin2(x, y);
                    data[index++] += noiseValue * noiseFactor;
                }
            }
        }
        return data;
    }

    this.generateGeometry = function () {
        var data = this.generateHeight(widthSegments, depthSegments);
        this.geometry = new THREE.PlaneGeometry(this.width, this.depth, this.widthSegments - 1, this.depthSegments - 1);

        var dataIndex = 0;
        for (vertex of this.geometry.vertices) {
            vertex.x += this.x;
            vertex.y += this.y;
            vertex.z += data[dataIndex++] + this.z;
            // if (vertex.z < this.waterLevel) {
            //     vertex.z = this.waterLevel;
            // }

        }
        this.addColorToTerrain();
    }

    this.addColorToTerrain = function () {
        new THREE.Color("rgb(96, 80, 64)");
        new THREE.Color("rgb(238, 204, 68)");
        new THREE.Color("rgb(34, 136, 0)");
        new THREE.Color("rgb(17, 102, 0)");
        new THREE.Color("rgb(17, 51, 0)");

        const underWaterColor = new THREE.Color("rgb(96, 80, 64)"), heightCuttoff0 = this.waterLevel;
        const terrainColor1 = new THREE.Color("rgb(238, 204, 68)"), heightCuttoff1 = 0;
        const terrainColor2 = new THREE.Color("rgb(34, 136, 0)"), heightCuttoff2 = this.maxHeight * (2 / 4);
        const terrainColor3 = new THREE.Color("rgb(17, 102, 0)"), heightCuttoff3 = this.maxHeight * (3 / 4);
        const terrainColor4 = new THREE.Color("rgb(17, 51, 0)"), heightCuttoff4 = this.maxHeight;
        const terrainColor5 = new THREE.Color("rgb(255, 255, 255)");

        for (face of this.geometry.faces) {

            const a = this.geometry.vertices[face.a]
            var color = new THREE.Color();
            var fractionToTop = 0;
            var colorBottom, colorTop;

            if (a.z <= heightCuttoff0) {
                fractionToTop = 1 - ((heightCuttoff0 - a.z) / (heightCuttoff0 - -this.maxHeight));
                colorBottom = underWaterColor;
                colorTop = terrainColor1;
            }
            else if (a.z <= heightCuttoff1) {
                fractionToTop = 1 - ((heightCuttoff1 - a.z) / (heightCuttoff1 - heightCuttoff0));
                colorBottom = terrainColor1;
                colorTop = terrainColor2;
            }
            else if (a.z <= heightCuttoff2) {
                fractionToTop = 1 - ((heightCuttoff2 - a.z) / (heightCuttoff2 - heightCuttoff1));
                colorBottom = terrainColor2;
                colorTop = terrainColor3;
            }
            else if (a.z <= heightCuttoff3) {
                fractionToTop = 1 - ((heightCuttoff3 - a.z) / (heightCuttoff3 - heightCuttoff2));
                colorBottom = terrainColor3;
                colorTop = terrainColor4;
            }
            else {
                fractionToTop = 1 - ((heightCuttoff4 - a.z) / (heightCuttoff4 - heightCuttoff3));
                colorBottom = terrainColor4;
                colorTop = terrainColor5;
            }

            color.r = colorBottom.r + fractionToTop * (colorTop.r - colorBottom.r);
            color.g = colorBottom.g + fractionToTop * (colorTop.g - colorBottom.g);
            color.b = colorBottom.b + fractionToTop * (colorTop.b - colorBottom.b);

            var colorAddition = (Math.random() - 0.5) / 20;

            face.color.setRGB(color.r + colorAddition, color.g + colorAddition, color.b + colorAddition);
            // console.log(face.color);
        }

        this.geometry.colorsNeedUpdate = true;
    }

    this.generateMaterial = function () {
        var color = '#' + Math.floor(Math.random() * 16777215).toString(16);
        // var color = "green";
        this.material = new THREE.MeshStandardMaterial();
        // this.material.color = new THREE.Color(color);
        this.material.vertexColors = THREE.VertexColors;
        this.material.flatShading = true;
        // this.material.wireframe = true;

    }

    this.generateMesh = function () {
        this.generateGeometry();
        this.generateMaterial();
        this.mesh = new THREE.Mesh(this.geometry, this.material);
    }


    this.getMesh = function () {
        return this.mesh;
    }

    this.generateMesh();

};