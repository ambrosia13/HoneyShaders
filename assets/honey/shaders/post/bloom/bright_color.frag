#include honey:shaders/lib/common.glsl

uniform sampler2D u_pipeline_data;
uniform sampler2D u_particles_depth;
uniform sampler2D u_translucent_depth;
uniform sampler2D u_main_depth;
uniform sampler2D u_clouds_depth;
uniform sampler2D u_color;

in vec2 texcoord;

out vec4 brightColor;

void main() {
    vec4 color = texture2D(u_color, texcoord);

    float particlesDepth = texture2D(u_particles_depth, texcoord).r;
    float translucentDepth = texture2D(u_translucent_depth, texcoord).r;
    float handDepth = texture2D(u_main_depth, texcoord).r;
    
    // skylight emissivity - same behaviour as material shaders but controlled by a threshold
    float sunLightEmissivity = SUNLIGHT_EMISSIVITY;
    float moonLightEmissivity = MOONLIGHT_EMISSIVITY;

    // checks for emissivity bloom 
    bool isHand = handDepth != 1.0;
    bool isSky = translucentDepth == 1.0 && particlesDepth == 1.0 && frx_worldHasSkylight == 1 && !isHand;
    bool isSun = false;

    if(isSky) {
        // bloom threshold for the sky only
        if(frx_worldIsMoonlit == 0.0) {
            brightColor += vec4(1.8, 1.2, 0.4, 1.1) * frx_smootherstep(0.89, 0.9, frx_luminance(color.rgb));
            brightColor *= sunLightEmissivity * frx_skyLightTransitionFactor;
        }

        // lower threshold during night
        if(frx_worldIsMoonlit == 1.0) {
            brightColor += vec4(0.3, 1.2, 1.8, 1.1) * frx_smootherstep(0.4, 0.6, frx_luminance(color.rgb));
            brightColor *= moonLightEmissivity * frx_skyLightTransitionFactor;
        }

        if(frx_luminance(brightColor.rgb) > 1.0) {
            isSun = true;
        }
    }

    #if BLOOM_STYLE == 0
        float emissivity = texture2D(u_pipeline_data, texcoord).r;
        vec4 emissive = color * emissivity;
        brightColor += emissive;
    #elif BLOOM_STYLE == 1
        brightColor.rgb += color.rgb * frx_luminance(color.rgb);

        brightColor *= brightColor;

        if(!isSun && frx_worldIsNether != 1.0) {
            brightColor *= brightColor;
            if(isSky && !isSun) {
                brightColor *= brightColor * brightColor * brightColor * brightColor * brightColor;
            }
        }
    #else // both - kind of ugly
        float emissivity = texture2D(u_pipeline_data, texcoord).r;
        vec4 emissive = color * emissivity;
        brightColor += emissive;

        brightColor.rgb += color.rgb * frx_luminance(color.rgb);

        brightColor *= brightColor;

        if(!isSun && frx_worldIsNether != 1.0) {
            brightColor *= brightColor;
            if(isSky && !isSun) {
                brightColor *= brightColor * brightColor * brightColor * brightColor * brightColor;
            }
        }
    #endif
}