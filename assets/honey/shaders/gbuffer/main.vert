#include honey:shaders/lib/includes.glsl 

#ifdef VANILLA_LIGHTING
    out float diffuse;
#endif
out vec2 faceUV;

void frx_pipelineVertex() {
    if (frx_modelOriginScreen) {
        gl_Position = frx_guiViewProjectionMatrix * frx_vertex;
        frx_distance = length(gl_Position.xyz);
    } else {
        frx_vertex += frx_modelToCamera;
        gl_Position = frx_viewProjectionMatrix * frx_vertex;
        frx_distance = length(frx_vertex.xyz);
    }
    
    // -------
    // Diffuse shading
    // -------
    #ifdef VANILLA_LIGHTING
        diffuse = dot(frx_vertexNormal.xyz, frx_skyLightVector) * 0.2 + 0.7;
    #endif
}