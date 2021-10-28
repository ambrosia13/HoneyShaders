#include frex:shaders/api/fragment.glsl
#include frex:shaders/lib/math.glsl

void frx_materialFragment() {
    float luminance = frx_luminance(frx_fragColor.rgb);
    float blue = frx_luminance(frx_fragColor.rgb * vec3(0.0, 0.0, 1.0));

    frx_fragEmissive = max(frx_smootherstep(0.6, 0.7, luminance), blue);
}