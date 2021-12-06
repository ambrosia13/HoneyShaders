#include honey:shaders/lib/external.glsl 

vec3 setupViewSpacePos(in vec2 texcoord, in float depth) {
    vec3 screenSpacePos = vec3(texcoord, depth);
    vec3 clipSpacePos = screenSpacePos * 2.0 - 1.0;
    vec4 temp = frx_inverseViewProjectionMatrix * vec4(clipSpacePos, 1.0);
    return temp.xyz / temp.w;
}

void clamp01(inout float a) {
    a = clamp(a, 0.0, 1.0);
}

float getGaussianWeights(float val, float center, float height, float width) {
    float n = -1.0 * (val - center) * (val - center);
    float d = 2.0 * width * width;
    float a = height * exp(n / d);
    return a;
}