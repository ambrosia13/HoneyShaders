#include honey:shaders/lib/includes.glsl

uniform sampler2D u_g_solid;
uniform sampler2D u_g_depth_translucent;
uniform sampler2D u_behind_translucent;
uniform sampler2D u_g_data;
uniform sampler2D u_hand_depth;

in vec2 texcoord;

layout(location = 0) out vec4 finalColor;

void main() {
    vec4 color = texture(u_g_solid, texcoord);

    vec4 translucent = texture(u_behind_translucent, texcoord);

    #if TRANSLUCENT_BLUR_AMT != 0
        if(frx_luminance(translucent.rgb) > 0.0 && texture(u_hand_depth, texcoord).r == 1.0) {
            color = blur(u_g_solid, texcoord, TRANSLUCENT_BLUR_AMT);
        }
    #endif

    float depth = texture(u_g_depth_translucent, texcoord).r;
    
    if(frx_cameraInWater == 1) {
        #if UNDERWATER_BLUR_AMT != 0
            color = blur(u_g_solid, texcoord, UNDERWATER_BLUR_AMT);
        #endif

        color *= vec4(0.8, 0.8, 1.5, 1.0);
    }

    if(frx_cameraInLava == 1) {
        color = blur(u_g_solid, texcoord, UNDERWATER_BLUR_AMT);

        color *= vec4(1.5, 0.8, 0.8, 1.0);
    }

    #ifdef HUNGER_DESATURATION
        if(frx_effectHunger == 1) {
            vec3 hungerColor = rgb2hsv(color.rgb);
            hungerColor.g *= 0.5;
            color.rgb = hsv2rgb(hungerColor);
        }
    #endif

    #ifdef TRANS_SKY_OVERLAY
        vec3 transSky = vec3(0.0);

        if(texcoord.y >= 0.0 && texcoord.y <= 0.2) {
            transSky += vec3(0.428,0.924,0.980);
        }

        if(texcoord.y > 0.2 && texcoord.y <= 0.4) {
            transSky += vec3(0.990,0.742,0.962);
        }

        if(texcoord.y > 0.4 && texcoord.y <= 0.6) {
            transSky += vec3(1.0);
        }

        if(texcoord.y > 0.6 && texcoord.y <= 0.8) {
            transSky += vec3(0.990,0.742,0.962);
        }

        if(texcoord.y >= 0.8 && texcoord.y <= 1.0) {
            transSky += vec3(0.428,0.924,0.980);
        }

        if(depth == 1.0) {
        color.rgb *= (transSky);
        }
    #endif

    #ifdef AMONG_US_OVERLAY
        vec3 sussy = vec3(1.000,0.076,0.029);
        
        if(texcoord.x < 0.9 && texcoord.x > 0.1 && texcoord.y < 0.8 && texcoord.y > 0.3) {
            sussy = vec3(0.022,0.023,0.025);
        }

        if(texcoord.x < 0.8 && texcoord.x > 0.2 && texcoord.y < 0.7 && texcoord.y > 0.4) {
            sussy = vec3(0.655,0.941,0.950);
        }

        if(texcoord.x < 0.8 && texcoord.x > 0.2 && texcoord.y < 0.5 && texcoord.y > 0.4 
        || texcoord.x < 0.8 && texcoord.x > 0.7 && texcoord.y < 0.7 && texcoord.y > 0.4) {
            sussy = vec3(0.270,0.365,0.545);
        }

        if(texcoord.x < 0.6 && texcoord.x > 0.3 && texcoord.y < 0.7 && texcoord.y > 0.6) {
            sussy = vec3(0.924,0.971,1.000);
        }

        color.rgb *= sussy;
    #endif

    #ifdef DRUNK_SHADER
        vec3 drunk1 = texture(u_g_solid, texcoord + vec2(sin(frx_renderSeconds)/10.0, cos(frx_renderSeconds)/10.0)).rgb;
        vec3 drunk2 = texture(u_g_solid, texcoord - vec2(sin(frx_renderSeconds)/10.0, cos(frx_renderSeconds)/10.0)).rgb;
        color.rgb += (drunk1 * drunk2);
    #endif

    color.rgb = reinhard2(color.rgb);

    finalColor = vec4(color.rgb, 1.0);
}