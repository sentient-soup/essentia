const terrainFragment = /*glsl*/ `
    uniform float time;
    varying vec2 vGrid;
    varying vec3 vWorld;
    varying float vHeight;

    vec3 palette(float t) {
        vec3 a = vec3(0.5, 0.5, 0.5);
        vec3 b = vec3(0.5, 0.5, 0.5);
        vec3 c = vec3(1.0, 1.0, 1.0);
        vec3 d = vec3(0.263, 0.416, 0.557);
        return a + b * cos(6.28318 * (c * t + d));
    }

    // Analytic anti-aliased grid line; width in multiples of one pixel.
    float gridLine(vec2 coord, float width) {
        vec2 g = abs(fract(coord - 0.5) - 0.5) / (fwidth(coord) * width);
        return 1.0 - min(min(g.x, g.y), 1.0);
    }

    void main() {
        vec2 coord = vGrid / 80.0;
        float line = gridLine(coord, 1.4);
        float halo = gridLine(coord, 7.0);
        halo *= halo * 0.45;

        vec3 neon = palette(vHeight * 0.6 + time * 0.03);
        vec3 fill = mix(vec3(0.015, 0.008, 0.045), vec3(0.10, 0.03, 0.14), vHeight);

        vec3 color = fill;
        color += neon * (line * 1.5 + halo);
        // Peaks catch the light and glow.
        color += vec3(1.0, 0.45, 0.65) * smoothstep(0.5, 0.95, vHeight) * 0.3;

        // Fade into the sunset with distance, warmer in the sun's column.
        float dist = length(vWorld - cameraPosition);
        float fog = smoothstep(1100.0, 3600.0, dist);
        float sunCol = exp(-pow(vWorld.x / 1000.0, 2.0));
        vec3 horizon = mix(vec3(0.13, 0.04, 0.16), vec3(0.85, 0.28, 0.28), sunCol);
        color = mix(color, horizon, fog);

        gl_FragColor = vec4(color, 1.0);
    }
`;
export default terrainFragment;
