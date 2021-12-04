#include honey:shaders/lib/common.glsl

uniform sampler2D u_translucent_depth;
uniform sampler2D u_particles_depth;

in vec2 texcoord;

layout(location = 0) out vec4 skyColor;

void main() {
    float depth = min(texture(u_translucent_depth, texcoord).r, texture(u_particles_depth, texcoord).r);

    vec3 screenSpacePos = vec3(texcoord, depth);
    vec3 clipSpacePos = screenSpacePos * 2.0 - 1.0;
    vec4 temp = frx_inverseViewProjectionMatrix * vec4(clipSpacePos, 1.0);
    vec3 viewSpacePos = (temp.xyz / temp.w);

    viewSpacePos = normalize(viewSpacePos);

    vec2 plane = viewSpacePos.xz / (viewSpacePos.y / 2.0);
    plane += frx_renderSeconds * 0.05;

    vec2 planeGrid = floor(plane);
    float cloudNoise;
    cloudNoise = step(0.4, snoise(planeGrid));

    vec3 skyCol = max(frx_fogColor.rgb * 1.2, vec3(0.2));

    float nightFactor = frx_worldIsMoonlit == 1.0 ? 1.0 : 0.0;
    nightFactor *= frx_skyLightTransitionFactor;
    float dayFactor = frx_worldIsMoonlit == 0.0 ? 1.0 : 0.0;
    dayFactor *= frx_skyLightTransitionFactor;
    float sunsetFactor = 1.0 - frx_skyLightTransitionFactor;

    vec3 sunColor = vec3(2.0, 1.6, 0.4) * 1.0;
    sunColor = mix(sunColor, vec3(0.3, 0.8, 1.8) * 1.5, nightFactor);
    sunColor = mix(sunColor, skyCol, sunsetFactor);

    skyCol = mix(skyCol, vec3(0.1, 0.4, 0.7), nightFactor);
    vec3 skyColNight = skyCol * skyCol;
    vec3 skyColDay = skyCol.rgb * skyCol.rgb * skyCol.rgb * skyCol.rgb * skyCol.rgb * skyCol.rgb * skyCol.rgb * skyCol.rgb * skyCol.rgb * skyCol.rgb - 0.2;
    vec3 upSkyCol = mix(skyColNight, skyColDay, dayFactor);

    float sun = frx_worldIsMoonlit == 0.0 ? dot((viewSpacePos), frx_skyLightVector) * 0.5 + 0.5 : dot((viewSpacePos), -frx_skyLightVector) * 0.5 + 0.5;
    float moon = frx_worldIsMoonlit == 0.0 ? dot((viewSpacePos), -frx_skyLightVector) * 0.5 + 0.5 : dot((viewSpacePos), frx_skyLightVector) * 0.5 + 0.5;

    sun = smoothstep(0.8, 2.0, sun);
    moon = smoothstep(0.8, 2.0, moon);
    
    skyColor.rgb = mix(skyCol.rgb, upSkyCol.rgb, dot(viewSpacePos, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5);

    // horizon
    skyColor.rgb = mix(skyColor.rgb, skyCol.rgb, 1.0 - frx_smootherstep(-0.5, 0.5, viewSpacePos.y));
    skyColor.rgb = mix(skyColor.rgb, sunColor.rgb, smoothstep(0.8, 1.3, dot((viewSpacePos), frx_skyLightVector) * 0.5 + 0.5));

    skyColor.rgb += sun * vec3(0.970,0.846,0.289);
    skyColor.rgb += moon * vec3(0.010,0.495,0.970);
    skyColor.rgb += vec3(frx_noise2d(plane * 20.0)) / 50.0;

    vec3 skyColorCloud = mix(skyColor.rgb, skyColor.rgb * vec3(1.2 * cloudNoise), cloudNoise);
    skyColor.rgb = mix(skyColor.rgb, skyColorCloud, frx_smootherstep(0.0, 0.3, viewSpacePos.y));

    // end sky
    vec3 spaceColor = vec3(0.4, 0.2, 0.4);
    spaceColor = mix(spaceColor, vec3(0.25, 0.1, 0.25), abs(dot(viewSpacePos, vec3(1.0))));
    spaceColor += vec3(frx_noise2d(viewSpacePos.xz)) / 6.0;

    if(frx_worldIsOverworld == 1) {
        skyColor = vec4(skyColor.rgb, 1.0);
    } else if(frx_worldIsEnd == 1) {
        skyColor = vec4(spaceColor.rgb, 1.0);
    } else skyColor = frx_fogColor;
}