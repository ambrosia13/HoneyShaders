/*
Taken with permission from Xordev's Ominous Shaderpack
https://github.com/XorDev/Ominous-Shaderpack/blob/main/shaders/lib/Blur.inc
*/

#ifndef BLOOM_QUALITY
#define BLOOM_QUALITY 5 // define bloom quality in case pipeline is not loaded
#endif

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

// float getGaussianWeights(float val, float center, float height, float width) {
//     float n = -1.0 * (val - center) * (val - center);
//     float d = 2.0 * width * width;
//     float a = height * exp(n / d);
//     return a;
// }

// vec4 blur(sampler2D texture, vec2 uv, float radius) {
//     vec2 pixel = 1.0 / vec2(frx_viewWidth, frx_viewHeight);
//     vec4 color;
//     float weight = getGaussianWeights(uv.y, 0.0, 1.0, 1.0);

//     for(int i = 0; i < BLOOM_QUALITY; i++) {
//         color += texture2D(texture, uv + pixel * radius) * weight;
//         color += texture2D(texture, uv - pixel * radius) * weight;
//         color / float(i);
//     }

//     return color / weight;
// }