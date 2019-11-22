class Planet {

	constructor(radius, detail) {
		this.sphereRadius = radius;
		this.sphereDetail = detail;

		this.sphereGeometry = this.createGeometry();
		this.sphereMaterial = this.createMaterial();

		this.sphereMesh = this.createMesh(this.sphereGeometry, this.sphereMaterial);

		this.createTerrain();
		this.addColorToTerrain();
	}

	get mesh() {
		return this.sphereMesh;
	}

	createGeometry() {
		var geometry = new THREE.IcosahedronGeometry(this.sphereRadius, this.sphereDetail);
		return geometry;
	}

	createMaterial() {
		var material = new THREE.MeshStandardMaterial({ color: "orange" });
		material.flatShading = true;
		return material;
	}

	createMesh(geometry, material) {
		var mesh = new THREE.Mesh(geometry, material);
		return mesh;
	}

	createTerrain() {
		var largeScaleMax = 2;
		var largeScale = largeScaleMax;
		for (var i = 0; i < this.sphereMesh.geometry.vertices.length; i++) {
			var p = this.sphereMesh.geometry.vertices[i];
			p.normalize().multiplyScalar(1.01 + 0.1 * noise.perlin3(p.x * largeScale, p.y * largeScale, p.z * largeScale));
		}
		this.sphereMesh.geometry.verticesNeedUpdate = true; //must be set or vertices will not update

		var mediumScaleMax = 10;
		var mediumScale = mediumScaleMax;
		for (var i = 0; i < this.sphereMesh.geometry.vertices.length; i++) {
			var p = this.sphereMesh.geometry.vertices[i];
			p.multiplyScalar(1.01 + 0.02 * noise.perlin3(p.x * mediumScale, p.y * mediumScale, p.z * mediumScale));
		}
		this.sphereMesh.geometry.verticesNeedUpdate = true; //must be set or vertices will not update

		var smallScaleMax = 15;
		var smallScale = smallScaleMax;
		for (var i = 0; i < this.sphereMesh.geometry.vertices.length; i++) {
			var p = this.sphereMesh.geometry.vertices[i];
			p.multiplyScalar(1.01 + 0.02 * noise.perlin3(p.x * smallScale, p.y * smallScale, p.z * smallScale));
		}
		this.sphereMesh.geometry.verticesNeedUpdate = true; //must be set or vertices will not update

		// normalize water to be at 1 unit
		for (var i = 0; i < this.sphereMesh.geometry.vertices.length; i++) {
			var p = this.sphereMesh.geometry.vertices[i];
			var rad = Math.sqrt((p.x * p.x) + (p.y * p.y) + (p.z * p.z));
			if (rad < 1) {
				p.normalize();
			}
		}
		this.sphereMesh.geometry.verticesNeedUpdate = true; //must be set or vertices will not update
	}

	addColorToTerrain() {
		this.sphereMesh.geometry.faces.forEach(f => {
			//get three verts for the face
			const a = this.sphereMesh.geometry.vertices[f.a]
			// const b = sphere.geometry.vertices[f.b]
			// const c = sphere.geometry.vertices[f.c]

			var rad = Math.sqrt((a.x * a.x) + (a.y * a.y) + (a.z * a.z))
			// console.log(rad)

			if (rad <= 1.001) f.color.set(0x44ccff); // water
			if (rad > 1.001) f.color.set(0xeecc44); // dirt yellow
			if (rad > 1 + 0.01) f.color.set(0x228800); // grass green
			if (rad > 1 + 0.04) f.color.set(0x116600);
			if (rad > 1.06) f.color.set(0x113300);

		})

		this.sphereMesh.geometry.colorsNeedUpdate = true
		this.sphereMesh.geometry.verticesNeedUpdate = true
		//required for flat shading
		this.sphereMesh.geometry.computeFlatVertexNormals()
		var mesh = new THREE.Mesh(this.sphereMesh.geometry, new THREE.MeshLambertMaterial({
			// wireframe:true,
			vertexColors: THREE.VertexColors,
			//required for flat shading
			flatShading: true,
		}));

		this.sphereMesh = mesh;
	}


}