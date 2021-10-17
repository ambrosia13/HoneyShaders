#include frex:shaders/api/fog.glsl
#include frex:shaders/api/fragment.glsl
#include frex:shaders/api/header.glsl
#include frex:shaders/api/material.glsl
#include frex:shaders/api/player.glsl
#include frex:shaders/api/sampler.glsl
#include frex:shaders/api/view.glsl
#include frex:shaders/api/world.glsl

#include frex:shaders/lib/bitwise.glsl
#include frex:shaders/lib/color.glsl
#include frex:shaders/lib/face.glsl
#include frex:shaders/lib/math.glsl
#include frex:shaders/lib/sample.glsl
#include frex:shaders/lib/noise/noise2d.glsl
#include frex:shaders/lib/noise/classicnoise2d.glsl
#include frex:shaders/lib/noise/cellular2d.glsl

#include honey:shaders/lib/config.glsl
#include honey:shaders/lib/blur.glsl
//#include honey:shaders/lib/raytrace.glsl

uniform ivec2 frxu_size; // size of viewport
uniform int frxu_lod; // lod value of this pass

//from https://gist.github.com/sugi-cho/6a01cae436acddd72bdf
vec3 rgb2hsv(vec3 c)
{
    vec4 _K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, _K.wz), vec4(c.gb, _K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 _K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + _K.xyz) * 6.0 - _K.www);
    return c.z * mix(_K.xxx, clamp(p - _K.xxx, 0.0, 1.0), c.y);
}