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

float queryDepth(in vec2 texcoord) {
    float handDepth = texture(u_geometry_depth_solid, texcoord).r;
    float translucentDepth = texture(u_geometry_depth_translucent, texcoord).r;
    float particlesDepth = texture(u_geometry_depth_particles, texcoord).r;

    return min(handDepth, min(translucentDepth, particlesDepth));
}

float getReflectivity(in float angle, in float f0) {
    return f0 + ((1.0 - f0) * pow(1.0 - angle, 2.0));
}

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
    vec3 normalizedView = normalize(viewSpacePos);

    #ifdef ENABLE_REFLECTIONS
        vec4 reflectColor;

        float applyReflection = float(compositeDepth != 1.0 && translucentDepth != max(translucentDepth, particlesDepth) && floor(handDepth) == 1.0);

        #ifdef RAIN_REFLECTIONS
            if(frx_rainGradient != 0 && dot(normal, vec3(0.0, 1.0, 0.0)) > 0.9) applyReflection += frx_rainGradient;
        #endif

        vec3 rView = reflect(setupCleanViewSpacePos(texcoord, compositeDepth), normal);
        rView = cleanViewSpaceToScreenSpace(rView);
        if(applyReflection > 0.0) {
            reflectColor = texture(u_prepare, rView.xy); 
        } else reflectColor = color;

        if(
            clamp(rView.xy, 0.0, 1.0) != rView.xy && applyReflection > 0.0
            //|| (queryDepth(rView.xy) < rView.z) // prevents incorrect depth of reflection sometimes, other times introduces new problems
          ) {
            reflectColor.rgb = mix(calculateSky(normalize(reflect(viewSpacePos, normal))), color.rgb, 1.0 - frx_eyeBrightness.y);
        }


        // raymarcher broken, deleted for now :(

        vec3 sun = calculateSun(normalize(reflect(viewSpacePos, 1 * normal)));
        reflectColor.rgb += sun * frx_eyeBrightness.y * 5.0;

        clamp01(applyReflection);

        if(applyReflection > 0.0) {
            float f0 = geometryData.g;
            f0 = 0.05;
            float reflectance = smoothstep(f0, 1.0 - f0, dot(normalizedView, normal) * 0.5 + 0.5);
            //float reflectivity = getReflectivity(dot(normalizedView, normal) * 0.5 + 0.5, f0);
            color.rgb = mix(color.rgb, reflectColor.rgb, reflectance);
            geometryData.r += frx_luminance(sun);
        }
    #endif

    fragColor = color;
    //fragColor.rgb = reflectColor.rgb;
}