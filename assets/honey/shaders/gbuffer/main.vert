#include honey:shaders/lib/includes.glsl 

#ifdef VANILLA_LIGHTING
    out vec3 directionalLight;
#endif
out vec2 faceUV;

void frx_pipelineVertex() {
    if (frx_modelOriginScreen) {
        gl_Position = frx_guiViewProjectionMatrix * frx_vertex;
        frx_distance = length(gl_Position.xyz);
    } else {
        frx_vertex += frx_modelToCamera;
        gl_Position = frx_viewProjectionMatrix * frx_vertex;
        frx_distance = length(frx_vertex.xyz);
    }
    
    // -------
    // Diffuse shading
    // -------
    #ifdef VANILLA_LIGHTING
        vec3 sunVector = getSunVector();
        vec3 moonVector = getMoonVector();
        float temp = mix(dot(frx_vertexNormal.xyz, sunVector), dot(frx_vertexNormal, vec3(0.0, 0.5, 1.0)), getTimeOfDayFactors().z);
        temp = mix(temp, dot(frx_vertexNormal.xyz, moonVector), getTimeOfDayFactors().y);
        directionalLight = vec3(temp * 0.5 + 0.5);
        vec3 tdata = getTimeOfDayFactors();
        directionalLight = mix(directionalLight, directionalLight * vec3(0.8, 1.5, 2.0), tdata.y * frx_smootherstep(0.5, 1.0, directionalLight));
        directionalLight = mix(directionalLight, directionalLight * vec3(2.0, 1.5, 0.8), tdata.z * frx_smootherstep(0.5, 1.0, directionalLight));
        directionalLight = mix(directionalLight, directionalLight * vec3(2.0, 1.8, 1.4), tdata.x * frx_smootherstep(0.5, 1.0, directionalLight));
        directionalLight = mix(directionalLight, vec3(1.0), 1.0 - frx_vertexLight.y);
        directionalLight = directionalLight + 0.4;
    #endif
}