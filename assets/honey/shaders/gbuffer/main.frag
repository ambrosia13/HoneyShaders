#include honey:shaders/lib/common.glsl 

uniform sampler2D u_glint;

#ifdef VANILLA_LIGHTING
in float diffuse;
#endif

out vec4[2] fragColor;

void frx_pipelineFragment() {
    vec4 color = frx_fragColor;
    vec4 emissive_color = color;

    #ifdef VANILLA_LIGHTING
    vec3 lightmap = texture2D(frxs_lightmap, frx_fragLight.xy).rgb;
    if(frx_fragEnableAo) {
        lightmap *= frx_fragLight.z;
    }
    color.rgb *= lightmap;

    if (frx_fragEnableDiffuse) {
        color.rgb *= diffuse;
    }
    #endif

    vec4 glint = texture2D(u_glint, (frx_texcoord + frx_renderSeconds / 15.0) * 1.5);
    vec4 hurt = vec4(1.0, 0.0, 0.0, 0.1);
    vec4 flash = vec4(1.0, 1.0, 1.0, 0.1);
    if(frx_matGlint() == 1.0) {
        color *= glint;
    }
    if(frx_matHurt()) {
        color += hurt / 3.0;
    }
    if(frx_matFlash()) {
        color += flash / 3.0;
    }

    color.rgb = mix(color.rgb, emissive_color.rgb, frx_fragEmissive);
    emissive_color *= frx_fragEmissive;

    fragColor[0] = color;
    fragColor[1] = emissive_color;

    gl_FragDepth = gl_FragCoord.z;
}