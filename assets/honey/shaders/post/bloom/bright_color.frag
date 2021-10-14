#include honey:shaders/lib/common.glsl

uniform sampler2D u_emissive;
uniform sampler2D u_particles_depth;
uniform sampler2D u_translucent_depth;
uniform sampler2D u_main_depth;
uniform sampler2D u_clouds_depth;
uniform sampler2D u_color;

in vec2 texcoord;

out vec4 fragColor;

void main() {
    vec4 emissive = texture2D(u_emissive, texcoord);
    float particlesDepth = texture2D(u_particles_depth, texcoord).r;
    float translucentDepth = texture2D(u_translucent_depth, texcoord).r;
    float handDepth = texture2D(u_main_depth, texcoord).r;
    float cloudsDepth = texture2D(u_clouds_depth, texcoord).r;
    vec4 color = texture2D(u_color, texcoord);
    color.a = 1.0;
    vec4 brightColor;

    // emissive -= (1.0 - handDepth);
    // emissive = clamp(emissive, 0.0, 1.0);
    // emissive += ((1.0 - handDepth) * color.rgb);

    float sunLightIlluminance = SUNLIGHT_EMISSIVITY;
    float moonLightIlluminance = MOONLIGHT_EMISSIVITY;
    float blockLightIlluminance = frx_fragEmissive;

    #ifdef SMART_SUNLIGHT_BLOOM
    float sunView = (dot(frx_cameraView, frx_skyLightVector) * 0.5 + 0.5);
    sunLightIlluminance *= clamp(1.0 - sunView, 0.005, 0.1);
    #endif

    //I'm getting headaches so I do this but it still doesn't work properly :(
    bool isCloud = cloudsDepth != 1.0 && cloudsDepth != 0.0;
    bool isPlayer = particlesDepth <= 0.1;
    bool isHand = handDepth != 1.0;
    bool isTerrain = translucentDepth != 1.0 && particlesDepth != 1.0 && !isPlayer && !isHand;
    bool isSky = translucentDepth == 1.0 && particlesDepth == 1.0 && frx_worldHasSkylight == 1 && !isCloud && !isPlayer && !isHand;

    if(isSky) {
        //only targetting the sky for bloom threshold
        if(frx_worldIsMoonlit == 0.0) {
            brightColor += vec4(2.0, 1.2, 0.4, 1.0) * frx_smootherstep(0.89, 0.9, frx_luminance(color.rgb));
            brightColor *= sunLightIlluminance;
        }
        //lower threshold during night (todo: smooth this out)
        if(frx_worldIsMoonlit == 1.0) {
            brightColor += vec4(0.3, 0.7, 2.0, 1.0) * frx_smootherstep(0.4, 0.6, frx_luminance(color.rgb));
            brightColor *= moonLightIlluminance;
        }
        emissive = vec4(0.0);
    }

    vec3 handColor = color.rgb * (1 - handDepth) * frx_fragEmissive;

    if(isHand) {
        if(frx_luminance(emissive.rgb) == 0.0) {
            emissive.rgb = vec3(0.0);
        }
        brightColor.rgb += (emissive.rgb) + handColor; //handbloom
    }
    if(isTerrain) {
        brightColor += emissive; //terrain bloom
    }
    if(isPlayer) {
        brightColor = vec4(0.0); //tried to prevent entity bloom on sky but not working :(
    }

    fragColor = brightColor;
}