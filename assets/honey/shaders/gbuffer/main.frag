#include honey:shaders/lib/common.glsl 

uniform sampler2D u_glint;
uniform sampler2D u_shadowmap;
uniform sampler2D u_fog_density;

#ifdef VANILLA_LIGHTING
in float diffuse;
#endif
in vec2 faceUV;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 fragData;
layout(location = 2) out vec4 fragLight;

void frx_pipelineFragment() {
    vec4 color = frx_fragColor;
    vec4 emissive_color = color;

    // vanilla lighting
    #ifdef VANILLA_LIGHTING
        vec3 lightmap = texture(frxs_lightmap, vec2(frx_fragLight.x, frx_fragLight.y)).rgb;

        // handheld light
        vec3 heldLightColor = frx_heldLight.rgb;
        float heldLightDist = frx_heldLight.a * 15.0;
        // if(frx_distance <= heldLightDist && !frx_isGui || frx_isHand) {
        //     vec3 heldLightTemp = heldLightColor * 1.0 - frx_smootherstep(10.0, 15.0, frx_distance);
        //     lightmap = mix(lightmap, max(heldLightTemp, frx_fragLight.y), 1.0 - frx_smootherstep(0.0, 15.0, frx_distance));
        // }
        //lightmap = mix(lightmap, heldLightColor, 1.0 - smoothstep(heldLightDist / 2.0, heldLightDist, frx_distance));
        vec3 heldLightTemp = (heldLightColor * (1.0 - smoothstep(heldLightDist / 2.0, heldLightDist, frx_distance)));
        if(!frx_isGui || frx_isHand) lightmap += heldLightTemp / 2.0;

        lightmap = max(lightmap, 0.3);

        if(frx_fragEnableAo) lightmap.rgb *= frx_fragLight.z;
        if(frx_fragEnableDiffuse) lightmap.rgb *= diffuse;

        #ifdef RED_MOOD_TINT
            lightmap.rgb = mix(lightmap.rgb, vec3(lightmap.r * 0.8, 0.0, 0.0), frx_smootherstep(0.9, 1.0, frx_playerMood)); // red lightmap when spooky sound
        #endif

        #ifdef FIRE_RESISTANCE_TINT
            if(frx_effectFireResistance == 1 && !frx_isGui) {
                lightmap.r *= 1.5;
            }
        #endif

        #ifdef WATER_BREATHING_TINT
            if(frx_effectWaterBreathing == 1 && !frx_isGui) {
                lightmap.b *= 1.5;
            }
        #endif

        if(!frx_isGui || frx_isHand) lightmap *= vec3(1.8, 1.5, 1.2);

        color.rgb *= lightmap;
    #endif

    // vanilla effects
    vec4 glint = texture(u_glint, (frx_texcoord + frx_renderSeconds / 15.0) * 1.5);
    vec4 hurt = vec4(1.5, 0.6, 0.6, 1.0);
    vec4 flash = vec4(1.0, 1.0, 1.0, 0.1);

    if(frx_matGlint() == 1.0) {
        color.rgb += glint.rgb;
        frx_fragEmissive += frx_luminance(glint.rgb) * 0.5;
    }

    if(frx_matHurt()) {
        color *= hurt;
    }

    if(frx_matFlash()) {
        color += flash / 3.0;
    }

    // apply emissivity
    color.rgb = mix(color.rgb, emissive_color.rgb, frx_fragEmissive);

    float outDistance = frx_distance / frx_viewDistance; // normalize block distance
    
    // outputs
    fragColor = color;
    fragData = vec4(frx_fragEmissive, 0.0, outDistance, 1.0); // data for other post shaders to access
    fragLight = vec4(frx_fragLight, diffuse);

    gl_FragDepth = gl_FragCoord.z;
}