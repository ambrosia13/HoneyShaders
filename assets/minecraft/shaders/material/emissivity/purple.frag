#include honey:shaders/lib/common.glsl

void frx_materialFragment() {
    #ifdef INBUILT_MATERIALS
        float purple = frx_luminance(frx_fragColor.rgb * vec3(4.0, 0.0, 4.0));

        frx_fragEmissive = purple;

        #ifdef RED_MOOD_TINT
            frx_fragColor.rgb = mix(frx_fragColor.rgb, vec3(1.0, 0.0, 0.0), frx_smootherstep(0.9, 1.0, frx_playerMood));
        #endif
    #endif
}

