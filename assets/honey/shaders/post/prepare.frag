#include honey:shaders/lib/includes.glsl

uniform sampler2D u_composite;
uniform sampler2D u_g_depth_solid;
uniform sampler2D u_g_solid;
uniform sampler2D u_sky;
uniform sampler2D u_g_data;
uniform sampler2D u_g_depth_translucent;
uniform sampler2D u_g_depth_particles;

in vec2 texcoord;

layout(location = 0) out vec4 compositeHand;

void main() {
    vec4 composite = texture(u_composite, texcoord);
    float handDepth = texture(u_g_depth_solid, texcoord).r;
    vec4 color = texture(u_g_solid, texcoord);
    float compositeDepth = min(texture(u_g_depth_particles, texcoord).r, texture(u_g_depth_translucent, texcoord).r);
    compositeDepth = min(handDepth, compositeDepth);

    // -------
    // Composite image + hand
    // -------
    if(handDepth != 1.0) {
        handDepth = 0.0;
    }

    handDepth = 1.0 - handDepth;

    composite -= handDepth * 100.0;
    composite.rgb = max(vec3(0.0), composite.rgb);

    color -= (1.0 - handDepth) * 100.0;
    color.rgb = max(vec3(0.0), color.rgb);

    composite += color;
    composite.a = 1.0;

    // -------
    // Fog
    // -------
    vec4 skyCol = min(texture(u_sky, texcoord), vec4(1.0));

    float blockDist = texture(u_g_data, texcoord).b;
    float dist = blockDist / frx_viewDistance;

    vec3 timeFactors = getTimeOfDayFactors();

    float fogStartMin = 10.0;
    float fogFactor = frx_smootherstep(fogStartMin, frx_viewDistance, blockDist);
    fogFactor = 1.0 - exp(-fogFactor);

    fogFactor += 0.2 * frx_smootherstep(0.0, 1.0, timeFactors.z); // denser fog at sunrise/sunset
    fogFactor += -0.3 * frx_smootherstep(0.0, 1.0, timeFactors.x);
    fogFactor = (1.0 - exp(-fogFactor));
    fogFactor *= frx_eyeBrightness.y;
    clamp01(fogFactor);

    #ifdef ENABLE_FOG
        if(compositeDepth != 1.0) {
            #ifdef RAINBOW_FOG
                vec3 rainbow = vec3(sin(frx_renderSeconds / 5.0) * sin(frx_renderSeconds / 5.0), 1.0, 0.75);
                skyCol.rgb = hsv2rgb(rainbow.rgb);
            #endif
            composite.rgb = mix(composite.rgb, skyCol.rgb, fogFactor);
        }
    #endif

    // -------
    // Clouds
    // -------

    vec3 viewSpacePos = setupViewSpacePos(texcoord, compositeDepth);
    viewSpacePos = normalize(viewSpacePos);

    vec2 plane = viewSpacePos.xz / (viewSpacePos.y / 2.0);
    plane += frx_renderSeconds * 0.05;

    vec2 planeGrid = floor(plane);
    float cloudNoise;
    cloudNoise = step(0.5 - frx_rainGradient * 0.2 - frx_thunderGradient * 0.2, snoise(planeGrid));
    cloudNoise *= frx_smootherstep(0.0, 0.1, viewSpacePos.y);

    // -------
    // Sun/Moon
    // -------
    float sun;
    if(frx_worldIsMoonlit != 1.0) {
        sun = dot((viewSpacePos), frx_skyLightVector) * 0.5 + 0.5;
    } else sun = dot((viewSpacePos), -frx_skyLightVector) * 0.5 + 0.5;

    bool fullMoon = frx_worldDay == 0.0;
    bool phase1 = frx_worldDay == 1.0;
    bool phase2 = frx_worldDay == 2.0;
    bool phase3 = frx_worldDay == 3.0;
    bool phase4 = frx_worldDay == 4.0;
    bool phase5 = frx_worldDay == 5.0;
    bool phase6 = frx_worldDay == 6.0;
    bool phase7 = frx_worldDay == 7.0;

    float moon;
    if(frx_worldIsMoonlit == 1.0) {
        moon = dot((viewSpacePos), frx_skyLightVector) * 0.5 + 0.5;
    } else moon = dot((viewSpacePos), -frx_skyLightVector) * 0.5 + 0.5;
    // if(phase1 || phase7) moon -= step(0.9994, dot(viewSpacePos, vec3(frx_skyLightVector.xy, frx_skyLightVector.z - 0.025)) * 0.5 + 0.5);
    // if(phase2 || phase6) moon -= step(0.9993, dot(viewSpacePos, vec3(frx_skyLightVector.xy, frx_skyLightVector.z - 0.02)) * 0.5 + 0.5);
    // if(phase3 || phase5) moon -= step(0.9995, dot(viewSpacePos, vec3(frx_skyLightVector.xy, frx_skyLightVector.z - 0.01)) * 0.5 + 0.5);
    // if(phase4) moon = 0.0;
    
    sun = step(0.9995, sun);
    moon = step(0.9996, moon);
    vec4 sunCol = sun * vec4(2.0, 1.4, 0.4, 10.0);
    vec4 moonCol = moon * vec4(0.3, 0.8, 1.8, 10.0);

    if(texture(u_g_depth_particles, texcoord).r == 1.0 && handDepth == 0.0 && frx_worldIsOverworld == 1) composite += (sunCol + moonCol) * ((1.0 - cloudNoise * 0.75));
    if(compositeDepth == 1.0 && frx_worldIsOverworld == 1) composite.rgb = mix(composite.rgb, mix(composite.rgb, composite.rgb * vec3(1.2 * cloudNoise), cloudNoise), frx_smootherstep(0.0, 0.3, viewSpacePos.y));

    compositeHand = composite;
}