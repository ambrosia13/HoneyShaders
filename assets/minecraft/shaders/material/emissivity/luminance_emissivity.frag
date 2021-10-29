#include honey:shaders/lib/common.glsl

void frx_materialFragment() {
    #ifdef INBUILT_MATERIALS
        float luminance = frx_luminance(frx_fragColor.rgb);

        frx_fragEmissive = luminance;
    #endif
}