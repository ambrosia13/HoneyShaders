vec3 calculateSky(in vec3 viewSpacePos) {
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
    skyColLower = mix(skyColLower, vec3(1.3, 1.5, 1.8), dayFactor);
    skyColLower = mix(skyColLower, vec3(0.9, 0.6, 0.6), sunsetFactor);
    
    skyColLower = mix(skyColLower, vec3(0.2, 0.7, 1.0), moonPos * moonPos * moonPos * sunsetFactor);
    skyColLower = mix(skyColLower, vec3(1.0, 0.6, 0.3), sunPos * sunPos * sunPos * sunsetFactor);

    // -------
    // Upper sky color based on time of day
    // -------
    vec3 skyColDay = pow(vec3(0.8, 1.0, 1.2), vec3(5.0));
    vec3 skyColNight = pow(skyColLower, vec3(2.0));
    vec3 skyColDayNight = mix(skyColDay, skyColNight, frx_worldIsMoonlit);
    vec3 skyColSunset = pow(vec3(0.7, 0.9, 1.0), vec3(5.0));
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

    if(frx_worldIsOverworld == 1) return skyColUpper.rgb;
    else if(frx_worldIsEnd == 1) return spaceColor.rgb;
    else return frx_fogColor.rgb;
}

vec3 calculateSun(in vec3 viewSpacePos) {
    float sun = dot(viewSpacePos, getSunVector()) * 0.5 + 0.5;

    // bool fullMoon = mod(frx_worldDay, 8.0) == 0.0;
    // bool phase1 = mod(frx_worldDay, 8.0) == 1.0;
    // bool phase2 = mod(frx_worldDay, 8.0) == 2.0;
    // bool phase3 = mod(frx_worldDay, 8.0) == 3.0;
    // bool phase4 = mod(frx_worldDay, 8.0) == 4.0;
    // bool phase5 = mod(frx_worldDay, 8.0) == 5.0;
    // bool phase6 = mod(frx_worldDay, 8.0) == 6.0;
    // bool phase7 = mod(frx_worldDay, 8.0) == 7.0;

    float moon = dot(viewSpacePos, getMoonVector()) * 0.5 + 0.5;
    // if(phase1 || phase7) moon -= step(0.9994, dot(viewSpacePos, vec3(frx_skyLightVector.xy, frx_skyLightVector.z - 0.0008)) * 0.5 + 0.5);
    // if(phase2 || phase6) moon -= step(0.9993, dot(viewSpacePos, vec3(frx_skyLightVector.xy, frx_skyLightVector.z - 0.02)) * 0.5 + 0.5);
    // if(phase3 || phase5) moon -= step(0.9995, dot(viewSpacePos, vec3(frx_skyLightVector.xy, frx_skyLightVector.z - 0.01)) * 0.5 + 0.5);
    // if(phase4) moon = 0.0;
    
    sun = step(0.9995, sun);
    moon = step(0.9996, moon);
    vec4 sunCol = sun * vec4(2.0, 1.2, 0.4, 10.0);
    vec4 moonCol = moon * vec4(0.3, 0.8, 1.8, 10.0);

    return sunCol.rgb + moonCol.rgb;
}