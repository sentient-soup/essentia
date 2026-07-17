// Screen-space sky: rendered as a fullscreen triangle behind the terrain.
export const skyVertex = /*glsl*/ `
    void main() {
        gl_Position = vec4(position.xy, 1.0, 1.0);
    }
`;

export const skyFragment = /*glsl*/ `
    uniform float time;
    uniform float scroll;
    uniform vec2 resolution;
    uniform vec2 pointer;

    float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
        vec2 uv = gl_FragCoord.xy / resolution;
        float aspect = resolution.x / resolution.y;
        // Slight parallax from the mouse.
        uv += pointer * vec2(-0.015, -0.01);

        // Layered sunset gradient: night at the top, fire at the horizon.
        // The terrain skyline sits around uv.y 0.5 at screen center, so the
        // visible bands live in the upper half.
        vec3 top = vec3(0.015, 0.010, 0.060);
        vec3 mid = vec3(0.230, 0.050, 0.280);
        vec3 hor = vec3(0.900, 0.300, 0.220);
        vec3 sky = mix(hor, mid, smoothstep(0.50, 0.80, uv.y));
        sky = mix(sky, top, smoothstep(0.78, 0.99, uv.y));

        // The sun, setting into the notch between the mountains.
        vec2 sunPos = vec2(0.5, 0.62);
        vec2 p = uv - sunPos;
        p.x *= aspect;
        float d = length(p);
        float radius = 0.14;
        float aa = fwidth(d);
        float disc = smoothstep(radius + aa, radius - aa, d);

        // Retro stripes: gaps widen toward the bottom of the sun and drift.
        float stripes = sin(uv.y * 160.0 + time * 0.6);
        float cutoff = mix(1.05, -1.2,
            smoothstep(sunPos.y - radius, sunPos.y + radius * 0.5, uv.y));
        float cut = smoothstep(cutoff - 0.15, cutoff + 0.15, stripes);
        disc *= cut;

        vec3 sunTop = vec3(1.00, 0.85, 0.45);
        vec3 sunBot = vec3(0.95, 0.25, 0.42);
        vec3 sunColor = mix(sunBot, sunTop,
            smoothstep(sunPos.y - radius, sunPos.y + radius, uv.y));

        // Layered glow: tight hot core plus a wide soft wash. Inside the sun
        // area the glow follows the stripe gaps so the cuts stay crisp.
        float glow = exp(-d * d * 18.0) * 0.35 + exp(-d * 2.5) * 0.15;
        glow *= mix(1.0, 0.45 + 0.55 * cut,
            smoothstep(radius + 0.05, radius - 0.02, d));

        // Twinkling stars, fading out near the horizon and the sun.
        vec2 sUv = vec2(uv.x * aspect, uv.y);
        vec2 cell = floor(sUv * 90.0);
        vec2 cellUv = fract(sUv * 90.0) - 0.5;
        float h = hash(cell);
        vec2 offset = (vec2(hash(cell + 7.0), hash(cell + 13.0)) - 0.5) * 0.6;
        float star = smoothstep(0.20, 0.0, length(cellUv - offset));
        float twinkle = 0.55 + 0.45 * sin(time * (1.5 + h * 3.0) + h * 40.0);
        star *= step(0.93, h) * smoothstep(0.62, 0.90, uv.y) * twinkle;
        star *= 1.0 - smoothstep(0.0, 0.8, glow);

        // Sun replaces the sky rather than adding to it, so it never blows
        // out to white; glow and stars stay additive but dimmed by the disc.
        vec3 color = mix(sky, sunColor, disc)
            + vec3(1.0, 0.45, 0.35) * glow * (1.0 - disc * 0.75)
            + vec3(0.9, 0.9, 1.0) * star;

        gl_FragColor = vec4(color, 1.0);
    }
`;
