#include honey:shaders/lib/includes.glsl

uniform sampler2D u_geometry_depth_translucent;
uniform sampler2D u_geometry_depth_particles;

in vec2 texcoord;

layout(location = 0) out vec4 finalSkyColor;

void main() {
    // -------
    // Setup view space for sky
    // -------
    float depth = min(texture(u_geometry_depth_translucent, texcoord).r, texture(u_geometry_depth_particles, texcoord).r);
    vec3 viewSpacePos = setupViewSpacePos(texcoord, depth);
    viewSpacePos = normalize(viewSpacePos);

    vec3 skyColor = calculateSky(viewSpacePos);

    // if(frx_worldIsOverworld == 1) {
    //     finalSkyColor = vec4(skyColUpper.rgb, 1.0);
    // } else if(frx_worldIsEnd == 1) {
    //     finalSkyColor = vec4(spaceColor.rgb, 1.0);
    // } else finalSkyColor = frx_fogColor;
    finalSkyColor = vec4(skyColor, 1.0);
}