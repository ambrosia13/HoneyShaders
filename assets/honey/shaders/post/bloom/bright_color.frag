#include honey:shaders/lib/includes.glsl

uniform sampler2D u_geometry_data;
uniform sampler2D u_geometry_data_particles;
uniform sampler2D u_geometry_data_translucent;
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
    float solidDepth = max(particlesDepth, translucentDepth);

    float handDepth = texture(u_geometry_depth_solid, texcoord).r;

    float compositeDepth = min(handDepth, min(particlesDepth, translucentDepth));
    
    // checks for emissivity bloom 
    bool isHand = handDepth != 1.0;
    bool isSky = translucentDepth == 1.0 && particlesDepth == 1.0 && frx_worldHasSkylight == 1 && !isHand;

    //if(isSky && frx_luminance(color.rgb) > 2.0) {
    if(color.a > 10.0) {
        brightColor += color;
    }

    float solidEmissive = texture(u_geometry_data, texcoord).r;
    float particlesEmissive = texture(u_geometry_data_particles, texcoord).r - (1.0 - (handDepth)) * 100.0;
    float translucentEmissive = texture(u_geometry_data_translucent, texcoord).r - (1.0 - (handDepth)) * 100.0;
    // if(solidDepth > particlesDepth) solidEmissive = 0.0; // there is a particle in front of solid terrain
    // if(translucentDepth < min(handDepth, particlesDepth)) translucentEmissive = 0.0; // there is a particle in front of translucent terrain

    #if BLOOM_STYLE == 0

        vec4 emissive = color * solidEmissive;
        emissive += color * max(particlesEmissive, 0.0);
        emissive += color * max(translucentEmissive, 0.0);
        //emissive.rgb *= frx_luminance(emissive.rgb);
        brightColor += emissive;

    #elif BLOOM_STYLE >= 1

        //if(!isSky) {
            float luminance = max(frx_luminance(frx_toneMap(color.rgb)), 0.01);
            brightColor += color * pow(luminance, 6.0);
            brightColor /= 2.0;
        //}

    #endif
    #if BLOOM_STYLE == 2 // both emissivity and luminance

        vec4 emissive = color * solidEmissive;
        brightColor += emissive;

    #endif

    vec3 viewSpacePos = setupViewSpacePos(texcoord, min(handDepth, min(translucentDepth, particlesDepth)));
    float dist = length(viewSpacePos) / frx_viewDistance;

    if(frx_worldIsNether == 1 || frx_worldIsEnd == 1) brightColor *= clamp(getNetherFogDensity(dist, true), 0.0, 1.0);
}