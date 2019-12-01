// const gConstant = 0.00000000006674;
const gConstant = 0.1;

class Body {

	constructor(id, c, m, x, y, z, dx, dy, dz, ddx, ddy, ddz) {
		this.id = id;
		this.radius = 0.5;
		this.heightSegments = 32;
		this.widthSegments = 32;

		this.geometry = new THREE.SphereBufferGeometry(this.radius, 20, 20);
		this.material = new THREE.MeshStandardMaterial({ color: c });
		this.mesh = new THREE.Mesh(this.geometry, this.material);

		this.mass = m;

		this.x = x;
		this.y = y;
		this.z = z;
		this.dx = dx;
		this.dy = dy;
		this.dz = dz;
		this.ddx = ddx;
		this.ddy = ddy;
		this.ddz = ddz;
	}

	getMesh() {
		return this.mesh;
	}

	calculateState(bodies) {
		this.calculateAccelerations(bodies);
	}

	update(dt) {
		this.dx += this.ddx * dt;
		this.dy += this.ddy * dt;
		this.dz += this.ddz * dt;

		this.x += this.dx * dt;
		this.y += this.dy * dt;
		this.z += this.dz * dt;

		this.mesh.position.x = this.x;
		this.mesh.position.y = this.y;
		this.mesh.position.z = this.z;
	}

	calculateAccelerations(bodies) {
		this.ddx = 0;
		this.ddy = 0;
		this.ddz = 0;

		for (var i = 0; i < bodies.length; i++) {

			if (bodies[i].id != this.id) {
				const dist = Body.distance(bodies[i], this);

				var gForce = (gConstant * this.mass * bodies[i].mass) / (dist * dist);

				var vec = Body.vectorBetween(bodies[i], this);

				this.ddx += gForce * vec.i / this.mass;
				this.ddy += gForce * vec.j / this.mass;
				this.ddz += gForce * vec.k / this.mass;
			}
		}
	}

	static distance(a, b) {
		const dx = a.x - b.x;
		const dy = a.y - b.y;
		const dz = a.z - b.z;

		return Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));
	}

	static vectorBetween(a, b) {
		const dx = a.x - b.x;
		const dy = a.y - b.y;
		const dz = a.z - b.z;

		const mag = Math.sqrt((dx * dx) + (dy * dy) + (dz * dz));

		return { i: dx / mag, j: dy / mag, k: dz / mag };
	}



}