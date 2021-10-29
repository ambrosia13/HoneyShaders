#include honey:shaders/lib/common.glsl

void frx_materialFragment() {
    #ifdef INBUILT_MATERIALS
        float luminance = frx_luminance(frx_fragColor.rgb);

        frx_fragEmissive = frx_smootherstep(0.2, 0.5, luminance);
    #endif
}

