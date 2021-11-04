#include honey:shaders/lib/common.glsl

void frx_materialFragment() {
    #ifdef INBUILT_MATERIALS
        float luminance = frx_luminance(frx_fragColor.rgb);
        float blue = frx_luminance(frx_fragColor.rgb * vec3(0.0, 0.0, 8.0));

        frx_fragEmissive = max(frx_smootherstep(0.5, 0.7, luminance), blue);
        // frx_fragColor += max(frx_smootherstep(0.5, 0.7, luminance), blue);
        // note for the above: can modify fragColor/sampleColor to achieve hdr effect for emissives
        // do not set frx_fagEmissive above 1.0

        #ifdef RED_MOOD_TINT
            frx_fragColor.rgb = mix(frx_fragColor.rgb, vec3(1.0, 0.0, 0.0), frx_smootherstep(0.9, 1.0, frx_playerMood));
        #endif
    #endif
}