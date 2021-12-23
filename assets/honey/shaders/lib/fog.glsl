// Included in functions.glsl

float getOverworldFogDensity(in vec3 timeFactors, in float blockDist) {
    float fogStartMin = 10.0;
    float fogFactor = 1.0 - exp(-blockDist / frx_viewDistance);

    fogFactor = mix(fogFactor, fogFactor * 1.5, timeFactors.z);
    fogFactor = mix(fogFactor, fogFactor * 1.2, timeFactors.y);
    fogFactor = mix(fogFactor, fogFactor * 0.8, timeFactors.x);

    return fogFactor;
}

float getNetherFogDensity(in float blockDist, in bool reverse) {
    float fogFactor = 1.0 - exp(-blockDist / frx_viewDistance);
    if(reverse) fogFactor = 1.0 - fogFactor;
    fogFactor *= 3.0;
    
    return fogFactor;
}

float getFogDensity(in vec3 timeFactors, in float blockDist) {
    float fogFactor = frx_smootherstep(frx_fogStart, frx_fogEnd, blockDist); // vanilla fog unless specified otherwise

    float overworldOutOfWater = clamp(float(frx_worldIsOverworld) + float(frx_playerEyeInFluid), 0.0, 1.0);
    fogFactor = mix(fogFactor, getOverworldFogDensity(timeFactors, blockDist), overworldOutOfWater);

    float netherOrEnd = clamp(float(frx_worldIsNether + frx_worldIsEnd), 0.0, 1.0);
    fogFactor = mix(fogFactor, getNetherFogDensity(blockDist, false), netherOrEnd);
    
    return fogFactor;
}