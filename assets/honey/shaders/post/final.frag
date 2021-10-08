#include honey:shaders/lib/common.glsl

uniform sampler2D u_main_color;

in vec2 texcoord;

out vec4 fragColor;

void main() {
    vec4 color = texture2D(u_main_color, texcoord);

    fragColor = color;
}