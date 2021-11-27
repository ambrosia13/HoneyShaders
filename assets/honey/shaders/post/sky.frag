#include honey:shaders/lib/common.glsl

uniform sampler2D u_translucent_depth;
uniform sampler2D u_particles_depth;

in vec2 texcoord;

layout(location = 0) out vec4 skyColor;

void main() {
    float depth = min(texture(u_translucent_depth, texcoord).r, texture(u_particles_depth, texcoord).r);

    vec3 screenPos = vec3(texcoord, depth);
    vec3 clipPos = screenPos * 2.0 - 1.0;
    vec4 tmp = frx_inverseViewProjectionMatrix * vec4(clipPos, 1.0);
    vec3 viewPos = normalize(tmp.xyz / tmp.w);

    vec2 plane = viewPos.xz / (viewPos.y / 2.0);

    vec3 skyCol = max(frx_fogColor.rgb, vec3(0.2));
    float nightFactor = frx_worldIsMoonlit == 1.0 ? 1.0 : 0.0;
    nightFactor *= frx_skyLightTransitionFactor;
    skyCol = mix(skyCol, vec3(0.1, 0.4, 0.7), nightFactor);

    float sun = dot((viewPos), frx_skyLightVector) * 0.5 + 0.5;
    float moon = dot((viewPos), -frx_skyLightVector) * 0.5 + 0.5;
    //sun = step(0.9995, sun) * 5.0 + step(0.9995, moon) * 2.5;
    sun = smoothstep(0.8, 2.0, dot((viewPos), frx_skyLightVector) * 0.5 + 0.5) + smoothstep(0.8, 2.0, dot((viewPos), -frx_skyLightVector) * 0.5 + 0.5);
    
    skyColor.rgb = mix(skyCol.rgb * skyCol.rgb, skyCol.rgb * skyCol.rgb * skyCol.rgb * skyCol.rgb, dot(viewPos, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5);

    // horizon for fog 
    skyColor.rgb = mix(skyColor.rgb, skyCol.rgb, 1.0 - frx_smootherstep(-0.5, 0.5, viewPos.y));
    skyColor.rgb = mix(skyColor.rgb, skyCol.rgb, smoothstep(0.8, 1.3, dot((viewPos), frx_skyLightVector) * 0.5 + 0.5) + smoothstep(0.8, 2.0, dot((viewPos), -frx_skyLightVector) * 0.5 + 0.5));

    skyColor.rgb += sun;
    skyColor.rgb += vec3(frx_noise2d(plane * 20.0)) / 50.0;

    vec3 spaceColor = vec3(0.4, 0.2, 0.4);
    spaceColor = mix(spaceColor, vec3(0.25, 0.1, 0.25), abs(dot(viewPos, vec3(1.0))));
    spaceColor += vec3(frx_noise2d(viewPos.xz)) / 6.0;

    float cloudNoiseA = min(1.0 - snoise(plane * 0.5), 1.0);
    float cloudNoiseB = min(1.0 - snoise(plane * 1.0), 1.0);
    float cloudNoiseC = min(1.0 - snoise(plane * 1.5), 1.0);
    float cloudNoiseD = min(1.0 - snoise(plane * 2.0), 1.0);
    float cloudNoiseE = min(1.0 - snoise(plane * 2.5), 1.0);
    float cloudNoiseF = min(1.0 - snoise(plane * 3.0), 1.0);
    float cloudNoise =  cloudNoiseA *(cloudNoiseA + cloudNoiseB + cloudNoiseC + cloudNoiseD + cloudNoiseE + cloudNoiseF) / 6.0;
    // cloudNoise = cloudNoiseA * cloudNoiseB * cloudNoiseC * cloudNoiseD * cloudNoiseE * cloudNoiseF;
    // cloudNoise = cloudNoiseD + cloudNoiseB;
    // cloudNoise /= 2.0;
    //skyColor = mix(skyColor, vec4(cloudNoise), cloudNoise);

    if(frx_worldIsOverworld == 1) {
        skyColor = vec4(skyColor.rgb, 1.0);
    } else if(frx_worldIsEnd == 1) {
        skyColor = vec4(spaceColor.rgb, 1.0);
    } else skyColor = frx_fogColor;

}