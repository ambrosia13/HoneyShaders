#include honey:shaders/lib/common.glsl

uniform sampler2D u_bloom_composite1;
uniform sampler2D u_bloom_composite2;
uniform sampler2D u_composite;

in vec2 texcoord;

layout(location = 0) out vec4 fragColor;

void main() {
    vec4 comp = texture2D(u_composite, texcoord);
    #ifdef HQ_BLOOM
        fragColor = texture2D(u_bloom_composite2, texcoord) + comp;
    #else
        fragColor = texture2D(u_bloom_composite1, texcoord) + comp;
    #endif
}