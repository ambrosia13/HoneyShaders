#include honey:shaders/lib/common.glsl

uniform sampler2D u_main_color;
uniform sampler2D u_bloom;

in vec2 texcoord;

out vec4 fragColor;

void main() {
    vec4 color = texture2D(u_main_color, texcoord);
    #ifdef ENABLE_BLOOM
    vec4 bloom = texture2D(u_bloom, texcoord);
    color += bloom * BLOOM_OPACITY;
    #endif

    fragColor = color;
}