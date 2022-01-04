#include honey:shaders/lib/includes.glsl

void frx_materialFragment() {
    #ifndef CUSTOM_WATER
        // Foam function taken from https://www.shadertoy.com/view/ltfGD7
        // - see comment in includes.glsl for proper credit
        vec3 waterColor = vec3(0.179,0.350,0.590);
        vec2 uv = vec2(
            frx_var0.x + (sin(frx_renderSeconds / 10.0) / 20 + frx_renderSeconds / 10.0),
            frx_var0.y + (sin(frx_renderSeconds / 10.0) / 2.0 + frx_renderSeconds / 10.0)
        );
        float distortX = sin(frx_var0.y * 1.0 + frx_renderSeconds * 0.5) * 0.2;
        float distortY = cos(frx_var0.x * 1.0 + frx_renderSeconds * 0.5) * 0.2;
        vec2 distort = vec2(distortX, distortY);
        float foam = waterlayer(uv * 0.5 + distort);
        vec3 water = (waterColor + foam / 3.5);

        frx_fragColor.rgb = mix(water, frx_vertexColor.rgb, 0.5);
    #endif
    frx_fragReflectance = 1.0;
}