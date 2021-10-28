#include frex:shaders/api/fragment.glsl
#include frex:shaders/lib/math.glsl

void frx_materialFragment() {
    float purple = frx_luminance(frx_fragColor.rgb * vec3(4.0, 0.0, 4.0));

    frx_fragEmissive = purple;
}

