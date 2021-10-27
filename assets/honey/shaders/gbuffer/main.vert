#include honey:shaders/lib/common.glsl 

#ifdef VANILLA_LIGHTING
out float diffuse;
#endif
out vec2 faceUV;
out vec4 shadowPos;

void frx_pipelineVertex() {
    // implementation for normalized texture coordinates taken from Canvas Dev
    // https://github.com/vram-guild/canvas/blob/1.17/src/main/resources/assets/canvas/shaders/material/lava.vert
	if (abs(frx_vertexNormal.y) < 0.001) {
	    faceUV.xy = frx_faceUv(frx_vertex.xyz, frx_vertexNormal.xyz);
	} else {
	    faceUV.xy = frx_faceUv(frx_vertex.xyz, FACE_UP);
	}

    vec2 upUV = frx_faceUv(frx_vertex.xyz, FACE_UP);

    // water check for simplex noise waves - todo: move to material shader
    bool isWater = frx_vertexColor.b >= 0.6 && frx_vertexColor.r <= 0.3 && frx_vertexColor.g <= 0.5;
    if(isWater) {
        frx_vertex.y += snoise((frx_renderSeconds / 2.0) + 0.1 * upUV.xy) * 0.05;
        frx_vertexNormal.y += snoise((frx_renderSeconds / 2.0) + 0.1 * upUV.xy) * 0.05;
    }

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