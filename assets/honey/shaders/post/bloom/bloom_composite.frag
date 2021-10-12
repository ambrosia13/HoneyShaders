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

    float luminance = frx_luminance(composite);

    //composite /= luminance;

    fragColor = (vec4(composite, 1.0));
}