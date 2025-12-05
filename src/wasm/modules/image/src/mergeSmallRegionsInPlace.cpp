#include "mergeSmallRegionsInPlace.h"
#include <climits>
#include <cstdint>
#include <queue>
#include <vector>

struct Pixel {
  int x, y;
};

// Helper to get 1D index from x,y
inline int idx(int x, int y, int width) { return y * width + x; }

// Compare two RGBA pixels
inline bool sameColor(const uint8_t *img, int w, int h, int x1, int y1, int x2,
                      int y2) {
  int i1 = idx(x1, y1, w) * 4;
  int i2 = idx(x2, y2, w) * 4;
  return img[i1] == img[i2] && img[i1 + 1] == img[i2 + 1] &&
         img[i1 + 2] == img[i2 + 2] && img[i1 + 3] == img[i2 + 3];
}

// Region metadata for bounding box
struct Region {
  int size = 0;
  int minX = INT_MAX, maxX = INT_MIN;
  int minY = INT_MAX, maxY = INT_MIN;

  void add(int x, int y) {
    size++;
    if (x < minX)
      minX = x;
    if (x > maxX)
      maxX = x;
    if (y < minY)
      minY = y;
    if (y > maxY)
      maxY = y;
  }

  int width() const { return maxX - minX + 1; }
  int height() const { return maxY - minY + 1; }

  bool isBigEnough(int minArea, int minWidth, int minHeight) const {
    return size >= minArea && width() >= minWidth && height() >= minHeight;
  }
};

// TODO: check for gaps inside regions - its possible their dimensions are fine,
// but inner gaps reduce effective width and height
void mergeSmallRegionsInPlace(uint8_t *pixels, int width, int height,
                              int minArea, int minWidth, int minHeight) {
  std::vector<int> labels(width * height, -1);
  std::vector<Region> regions;
  int nextLabel = 0;

  // Flood-fill labeling
  for (int y = 0; y < height; ++y) {
    for (int x = 0; x < width; ++x) {
      if (labels[idx(x, y, width)] != -1)
        continue;

      Region r;
      std::queue<Pixel> q;
      q.push({x, y});
      labels[idx(x, y, width)] = nextLabel;
      r.add(x, y);

      while (!q.empty()) {
        Pixel p = q.front();
        q.pop();
        int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
        for (auto &d : dirs) {
          int nx = p.x + d[0], ny = p.y + d[1];
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (labels[idx(nx, ny, width)] == -1 &&
                sameColor(pixels, width, height, p.x, p.y, nx, ny)) {
              labels[idx(nx, ny, width)] = nextLabel;
              r.add(nx, ny);
              q.push({nx, ny});
            }
          }
        }
      }

      regions.push_back(r);
      nextLabel++;
    }
  }

  // Merge small regions
  for (int y = 0; y < height; ++y) {
    for (int x = 0; x < width; ++x) {
      int l = labels[idx(x, y, width)];
      if (regions[l].isBigEnough(minArea, minWidth, minHeight))
        continue;

      // Check immediate neighbors
      int dirs[4][2] = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};
      for (auto &d : dirs) {
        int nx = x + d[0], ny = y + d[1];
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          int nl = labels[idx(nx, ny, width)];
          if (nl != l &&
              regions[nl].isBigEnough(minArea, minWidth, minHeight)) {
            // Copy color
            for (int c = 0; c < 4; c++)
              pixels[idx(x, y, width) * 4 + c] =
                  pixels[idx(nx, ny, width) * 4 + c];
            labels[idx(x, y, width)] = nl;
            break;
          }
        }
      }
    }
  }
}
