varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uHover;

void main() {
    // Number of blocks to divide the image into
    float blocks = 20.0;
    vec2 blockUv = floor(vUv * blocks) / blocks;
    // Calculate the distance from the current block to the mouse
    float distance = length(blockUv - uMouse);

    // Smooth effect around the mouse area for hover distortion
    float effect = smoothstep(0.4, 0.0, distance);

    // Create distortion vector
    vec2 distortion = vec2(0.02) * effect;

    // Sample texture with added distortion based on hover amount
    vec4 color = texture2D(uTexture, vUv+(distortion*uHover));

    // Output final color
    gl_FragColor =color;
}
