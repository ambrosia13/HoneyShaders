#include honey:shaders/lib/common.glsl

void frx_materialFragment() {
    vec3 warm = vec3(1.000,0.915,0.010);
    vec3 cold = vec3(0.000,0.789,1.000);

    float warmGlow = dot(frx_fragColor.rgb, warm) * 0.5 + 1.5;
    float coldGlow = dot(frx_fragColor.rgb, cold) * 0.5 + 1.5;

    float luminance = frx_luminance(frx_fragColor.rgb);

    frx_fragEmissive = max(warmGlow, coldGlow) * 100.;
}