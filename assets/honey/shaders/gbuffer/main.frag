#include honey:shaders/lib/common.glsl 

uniform sampler2D u_glint;

in float diffuse;

out vec4[2] fragColor;

void frx_pipelineFragment() {
    vec4 color = frx_fragColor;
    vec4 emissive_color = color;

    #ifdef VANILLA_LIGHTING
    vec3 lightmap = texture2D(frxs_lightmap, frx_fragLight.xy).rgb;
    if(frx_fragEnableAo) {
        lightmap *= frx_fragLight.z;
    }
    color.rgb *= lightmap;

    if (frx_fragEnableDiffuse) {
        color.rgb *= diffuse;
    }
    #endif

    vec4 glint = texture2D(u_glint, (frx_texcoord + frx_renderSeconds / 15.0) * 1.5);
    vec4 hurt = vec4(1.0, 0.0, 0.0, 0.1);
    vec4 flash = vec4(1.0, 1.0, 1.0, 0.1);
    if(frx_matGlint() == 1.0) {
        color *= glint;
    }
    if(frx_matHurt()) {
        color += hurt / 3.0;
    }
    if(frx_matFlash()) {
        color += flash / 3.0;
    }

    color.rgb = mix(color.rgb, emissive_color.rgb, frx_fragEmissive);
    emissive_color *= frx_fragEmissive;

    fragColor[0] = color;
    fragColor[1] = emissive_color;

    gl_FragDepth = gl_FragCoord.z;
}

// #include tutorialpack:shaders/lib/common.glsl

// uniform sampler2D u_glint;
// uniform sampler2D u_caustics;

// in float v_diffuse;

// out vec4[4] fragColor; // we only output 1 color
// // in case of framebuffer with N color attachments, we use `out vec4[N] fragColor` instead

// Fragment setup - Most of the time you don't need to modify these
// frx_FragmentData frx_createPipelineFragment()
// {
// #ifdef VANILLA_LIGHTING
//   return frx_FragmentData (
//     texture2D(frxs_baseColor, frx_texcoord, frx_matUnmippedFactor() * -4.0),
//     frx_color,
//     frx_matEmissive() ? 1.0 : 0.0,
//     !frx_matDisableDiffuse(),
//     !frx_matDisableAo(),
//     frx_normal,
//     v_light,
//     ao
//   );
// #else
//   return frx_FragmentData (
//     texture2D(frxs_baseColor, frx_texcoord, frx_matUnmippedFactor() * -4.0),
//     frx_color,
//     frx_matEmissive() ? 1.0 : 0.0,
//     !frx_matDisableDiffuse(),
//     !frx_matDisableAo(),
//     frx_normal
//   );
// #endif
// }

// void frx_pipelineFragment() {
//   // Obtain true color by multiplying sprite color (usually texture) and vertex color (usually biome color)
//   vec4 color = frx_sampleColor * frx_vertexColor;
//   vec4 original_color = color;

//     // Always wrap vanilla lighting-related operation within #ifdef VANILLA_LIGHTING directive
//   #ifdef VANILLA_LIGHTING

//     // Obtain vanilla light color from the light map
//     vec3 light_color = texture2D(frxs_lightmap, frx_fragLight.xy).rgb;

//     if(frx_effectFireResistance == 1) {
//       light_color.r *= 1.5;
//     }
//     if(frx_effectWaterBreathing == 1) {
//       light_color.b *= 1.5;
//     }
//     #ifdef UNDERWATER_CAUSTICS
//     if(frx_cameraInWater == 1.0) {
//       vec4 caustics = clamp(texture2D(u_caustics, (frx_texcoord + vec2(frx_renderSeconds / 90.0)) * 20.0), 0.5, 1.0);
//       color *= caustics;
//     }
//     #endif

//     if (frx_fragEnableAo) {
//       light_color *= frx_fragLight.z;
//     }

//     color.rgb *= light_color;
//   #endif

//   // misc vanilla effects 
//   if(frx_matGlint() == 1.0) {
//     vec4 glint = texture2D(u_glint, (frx_texcoord + frx_renderSeconds / 15.0) * 2.0);
//     color += glint / 3.0;
//   }
//   if(frx_matHurt()) {
//     vec4 redHurt = vec4(1.0, 0.0, 0.0, 0.1);    
//     color += redHurt / 3.0;
//   }
//   vec4 flash = vec4(1.0, 1.0, 1.0, 0.1);
//   if(frx_matFlash()) {
//     color += flash / 3.0;
//   }

//   color.rgb = mix(color.rgb, original_color.rgb, frx_fragEmissive);

//   if(frx_fragEmissive == 0.0) {
//     original_color = vec4(0.0);
//   }

//   //color *= vec4(1.0) * gl_FragCoord.z;

//   // Write color data to the color attachment
//   fragColor[0] = color;
//   fragColor[1] = original_color;
  
  
//   // Write position data to the depth attachment
//   gl_FragDepth = gl_FragCoord.z;
// }