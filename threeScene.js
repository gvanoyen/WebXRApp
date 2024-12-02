import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js";
import { OBJLoader } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/OBJLoader.js';
import { ARButton } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/webxr/ARButton.js';

let scene, camera, renderer, controller1, controller2, object;
let scale = 1;
let sphere1, sphere2;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
    camera.position.z = 1;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);

    document.body.appendChild(ARButton.createButton(renderer));

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    controller1 = renderer.xr.getController(0);
    controller1.addEventListener('selectstart', onSelectStart);
    controller1.addEventListener('selectend', onSelectEnd);
    scene.add(controller1);

    controller2 = renderer.xr.getController(1);
    controller2.addEventListener('selectstart', onSelectStart);
    controller2.addEventListener('selectend', onSelectEnd);
    scene.add(controller2);

    const sphereGeometry = new THREE.SphereGeometry(0.05, 32, 32);
    const blueMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const greenMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    sphere1 = new THREE.Mesh(sphereGeometry, blueMaterial);
    sphere2 = new THREE.Mesh(sphereGeometry, blueMaterial);
    scene.add(sphere1);
    scene.add(sphere2);

    window.addEventListener('resize', onWindowResize, false);

    document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const contents = e.target.result;
            loadOBJ(contents);
        };
        reader.readAsText(file);
    }
}

function loadOBJ(contents) {
    const loader = new OBJLoader();
    const obj = loader.parse(contents);
    object = obj;
    scene.add(object);
}

function onSelectStart(event) {
    const controller = event.target;
    const intersections = getIntersections(controller);

    if (intersections.length > 0) {
        const intersection = intersections[0];
        object.position.copy(intersection.point);
        object.attach(controller);
    }

    // Shrink the object to half its size, but not smaller than 0.01
    if (object) {
        scale = Math.max(scale * 0.5, 0.01);
        object.scale.set(scale, scale, scale);
    }

    // Change sphere color to green
    if (controller === controller1) {
        sphere1.material.color.set(0x00ff00);
    } else if (controller === controller2) {
        sphere2.material.color.set(0x00ff00);
    }
}

function onSelectEnd(event) {
    const controller = event.target;
    object.detach(controller);

    // Change sphere color back to blue
    if (controller === controller1) {
        sphere1.material.color.set(0x0000ff);
    } else if (controller === controller2) {
        sphere2.material.color.set(0x0000ff);
    }
}

function getIntersections(controller) {
    const tempMatrix = new THREE.Matrix4();
    tempMatrix.identity().extractRotation(controller.matrixWorld);

    const raycaster = new THREE.Raycaster();
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(tempMatrix);

    return raycaster.intersectObject(object);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    if (object) {
        const session = renderer.xr.getSession();
        if (session) {
            const inputSources = session.inputSources;
            for (const inputSource of inputSources) {
                if (inputSource.gamepad) {
                    const axes = inputSource.gamepad.axes;
                    if (axes.length > 2) {
                        const scaleChange = axes[1] * 0.1;
                        scale += scaleChange;
                        scale = Math.max(0.1, Math.min(10, scale)); // Clamp scale between 0.1 and 10
                        object.scale.set(scale, scale, scale);
                    }
                }
            }
        }
    }

    // Update sphere positions
    sphere1.position.copy(controller1.position);
    sphere2.position.copy(controller2.position);

    renderer.render(scene, camera);
}

init();
animate();
