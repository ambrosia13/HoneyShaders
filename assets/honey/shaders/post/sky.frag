#include honey:shaders/lib/includes.glsl

uniform sampler2D u_translucent_depth;
uniform sampler2D u_particles_depth;

in vec2 texcoord;

layout(location = 0) out vec4 finalSkyColor;

void main() {
    // -------
    // Setup view space for sky
    // -------
    float depth = min(texture(u_translucent_depth, texcoord).r, texture(u_particles_depth, texcoord).r);
    vec3 viewSpacePos = setupViewSpacePos(texcoord, depth);
    viewSpacePos = normalize(viewSpacePos);

    // -------
    // Lower sky color will be combined with upper sky color for final sky
    // -------
    vec3 skyColLower;
    vec3 skyColUpper;

    // -------
    // Time of day factors
    // -------
    float nightFactor = frx_worldIsMoonlit == 1.0 ? 1.0 : 0.0;
    nightFactor *= frx_skyLightTransitionFactor;
    float dayFactor = frx_worldIsMoonlit == 0.0 ? 1.0 : 0.0;
    dayFactor *= frx_skyLightTransitionFactor;
    float sunsetFactor = 1.0 - frx_skyLightTransitionFactor;

    // -------
    // Lower sky color based on time of day
    // -------
    skyColLower = mix(skyColLower, vec3(0.1, 0.4, 0.7), nightFactor);
    skyColLower = mix(skyColLower, vec3(0.852,0.994,1.070), dayFactor);
    skyColLower = mix(skyColLower, vec3(0.970,0.696,0.248), sunsetFactor);

    // -------
    // Upper sky color based on time of day
    // -------
    vec3 skyColDayNight = pow(skyColLower, vec3(3.0));
    vec3 skyColSunset = pow(vec3(0.8, 0.9, 1.0), vec3(5.0));
    vec3 skyColTime = mix(skyColDayNight, skyColSunset, sunsetFactor);
    skyColUpper.rgb = mix(skyColLower.rgb, skyColTime.rgb, dot(viewSpacePos, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5);

    // -------
    // Around the sun & moon, the sky will be tinted the skylight color
    // -------
    float sunPos = frx_worldIsMoonlit == 0.0 ? dot((viewSpacePos), frx_skyLightVector) * 0.5 + 0.5 : dot((viewSpacePos), -frx_skyLightVector) * 0.5 + 0.5;
    float moonPos = frx_worldIsMoonlit == 0.0 ? dot((viewSpacePos), -frx_skyLightVector) * 0.5 + 0.5 : dot((viewSpacePos), frx_skyLightVector) * 0.5 + 0.5;

    sunPos = frx_smootherstep(0.85, 1.05, sunPos) * dayFactor;
    moonPos = frx_smootherstep(0.85, 1.05, moonPos) * nightFactor;

    skyColUpper.rgb += sunPos * vec3(0.970,0.846,0.289);
    skyColUpper.rgb += moonPos * vec3(0.010,0.495,0.970);
    
    // -------
    // Mix upper and lower sky colors
    // -------
    skyColUpper.rgb = mix(skyColUpper.rgb, skyColLower.rgb, 1.0 - frx_smootherstep(-0.5, 0.5, viewSpacePos.y));
    skyColUpper.rgb += vec3(frx_noise2d(viewSpacePos.xy)) / 50.0; // Fake dithering effect

    // -------
    // Custom sky for the End
    // -------
    vec3 spaceColor = vec3(0.4, 0.2, 0.4);
    spaceColor = mix(spaceColor, vec3(0.25, 0.1, 0.25), abs(dot(viewSpacePos, vec3(1.0))));
    spaceColor += vec3(frx_noise2d(viewSpacePos.xz)) / 6.0;


    if(frx_worldIsOverworld == 1) {
        finalSkyColor = vec4(skyColUpper.rgb, 1.0);
    } else if(frx_worldIsEnd == 1) {
        finalSkyColor = vec4(spaceColor.rgb, 1.0);
    } else finalSkyColor = frx_fogColor;
}