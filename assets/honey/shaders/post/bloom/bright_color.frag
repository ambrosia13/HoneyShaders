#include honey:shaders/lib/common.glsl

uniform sampler2D u_main_color;
uniform sampler2D u_emissive;
uniform sampler2D u_translucent_depth;
uniform sampler2D u_main_depth;
uniform sampler2D u_clouds_depth;
uniform sampler2D u_particles_depth;

in vec2 texcoord;

out vec4 fragColor;

void main() {
    vec4 color = texture2D(u_main_color, texcoord);
    vec4 emissive = texture2D(u_emissive, texcoord);
    float translucentDepth = texture2D(u_translucent_depth, texcoord).r;
    float handDepth = texture2D(u_main_depth, texcoord).r;
    float cloudsDepth = texture2D(u_clouds_depth, texcoord).r;
    float particlesDepth = texture2D(u_particles_depth, texcoord).r;
    vec4 brightColor;

    if(translucentDepth == 1.0 && handDepth == 1.0 && frx_worldHasSkylight == 1 && cloudsDepth == 1.0) {
        //only targetting the sky for bloom threshold
        if(frx_worldIsMoonlit == 0.0) {
            brightColor += vec4(1.0, 0.7, 0.4, 1.0) * frx_smootherstep(0.79, 1.0, frx_luminance(color.rgb));
        }
        //lower threshold during night
        if(frx_worldIsMoonlit == 1.0) {
            brightColor += vec4(0.2, 0.4, 1.0, 1.0) * frx_smootherstep(0.4, 0.6, frx_luminance(color.rgb));
        }
    }

    if(translucentDepth != 1.0 && particlesDepth != 1.0) {
        brightColor += emissive;
    }

    fragColor = brightColor;
}