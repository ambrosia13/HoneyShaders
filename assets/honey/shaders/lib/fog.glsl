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