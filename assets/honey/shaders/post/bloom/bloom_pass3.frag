#include honey:shaders/lib/common.glsl

uniform sampler2D u_color_input;

in vec2 texcoord;

out vec4 fragColor;

void main() {
    vec4 color = texture2D(u_color_input, texcoord);

    color = blur(u_color_input, texcoord, BLOOM_BASE_AMT * 6.0);

    fragColor = color;
}