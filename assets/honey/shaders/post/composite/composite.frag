#include honey:shaders/lib/common.glsl

uniform sampler2D u_main_color;
uniform sampler2D u_main_depth;
uniform sampler2D u_translucent_color;
uniform sampler2D u_translucent_depth;
uniform sampler2D u_entity_color;
uniform sampler2D u_entity_depth;
uniform sampler2D u_weather_color;
uniform sampler2D u_weather_depth;
uniform sampler2D u_clouds_color;
uniform sampler2D u_clouds_depth;
uniform sampler2D u_particles_color;
uniform sampler2D u_particles_depth;

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

in vec2 texcoord;

out vec4 fragColor;

void main() {
    vec4  main_color = texture2D(u_main_color, texcoord);
    float main_depth = texture2D(u_main_depth, texcoord).r;
    vec4  translucent_color = texture2D(u_translucent_color, texcoord);
    float translucent_depth = texture2D(u_translucent_depth, texcoord).r;
    vec4  entity_color = texture2D(u_entity_color, texcoord);
    float entity_depth = texture2D(u_entity_depth, texcoord).r;
    vec4  weather_color = texture2D(u_weather_color, texcoord);
    float weather_depth = texture2D(u_weather_depth, texcoord).r;
    vec4  clouds_color = texture2D(u_clouds_color, texcoord);
    float clouds_depth = texture2D(u_clouds_depth, texcoord).r;
    vec4  particles_color = texture2D(u_particles_color, texcoord);
    float particles_depth = texture2D(u_particles_depth, texcoord).r;

    if(frx_luminance(clouds_color.rgb) > 0.0) {
        clouds_color.a = 1.0;
    }

    color_layers[0] = main_color;
    depth_layers[0] = main_depth;
    active_layers = 1;

    try_insert(translucent_color, translucent_depth);
    try_insert(entity_color, entity_depth);
    try_insert(weather_color, weather_depth);
    try_insert(clouds_color, clouds_depth);
    try_insert(particles_color, particles_depth);

    vec3 composite = color_layers[0].rgb;
    for (int ii = 1; ii < active_layers; ++ii) {
        composite = blend(composite, color_layers[ii]);
    }

    fragColor = vec4(composite.rgb, 1.0);
}
