#include honey:shaders/lib/common.glsl

uniform sampler2D u_composite;

in vec2 texcoord;

layout(location = 0) out vec4 fragColor;

void main() {
    fragColor = texture2D(u_composite, texcoord);
}