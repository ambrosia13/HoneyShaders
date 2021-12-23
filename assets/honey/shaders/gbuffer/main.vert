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
        vec3 sunVector = getSunVector();
        vec3 moonVector = getMoonVector();
        diffuse = mix(dot(frx_vertexNormal.xyz, sunVector), dot(frx_vertexNormal, vec3(0.0, 0.5, 1.0)), getTimeOfDayFactors().z);
        diffuse = mix(diffuse, dot(frx_vertexNormal.xyz, moonVector), getTimeOfDayFactors().y);
    #endif
}