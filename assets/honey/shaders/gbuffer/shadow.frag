// Shadow implementation taken from Canvas Dev
// https://github.com/vram-guild/canvas/blob/1.17/src/main/resources/assets/canvas/shaders/pipeline/shadow.frag
// 

#include honey:shaders/lib/includes.glsl 

void frx_pipelineFragment() {
    gl_FragDepth = gl_FragCoord.z;
}