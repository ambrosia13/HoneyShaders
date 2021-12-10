#include honey:shaders/lib/includes.glsl

uniform sampler2D u_bloom0;
uniform sampler2D u_bloom1;
uniform sampler2D u_bloom2;
uniform sampler2D u_bloom3;
uniform sampler2D u_bloom4;
uniform sampler2D u_bloom5;
uniform sampler2D u_bloom6;

in vec2 texcoord;

layout(location = 0) out vec4 bloomComposite;

void main() {
    vec4 bloom0 = texture(u_bloom0, texcoord);
    vec4 bloom1 = texture(u_bloom1, texcoord);
    vec4 bloom2 = texture(u_bloom2, texcoord);
    vec4 bloom3 = texture(u_bloom3, texcoord);
    vec4 bloom4 = texture(u_bloom4, texcoord);
    vec4 bloom5 = texture(u_bloom5, texcoord);
    vec4 bloom6 = texture(u_bloom6, texcoord);

    vec3 composite = bloom0.rgb + bloom1.rgb + bloom2.rgb + bloom3.rgb + bloom4.rgb + bloom5.rgb + bloom6.rgb;

    bloomComposite = vec4(composite, 1.0);
}