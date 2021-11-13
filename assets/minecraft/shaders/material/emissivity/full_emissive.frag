#include honey:shaders/lib/common.glsl

void frx_materialFragment() {
    float luminance = frx_luminance(frx_fragColor.rgb);

    luminance = 1.0;

    frx_fragEmissive = step(0.6, luminance);
    frx_fragColor += frx_fragEmissive * 0.25;
}