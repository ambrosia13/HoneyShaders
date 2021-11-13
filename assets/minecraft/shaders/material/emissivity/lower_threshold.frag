#include honey:shaders/lib/common.glsl

void frx_materialFragment() {
    float luminance = frx_luminance(frx_fragColor.rgb);
    if(frx_fragColor.b > frx_fragColor.g && frx_fragColor.b > frx_fragColor.r) {
        luminance = 1.0;
    }
    frx_fragEmissive = step(0.4, luminance);
    frx_fragColor += frx_fragEmissive * 0.25;
}