// -------------
// Shadow functions & reference from Canvas dev
// https://github.com/vram-guild/canvas/blob/1.17/src/main/resources/assets/canvas/shaders/pipeline/dev.frag
// -------------
vec3 shadowDist(int cascade) {
	vec4 c = frx_shadowCenter(cascade);

	return abs((c.xyz - shadowPos.xyz) / c.w);
}
int selectShadowCascade() {
	vec3 d3 = shadowDist(3);
	vec3 d2 = shadowDist(2);
	vec3 d1 = shadowDist(1);

	int cascade = 0;

	if (d3.x < 1.0 && d3.y < 1.0 && d3.z < 1.0) {
		cascade = 3;
	} else if (d2.x < 1.0 && d2.y < 1.0 && d2.z < 1.0) {
		cascade = 2;
	} else if (d1.x < 1.0 && d1.y < 1.0 && d1.z < 1.0) {
		cascade = 1;
	}

	return cascade;
}