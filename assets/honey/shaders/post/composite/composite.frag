#include honey:shaders/lib/includes.glsl

uniform sampler2D u_geometry_solid;
uniform sampler2D u_geometry_depth_solid;
uniform sampler2D u_geometry_translucent;
uniform sampler2D u_geometry_depth_translucent;
uniform sampler2D u_geometry_entity;
uniform sampler2D u_geometry_depth_entity;
uniform sampler2D u_geometry_weather;
uniform sampler2D u_geometry_depth_weather;
uniform sampler2D u_geometry_clouds;
uniform sampler2D u_geometry_depth_clouds;
uniform sampler2D u_geometry_particles;
uniform sampler2D u_geometry_depth_particles;
uniform sampler2D u_sky;
uniform sampler2D u_geometry_light_solid;
uniform sampler2D u_geometry_light_translucent;
uniform sampler2D u_geometry_light_entity;
uniform sampler2D u_geometry_light_weather;
uniform sampler2D u_geometry_light_clouds;
uniform sampler2D u_geometry_light_particles;
uniform sampler2D u_geometry_data;

in vec2 texcoord;

layout(location = 0) out vec4 compositeColor;
layout(location = 1) out vec4 translucentOnly;

//Sorting function for fabulous layers used from transparency.fsh in vanilla shaders

#define NUM_LAYERS 6

vec4 color_layers[NUM_LAYERS];
float depth_layers[NUM_LAYERS];
int active_layers = 0;

void try_insert( vec4 color, float depth ) {
    if ( color.a == 0.0 ) {
        return;
    }

    color_layers[active_layers] = color;
    depth_layers[active_layers] = depth;

    int jj = active_layers++;
    int ii = jj - 1;
    while ( jj > 0 && depth_layers[jj] > depth_layers[ii] ) {
        float depthTemp = depth_layers[ii];
        depth_layers[ii] = depth_layers[jj];
        depth_layers[jj] = depthTemp;

        vec4 colorTemp = color_layers[ii];
        color_layers[ii] = color_layers[jj];
        color_layers[jj] = colorTemp;

        jj = ii--;
    }
}

vec3 blend( vec3 dst, vec4 src ) {
    return ( dst * ( 1.0 - src.a ) ) + src.rgb;
}

