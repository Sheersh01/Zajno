// vertexShader.glsl
varying vec2 vUv;

void main() {
    // Pass UV coordinates to the fragment shader
    vUv = uv;

    // Calculate position in camera space
    vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);

    // Project to screen space
    gl_Position = projectionMatrix * modelViewPosition;
}
