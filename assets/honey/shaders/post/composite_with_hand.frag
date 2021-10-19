#include honey:shaders/lib/common.glsl

uniform sampler2D u_composite;
uniform sampler2D u_main_depth;
uniform sampler2D u_main_color;

in vec2 texcoord;

out vec4 fragColor;

void main() {
    vec4 composite = texture2D(u_composite, texcoord);
    float handDepth = texture2D(u_main_depth, texcoord).r * 1.0;
    vec4 color = texture2D(u_main_color, texcoord);

    if(handDepth != 1.0) {
        handDepth = 0.0;
    }
    handDepth = 1.0 - handDepth;

    composite -= handDepth;
    composite = clamp(composite, 0.0, 1.0);

    color -= (1.0 - handDepth);
    color = clamp(color, 0.0, 1.0);

    composite += color;

    fragColor = composite;
}