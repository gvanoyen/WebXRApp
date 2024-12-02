import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js";
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/OBJLoader.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/webxr/ARButton.js';

let camera, scene, renderer;
let controller;
let loadedObject;
let joystickIndicator;

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
    scene.add(controller);

    // Create a visual indicator for joystick input
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    joystickIndicator = new THREE.Mesh(geometry, material);
    joystickIndicator.position.set(0, 0, -0.5);
    scene.add(joystickIndicator);

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
    if (loadedObject) {
        const gamepad = controller.gamepad;
        if (gamepad) {
            const scaleChange = gamepad.axes[3] * 0.01; // Adjust the scale factor as needed
            loadedObject.scale.x += scaleChange;
            loadedObject.scale.y += scaleChange;
            loadedObject.scale.z += scaleChange;
        }
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
            // Set the default scale for the loaded object
            loadedObject.scale.set(0.1, 0.1, 0.1); // Adjust the scale factor as needed
            scene.add(loadedObject);
        };
        reader.readAsText(file);
    }
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    if (controller && controller.gamepad) {
        const gamepad = controller.gamepad;
        // Update the visual indicator based on joystick input
        joystickIndicator.position.x = gamepad.axes[0] * 0.5;
        joystickIndicator.position.y = gamepad.axes[1] * 0.5;
    }
    renderer.render(scene, camera);
}