import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js";
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/OBJLoader.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer;
let controller;
let loadedObject;

init();
animate();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    document.body.appendChild(ARButton.createButton(renderer));

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    controller.addEventListener('connected', onControllerConnected);
    scene.add(controller);

    window.addEventListener('resize', onWindowResize, false);

    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', onFileChange, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onSelect() {
    // Handle object selection
}

function onControllerConnected(event) {
    const gamepad = event.data.gamepad;
    if (gamepad) {
        gamepad.addEventListener('axeschange', onThumbstickMove);
    }
}

function onThumbstickMove(event) {
    const axes = event.target.axes;
    if (loadedObject) {
        const scale = 1 + axes[1] * 0.1; // Adjust the scale factor as needed
        loadedObject.scale.set(scale, scale, scale);
    }
}

function onFileChange(event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const contents = e.target.result;
            const loader = new OBJLoader();
            loadedObject = loader.parse(contents);
            loadedObject.traverse(function (child) {
                if (child.isMesh && child.material.map) {
                    child.material.map.format = THREE.RGBAFormat;
                }
            });
            scene.add(loadedObject);
        };
        reader.readAsText(file);
    }
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    renderer.render(scene, camera);
}
