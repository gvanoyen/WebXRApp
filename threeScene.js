import * as THREE from "three";

const w = window.innerWidth;
const h = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w,h);
document.body.appendChild(renderer.domElement);

const fov = 75;
const aspect = w/h;
const near = 0.1;
const far = 10;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;
const scene = new THREE.Scene();

const geo = new THREE.IcosahedronGeometry(1.0, 2);

const mat = new THREE.MeshBasicMaterial({
    color: 0xccff
});

const mesh = new THREE.Mesh(geo, mat);
scene.add(mesh);

function animate(t = 0) {
    requestAnimationFrame(animate);
    mesh.scale.setScalar(Math.cos(t * 0.001) + 1.0);
    renderer.render(scene,camera);
}

animate();