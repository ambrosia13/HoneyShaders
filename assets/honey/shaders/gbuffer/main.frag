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

//layout(location = 2) out vec4 fragLight;

void frx_pipelineFragment() {
    vec4 color = frx_fragColor;
    vec4 unshadedColor = color;

    // -------
    // Vanilla lighting - todo: support things like night vision, and lightmap tinting, etc
    // -------
    #ifdef VANILLA_LIGHTING
        float minCaveLight = MIN_CAVE_LIGHT;
        float minSkyLight = MIN_SKY_LIGHT;
        if(frx_worldIsNether == 1 || frx_worldIsEnd == 1) {
            minCaveLight = 0.8;
            minSkyLight = 0.8;
        }
        vec3 lightmap = vec3(1.0);
        vec3 ldata = frx_fragLight;
        vec3 tdata = getTimeOfDayFactors();
        lightmap = mix(lightmap * minCaveLight, lightmap, ldata.y);
        lightmap = mix(lightmap, lightmap * minSkyLight, tdata.y * ldata.y);
        lightmap = mix(lightmap, lightmap * vec3(4.8, 3.2, 2.8), max(ldata.x * (1.0 - ldata.y), ldata.x * (1.0 - tdata.x)));
        lightmap = mix(lightmap, lightmap * DAY_BRIGHTNESS, min(ldata.y, tdata.x));
        if(frx_matDisableAo == 0) lightmap *= ldata.z;
        if(frx_matDisableDiffuse == 0) lightmap *= diffuse * 0.3 + 0.7;

        float heldLightDist = frx_heldLight.w * 10.0;
        float heldLightFactor = (heldLightDist / frx_distance) * (1.0 - min((1.0 - tdata.y), ldata.y)) * (1.0 - frx_smootherstep(7.0, 12.0, frx_distance));
        heldLightFactor *= dot(frx_vertex.xyz, -frx_vertexNormal.xyz) * 0.5 + 0.5;
        heldLightFactor *= HANDHELD_LIGHT_INTENSITY;
        //clamp01(heldLightFactor);
        lightmap = mix(lightmap, lightmap * 2.0 * frx_heldLight.rgb, max(heldLightFactor, 0.0));

        if(!frx_isGui || frx_isHand) color.rgb *= lightmap;
        if(frx_isGui && !frx_isHand) color.rgb *= diffuse * 0.3 + 0.7;
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
    fragData = vec4(frx_fragEmissive, frx_matDisableAo, frx_distance, frx_matDisableDiffuse); // data for other post shaders to access
    fragLight = vec4(frx_fragLight.xy, frx_fragLight.z, diffuse * 0.5 + 0.5);

    gl_FragDepth = gl_FragCoord.z;
}