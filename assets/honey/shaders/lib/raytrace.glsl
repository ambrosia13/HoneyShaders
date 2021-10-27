// ray tracing stuff - unused, experimental
struct Ray {
    vec3 origin;
    vec3 direction;
};

vec3 cloudsPlane(Ray ray, vec3 color) {
    if(ray.direction.y <= 0.0) {
        return color;
    }
    return vec3(1.0, 0.0, 0.0);
}
