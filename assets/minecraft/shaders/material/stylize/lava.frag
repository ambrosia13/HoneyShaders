#include honey:shaders/lib/common.glsl

void frx_materialFragment() {
    #ifdef STYLIZED_LAVA
        vec3 lavaColor = vec3(0.525,0.110,0.105);
        vec2 uv = vec2(
            frx_var0.x + (sin(frx_renderSeconds / 10.0) / 20 + frx_renderSeconds / 10.0),
            frx_var0.y + (sin(frx_renderSeconds / 10.0) / 2.0 + frx_renderSeconds / 10.0)
        );
        float distortX = sin(frx_var0.y * 1.0 + frx_renderSeconds * 0.5) * 0.2;
        float distortY = cos(frx_var0.x * 1.0 + frx_renderSeconds * 0.5) * 0.2;
        vec2 distort = vec2(distortX, distortY);
        float magma = snoise((uv + distort) * 0.25);
        float magma1 = snoise((uv + distort) * 0.5);
        float magma2 = snoise((uv + distort) * 1.0);
        float magma3 = snoise((uv + distort) * 1.5);
        float magma4 = snoise((uv + distort) * 2.0);
        float magma5 = snoise((uv + distort) * 2.5);
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