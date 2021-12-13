#include honey:shaders/lib/includes.glsl

uniform sampler2D u_g_solid;
uniform sampler2D u_g_depth_solid;
uniform sampler2D u_g_translucent;
uniform sampler2D u_g_depth_translucent;
uniform sampler2D u_g_entity;
uniform sampler2D u_g_depth_entity;
uniform sampler2D u_g_weather;
uniform sampler2D u_g_depth_weather;
uniform sampler2D u_g_clouds;
uniform sampler2D u_g_depth_clouds;
uniform sampler2D u_g_particles;
uniform sampler2D u_g_depth_particles;
uniform sampler2D u_sky;

in vec2 texcoord;

layout(location = 0) out vec4 compositeColor;
layout(location = 1) out vec4 translucentOnly;

//Sorting function for fabulous layers used from transparency.fsh in vanilla shaders

#define NUM_LAYERS 6

vec4 color_layers[NUM_LAYERS];
float depth_layers[NUM_LAYERS];
int active_layers = 0;

void try_insert( vec4 color, float depth ) {
    if ( color.a == 0.0 ) {
        return;
    }

    color_layers[active_layers] = color;
    depth_layers[active_layers] = depth;

    int jj = active_layers++;
    int ii = jj - 1;
    while ( jj > 0 && depth_layers[jj] > depth_layers[ii] ) {
        float depthTemp = depth_layers[ii];
        depth_layers[ii] = depth_layers[jj];
        depth_layers[jj] = depthTemp;

        vec4 colorTemp = color_layers[ii];
        color_layers[ii] = color_layers[jj];
        color_layers[jj] = colorTemp;

        jj = ii--;
    }
}

vec3 blend( vec3 dst, vec4 src ) {
    return ( dst * ( 1.0 - src.a ) ) + src.rgb;
}

void main() {
    vec4  g_solid = texture(u_g_solid, texcoord);
    float g_depth_solid = texture(u_g_depth_solid, texcoord).r;
    vec4  g_translucent = texture(u_g_translucent, texcoord);
    float g_depth_translucent = texture(u_g_depth_translucent, texcoord).r;
    vec4  g_entity = texture(u_g_entity, texcoord);
    float g_depth_entity = texture(u_g_depth_entity, texcoord).r;
    vec4  g_weather = texture(u_g_weather, texcoord);
    float g_depth_weather = texture(u_g_depth_weather, texcoord).r;
    vec4  g_clouds = texture(u_g_clouds, texcoord);
    float g_depth_clouds = texture(u_g_depth_clouds, texcoord).r;
    vec4  g_particles = texture(u_g_particles, texcoord);
    float g_depth_particles = texture(u_g_depth_particles, texcoord).r;
    
    vec4 sky = texture(u_sky, texcoord);
    if(g_depth_particles == 1.0) { 
        g_solid = sky;
    }

    color_layers[0] = g_solid;
    depth_layers[0] = g_depth_solid;
    active_layers = 1;

    try_insert(g_translucent, g_depth_translucent);
    try_insert(g_entity, g_depth_entity);
    try_insert(g_weather, g_depth_weather);
    //try_insert(g_clouds, g_depth_clouds);
    try_insert(g_particles, g_depth_particles);

    vec3 composite = color_layers[0].rgb;
    for (int ii = 1; ii < active_layers; ++ii) {
        composite = blend(composite, color_layers[ii]);
    }

    vec3 b;
    if(frx_luminance(g_translucent.rgb) != 0.0) {
        b = max(g_translucent.rgb, 1.0);
    }
    bool isTranslucent = frx_luminance(b) >= 1.0;
    if(isTranslucent) {
        b = g_solid.rgb;
    }

    compositeColor = vec4(composite, 1.0);
    translucentOnly = vec4(b.rgb, 1.0);
}
