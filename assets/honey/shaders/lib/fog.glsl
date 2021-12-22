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

    if(frx_worldIsOverworld == 1 && frx_playerEyeInFluid == 0) fogFactor = getOverworldFogDensity(timeFactors, blockDist);
    if(frx_worldIsNether == 1 || frx_worldIsEnd == 1) fogFactor = getNetherFogDensity(blockDist, false);

    return fogFactor;
}