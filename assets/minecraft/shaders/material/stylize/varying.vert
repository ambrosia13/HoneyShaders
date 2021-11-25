#include honey:shaders/lib/common.glsl

void frx_materialVertex() {
        frx_var0.xy = frx_faceUv(frx_vertex.xyz, frx_vertexNormal.xyz);
        frx_var0.zw = frx_faceUv(frx_vertex.xyz, FACE_UP);

        //frx_vertex.y += snoise((frx_renderSeconds / 2.0) + 0.1 * frx_var0.zw) * 0.05;
}