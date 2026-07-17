import perlinNoise from './PerlinNoise';

const terrainVertex = /*glsl*/ `
    ${perlinNoise}

    uniform float time;
    varying vec2 vGrid;
    varying vec3 vWorld;
    varying float vHeight;

    // Mountain ridges: fold the noise around 0 and square it. The fold is
    // smoothed (sqrt(n^2+eps) instead of abs) so the crease at the apex stays
    // sampleable by the vertex grid; a hard abs makes peaks shimmer/jiggle as
    // the noise field scrolls through the fixed vertices.
    float ridged(float n, float eps) {
        float r = 1.0 - sqrt(n * n + eps);
        return r * r;
    }

    void main() {
        vec2 tPos = vec2(position.x, position.y + time * 100.0);

        // 0 in the valley corridor down the middle, 1 on the flanks.
        float valley = 1.0 - exp(-pow(position.x / 480.0, 2.0));

        // Rolling base layers.
        float base =
            snoise(tPos / 1000.0) * 220.0 +
            snoise(tPos / 400.0) * 120.0;

        // Dramatic ridged peaks on top.
        float peaks =
            ridged(snoise(tPos / 620.0), 0.004) * 720.0 +
            ridged(snoise(tPos / 240.0), 0.012) * 170.0;

        float height = valley * (base + peaks + 230.0);

        vec4 world = modelMatrix * vec4(position.xy, height, 1.0);
        gl_Position = projectionMatrix * viewMatrix * world;

        // Grid coordinates scroll with the same tPos as the noise, so the
        // lines stay pinned to the terrain instead of sliding over it.
        vGrid = tPos;
        vWorld = world.xyz;
        vHeight = clamp(height / 1250.0, 0.0, 1.0);
    }
`;

export default terrainVertex;
