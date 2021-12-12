#include honey:shaders/lib/includes.glsl

void frx_materialFragment() {
    float luminance = frx_luminance(frx_fragColor.rgb);
    if(frx_fragColor.b > frx_fragColor.g * 1.5 && frx_fragColor.b > frx_fragColor.r * 1.5) { // for lantern
        luminance = 1.0;
    }
    frx_fragEmissive = frx_smootherstep(0.5, 0.6, luminance);
    frx_fragColor += frx_fragEmissive * 0.25;
    frx_fragColor = mix(frx_fragColor, frx_fragColor * frx_fragColor, frx_fragEmissive);
}