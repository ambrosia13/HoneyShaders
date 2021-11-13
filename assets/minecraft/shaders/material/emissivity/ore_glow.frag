#include honey:shaders/lib/common.glsl

void frx_materialFragment() {
    //float luminance = frx_luminance(frx_fragColor.rgb);
    float luminance = 0.0;

    bool goldCheck = frx_fragColor.r > 0.6 && frx_fragColor.g > 0.6 && frx_fragColor.r > frx_fragColor.b && frx_fragColor.g > frx_fragColor.b;
    bool diamondLapisCheck = frx_fragColor.b > frx_fragColor.r && frx_fragColor.b > frx_fragColor.r && frx_fragColor.b > 0.53;
    bool emeraldCheck = frx_fragColor.g > frx_fragColor.r && frx_fragColor.g > frx_fragColor.b && frx_fragColor.g > 0.45;
    bool redstoneCheck = frx_fragColor.r > frx_fragColor.g && frx_fragColor.r > frx_fragColor.b && frx_fragColor.r > 0.58;

    if(goldCheck || diamondLapisCheck || emeraldCheck || redstoneCheck) {
        luminance = 1.0;
    }

    frx_fragEmissive = luminance;
    frx_fragColor += frx_fragEmissive * 0.25;
}