#include honey:shaders/lib/common.glsl 
#include canvas:shaders/pipeline/shadow.glsl

uniform sampler2D u_glint;

#ifdef VANILLA_LIGHTING
in float diffuse;
#endif
in vec2 faceUV;
in vec4 shadowPos;

out vec4 fragColor;
out vec4 emissiveColor;
out vec4 fragCopy;

void frx_pipelineFragment() {
    vec4 color = frx_fragColor;
    vec4 emissive_color = color;

    // vanilla lighting
    #ifdef VANILLA_LIGHTING
        vec3 lightmap = texture2D(frxs_lightmap, vec2(frx_fragLight.x, frx_fragLight.y)).rgb;
        if(frx_fragEnableAo) {
            lightmap *= frx_fragLight.z;
        }
    #endif

    // custom water - todo: move to material shader
    #ifdef STYLIZED_WATER
        // Foam function taken from https://www.shadertoy.com/view/ltfGD7
        // - see comment in common.glsl for proper credit
        bool isWater = frx_vertexColor.b >= 0.6 && frx_vertexColor.r <= 0.3 && frx_vertexColor.g <= 0.5;
        vec3 waterColor = vec3(0.179,0.350,0.590);
        vec2 st = vec2(faceUV.x + (sin(frx_renderSeconds / 10.0) / 20 + frx_renderSeconds / 10.0),
                                        faceUV.y + (sin(frx_renderSeconds / 10.0) / 2.0 + frx_renderSeconds / 10.0));
        float distortX = sin(faceUV.y * 1.0 + frx_renderSeconds * 0.5) * 0.2;
        float distortY = cos(faceUV.x * 1.0 + frx_renderSeconds * 0.5) * 0.2;
        vec2 distort = vec2(distortX, distortY);
        float foam = waterlayer(st * 0.5 + distort);
        vec3 water = (waterColor + foam / 4.5);
        if(isWater) {
            color.rgb = water;
        }
    #endif

    // more vanilla lighting
    #ifdef VANILLA_LIGHTING
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

    // outputs
    fragColor = color;
    emissiveColor = (emissive_color);
    fragCopy = color;

    gl_FragDepth = gl_FragCoord.z;
}