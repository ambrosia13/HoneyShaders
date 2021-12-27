// Define bloom quality in case pipeline is not loaded
#ifndef BLOOM_QUALITY
    #define BLOOM_QUALITY 5 
#endif

#include honey:shaders/lib/external.glsl 

vec3 setupViewSpacePos(in vec2 texcoord, in float depth) {
    vec3 screenSpacePos = vec3(texcoord, depth);
    vec3 clipSpacePos = screenSpacePos * 2.0 - 1.0;
    vec4 temp = frx_inverseViewProjectionMatrix * vec4(clipSpacePos, 1.0);
    return temp.xyz / temp.w;
}
// vec3 getReflectionVector(in vec2 texcoord, in float depth, in vec3 normal) {
//     vec3 screenSpacePos = vec3(texcoord, depth);
//     vec3 clipSpacePos = screenSpacePos * 2.0 - 1.0;
//     vec4 temp = frx_inverseViewProjectionMatrix * vec4(clipSpacePos, 1.0);
//     vec4 reflectedViewPos = vec4(reflect(temp.xyz, normal), 1.0);
//     vec3 reflectedClipSpacePos = (frx_viewProjectionMatrix * reflectedViewPos).xyz;
//     return reflectedClipSpacePos * 0.5 + 0.5;
// }

void clamp01(inout float a) {
    a = clamp(a, 0.0, 1.0);
}
void clamp01(inout vec2 a) {
    a = clamp(a, vec2(0.0), vec2(1.0));
}
void clamp01(inout vec3 a) {
    a = clamp(a, vec3(0.0), vec3(1.0));
}
// float clamp01(in float a) {
//     return clamp(a, 0.0, 1.0);
// }
// vec2 clamp01(in vec2 a) {
//     return clamp(a, vec2(0.0), vec2(1.0));
// }
// vec3 clamp01(in vec3 a) {
//     return clamp(a, vec3(0.0), vec3(1.0));
// }


float getGaussianWeights(in float val, in float center, in float height, in float width) {
    float n = -1.0 * (val - center) * (val - center);
    float d = 2.0 * width * width;
    float a = height * exp(n / d);
    return a;
}

vec3 getTimeOfDayFactors() {
    float nightFactor = frx_worldIsMoonlit == 1.0 ? 1.0 : 0.0;
    nightFactor *= frx_skyLightTransitionFactor;
    float dayFactor = frx_worldIsMoonlit == 0.0 ? 1.0 : 0.0;
    dayFactor *= frx_skyLightTransitionFactor;
    float sunsetFactor = 1.0 - frx_skyLightTransitionFactor;

    return vec3(dayFactor, nightFactor, sunsetFactor);
}

#include honey:shaders/lib/fog.glsl 

// vec4 blur(in sampler2D image, in vec2 coord, in float radius, in vec2 direction) {
//     float weight = 0.1;
//     vec4 color;
//     float dst = radius / BLOOM_QUALITY; 
//     for(int i = -BLOOM_QUALITY; i < BLOOM_QUALITY; i++) {
//         color += texture(image, coord + (direction * float(i) * radius) / vec2(frx_viewWidth, frx_viewHeight));
//         weight += getGaussianWeights(float(i), 0.0, 1.0, 1.0);
//     }
//     return color / weight;
// }

vec3 getSunVector() {
    vec3 sun = frx_worldIsMoonlit == 0 ? frx_skyLightVector : -frx_skyLightVector;
    return sun;
}
vec3 getMoonVector() {
    vec3 moon = frx_worldIsMoonlit == 1 ? frx_skyLightVector : -frx_skyLightVector;
    return moon;
}

