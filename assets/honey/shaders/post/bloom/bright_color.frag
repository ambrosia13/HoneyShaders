#include honey:shaders/lib/common.glsl

uniform sampler2D u_emissive;
uniform sampler2D u_particles_depth;
uniform sampler2D u_translucent_depth;
uniform sampler2D u_main_depth;
uniform sampler2D u_clouds_depth;
uniform sampler2D u_color;

in vec2 texcoord;

out vec4 brightColor;

void main() {
    vec4 emissive = texture2D(u_emissive, texcoord);
    vec4 color = texture2D(u_color, texcoord);
    float particlesDepth = texture2D(u_particles_depth, texcoord).r;
    float translucentDepth = texture2D(u_translucent_depth, texcoord).r;
    float handDepth = texture2D(u_main_depth, texcoord).r;
    float cloudsDepth = texture2D(u_clouds_depth, texcoord).r;
    
    // skylight emissivity - same behaviour as material shaders but controlled by a threshold
    float sunLightIlluminance = SUNLIGHT_EMISSIVITY;
    float moonLightIlluminance = MOONLIGHT_EMISSIVITY;

    // checks for emissivity bloom 
    bool isCloud = cloudsDepth != 1.0 && cloudsDepth != 0.0;
    bool isHand = handDepth != 1.0;
    bool isTerrain = translucentDepth != 1.0 && particlesDepth != 1.0 && !isHand;
    bool isSky = translucentDepth == 1.0 && particlesDepth == 1.0 && frx_worldHasSkylight == 1 && !isHand;
    bool isSun = false;

    if(isSky) {
        // bloom threshold for the sky only
        if(frx_worldIsMoonlit == 0.0) {
            brightColor += vec4(2.0, 1.2, 0.4, 1.1) * frx_smootherstep(0.89, 0.9, frx_luminance(color.rgb));
            brightColor *= sunLightIlluminance * frx_skyLightTransitionFactor;
        }

        // lower threshold during night
        if(frx_worldIsMoonlit == 1.0) {
            brightColor += vec4(0.3, 0.7, 2.0, 1.1) * frx_smootherstep(0.4, 0.6, frx_luminance(color.rgb));
            brightColor *= moonLightIlluminance * frx_skyLightTransitionFactor;
        }

        if(frx_luminance(brightColor.rgb) > 1.0) {
            isSun = true;
        }
    }

    #if BLOOM_STYLE == 0
        if(isHand) {
            if(frx_luminance(emissive.rgb) == 0.0) {
                emissive.rgb = vec3(0.0);
            }

            brightColor.rgb += (emissive.rgb); // hand bloom
        }
        
        if(isTerrain) {
            brightColor += emissive; // terrain bloom
        }
    #elif BLOOM_STYLE == 1
        brightColor.rgb += color.rgb * frx_luminance(color.rgb);

        if(!isSun) {
            brightColor *= brightColor;
        }
    #endif
}