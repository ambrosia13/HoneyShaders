#include honey:shaders/lib/includes.glsl

void frx_materialFragment() {
    float luminance = 0.0;

    if(frx_fragColor.r > frx_fragColor.b && frx_fragColor.g > frx_fragColor.b && frx_fragColor.r > 0.5 && frx_fragColor.g > 0.7) {
        luminance = 1.0;
    }

    frx_fragEmissive = step(0.6, luminance);
    frx_fragColor += frx_fragEmissive * 0.25;
    frx_fragColor = mix(frx_fragColor, frx_fragColor * frx_fragColor, frx_fragEmissive);
}