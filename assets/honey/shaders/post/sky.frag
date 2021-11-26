#include honey:shaders/lib/common.glsl

uniform sampler2D u_translucent_depth;
uniform sampler2D u_particles_depth;
uniform sampler2D u_main_depth;
uniform sampler2D u_composite;

in vec2 texcoord;

layout(location = 0) out vec4 skyColor;

void main() {
    float depth = min(texture(u_main_depth, texcoord).r, min(texture(u_translucent_depth, texcoord).r, texture(u_particles_depth, texcoord).r));

    vec3 screenPos = vec3(texcoord, depth);
    vec3 clipPos = screenPos * 2.0 - 1.0;
    vec4 tmp = frx_inverseViewProjectionMatrix * vec4(clipPos, 1.0);
    vec3 viewPos = normalize(tmp.xyz / tmp.w);

    vec2 plane = viewPos.xz / (viewPos.y / 2.0);

    vec3 skyCol = max(frx_fogColor.rgb, vec3(0.2));

    float sun = dot((viewPos), frx_skyLightVector) * 0.5 + 0.5;
    //sun += dot((viewPos), -frx_skyLightVector) * 0.5 + 0.5;
    sun = step(0.9995, sun) * 10.0;
    //sun += smoothstep(0.8, 1.2, dot((viewPos), frx_skyLightVector) * 0.5 + 0.5);
    if(depth == 1.0) {
        skyColor.rgb = mix(skyCol.rgb, skyCol.rgb * skyCol.rgb * skyCol.rgb, dot(viewPos * 0.5 + 0.5, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5);
        skyColor.rgb = mix(skyColor.rgb, frx_fogColor.rgb, 1.0 - frx_smootherstep(-0.5, 0.5, viewPos.y));
        skyColor.rgb += sun;
    } else {
        skyColor.rgb = texture(u_composite, texcoord).rgb;
    }

    skyColor = vec4(skyColor.rgb, 1.0);
}