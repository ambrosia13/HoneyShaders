#include honey:shaders/lib/common.glsl

void frx_materialFragment() {
    #ifdef STYLIZED_LAVA
        vec3 lavaColor = vec3(0.320,0.025,0.005);
        vec2 uv = vec2(
            frx_var0.x + (sin(frx_renderSeconds / 10.0) / 20 + frx_renderSeconds / 10.0),
            frx_var0.y + (sin(frx_renderSeconds / 10.0) / 2.0 + frx_renderSeconds / 10.0)
        );
        float distortX = sin(frx_var0.y * 1.0 + frx_renderSeconds * 0.5) * 0.2;
        float distortY = cos(frx_var0.x * 1.0 + frx_renderSeconds * 0.5) * 0.2;
        vec2 distort = vec2(distortX * cos(frx_renderSeconds * 0.5), distortY * sin(frx_renderSeconds * 0.5));
        float magma = snoise((uv + distort) * 0.25);
        float magma1 = snoise((uv + distort) * 0.5);
        float magma2 = snoise((uv + distort) * 1.0);
        float magma3 = snoise((uv + distort) * 1.5);
        float magma4 = snoise((uv + distort) * 2.0);
        float magma5 = snoise((uv + distort) * 2.5);

        // lower detail lava based on distance
        magma5 *= 1.0 - frx_smootherstep(25, 35, frx_distance);
        magma4 *= 1.0 - frx_smootherstep(45, 55, frx_distance);
        magma3 *= 1.0 - frx_smootherstep(70, 80, frx_distance);
        magma2 *= 1.0 - frx_smootherstep(100, 110, frx_distance);
        magma1 *= 1.0 - frx_smootherstep(135, 145, frx_distance);
        
        vec3 lava = lavaColor + vec3(
            (magma + magma1 + magma2 + magma3 + magma4 + magma5) / 2.0
            * vec3(0.995,0.415,0.084)
            );

        frx_fragColor.rgb = lava;
    #endif
    frx_fragEmissive = frx_luminance(frx_fragColor.rgb);
    frx_fragEnableDiffuse = false;
    frx_fragEnableAo = false;
}