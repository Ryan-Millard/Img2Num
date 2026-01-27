#ifndef UTILS_H
#define UTILS_H

#include <emscripten.h>
#include <iostream>
#include <vector>
#include <iomanip>
#include <fstream>
#include <string>

void EMSCRIPTEN_KEEPALIVE saveSVG(const std::string& filename, int width, int height, 
             const std::vector<std::vector<Point>>& rawChains, 
             const std::vector<std::vector<Point>>& closedLoops) {

    EM_ASM({
        // Make a directory and mount IDBFS
        FS.mkdir('/offline');
        FS.mount(IDBFS, {}, '/offline');
        // Then sync to load existing data and prepare for saving
        FS.syncfs(true, function (err) {
            if (err) console.log("Sync error: " + err);
            else console.log("IDBFS synced.");
        });
    });
    
    std::ofstream f(std::strcat("/offline/", filename.c_str()));
    if (!f.is_open()) {
        std::cerr << "Error opening file: " << filename << "\n";
        return;
    }

    // SVG Header
    f << "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"" << width * 10 << "\" height=\"" << height * 10 << "\" viewBox=\"0 0 " << width << " " << height << "\">\n";
    
    // Background (White)
    f << "<rect width=\"" << width << "\" height=\"" << height << "\" fill=\"white\"/>\n";

    // Style Definitions
    f << "<style>\n";
    f << "  .chain { fill: none; stroke: #ccc; stroke-width: 0.2; stroke-linecap: round; }\n";
    f << "  .loop { fill: none; stroke-width: 0.5; stroke-opacity: 0.8; }\n";
    f << "  .vertex { fill: red; r: 0.2; }\n";
    f << "</style>\n";

    // 1. Draw Raw Chains (Background Layer - Light Gray)
    for (const auto& chain : rawChains) {
        f << "<polyline points=\"";
        for (const auto& p : chain) {
            f << p.x << "," << p.y << " ";
        }
        f << "\" class=\"chain\" />\n";
    }

    // 2. Draw Closed Loops (Foreground Layer - Colors)
    std::string colors[] = {"#FF0000", "#00AA00", "#0000FF", "#FF00FF", "#FFAA00", "#00AAAA"};
    int colorIdx = 0;

    for (const auto& loop : closedLoops) {
        std::string color = colors[colorIdx % 6];
        colorIdx++;

        f << "<polygon points=\"";
        for (const auto& p : loop) {
            f << p.x << "," << p.y << " ";
        }
        f << "\" class=\"loop\" stroke=\"" << color << "\" />\n";
    }

    f << "</svg>\n";
    f.close();
    std::cout << "Saved visualization to " << filename << "\n";

    // Sync again to save changes from MEMFS to IndexedDB
    EM_ASM({
        FS.syncfs(false, function (err) {
            if (err) console.log("Sync error: " + err);
            else console.log("File saved to IndexedDB.");
        });
    });
    // 2. Trigger browser download using JS
    /*EM_ASM({
        var a = document.createElement('a');
        a.href = 'output.svg';
        a.download = 'output.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });*/
}

#endif