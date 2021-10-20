struct Ray {
    vec3 origin;
    vec3 direction;
};

vec2 raySphere(vec3 center, float radius, Ray ray) {
    vec3 offset = ray.origin - center;
    const float a = 1;
    float b = 2 * dot(offset, ray.direction);
    float c = dot(offset, offset) - radius * radius;

    float discriminant = b * b - 4 * a * c;
    if(discriminant > 0) {
        float s = sqrt(discriminant);
        float distToSphereNear = max(0, (-b - s) / (2 * a));
        float distToSphereFar = (-b - s) / (2 * a);

        if(distToSphereFar >= 0) {
            return vec2(distToSphereNear, distToSphereFar - distToSphereNear);
        }
    } else {
        return vec2(0.0, 0.0);
    }
}