#include frex:shaders/api/vertex.glsl
#include frex:shaders/api/world.glsl

#ifdef VANILLA_LIGHTING
out float diffuse;
#endif
out vec2 n_texcoord;

void frx_pipelineVertex() {
    //implementation for normalized texture coordinates taken from Canvas Dev
    //https://github.com/vram-guild/canvas/blob/1.17/src/main/resources/assets/canvas/shaders/material/lava.vert
	if (abs(frx_vertexNormal.y) < 0.001) {
	    n_texcoord.xy = frx_faceUv(frx_vertex.xyz, frx_vertexNormal.xyz);
	} else {
	    n_texcoord.xy = frx_faceUv(frx_vertex.xyz, FACE_UP);
	}

    bool isWater = frx_vertexColor.b >= 0.6 && frx_vertexColor.r <= 0.3 && frx_vertexColor.g <= 0.5;
    if(isWater) {
        frx_vertexNormal.x = 0.5;
    }

    if (frx_modelOriginType() == MODEL_ORIGIN_SCREEN) {
        gl_Position = frx_guiViewProjectionMatrix() * frx_vertex;
    } else {
        frx_vertex += frx_modelToCamera();
        gl_Position = frx_viewProjectionMatrix() * frx_vertex;
    }

    #ifdef VANILLA_LIGHTING
    float lightSource = dot(frx_vertexNormal.rgb, frx_skyLightVector + vec3(0.2, 0.3, 0.4));
    lightSource = lightSource * 0.2 + 0.75; //make the range 0.5 to 1.0
    diffuse = lightSource;
    #endif
}