void main() {

    // very messy code. fix later.

    vec4  geometrySolid = texture(u_geometry_solid, texcoord);
    float geometryDepthSolid = texture(u_geometry_depth_solid, texcoord).r;
    vec4  geometryTranslucent = texture(u_geometry_translucent, texcoord);
    float geometryDepthTranslucent = texture(u_geometry_depth_translucent, texcoord).r;
    vec4  geometryEntity = texture(u_geometry_entity, texcoord);
    float geometryDepthEntity = texture(u_geometry_depth_entity, texcoord).r;
    vec4  geometryWeather = texture(u_geometry_weather, texcoord);
    float geometryDepthWeather = texture(u_geometry_depth_weather, texcoord).r;
    // vec4  geometry_clouds = texture(u_geometry_clouds, texcoord);
    // float geometry_depth_clouds = texture(u_geometry_depth_clouds, texcoord).r;
    vec4  geometryParticles = texture(u_geometry_particles, texcoord);
    float geometryDepthParticles = texture(u_geometry_depth_particles, texcoord).r;

    // -------
    // Lighting
    // -------
    // vec4 lightDataSolid = texture(u_geometry_light_solid, texcoord);
    // vec4 lightDataTranslucent = texture(u_geometry_light_translucent, texcoord);
    // vec4 lightDataEntity = texture(u_geometry_light_entity, texcoord);
    // vec4 lightDataWeather = texture(u_geometry_light_weather, texcoord);
    // vec4 lightDataParticles = texture(u_geometry_light_particles, texcoord);
    
    // vec4 geometryData = texture(u_geometry_data, texcoord);
    // vec3 heldLightColor = frx_heldLight.rgb;
    // float heldLightDist = frx_heldLight.w * 10.0;

    // viewPosEntity blockDistEntity entityEmissive lightEntity lightDataEntity heldLightFactorEntity

    // -------
    // Solid light
    // -------
    // vec3 viewPosSolid = setupViewSpacePos(texcoord, max(geometryDepthParticles, geometryDepthTranslucent));
    // float blockDistSolid = length(viewPosSolid);
    // vec3 solidEmissive = geometrySolid.rgb;
    // vec3 lightSolid = vec3(1.0);
    // lightSolid = mix(lightSolid.rgb * MIN_CAVE_LIGHT, lightSolid.rgb, lightDataSolid.y);
    // lightSolid = mix(lightSolid, lightSolid * MIN_SKY_LIGHT, getTimeOfDayFactors().y * lightDataSolid.y);
    // lightSolid = mix(lightSolid, lightSolid * vec3(4.8, 3.2, 2.8), max(lightDataSolid.x * (1.0 - lightDataSolid.y), lightDataSolid.x * (1.0 - getTimeOfDayFactors().x)));
    // lightSolid = mix(lightSolid, lightSolid * DAY_BRIGHTNESS, min(lightDataSolid.y, getTimeOfDayFactors().x));
    // if(geometryData.y == 0) lightSolid *= lightDataSolid.z;
    // if(geometryData.w == 0) lightSolid *= lightDataSolid.w * 0.3 + 0.7;
    // float heldLightFactorSolid = (heldLightDist / blockDistSolid) * HANDHELD_LIGHT_INTENSITY * (1.0 - min(getTimeOfDayFactors().x, lightDataSolid.y)) * (1.0 - frx_luminance(lightSolid.rgb));
    // lightSolid = mix(lightSolid, lightSolid * 2.0 * heldLightColor, max(heldLightFactorSolid, 0.0));
    // geometrySolid.rgb *= lightSolid;
    // geometrySolid.rgb = mix(geometrySolid.rgb, solidEmissive.rgb, geometryData.x);

    // -------
    // Translucent light
    // -------
    // vec3 viewPosTranslucent = setupViewSpacePos(texcoord, geometryDepthTranslucent);
    // float blockDistTranslucent = length(viewPosTranslucent);
    // vec3 translucentEmissive = geometryTranslucent.rgb;
    // vec3 lightTranslucent = vec3(1.0);
    // lightTranslucent = mix(lightTranslucent.rgb * MIN_CAVE_LIGHT, lightTranslucent.rgb, lightDataTranslucent.y);
    // lightTranslucent = mix(lightTranslucent, lightTranslucent * MIN_SKY_LIGHT, getTimeOfDayFactors().y * lightDataTranslucent.y);
    // lightTranslucent = mix(lightTranslucent, lightTranslucent * vec3(4.8, 3.2, 2.8), max(lightDataTranslucent.x * (1.0 - lightDataTranslucent.y), lightDataTranslucent.x * (1.0 - getTimeOfDayFactors().x)));
    // lightTranslucent = mix(lightTranslucent, lightTranslucent * DAY_BRIGHTNESS, min(lightDataTranslucent.y, getTimeOfDayFactors().x));
    // if(geometryData.y == 0) lightTranslucent *= lightDataTranslucent.z;
    // if(geometryData.w == 0) lightTranslucent *= lightDataTranslucent.w * 0.3 + 0.7;
    // float heldLightFactorTranslucent = (heldLightDist / blockDistTranslucent) * HANDHELD_LIGHT_INTENSITY * (1.0 - min(getTimeOfDayFactors().x, lightDataTranslucent.y)) * (1.0 - frx_luminance(lightTranslucent.rgb));
    // lightTranslucent = mix(lightTranslucent, lightTranslucent * 2.0 * heldLightColor, max(heldLightFactorTranslucent, 0.0));
    // geometryTranslucent.rgb *= lightTranslucent;
    // geometryTranslucent.rgb = mix(geometryTranslucent.rgb, translucentEmissive.rgb, geometryData.x);

    // -------
    // Entity light
    // -------
    // vec3 viewPosEntity = setupViewSpacePos(texcoord, max(geometryDepthParticles, geometryDepthTranslucent));
    // float blockDistEntity = length(viewPosEntity);
    // vec3 entityEmissive = geometrySolid.rgb;
    // vec3 lightEntity = vec3(1.0);
    // lightEntity = mix(lightEntity.rgb * MIN_CAVE_LIGHT, lightEntity.rgb, lightDataEntity.y);
    // lightEntity = mix(lightEntity, lightEntity * MIN_SKY_LIGHT, getTimeOfDayFactors().y * lightDataEntity.y);
    // lightEntity = mix(lightEntity, lightEntity * vec3(4.8, 3.2, 2.8), max(lightDataEntity.x * (1.0 - lightDataEntity.y), lightDataEntity.x * (1.0 - getTimeOfDayFactors().x)));
    // lightEntity = mix(lightEntity, lightEntity * DAY_BRIGHTNESS, min(lightDataEntity.y, getTimeOfDayFactors().x));
    // if(geometryData.y == 0) lightEntity *= lightDataEntity.z;
    // if(geometryData.w == 0) lightEntity *= lightDataEntity.w * 0.3 + 0.7;
    // float heldLightFactorEntity = (heldLightDist / blockDistEntity) * HANDHELD_LIGHT_INTENSITY * (1.0 - min(getTimeOfDayFactors().x, lightDataEntity.y)) * (1.0 - frx_luminance(lightEntity.rgb));
    // lightEntity = mix(lightEntity, lightEntity * 2.0 * heldLightColor, max(heldLightFactorEntity, 0.0));
    // geometryEntity.rgb *= lightEntity;
    // geometryEntity.rgb = mix(geometryEntity.rgb, entityEmissive.rgb, geometryData.x);

    // -------
    // Weather light
    // -------


    // -------
    // Particles light
    // -------


    // -------
    // Apply custom sky
    // -------
    vec4 sky = texture(u_sky, texcoord);
    if(max(geometryDepthTranslucent, geometryDepthParticles) == 1.0) { 
        geometrySolid = sky;
    }

    // -------
    // Composite Sorting
    // -------
    color_layers[0] = geometrySolid;
    depth_layers[0] = geometryDepthSolid;
    active_layers = 1;

    try_insert(geometryTranslucent, geometryDepthTranslucent);
    try_insert(geometryEntity, geometryDepthEntity);
    try_insert(geometryWeather, geometryDepthWeather);
    //try_insert(geometry_clouds, geometry_depth_clouds);
    try_insert(geometryParticles, geometryDepthParticles);

    vec3 composite = color_layers[0].rgb;
    for (int ii = 1; ii < active_layers; ++ii) {
        composite = blend(composite, color_layers[ii]);
    }

    vec3 b;
    if(frx_luminance(geometryTranslucent.rgb) != 0.0) {
        b = max(geometryTranslucent.rgb, 1.0);
    }
    bool isTranslucent = frx_luminance(b) >= 1.0;
    if(isTranslucent) {
        b = geometrySolid.rgb;
    }

    compositeColor = vec4(composite, 1.0);
    translucentOnly = vec4(b.rgb, 1.0);
}
