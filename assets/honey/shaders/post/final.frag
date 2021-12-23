#include honey:shaders/lib/includes.glsl

uniform sampler2D u_color;
uniform sampler2D u_geometry_depth_translucent;
uniform sampler2D u_behind_translucent;
uniform sampler2D u_geometry_data;
uniform sampler2D u_hand_depth;

in vec2 texcoord;

layout(location = 0) out vec4 finalColor;

void main() {
    vec4 color = texture(u_color, texcoord);

    vec4 translucent = texture(u_behind_translucent, texcoord);

    #if TRANSLUCENT_BLUR_AMT != 0
        if(frx_luminance(translucent.rgb) > 0.0 && texture(u_hand_depth, texcoord).r == 1.0) {
            color = blur(u_color, texcoord, TRANSLUCENT_BLUR_AMT);
        }
    #endif

    //float depth = texture(u_geometry_depth_translucent, texcoord).r;
    
    if(frx_cameraInWater == 1) {
        #if UNDERWATER_BLUR_AMT != 0
            color = blur(u_color, texcoord, UNDERWATER_BLUR_AMT);
        #endif

        color *= vec4(0.8, 0.8, 1.5, 1.0);
    }

    if(frx_cameraInLava == 1) {
        #if UNDERWATER_BLUR_AMT != 0
            color = blur(u_color, texcoord, UNDERWATER_BLUR_AMT);
        #endif

        color *= vec4(1.5, 0.8, 0.8, 1.0);
    }

    #ifdef HUNGER_DESATURATION
        if(frx_effectHunger == 1) {
            vec3 hungerColor = rgb2hsv(color.rgb);
            hungerColor.g *= 0.5;
            color.rgb = hsv2rgb(hungerColor);
        }
    #endif

    color.rgb = frx_toneMap(color.rgb);
    color.rgb = rgb2hsv(color.rgb);
    color.g *= 1.6;
    color.rgb = hsv2rgb(color.rgb);

    clamp01(color.rgb);
    finalColor = vec4(color.rgb, 1.0);
}