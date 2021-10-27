#include honey:shaders/lib/common.glsl 

void frx_pipelineVertex() {
	gl_Position = frx_shadowViewProjectionMatrix(frxu_cascade) * (frx_vertex + frx_modelToCamera);
}