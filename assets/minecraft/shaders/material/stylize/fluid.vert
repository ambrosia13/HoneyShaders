#include frex:shaders/api/vertex.glsl 
#include frex:shaders/api/world.glsl
#include frex:shaders/lib/face.glsl
#include frex:shaders/lib/noise/noise2d.glsl

void frx_materialFragment() {
	// frx_var0.xy = frx_faceUv(frx_vertex.xyz, frx_vertexNormal.xyz);
    // frx_var0.zw = frx_faceUv(frx_vertex.xyz, FACE_UP);

	if (abs(frx_vertexNormal.y) < 0.001) {
	    frx_var0.xy = frx_faceUv(frx_vertex.xyz, frx_vertexNormal.xyz);
	    //must specify frx_var0.z explicitly on Nvidia cards
	    frx_var0.zw = vec2(0.0, 1.0);
	} else {
	    frx_var0.xy = frx_faceUv(frx_vertex.xyz, FACE_UP);
	    // apparently can't normalize (0, 0) on Nvidia cards
	    frx_var0.zw = abs(frx_vertexNormal.y)==1.0 ? vec2(0.0, 0.0) : -normalize(frx_vertexNormal.xz);
	}

    //frx_vertex.y += snoise((frx_renderSeconds / 2.0) + 0.1 * frx_var0.zw) * 0.05;
    //frx_vertexNormal.y += snoise((frx_renderSeconds / 2.0) + 0.1 * frx_var0.zw) * 0.05;
}