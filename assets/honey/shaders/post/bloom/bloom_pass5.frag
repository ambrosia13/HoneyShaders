#include honey:shaders/lib/common.glsl

uniform sampler2D u_color_input;

in vec2 texcoord;

layout(location = 0) out vec4 blurColor;

void main() {
    vec4 color = texture(u_color_input, texcoord);

    color = blur(u_color_input, texcoord, BLOOM_BASE_AMT * 2.0);

    blurColor = color;
}