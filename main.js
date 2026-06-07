import * as THREE from 'three';
import LocomotiveScroll from 'locomotive-scroll';
import vertexShader from './shaders/vertexShader.glsl';
import fragmentShader from './shaders/fragmentShader.glsl';
import gsap from 'gsap';

// Locomotive Scroll Initialization
const scrollContainer = document.querySelector('.scroll-container');
const locomotiveScroll = new LocomotiveScroll({
  el: scrollContainer,
  smooth: true
});

// Basic Scene Setup
const scene = new THREE.Scene();
const distance = 20;
const fov = 2 * Math.atan((window.innerHeight / 2) / distance) * (180 / Math.PI);
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = distance;

// Renderer Setup
const canvas = document.querySelector('canvas');
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Raycaster and Mouse Vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Planes and Images Setup
const images = document.querySelectorAll("img");
const planes = [];

images.forEach((image) => {
  const imgbounds = image.getBoundingClientRect();
  
  // Texture and Material
  const texture = new THREE.TextureLoader().load(image.src);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uHover: { value: 0 }
    },
    vertexShader,
    fragmentShader,
  });
  
  // Geometry and Mesh
  const geometry = new THREE.PlaneGeometry(imgbounds.width, imgbounds.height);
  const plane = new THREE.Mesh(geometry, material);
  
  // Positioning
  plane.position.set(
    imgbounds.left - window.innerWidth/2 + imgbounds.width/2, 
    -imgbounds.top + window.innerHeight/2 - imgbounds.height/2, 
    0
  );
  
  planes.push({ plane, image, texture });
  scene.add(plane);
});

// Update Planes Position Function
function updatePlanesPosition() {
  planes.forEach(({ plane, image }) => {
    const imgbounds = image.getBoundingClientRect();
    plane.position.set(
      imgbounds.left - window.innerWidth/2 + imgbounds.width/2, 
      -imgbounds.top + window.innerHeight/2 - imgbounds.height/2, 
      0
    );
  });
}

// Resize Planes Function
function resizePlanes() {
  planes.forEach(({ plane, image }) => {
    const imgbounds = image.getBoundingClientRect();

    // Dispose old geometry
    plane.geometry.dispose();

    // Create new geometry with updated width and height
    plane.geometry = new THREE.PlaneGeometry(imgbounds.width, imgbounds.height);
    
    // Update plane position
    plane.position.set(
      imgbounds.left - window.innerWidth / 2 + imgbounds.width / 2,
      -imgbounds.top + window.innerHeight / 2 - imgbounds.height / 2,
      0
    );
  });
}

// Mouse Move Event Handler
function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  raycaster.setFromCamera(mouse, camera);
  
  const intersects = raycaster.intersectObjects(planes.map(p => p.plane));
  
  planes.forEach(({ plane }) => {
    const intersect = intersects.find(i => i.object === plane);
    
    if (intersect) {
      const localMousePosition = plane.worldToLocal(intersect.point.clone());
      const normalizedX = (localMousePosition.x / plane.geometry.parameters.width) + 0.5;
      const normalizedY = (localMousePosition.y / plane.geometry.parameters.height) + 0.5;
      
      plane.material.uniforms.uMouse.value.set(normalizedX, normalizedY);
      gsap.to(plane.material.uniforms.uHover, { value: 1, duration: 0.5, ease: 'power2.out' });
    } else {
      gsap.to(plane.material.uniforms.uHover, { value: 0, duration: 0.5, ease: 'power2.out' });
    }
  });
}

// Animation Loop
function animate() {
  updatePlanesPosition();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Event Listeners
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Resize planes
  resizePlanes();
});

window.addEventListener('mousemove', onMouseMove);

window.addEventListener('mouseout', () => {
  planes.forEach(({ plane }) => {
    gsap.to(plane.material.uniforms.uHover, { value: 0, duration: 0.5, ease: 'power2.out' });
    plane.material.uniforms.uMouse.value.set(0.5, 0.5);
  });
});
