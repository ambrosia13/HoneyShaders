#include honey:shaders/lib/includes.glsl

uniform sampler2D u_fragment_data;
uniform sampler2D u_particles_depth;
uniform sampler2D u_translucent_depth;
uniform sampler2D u_main_depth;
uniform sampler2D u_clouds_depth;
uniform sampler2D u_color;
uniform sampler2D u_lut;

in vec2 texcoord;

layout(location = 0) out vec4 brightColor;

void main() {
    vec4 color = texture(u_color, texcoord);

    float particlesDepth = texture(u_particles_depth, texcoord).r;
    float translucentDepth = texture(u_translucent_depth, texcoord).r;
    float handDepth = texture(u_main_depth, texcoord).r;
    
    // checks for emissivity bloom 
    bool isHand = handDepth != 1.0;
    bool isSky = translucentDepth == 1.0 && particlesDepth == 1.0 && frx_worldHasSkylight == 1 && !isHand;

    //if(isSky && frx_luminance(color.rgb) > 2.0) {
    if(color.a > 1.0) {
        brightColor += color;
    }

    #if BLOOM_STYLE == 0

        float emissivity = texture(u_fragment_data, texcoord).r;
        vec4 emissive = color * emissivity;
        brightColor += emissive;

    #elif BLOOM_STYLE >= 1

        if(!isSky) {
            float temp = pow(min(frx_luminance(color.rgb), 0.99), 1.0) / 4.0;
            vec4 luminance = color * frx_smootherstep(0.0, 2.0, temp);
            brightColor += luminance;
        }

    #elif BLOOM_STYLE == 2 // both - kind of ugly

        float emissivity = texture(u_fragment_data, texcoord).r;
        vec4 emissive = color * emissivity;
        brightColor += emissive;

    #endif
}