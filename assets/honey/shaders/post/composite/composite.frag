#include honey:shaders/lib/includes.glsl

uniform sampler2D u_geometry_solid;
uniform sampler2D u_geometry_depth_solid;
uniform sampler2D u_geometry_translucent;
uniform sampler2D u_geometry_depth_translucent;
uniform sampler2D u_geometry_entity;
uniform sampler2D u_geometry_depth_entity;
uniform sampler2D u_geometry_weather;
uniform sampler2D u_geometry_depth_weather;
uniform sampler2D u_geometry_clouds;
uniform sampler2D u_geometry_depth_clouds;
uniform sampler2D u_geometry_particles;
uniform sampler2D u_geometry_depth_particles;
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
    vec4  geometry_solid = texture(u_geometry_solid, texcoord);
    float geometry_depth_solid = texture(u_geometry_depth_solid, texcoord).r;
    vec4  geometry_translucent = texture(u_geometry_translucent, texcoord);
    float geometry_depth_translucent = texture(u_geometry_depth_translucent, texcoord).r;
    vec4  geometry_entity = texture(u_geometry_entity, texcoord);
    float geometry_depth_entity = texture(u_geometry_depth_entity, texcoord).r;
    vec4  geometry_weather = texture(u_geometry_weather, texcoord);
    float geometry_depth_weather = texture(u_geometry_depth_weather, texcoord).r;
    vec4  geometry_clouds = texture(u_geometry_clouds, texcoord);
    float geometry_depth_clouds = texture(u_geometry_depth_clouds, texcoord).r;
    vec4  geometry_particles = texture(u_geometry_particles, texcoord);
    float geometry_depth_particles = texture(u_geometry_depth_particles, texcoord).r;
    
    vec4 sky = texture(u_sky, texcoord);
    if(geometry_depth_particles == 1.0) { 
        geometry_solid = sky;
    }

    color_layers[0] = geometry_solid;
    depth_layers[0] = geometry_depth_solid;
    active_layers = 1;

    try_insert(geometry_translucent, geometry_depth_translucent);
    try_insert(geometry_entity, geometry_depth_entity);
    try_insert(geometry_weather, geometry_depth_weather);
    //try_insert(geometry_clouds, geometry_depth_clouds);
    try_insert(geometry_particles, geometry_depth_particles);

    vec3 composite = color_layers[0].rgb;
    for (int ii = 1; ii < active_layers; ++ii) {
        composite = blend(composite, color_layers[ii]);
    }

    vec3 b;
    if(frx_luminance(geometry_translucent.rgb) != 0.0) {
        b = max(geometry_translucent.rgb, 1.0);
    }
    bool isTranslucent = frx_luminance(b) >= 1.0;
    if(isTranslucent) {
        b = geometry_solid.rgb;
    }

    compositeColor = vec4(composite, 1.0);
    translucentOnly = vec4(b.rgb, 1.0);
}
