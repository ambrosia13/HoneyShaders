#include honey:shaders/lib/includes.glsl 

uniform sampler2D u_glint;
uniform sampler2D u_shadowmap;
uniform sampler2D u_fog_density;

#ifdef VANILLA_LIGHTING
    in float diffuse;
#endif
in vec2 faceUV;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 fragNormal;
layout(location = 2) out vec4 fragData;

//layout(location = 2) out vec4 fragLight;

void frx_pipelineFragment() {
    vec4 color = frx_fragColor;
    vec4 unshadedColor = color;

    // -------
    // Vanilla lightmap
    // -------
    #ifdef VANILLA_LIGHTING
        vec3 lightmap = texture(frxs_lightmap, frx_fragLight.xy).rgb;

        // -------
        // Handheld light cursed implementation (no spotlights yet)
        // -------
        vec3 heldLightColor = frx_heldLight.rgb;
        float heldLightDist = frx_heldLight.a * 10.0;
        vec3 heldLightTemp = (heldLightColor * (1.0 - smoothstep(heldLightDist / 2.0, heldLightDist, frx_distance)));
        if(!frx_isGui || frx_isHand) lightmap += (heldLightTemp * (dot(normalize(frx_vertex.xyz), normalize(-frx_vertexNormal)) * 0.5 + 0.5)) / (2.0 - max(getTimeOfDayFactors().y, 1.0 - frx_fragLight.y));

        // -------
        // Lighting shouldn't be too dark
        // -------
        float minLight;
        if(frx_worldIsNether == 1 || frx_worldIsEnd == 1) { minLight = 0.5; } 
        else minLight = 0.3;
        lightmap = max(lightmap, vec3(minLight));

        float fragDiffuse = diffuse * 0.3 + 0.7;

        if(frx_matDisableAo == 0) lightmap.rgb *= frx_fragLight.z;
        if(frx_matDisableDiffuse == 0) lightmap.rgb *= fragDiffuse;

        // -------
        // Tint lightmap red when spooky cave sound plays
        // -------
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

        #ifdef BRIGHT_LIGHTMAP
            // -------
            // Make lighting brighter overall
            // -------
            if(!frx_isGui || frx_isHand) lightmap *= vec3(1.8, 1.5, 1.2);
        #endif

        lightmap += frx_noise2d(frx_texcoord) / 100.0;

        color.rgb *= lightmap;
    #endif

    // -------
    // Vanilla effects
    // -------
    if(frx_matGlint == 1) {
        vec3 glint = texture(u_glint, (frx_texcoord + frx_renderSeconds / 15.0) * 1.5).rgb;
        color.rgb += glint;
        frx_fragEmissive += frx_luminance(glint) * 0.5;
    }

    if(frx_matHurt == 1) {
        color *= vec4(1.5, 0.6, 0.6, 1.0);
    }

    if(frx_matFlash == 1) {
        color += vec4(1.0, 1.0, 1.0, 0.1) / 3.0;
    }

    // -------
    // Apply emissivity
    // -------
    color.rgb = mix(color.rgb, unshadedColor.rgb, frx_fragEmissive);
    
    if(color.a == 0.0) discard;

    // -------
    // Outputs
    // -------
    fragColor = color;
    fragNormal = vec4((frx_vertexNormal * 0.5 + 0.5), 1.0);
    fragData = vec4(frx_fragEmissive, 0.0, frx_distance, 1.0); // data for other post shaders to access
    //fragLight = vec4(frx_fragLight, diffuse);

    gl_FragDepth = gl_FragCoord.z;
}