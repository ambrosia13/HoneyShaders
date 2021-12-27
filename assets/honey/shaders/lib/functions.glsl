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

float getExposureLuminance(sampler2D u_input) {
    #define AUTO_EXPOSURE 4
    #ifdef AUTO_EXPOSURE //todo: more efficient method probably using an array
    #if AUTO_EXPOSURE >= 1
    vec3 exposure_middle = texture(u_input, vec2(0.5)).rgb;
    float exposure_middle_l = frx_luminance(exposure_middle.rgb);
    #if AUTO_EXPOSURE >= 2
    vec3 exposure2a = texture(u_input, vec2(0.33, 0.33)).rgb;
    vec3 exposure2b = texture(u_input, vec2(0.33, 0.67)).rgb;
    vec3 exposure2c = texture(u_input, vec2(0.67, 0.33)).rgb;
    vec3 exposure2d = texture(u_input, vec2(0.67, 0.67)).rgb;
    float exposure2a_l = frx_luminance(exposure2a);
    float exposure2b_l = frx_luminance(exposure2b);
    float exposure2c_l = frx_luminance(exposure2c);
    float exposure2d_l = frx_luminance(exposure2d);
    float exposure2avg = (exposure2a_l + exposure2b_l + exposure2c_l + exposure2d_l) / 4.0;
    #if AUTO_EXPOSURE >= 3
    vec3 exposure3a = texture(u_input, vec2(0.25, 0.25)).rgb;
    vec3 exposure3b = texture(u_input, vec2(0.25, 0.50)).rgb;
    vec3 exposure3c = texture(u_input, vec2(0.25, 0.75)).rgb;
    vec3 exposure3d = texture(u_input, vec2(0.50, 0.25)).rgb;
    vec3 exposure3e = texture(u_input, vec2(0.75, 0.25)).rgb;
    vec3 exposure3f = texture(u_input, vec2(0.75, 0.50)).rgb;
    vec3 exposure3g = texture(u_input, vec2(0.75, 0.75)).rgb;
    vec3 exposure3h = texture(u_input, vec2(0.50, 0.75)).rgb;
    float exposure3a_l = frx_luminance(exposure3a);
    float exposure3b_l = frx_luminance(exposure3b);
    float exposure3c_l = frx_luminance(exposure3c);
    float exposure3d_l = frx_luminance(exposure3d);
    float exposure3e_l = frx_luminance(exposure3e);
    float exposure3f_l = frx_luminance(exposure3f);
    float exposure3g_l = frx_luminance(exposure3g);
    float exposure3h_l = frx_luminance(exposure3h);
    float exposure3avg = (exposure3a_l + exposure3b_l + exposure3c_l + exposure3d_l
                        + exposure3e_l + exposure3f_l + exposure3g_l + exposure3h_l) / 8.0;
    #if AUTO_EXPOSURE >= 4
    vec3 exposure4a = texture(u_input, vec2(0.2, 0.2)).rgb;
    vec3 exposure4b = texture(u_input, vec2(0.2, 0.4)).rgb;
    vec3 exposure4c = texture(u_input, vec2(0.2, 0.6)).rgb;
    vec3 exposure4d = texture(u_input, vec2(0.2, 0.8)).rgb;
    vec3 exposure4e = texture(u_input, vec2(0.4, 0.2)).rgb;
    vec3 exposure4f = texture(u_input, vec2(0.4, 0.4)).rgb;
    vec3 exposure4g = texture(u_input, vec2(0.4, 0.6)).rgb;
    vec3 exposure4h = texture(u_input, vec2(0.4, 0.8)).rgb;
    vec3 exposure4i = texture(u_input, vec2(0.6, 0.2)).rgb;
    vec3 exposure4j = texture(u_input, vec2(0.6, 0.4)).rgb;
    vec3 exposure4k = texture(u_input, vec2(0.6, 0.6)).rgb;
    vec3 exposure4l = texture(u_input, vec2(0.6, 0.8)).rgb;
    vec3 exposure4m = texture(u_input, vec2(0.8, 0.2)).rgb;
    vec3 exposure4n = texture(u_input, vec2(0.8, 0.4)).rgb;
    vec3 exposure4o = texture(u_input, vec2(0.8, 0.6)).rgb;
    vec3 exposure4p = texture(u_input, vec2(0.8, 0.8)).rgb;
    float exposure4a_l = frx_luminance(exposure4a);
    float exposure4b_l = frx_luminance(exposure4b);
    float exposure4c_l = frx_luminance(exposure4c);
    float exposure4d_l = frx_luminance(exposure4d);
    float exposure4e_l = frx_luminance(exposure4e);
    float exposure4f_l = frx_luminance(exposure4f);
    float exposure4g_l = frx_luminance(exposure4g);
    float exposure4h_l = frx_luminance(exposure4h);
    float exposure4i_l = frx_luminance(exposure4i);
    float exposure4j_l = frx_luminance(exposure4j);
    float exposure4k_l = frx_luminance(exposure4k);
    float exposure4l_l = frx_luminance(exposure4l);
    float exposure4m_l = frx_luminance(exposure4m);
    float exposure4n_l = frx_luminance(exposure4n);
    float exposure4o_l = frx_luminance(exposure4o);
    float exposure4p_l = frx_luminance(exposure4p);
    float exposure4avg = (exposure4a_l + exposure4b_l + exposure4c_l + exposure4d_l
                        + exposure4e_l + exposure4f_l + exposure4g_l + exposure4h_l
                        + exposure4i_l + exposure4j_l + exposure4k_l + exposure4l_l
                        + exposure4m_l + exposure4n_l + exposure4o_l + exposure4p_l) / 16.0;
    #endif
    #endif
    #endif
    float exposure_luminance = 0.0;
    #if AUTO_EXPOSURE == 1
    exposure_luminance = exposure_middle_l;
    #endif
    #if AUTO_EXPOSURE == 2
    exposure_luminance = (exposure_middle_l + exposure2a_l + exposure2b_l + exposure2c_l + exposure2d_l) / 5.0;
    #endif
    #if AUTO_EXPOSURE == 3
    exposure_luminance = (exposure_middle_l + exposure2a_l + exposure2b_l + exposure2c_l + exposure2d_l
                        + exposure3a_l + exposure3b_l + exposure3c_l + exposure3d_l
                        + exposure3e_l + exposure3f_l + exposure3g_l + exposure3h_l) / 13.0;
    #endif
    #if AUTO_EXPOSURE == 4
    exposure_luminance = (exposure_middle_l + exposure2a_l + exposure2b_l + exposure2c_l + exposure2d_l
                        + exposure3a_l + exposure3b_l + exposure3c_l + exposure3d_l
                        + exposure3e_l + exposure3f_l + exposure3g_l + exposure3h_l
                        + exposure4a_l + exposure4b_l + exposure4c_l + exposure4d_l
                        + exposure4e_l + exposure4f_l + exposure4g_l + exposure4h_l
                        + exposure4i_l + exposure4j_l + exposure4k_l + exposure4l_l
                        + exposure4m_l + exposure4n_l + exposure4o_l + exposure4p_l) / 29.0;
    #endif
    return exposure_luminance;
}