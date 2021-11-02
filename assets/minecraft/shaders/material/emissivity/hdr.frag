#include honey:shaders/lib/common.glsl

// unused

void frx_materialFragment() {
    #ifdef INBUILT_MATERIALS
        vec3 warm = vec3(1.000,0.915,0.010);
        vec3 cold = vec3(0.000,0.789,1.000);

        float warmGlow = dot(frx_fragColor.rgb, warm) * 0.5 + 1.5;
        float coldGlow = dot(frx_fragColor.rgb, cold) * 0.5 + 1.5;

        float luminance = frx_luminance(frx_fragColor.rgb);

        frx_fragEmissive = max(warmGlow, coldGlow) * 100.;

        #ifdef RED_MOOD_TINT
            frx_fragColor.rgb = mix(frx_fragColor.rgb, vec3(1.0, 0.0, 0.0), frx_smootherstep(0.9, 1.0, frx_playerMood));
        #endif
    #endif
}