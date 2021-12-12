#include honey:shaders/lib/includes.glsl

void frx_materialFragment() {
    float luminance = frx_luminance(frx_fragColor.rgb);
    if(frx_fragColor.b > frx_fragColor.g && frx_fragColor.b > frx_fragColor.r) { // soul torch
        luminance = 1.0;
    } else if(frx_fragColor.r > 0.65 && frx_fragColor.r > frx_fragColor.g * 2.5 && frx_fragColor.r > frx_fragColor.b * 2.5) { // redstone torch
        luminance = 1.0;
    }
    frx_fragEmissive = step(0.6, luminance);
    frx_fragColor += frx_fragEmissive * 0.25;
    frx_fragColor = mix(frx_fragColor, frx_fragColor * frx_fragColor, frx_fragEmissive);
}