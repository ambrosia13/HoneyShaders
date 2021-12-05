uniform int frxu_cascade;
uniform ivec2 frxu_size;
uniform int frxu_lod;

// in case I mess up again and use texture2D instead of texture
#define texture2D(x, y) texture(x, y)

#include honey:shaders/lib/api_includes.glsl
#include honey:shaders/lib/config.glsl
#include honey:shaders/lib/functions.glsl
