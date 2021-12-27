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
layout(location = 3) out vec4 fragLight;

void frx_pipelineFragment() {
    vec4 color = frx_fragColor;
    vec4 unshadedColor = color;

    // -------
    // Vanilla lighting - todo: support things like lightmap tinting, etc
    // -------
    #ifdef VANILLA_LIGHTING
        float minCaveLight = MIN_CAVE_LIGHT;
        float minSkyLight = MIN_SKY_LIGHT;
        float handheldLightIntensity = HANDHELD_LIGHT_INTENSITY;
        vec3 torchColor = vec3(1.2, 0.9, 0.7);
        float torchStrength = 5.0;

        float netherOrEnd = clamp(float(frx_worldIsNether + frx_worldIsEnd), 0.0, 1.0);
        minCaveLight = mix(minCaveLight, 0.65, netherOrEnd);
        minSkyLight = mix(minSkyLight, 0.65, netherOrEnd);
        torchStrength = mix(torchStrength, 2.0, netherOrEnd);
        handheldLightIntensity = mix(handheldLightIntensity, handheldLightIntensity * 0.5, netherOrEnd);

        float nightVision = float(frx_effectNightVision);
        minCaveLight = mix(minCaveLight, 0.9, nightVision);
        minSkyLight = mix(minSkyLight, 0.9, nightVision);
        torchStrength = mix(torchStrength, 1.5, nightVision);
        handheldLightIntensity = mix(handheldLightIntensity, handheldLightIntensity * 0.2, nightVision);

        vec3 lightmap = vec3(1.0);
        vec3 ldata = frx_fragLight;
        vec3 tdata = getTimeOfDayFactors();

        lightmap = mix(lightmap * minCaveLight, lightmap, ldata.y);
        float temp = 1.0 - minSkyLight;
        lightmap = mix(lightmap, lightmap * (minSkyLight + temp / 2.0), tdata.z * ldata.y);
        lightmap = mix(lightmap, lightmap * minSkyLight, tdata.y * ldata.y);
        lightmap = mix(lightmap, lightmap * torchColor * torchStrength, max(ldata.x * (1.0 - ldata.y), ldata.x * tdata.y));
        lightmap = mix(lightmap, lightmap * DAY_BRIGHTNESS, min(ldata.y, tdata.x));
        if(frx_matDisableAo == 0) lightmap *= ldata.z;
        //lightmap = mix(lightmap, lightmap * ldata.z, 1.0 - float(frx_matDisableAo));

        float heldLightDist = frx_heldLight.w * 10.0;
        float heldLightFactor = (heldLightDist / frx_distance) * (1.0 - min((1.0 - tdata.y), ldata.y)) * (frx_smootherstep(10.0, 5.0, frx_distance));
        heldLightFactor *= dot(frx_vertex.xyz, -frx_vertexNormal.xyz) * 0.5 + 0.5;
        heldLightFactor *= handheldLightIntensity;
        //clamp01(heldLightFactor);
        vec3 heldLightColor = frx_heldLight.rgb;
        lightmap = mix(lightmap, lightmap * 2.0 * heldLightColor.rgb, max(heldLightFactor, 0.0) * (1.0 - ldata.x));

        // diffuse lighting calculation
        vec3 coloredDiffuse = vec3(diffuse * 0.5 + 0.5);
        coloredDiffuse = mix(coloredDiffuse, coloredDiffuse * vec3(0.8, 1.5, 2.0), tdata.y * frx_smootherstep(0.5, 1.0, diffuse));
        coloredDiffuse = mix(coloredDiffuse, coloredDiffuse * vec3(2.0, 1.5, 0.8), tdata.z * frx_smootherstep(0.5, 1.0, diffuse));
        coloredDiffuse = mix(coloredDiffuse, coloredDiffuse * vec3(2.0, 1.8, 1.4), tdata.x * frx_smootherstep(0.5, 1.0, diffuse));
        coloredDiffuse = mix(coloredDiffuse, vec3(1.0), 1.0 - ldata.y);
        coloredDiffuse = coloredDiffuse + 0.4;
        if(frx_matDisableDiffuse == 0) lightmap *= (coloredDiffuse);


        #ifdef RED_MOOD_TINT
            lightmap = mix(lightmap, lightmap * vec3(1.0, 0.3, 0.3), frx_smootherstep(0.9, 1.0, frx_playerMood));
        #endif
        #ifdef FIRE_RESISTANCE_TINT
            lightmap = mix(lightmap, lightmap * vec3(1.4, 1.0, 1.0), frx_effectFireResistance);
        #endif
        #ifdef WATER_BREATHING_TINT
            lightmap = mix(lightmap, lightmap * vec3(1.0, 1.0, 1.4), frx_effectWaterBreathing);
        #endif

        if(!frx_isGui || frx_isHand) color.rgb *= lightmap;
        if(frx_isGui && !frx_isHand) color.rgb *= diffuse * 0.3 + 0.8;
    #endif

    // -------
    // Vanilla effects
    // -------
    if(frx_matGlint == 1) {
        vec3 glint = texture(u_glint, (frx_texcoord + frx_renderSeconds / 15.0) * 2.0).rgb;
        glint *= glint;
        color.rgb += glint;
        frx_fragEmissive += frx_luminance(glint) * 0.5;
    }

    color.rgb = mix(color.rgb, color.rgb * vec3(1.5, 0.6, 0.6), float(frx_matHurt));
    color.rgb = mix(color.rgb, color.rgb * 10.0, float(frx_matFlash));

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
    fragData = vec4(frx_fragEmissive, frx_matDisableAo, frx_distance, 1.0); // data for other post shaders to access
    fragLight = vec4(frx_fragLight.xy, frx_fragLight.z, diffuse * 0.5 + 0.5);

    gl_FragDepth = gl_FragCoord.z;
}