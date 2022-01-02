#include honey:shaders/lib/includes.glsl

uniform sampler2D u_prepare;
uniform sampler2D u_geometry_data;
uniform sampler2D u_geometry_normal;
uniform sampler2D u_geometry_depth_solid;
uniform sampler2D u_geometry_depth_translucent;
uniform sampler2D u_geometry_depth_particles;

in vec2 texcoord;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out vec4 geometryData;

void main() {
    vec4 color = texture(u_prepare, texcoord);
    geometryData = texture(u_geometry_data, texcoord);
    vec3 normal = texture(u_geometry_normal, texcoord).xyz * 2.0 - 1.0;

    float handDepth = texture(u_geometry_depth_solid, texcoord).r;
    float translucentDepth = texture(u_geometry_depth_translucent, texcoord).r;
    float particlesDepth = texture(u_geometry_depth_particles, texcoord).r;

    float compositeDepth = min(handDepth, min(translucentDepth, particlesDepth));
    handDepth = floor(handDepth);

    vec3 viewSpacePos = setupViewSpacePos(texcoord, compositeDepth);
    viewSpacePos = normalize(viewSpacePos);

    #ifdef ENABLE_REFLECTIONS
        vec4 reflectColor;

        vec3 rView = reflect(setupCleanViewSpacePos(texcoord, compositeDepth), normal);
        rView = cleanViewSpaceToScreenSpace(rView);
        //if(clamp(rView.xy, 0.0, 1.0) != rView.xy) rView.xy = texcoord.xy;
        if(compositeDepth != 1.0 && translucentDepth != max(translucentDepth, particlesDepth) && floor(handDepth) == 1.0 && compositeDepth != 1.0) {
            reflectColor = texture(u_prepare, rView.xy); 
        } else reflectColor = color;

        if(clamp(rView.xy, 0.0, 1.0) != rView.xy && compositeDepth != 1.0 && translucentDepth != max(translucentDepth, particlesDepth)) {
            reflectColor.rgb = calculateSky(normalize(reflect(viewSpacePos, normal))) * frx_eyeBrightness.y;
        }
        vec3 sun = calculateSun(normalize(reflect(viewSpacePos, normal)));
        reflectColor.rgb += sun * frx_eyeBrightness.y * 5.0;
        // raymarcher broken :(

        bool applyReflection = compositeDepth != 1.0 && translucentDepth != max(translucentDepth, particlesDepth) && floor(handDepth) == 1.0;
        if(applyReflection) {
            color.rgb = mix(color.rgb, reflectColor.rgb, frx_smootherstep(0.05, 1.0, dot(viewSpacePos, normal) * 0.5 + 0.5));
            geometryData.r += frx_luminance(sun);
        }
    #endif

    fragColor = color;
}