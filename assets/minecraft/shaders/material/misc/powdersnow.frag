#include honey:shaders/lib/includes.glsl

void frx_materialFragment() {
    #ifdef HIGHLIGHT_POWDER_SNOW
        frx_fragColor.rgb *= vec3(0.8, 0.8, 1.0);
    #endif
}