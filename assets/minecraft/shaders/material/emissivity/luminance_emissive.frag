#include honey:shaders/lib/includes.glsl

void frx_materialFragment() {
    float luminance = frx_luminance(frx_fragColor.rgb);

    frx_fragEmissive = luminance;
    frx_fragColor += frx_fragEmissive * 0.25;
    frx_fragColor = mix(frx_fragColor, frx_fragColor * frx_fragColor, frx_fragEmissive);
}