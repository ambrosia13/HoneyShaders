#include frex:shaders/api/fragment.glsl
#include frex:shaders/lib/math.glsl

void frx_materialFragment() {
    float luminance = frx_luminance(frx_fragColor.rgb);

    frx_fragEmissive = luminance;
}