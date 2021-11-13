#include honey:shaders/lib/common.glsl

void frx_materialFragment() {
    float luminance = frx_luminance(frx_fragColor.rgb);

    frx_fragEmissive = luminance;
    frx_fragColor += frx_fragEmissive * 0.25;
}