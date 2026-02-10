#ifndef POINT_H
#define POINT_H

// will start as integer values but can be adjusted to subpixel positions
struct Point {
    float x = 0;
    float y = 0;

    Point operator+(const Point &other) const {
        return Point{x + other.x, y + other.y};
    }

    // Overload the - operator (subtraction)
    Point operator-(const Point &other) const {
        return Point{x - other.x, y - other.y};
    }

    // Overload the * operator (multiplication by a scalar)
    // The left operand is the class object (this), the right is a double.
    Point operator*(float scalar) const {
        return Point{x * scalar, y * scalar};
    }

    Point operator/(float scalar) const {
        return Point{x / scalar, y / scalar};
    }

    // Friend function to allow float * Vector
    friend Point operator*(float scalar, const Point &v) {
        return Point{v.x * scalar, v.y * scalar};
        ;  // Calls the member function for the actual logic
    }

    Point &operator+=(const Point &other) {
        x += other.x;
        y += other.y;
        return *this;
    }

    static float distSq(Point a, Point b) {
        return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
    }
};

#endif