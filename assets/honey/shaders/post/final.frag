#include honey:shaders/lib/common.glsl

uniform sampler2D u_main_color;
uniform sampler2D u_bloom;
uniform sampler2D u_bloom_boosted;
uniform sampler2D u_translucent_depth;
uniform sampler2D u_translucent_only;
uniform sampler2D u_pipeline_data;

in vec2 texcoord;

out vec4 finalColor;

void main() {
    vec4 color = texture2D(u_main_color, texcoord);
    #ifdef TRANSLUCENT_BLUR
        vec4 translucent = texture2D(u_translucent_only, texcoord);

        if(frx_luminance(translucent.rgb) > 0.0) {
            color = blur(u_main_color, texcoord, TRANSLUCENT_BLUR_AMT);
        }
    #endif
    float depth = texture2D(u_translucent_depth, texcoord).r;
    #ifdef ENABLE_BLOOM
        #ifdef HQ_BLOOM
            vec4 bloom = texture2D(u_bloom_boosted, texcoord);
        #else
            vec4 bloom = texture2D(u_bloom, texcoord);
        #endif

        float opacity = BLOOM_OPACITY;
        #ifdef HQ_BLOOM
            opacity *= 0.5;
        #endif

        color += bloom * opacity;
    #endif
    
    if(frx_cameraInWater == 1) {
        #ifdef UNDERWATER_BLUR
            color = blur(u_main_color, texcoord, UNDERWATER_BLUR_AMT);
        #endif
        #ifdef ENABLE_BLOOM
            color += bloom * BLOOM_OPACITY;
        #endif
        color *= vec4(0.8, 0.8, 1.5, 1.0) / 1.0;
    }

    if(frx_cameraInLava == 1) {
        #ifdef UNDERWATER_BLUR
            color = blur(u_main_color, texcoord, UNDERWATER_BLUR_AMT);
        #endif
        #ifdef ENABLE_BLOOM
            color += bloom * BLOOM_OPACITY * vec4(1.5, 0.8, 0.8, 1.0);
        #endif
        color *= vec4(1.5, 0.8, 0.8, 1.0) / 1.0;
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
        vec3 drunk1 = texture2D(u_main_color, texcoord + vec2(sin(frx_renderSeconds)/10.0, cos(frx_renderSeconds)/10.0)).rgb;
        vec3 drunk2 = texture2D(u_main_color, texcoord - vec2(sin(frx_renderSeconds)/10.0, cos(frx_renderSeconds)/10.0)).rgb;
        color.rgb += (drunk1 * drunk2);
    #endif

    vec3 screenPos = vec3(texcoord, depth);
    Ray ray;
    ray.origin = frx_cameraPos;
    ray.direction = screenPos;
    //color.rgb = cloudsPlane(ray, color.rgb);

    #ifdef TONE_MAPPING
        color.rgb = frx_toneMap(color.rgb);
    #endif

    finalColor = vec4((color.rgb), 1.0);
}