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

    // -------
    // Lower sky color will be combined with upper sky color for final sky
    // -------
    vec3 skyColLower;
    vec3 skyColUpper;

    // -------
    // Time of day factors
    // -------
    vec3 timeFactors = getTimeOfDayFactors();
    float dayFactor = timeFactors.x;
    float nightFactor = timeFactors.y;
    float sunsetFactor = timeFactors.z;

    // -------
    // Sun & Moon position
    // -------
    float sunPos = dot(viewSpacePos, getSunVector()) * 0.5 + 0.5;
    float moonPos = dot(viewSpacePos, getMoonVector()) * 0.5 + 0.5;

    // -------
    // Lower sky color based on time of day
    // -------
    skyColLower = mix(skyColLower, vec3(0.1, 0.4, 0.7), nightFactor);
    skyColLower = mix(skyColLower, vec3(0.652,0.994,1.170), dayFactor);
    skyColLower = mix(skyColLower, vec3(0.670,0.496,0.248), sunsetFactor);
    
    skyColLower = mix(skyColLower, vec3(0.2, 0.7, 1.0), moonPos * moonPos * sunsetFactor);
    skyColLower = mix(skyColLower, vec3(1.0, 0.6, 0.4), sunPos * sunPos * sunsetFactor);

    // -------
    // Upper sky color based on time of day
    // -------
    vec3 skyColDay = pow(skyColLower, vec3(5.0));
    vec3 skyColNight = pow(skyColLower, vec3(2.0));
    vec3 skyColDayNight = mix(skyColDay, skyColNight, frx_worldIsMoonlit);
    vec3 skyColSunset = pow(vec3(0.8, 0.9, 1.0), vec3(5.0));
    vec3 skyColTime = mix(skyColDayNight, skyColSunset, sunsetFactor);
    skyColUpper.rgb = mix(skyColLower.rgb, skyColTime.rgb, dot(viewSpacePos, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5);
    skyColUpper.rgb = max(skyColUpper.rgb, vec3(0.25, 0.25, 0.5));

    // -------
    // Around the sun & moon, the sky will be tinted the skylight color
    // -------
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
    vec3 spaceColor = vec3(0.5, 0.0, 0.5);
    spaceColor = mix(spaceColor, vec3(0.2, 0.0, 0.8), dot(viewSpacePos, vec3(0.0, 0.0, 0.0) * 0.5 + 0.5));
    spaceColor += vec3(frx_noise2d(viewSpacePos.xz * 50.0)) / 50.0;
    spaceColor = mix(spaceColor, vec3(1.0), 0.3);


    if(frx_worldIsOverworld == 1) {
        finalSkyColor = vec4(skyColUpper.rgb, 1.0);
    } else if(frx_worldIsEnd == 1) {
        finalSkyColor = vec4(spaceColor.rgb, 1.0);
    } else finalSkyColor = frx_fogColor;
}