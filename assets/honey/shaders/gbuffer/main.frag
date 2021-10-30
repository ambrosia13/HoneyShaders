#include honey:shaders/lib/common.glsl 
#include canvas:shaders/pipeline/shadow.glsl

uniform sampler2D u_glint;

#ifdef VANILLA_LIGHTING
in float diffuse;
#endif
in vec2 faceUV;
in vec4 shadowPos;

out vec4 fragColor;
out vec4 fragEmissive;
out vec4 fragData;

void frx_pipelineFragment() {
    vec4 color = frx_fragColor;
    vec4 emissive_color = color;

    // vanilla lighting
    #ifdef VANILLA_LIGHTING
        vec3 lightmap = texture2D(frxs_lightmap, vec2(frx_fragLight.x, frx_fragLight.y)).rgb;
        if(frx_fragEnableAo) {
            lightmap *= frx_fragLight.z;
        }
        color.rgb *= lightmap;

        // blocklight boost
        if(!frx_isGui) {
            color.rgb *= vec3(2.0, 1.8, 1.6) * max(frx_fragLight.x, 0.5);
        }

        if(frx_fragEnableDiffuse) {
            color.rgb *= (diffuse);
        }

        #ifdef FIRE_RESISTANCE_TINT
            if(frx_effectFireResistance == 1) {
            lightmap.r *= 1.5;
            }
        #endif

        #ifdef WATER_BREATHING_TINT
            if(frx_effectWaterBreathing == 1) {
            lightmap.b *= 1.5;
            }
        #endif
    #endif

    // vanilla effects
    vec4 glint = texture2D(u_glint, (frx_texcoord + frx_renderSeconds / 15.0) * 1.5);
    vec4 hurt = vec4(1.5, 0.6, 0.6, 1.0);
    vec4 flash = vec4(1.0, 1.0, 1.0, 0.1);

    if(frx_matGlint() == 1.0) {
        color += glint;
    }

    if(frx_matHurt()) {
        color *= hurt;
    }

    if(frx_matFlash()) {
        color += flash / 3.0;
    }

    // emissive color
    color.rgb = mix(color.rgb, emissive_color.rgb * 1.0, frx_fragEmissive);
    emissive_color *= frx_fragEmissive;

    #ifdef BRIGHT_BLOOM
    if(frx_luminance(color.rgb) > 1.0) {
        frx_fragEmissive += frx_luminance(color.rgb) * frx_smootherstep(0.9, 1.5, frx_luminance(color.rgb));
    }
    #endif

    // outputs
    fragColor = color;
    fragEmissive = emissive_color;
    fragData = vec4(frx_fragEmissive, diffuse, 0.0, 1.0); // data for other post shaders to access

    gl_FragDepth = gl_FragCoord.z;
}