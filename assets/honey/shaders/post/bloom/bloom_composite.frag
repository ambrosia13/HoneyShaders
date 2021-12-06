#include honey:shaders/lib/includes.glsl

//#define AUTO_EXPOSURE_QUALITY 4 //config not working (bug probably) so this is temporary

uniform sampler2D u_bloom0;
uniform sampler2D u_bloom1;
uniform sampler2D u_bloom2;
uniform sampler2D u_bloom3;
uniform sampler2D u_bloom4;

in vec2 texcoord;

layout(location = 0) out vec4 bloomComposite;

void main() {
    vec4 bloom0 = texture(u_bloom0, texcoord);
    vec4 bloom1 = texture(u_bloom1, texcoord);
    vec4 bloom2 = texture(u_bloom2, texcoord);
    vec4 bloom3 = texture(u_bloom3, texcoord);
    vec4 bloom4 = texture(u_bloom4, texcoord);

    vec3 composite = bloom0.rgb + bloom1.rgb + bloom2.rgb + bloom3.rgb + bloom4.rgb;

    bloomComposite = vec4((composite), 1.0);
}