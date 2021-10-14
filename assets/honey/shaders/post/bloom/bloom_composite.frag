#include honey:shaders/lib/common.glsl

#define AUTO_EXPOSURE 4 //config not working (bug probably) so this is temporary

uniform sampler2D u_bloom0;
uniform sampler2D u_bloom1;
uniform sampler2D u_bloom2;
uniform sampler2D u_bloom3;
uniform sampler2D u_bloom4;

in vec2 texcoord;

out vec4 fragColor;

void main() {
    vec4 bloom0 = texture2D(u_bloom0, texcoord);
    vec4 bloom1 = texture2D(u_bloom1, texcoord);
    vec4 bloom2 = texture2D(u_bloom2, texcoord);
    vec4 bloom3 = texture2D(u_bloom3, texcoord);
    vec4 bloom4 = texture2D(u_bloom4, texcoord);

    vec3 composite = bloom0.rgb + bloom1.rgb + bloom2.rgb + bloom3.rgb + bloom4.rgb;

    #ifdef TONEMAP_BLOOM
    composite = frx_toneMap(composite);
    #endif

    #ifdef AUTO_EXPOSURE //todo: more efficient method probably using an array
    #if AUTO_EXPOSURE >= 1
    vec3 exposure_middle = texture2D(u_bloom3, vec2(0.5)).rgb;
    float exposure_middle_l = frx_luminance(1.0 - exposure_middle.rgb);
    #if AUTO_EXPOSURE >= 2
    vec3 exposure2a = texture2D(u_bloom3, vec2(0.33, 0.33)).rgb;
    vec3 exposure2b = texture2D(u_bloom3, vec2(0.33, 0.67)).rgb;
    vec3 exposure2c = texture2D(u_bloom3, vec2(0.67, 0.33)).rgb;
    vec3 exposure2d = texture2D(u_bloom3, vec2(0.67, 0.67)).rgb;
    float exposure2a_l = frx_luminance(1.0 - exposure2a);
    float exposure2b_l = frx_luminance(1.0 - exposure2b);
    float exposure2c_l = frx_luminance(1.0 - exposure2c);
    float exposure2d_l = frx_luminance(1.0 - exposure2d);
    float exposure2avg = (exposure2a_l + exposure2b_l + exposure2c_l + exposure2d_l) / 4.0;
    #if AUTO_EXPOSURE >= 3
    vec3 exposure3a = texture2D(u_bloom3, vec2(0.25, 0.25)).rgb;
    vec3 exposure3b = texture2D(u_bloom3, vec2(0.25, 0.50)).rgb;
    vec3 exposure3c = texture2D(u_bloom3, vec2(0.25, 0.75)).rgb;
    vec3 exposure3d = texture2D(u_bloom3, vec2(0.50, 0.25)).rgb;
    vec3 exposure3e = texture2D(u_bloom3, vec2(0.75, 0.25)).rgb;
    vec3 exposure3f = texture2D(u_bloom3, vec2(0.75, 0.50)).rgb;
    vec3 exposure3g = texture2D(u_bloom3, vec2(0.75, 0.75)).rgb;
    vec3 exposure3h = texture2D(u_bloom3, vec2(0.50, 0.75)).rgb;
    float exposure3a_l = frx_luminance(1.0 - exposure3a);
    float exposure3b_l = frx_luminance(1.0 - exposure3b);
    float exposure3c_l = frx_luminance(1.0 - exposure3c);
    float exposure3d_l = frx_luminance(1.0 - exposure3d);
    float exposure3e_l = frx_luminance(1.0 - exposure3e);
    float exposure3f_l = frx_luminance(1.0 - exposure3f);
    float exposure3g_l = frx_luminance(1.0 - exposure3g);
    float exposure3h_l = frx_luminance(1.0 - exposure3h);
    float exposure3avg = (exposure3a_l + exposure3b_l + exposure3c_l + exposure3d_l
                        + exposure3e_l + exposure3f_l + exposure3g_l + exposure3h_l) / 8.0;
    #if AUTO_EXPOSURE >= 4
    vec3 exposure4a = texture2D(u_bloom3, vec2(0.2, 0.2)).rgb;
    vec3 exposure4b = texture2D(u_bloom3, vec2(0.2, 0.4)).rgb;
    vec3 exposure4c = texture2D(u_bloom3, vec2(0.2, 0.6)).rgb;
    vec3 exposure4d = texture2D(u_bloom3, vec2(0.2, 0.8)).rgb;
    vec3 exposure4e = texture2D(u_bloom3, vec2(0.4, 0.2)).rgb;
    vec3 exposure4f = texture2D(u_bloom3, vec2(0.4, 0.4)).rgb;
    vec3 exposure4g = texture2D(u_bloom3, vec2(0.4, 0.6)).rgb;
    vec3 exposure4h = texture2D(u_bloom3, vec2(0.4, 0.8)).rgb;
    vec3 exposure4i = texture2D(u_bloom3, vec2(0.6, 0.2)).rgb;
    vec3 exposure4j = texture2D(u_bloom3, vec2(0.6, 0.4)).rgb;
    vec3 exposure4k = texture2D(u_bloom3, vec2(0.6, 0.6)).rgb;
    vec3 exposure4l = texture2D(u_bloom3, vec2(0.6, 0.8)).rgb;
    vec3 exposure4m = texture2D(u_bloom3, vec2(0.8, 0.2)).rgb;
    vec3 exposure4n = texture2D(u_bloom3, vec2(0.8, 0.4)).rgb;
    vec3 exposure4o = texture2D(u_bloom3, vec2(0.8, 0.6)).rgb;
    vec3 exposure4p = texture2D(u_bloom3, vec2(0.8, 0.8)).rgb;
    float exposure4a_l = frx_luminance(1.0 - exposure4a);
    float exposure4b_l = frx_luminance(1.0 - exposure4b);
    float exposure4c_l = frx_luminance(1.0 - exposure4c);
    float exposure4d_l = frx_luminance(1.0 - exposure4d);
    float exposure4e_l = frx_luminance(1.0 - exposure4e);
    float exposure4f_l = frx_luminance(1.0 - exposure4f);
    float exposure4g_l = frx_luminance(1.0 - exposure4g);
    float exposure4h_l = frx_luminance(1.0 - exposure4h);
    float exposure4i_l = frx_luminance(1.0 - exposure4i);
    float exposure4j_l = frx_luminance(1.0 - exposure4j);
    float exposure4k_l = frx_luminance(1.0 - exposure4k);
    float exposure4l_l = frx_luminance(1.0 - exposure4l);
    float exposure4m_l = frx_luminance(1.0 - exposure4m);
    float exposure4n_l = frx_luminance(1.0 - exposure4n);
    float exposure4o_l = frx_luminance(1.0 - exposure4o);
    float exposure4p_l = frx_luminance(1.0 - exposure4p);
    float exposure4avg = (exposure4a_l + exposure4b_l + exposure4c_l + exposure4d_l
                        + exposure4e_l + exposure4f_l + exposure4g_l + exposure4h_l
                        + exposure4i_l + exposure4j_l + exposure4k_l + exposure4l_l
                        + exposure4m_l + exposure4n_l + exposure4o_l + exposure4p_l) / 16.0;
    #endif
    #endif
    #endif
    float exposure_luminance = 0.0;
    #if AUTO_EXPOSURE == 1
    exposure_luminance = exposure_middle_l;
    #endif
    #if AUTO_EXPOSURE == 2
    exposure_luminance = (exposure_middle_l + exposure2a_l + exposure2b_l + exposure2c_l + exposure2d_l) / 5.0;
    #endif
    #if AUTO_EXPOSURE == 3
    exposure_luminance = (exposure_middle_l + exposure2a_l + exposure2b_l + exposure2c_l + exposure2d_l
                        + exposure3a_l + exposure3b_l + exposure3c_l + exposure3d_l
                        + exposure3e_l + exposure3f_l + exposure3g_l + exposure3h_l) / 13.0;
    #endif
    #if AUTO_EXPOSURE == 4
    exposure_luminance = (exposure_middle_l + exposure2a_l + exposure2b_l + exposure2c_l + exposure2d_l
                        + exposure3a_l + exposure3b_l + exposure3c_l + exposure3d_l
                        + exposure3e_l + exposure3f_l + exposure3g_l + exposure3h_l
                        + exposure4a_l + exposure4b_l + exposure4c_l + exposure4d_l
                        + exposure4e_l + exposure4f_l + exposure4g_l + exposure4h_l
                        + exposure4i_l + exposure4j_l + exposure4k_l + exposure4l_l
                        + exposure4m_l + exposure4n_l + exposure4o_l + exposure4p_l) / 29.0;
    #endif
    composite *= clamp(exposure_luminance, 0.1, 1.0);
    //composite *= exposure_luminance;
    #endif
    #endif

    fragColor = (vec4((composite), 1.0));
    //fragColor = vec4(exposure_luminance);
}