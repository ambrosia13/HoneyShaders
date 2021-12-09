#include honey:shaders/lib/includes.glsl

// --------
// Credit to supsm for all the magic numbers for the different ores
// --------

void frx_materialFragment() {
    float luminance = frx_luminance(frx_fragColor.rgb);
    float emissivity = 0.0;

    // lapis and diamond check have a lot of overlaps but whatever lol

    bool goldCheck = frx_fragColor.r > 0.6 && frx_fragColor.g > 0.25 && frx_fragColor.r > frx_fragColor.b && frx_fragColor.g > frx_fragColor.b && frx_fragColor.g - frx_fragColor.b > 0.16;
    bool diamondCheck = (frx_fragColor.b > frx_fragColor.r && frx_fragColor.b > 0.8);
    bool lapisCheck = frx_fragColor.b > frx_fragColor.g && frx_fragColor.b / frx_fragColor.r > 3.2;
    bool emeraldCheck = frx_fragColor.g > 0.95 || (frx_fragColor.g > frx_fragColor.r && frx_fragColor.g > frx_fragColor.b && frx_fragColor.g > 0.45 && frx_fragColor.g / frx_fragColor.r > 3.5);
    bool redstoneCheck = frx_fragColor.r > frx_fragColor.g * 2.0 && frx_fragColor.r > frx_fragColor.b * 2.0 && frx_fragColor.r > 0.4;
    bool ironCheck = frx_fragColor.r > frx_fragColor.g && frx_fragColor.r > frx_fragColor.b && frx_fragColor.g > frx_fragColor.b && frx_fragColor.r > 0.45 && frx_fragColor.g > 0.4 && frx_fragColor.b > 0.3 && frx_fragColor.r / frx_fragColor.b >= 1.4;
    bool copperCheck = (frx_fragColor.r > frx_fragColor.g && frx_fragColor.r > frx_fragColor.b && frx_fragColor.r > 0.75 && frx_fragColor.b > 0.25) // orange spots
        || (frx_fragColor.g > frx_fragColor.r && frx_fragColor.g > frx_fragColor.b && frx_fragColor.b > 0.35 && frx_fragColor.g > 0.4 && frx_fragColor.r < 0.36); // green spots
    bool quartzCheck = frx_fragColor.r > frx_fragColor.g && frx_fragColor.g > frx_fragColor.b && ((frx_fragColor.r + frx_fragColor.g + frx_fragColor.b) > 2.2 || (frx_fragColor.r + frx_fragColor.g + frx_fragColor.b) > 1.0 && frx_fragColor.r / frx_fragColor.b > 1.25);

    if(goldCheck || diamondCheck || lapisCheck || emeraldCheck || redstoneCheck || ironCheck || copperCheck || quartzCheck) {
        if (luminance >= 1.5) {
            emissivity = 1.0;
        } else emissivity = luminance;
    }

    frx_fragEmissive = emissivity;
}
