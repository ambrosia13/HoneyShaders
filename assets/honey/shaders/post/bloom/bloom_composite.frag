#include honey:shaders/lib/common.glsl

uniform sampler2D u_bloom0;
uniform sampler2D u_bloom1;
uniform sampler2D u_bloom2;
uniform sampler2D u_bloom3;
uniform sampler2D u_bloom4;

in vec2 texcoord;

out vec4 fragColor;

void main() {
    vec4 bloom0 = texture2D(u_bloom0, texcoord);
    vec4 bloom1 = texture2D(u_bloom1, texcoord);
    vec4 bloom2 = texture2D(u_bloom2, texcoord);
    vec4 bloom3 = texture2D(u_bloom3, texcoord);
    vec4 bloom4 = texture2D(u_bloom4, texcoord);

    vec3 composite = bloom0.rgb + bloom1.rgb + bloom2.rgb + bloom3.rgb + bloom4.rgb;

    #ifdef TONEMAP_BLOOM
    composite = frx_toneMap(composite);
    #endif

    #ifdef AUTO_EXPOSURE
    vec3 exposure_value = texture2D(u_bloom3, vec2(0.5)).rgb;
    float exposure_luminance = frx_luminance(1.0 - exposure_value.rgb);
    composite *= clamp(exposure_luminance, 0.2, 1.0);
    #endif

    fragColor = (vec4((composite), 1.0));
}