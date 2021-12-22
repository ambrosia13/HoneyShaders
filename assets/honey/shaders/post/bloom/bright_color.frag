#include honey:shaders/lib/includes.glsl

uniform sampler2D u_geometry_data;
uniform sampler2D u_geometry_depth_particles;
uniform sampler2D u_geometry_depth_translucent;
uniform sampler2D u_geometry_depth_solid;
uniform sampler2D u_geometry_depth_clouds;
uniform sampler2D u_color;

in vec2 texcoord;

layout(location = 0) out vec4 brightColor;

void main() {
    vec4 color = texture(u_color, texcoord);

    float particlesDepth = texture(u_geometry_depth_particles, texcoord).r;
    float translucentDepth = texture(u_geometry_depth_translucent, texcoord).r;
    float handDepth = texture(u_geometry_depth_solid, texcoord).r;
    
    // checks for emissivity bloom 
    bool isHand = handDepth != 1.0;
    bool isSky = translucentDepth == 1.0 && particlesDepth == 1.0 && frx_worldHasSkylight == 1 && !isHand;

    //if(isSky && frx_luminance(color.rgb) > 2.0) {
    if(color.a > 10.0) {
        brightColor += color;
    }

    #if BLOOM_STYLE == 0

        float emissivity = texture(u_geometry_data, texcoord).r;
        vec4 emissive = color * emissivity;
        brightColor += emissive;

    #elif BLOOM_STYLE >= 1

        //if(!isSky) {
            float luminance = frx_luminance(frx_toneMap(color.rgb));
            brightColor += color * pow(luminance, 3.0);
            brightColor /= 2.0;
        //}

    #endif
    #if BLOOM_STYLE == 2 // both emissivity and luminance

        float emissivity = texture(u_geometry_data, texcoord).r;
        vec4 emissive = color * emissivity;
        brightColor += emissive;

    #endif

    vec3 viewSpacePos = setupViewSpacePos(texcoord, min(handDepth, min(translucentDepth, particlesDepth)));
    float dist = length(viewSpacePos) / frx_viewDistance;

    //if(frx_worldIsNether == 1) brightColor *= getNetherFogDensity(dist, true);
}