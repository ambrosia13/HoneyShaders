#include honey:shaders/lib/common.glsl

uniform sampler2D u_composite;
uniform sampler2D u_main_depth;
uniform sampler2D u_main_color;
uniform sampler2D u_sky;
uniform sampler2D u_fragment_data;
uniform sampler2D u_translucent_depth;
uniform sampler2D u_particles_depth;

in vec2 texcoord;

layout(location = 0) out vec4 compositeHand;

void main() {
    vec4 composite = texture(u_composite, texcoord);
    float handDepth = texture(u_main_depth, texcoord).r;
    vec4 color = texture(u_main_color, texcoord);
    float depth = min(texture(u_particles_depth, texcoord).r, texture(u_translucent_depth, texcoord).r);
    depth = min(handDepth, depth);

    // combining the composite color with hand color for other programs to sample

    if(handDepth != 1.0) {
        handDepth = 0.0;
    }

    handDepth = 1.0 - handDepth;

    composite -= handDepth * 100.0;
    composite.rgb = max(vec3(0.0), composite.rgb);

    color -= (1.0 - handDepth) * 100.0;
    color.rgb = max(vec3(0.0), color.rgb);

    composite += color;

    vec4 skyCol = min(texture(u_sky, texcoord), vec4(1.0));
    float dist = texture(u_fragment_data, texcoord).b;

    float nightFactor = frx_worldIsMoonlit == 1.0 ? 1.0 : 0.0;
    nightFactor *= frx_skyLightTransitionFactor;
    float dayFactor = frx_worldIsMoonlit == 0.0 ? 1.0 : 0.0;
    dayFactor *= frx_skyLightTransitionFactor;
    float sunsetFactor = 1.0 - frx_skyLightTransitionFactor;

    float fogFactor = frx_smootherstep(0.0, 1.0, dist);
    fogFactor += 0.5 * frx_smootherstep(0.0, 1.0, nightFactor); // denser fog at night
    fogFactor += 0.75 * frx_smootherstep(0.0, 1.0, sunsetFactor); // denser fog at sunrise/sunset
    fogFactor += -0.3 * frx_smootherstep(0.0, 1.0, dayFactor);
    fogFactor = max(fogFactor, 0.0);

    if(depth != 1.0) composite.rgb = mix(composite.rgb, skyCol.rgb, 1.0 - exp(-fogFactor));

    vec3 screenPos = vec3(texcoord, depth);
    vec3 clipPos = screenPos * 2.0 - 1.0;
    vec4 tmp = frx_inverseViewProjectionMatrix * vec4(clipPos, 1.0);
    vec3 viewPos = normalize(tmp.xyz / tmp.w);

    float sun;
    if(frx_worldIsMoonlit != 1.0) {
        sun = dot((viewPos), frx_skyLightVector) * 0.5 + 0.5;
    } else sun = dot((viewPos), -frx_skyLightVector) * 0.5 + 0.5;

    float moon;
    if(frx_worldIsMoonlit == 1.0) {
        moon = dot((viewPos), frx_skyLightVector) * 0.5 + 0.5;
    } else moon = dot((viewPos), -frx_skyLightVector) * 0.5 + 0.5;
    
    //sun = step(0.9995, sun) * 5.0 + step(0.9995, moon) * 2.5;
    sun = step(0.9995, sun);
    moon = step(0.9996, moon);
    vec3 sunCol = sun * vec3(1.8, 1.2, 0.4) * SUNLIGHT_EMISSIVITY;
    vec3 moonCol = moon * vec3(0.3, 0.8, 1.8) * MOONLIGHT_EMISSIVITY;

    if(depth == 1.0 && frx_worldIsOverworld == 1) composite.rgb += sunCol + moonCol;

    compositeHand = composite;
}