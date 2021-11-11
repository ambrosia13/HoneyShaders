#include honey:shaders/lib/common.glsl

uniform sampler2D u_composite;
uniform sampler2D u_main_depth;
uniform sampler2D u_main_color;

in vec2 texcoord;

layout(location = 0) out vec4 compositeHand;

void main() {
    vec4 composite = texture2D(u_composite, texcoord);
    float handDepth = texture2D(u_main_depth, texcoord).r * 1.0;
    vec4 color = texture2D(u_main_color, texcoord);

    // combining the composite color with hand color for other programs to sample

    if(handDepth != 1.0) {
        handDepth = 0.0;
    }

    handDepth = 1.0 - handDepth;

    composite -= handDepth * 100.0;
    composite.rgb = max(vec3(0.0), composite.rgb);

    color -= (1.0 - handDepth);
    color.rgb = max(vec3(0.0), color.rgb);

    composite += color;

    compositeHand = composite;
}