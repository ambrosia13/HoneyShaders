#include honey:shaders/lib/includes.glsl

void frx_materialFragment() {
    float luminance = frx_luminance(frx_fragColor.rgb);

    frx_fragEmissive = luminance * luminance;
    frx_fragEnableAo = false;
    frx_fragEnableDiffuse = false;

    frx_fragColor += frx_fragEmissive * 0.25;
}