/*
Taken with permission from Xordev's Ominous Shaderpack
https://github.com/XorDev/Ominous-Shaderpack/blob/main/shaders/lib/Blur.inc
*/

vec4 blur(sampler2D texture, vec2 c, float radius)
{
	vec2 texel = 1./vec2(frx_viewWidth,frx_viewHeight);

    float weight = 0.;
    vec4 color = vec4(0);

    float d = 1.;
    vec2 samp = vec2(radius,radius)/float(BLOOM_QUALITY);

	#ifdef X_Bloom
	mat2 ang = mat2(0,1,-1,0);
	#else
	mat2 ang = mat2(.73736882209777832,-.67549037933349609,.67549037933349609,.73736882209777832);
	#endif

	for(int i = 0;i<BLOOM_QUALITY*BLOOM_QUALITY;i++)
	{
        d += 1./d;
        samp *= ang;

        float w = 1./(d-1.);
        vec2 uv = c+ samp*(d-1.)*texel;

		color += texture2D(texture,uv)*w;
        weight += w;
	}
    return color/weight;//+hash1(c-radius)/128.;
}