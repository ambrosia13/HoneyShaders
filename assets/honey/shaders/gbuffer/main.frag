#include honey:shaders/lib/common.glsl 
#include canvas:shaders/pipeline/shadow.glsl

uniform sampler2D u_glint;
uniform sampler2D u_shadowmap;

#ifdef VANILLA_LIGHTING
in float diffuse;
#endif
in vec2 faceUV;
in vec4 shadowPos;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 fragData;
layout(location = 2) out vec4 fragLight;

#include honey:shaders/lib/shadow.glsl

void frx_pipelineFragment() {
    vec4 color = frx_fragColor;
    vec4 emissive_color = color;

    // vanilla lighting
    #ifdef VANILLA_LIGHTING
        vec4 shadowcoord = frx_shadowProjectionMatrix(selectShadowCascade()) * shadowPos;
        shadowcoord.xy = shadowcoord.xy * 0.5 + 0.5;
        float shadowFactor = sampleShadowPCF(shadowcoord.xyz, float(selectShadowCascade()));

        vec3 lightmap = texture2D(frxs_lightmap, vec2(frx_fragLight.x, frx_fragLight.y)).rgb;

        #ifdef RED_MOOD_TINT
            lightmap.rgb = mix(lightmap.rgb, vec3(1.0, 0.0, 0.0), frx_smootherstep(0.9, 1.0, frx_playerMood)); // red lightmap when spooky sound
        #endif

        if(!frx_isGui || frx_isHand) lightmap *= vec3(1.5, 1.5, 1.5) * max(diffuse, 0.8);

        // handheld light
        if(frx_distance < frx_heldLight.a * 15.0 && !frx_isGui) {
            lightmap += min(frx_heldLight.rgb * frx_smootherstep(0.0, 7.5, abs(frx_distance - frx_heldLight.a * 15.0)), 1.0) * 0.75;
            //lightmap = clamp(lightmap, 0.0, 1.0);
        }

        if(frx_fragEnableAo) {
            lightmap *= frx_fragLight.z;
        }
        
        color.rgb *= lightmap;
        //color.rgb *= max(frx_fragLight.x, frx_fragLight.y);
        //color.rgb *= frx_fragLight.z;

        // blocklight boost
        if(!frx_isGui || frx_isHand) {
            color.rgb *= vec3(0.990,0.882,0.833) * (1.0 + frx_fragLight.x);
        }

        if(frx_fragEnableDiffuse) {
            color.rgb *= diffuse;
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
    // emissivity
    color.rgb = mix(color.rgb, emissive_color.rgb * 1.0, frx_fragEmissive);

    // fog
    #if FOG_STYLE == 0

        if(frx_fogEnabled == 1) {
            float fogStart = frx_fogStart;
            float fogEnd = frx_fogEnd;
            if(frx_worldIsNether == 1) {
                fogStart = frx_viewDistance * 0.5;
                fogEnd = frx_viewDistance;
            }
            float vanillaFogFactor = frx_smootherstep(fogStart, fogEnd, frx_distance);
            color.rgb = mix(color.rgb, frx_fogColor.rgb, vanillaFogFactor); 

            frx_fragEmissive *= 1.0 - vanillaFogFactor;
        }

    #elif FOG_STYLE == 1
    
        float expFogFactor = frx_distance / frx_viewDistance;
        if(frx_worldIsNether == 0) expFogFactor *= expFogFactor;
        expFogFactor = 1.0 - exp(-expFogFactor);

        #ifdef RAINBOW_FOG
            vec3 fogCol = frx_fogColor.rgb;
            fogCol = rgb2hsv(fogCol);
            fogCol.r = sin(frx_renderSeconds) * 0.5 + 0.5;
            fogCol = hsv2rgb(fogCol);
        #else
            vec3 fogCol = frx_fogColor.rgb;
        #endif

        color.rgb = mix(color.rgb, max(fogCol.rgb, vec3(0.0)), expFogFactor);
        frx_fragEmissive *= 1.0 - expFogFactor;

    #else // both

        float expFogFactor = frx_distance / frx_viewDistance;
        if(frx_worldIsNether == 0) expFogFactor *= expFogFactor;
        expFogFactor = 1.0 - exp(-expFogFactor);

        #ifdef RAINBOW_FOG
            vec3 fogCol = frx_fogColor.rgb;
            fogCol = rgb2hsv(fogCol);
            fogCol.r = sin(frx_renderSeconds) * 0.5 + 0.5;
            fogCol = hsv2rgb(fogCol);
        #else
            vec3 fogCol = frx_fogColor.rgb;
        #endif

        color.rgb = mix(color.rgb, max(fogCol.rgb, vec3(0.0)), expFogFactor);
        if(frx_fogEnabled == 1) {
            float fogStart = frx_fogStart;
            float fogEnd = frx_fogEnd;
            if(frx_worldIsNether == 1) {
                fogStart = frx_viewDistance * 0.5;
                fogEnd = frx_viewDistance;
            }
            float vanillaFogFactor = frx_smootherstep(fogStart, fogEnd, frx_distance);
            color.rgb = mix(color.rgb, frx_fogColor.rgb, vanillaFogFactor); 

            frx_fragEmissive *= 1.0 - max(expFogFactor, vanillaFogFactor);
        }

    #endif

    float outDistance = frx_distance / frx_viewDistance; // effectively pack/normalize distance from camera by dividing by view distance
                                                         // so color format can stay non-hdr.
    
    // outputs
    fragColor = color;
    fragData = vec4(frx_fragEmissive, 0.0, outDistance, 1.0); // data for other post shaders to access
    fragLight = vec4(frx_fragLight, diffuse);

    gl_FragDepth = gl_FragCoord.z;
}