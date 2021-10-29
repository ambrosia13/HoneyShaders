#include honey:shaders/lib/common.glsl 

#ifdef VANILLA_LIGHTING
out float diffuse;
#endif
out vec2 faceUV;
out vec4 shadowPos;

void frx_pipelineVertex() {
    // vertex stuff
    if (frx_modelOriginScreen) {
        gl_Position = frx_guiViewProjectionMatrix * frx_vertex;
    } else {
        frx_vertex += frx_modelToCamera();
        gl_Position = frx_viewProjectionMatrix * frx_vertex;
    }

    shadowPos = (frx_shadowViewMatrix * frx_vertex);

    // diffuse shading
    #ifdef VANILLA_LIGHTING
        float lightSource = dot(frx_vertexNormal.rgb, frx_skyLightVector);
        lightSource = lightSource * 0.2 + 0.7;
        diffuse = lightSource;
    #endif
}