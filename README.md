# Honey Shaders

Shaderpack for the [Canvas Renderer](https://github.com/vram-guild/canvas). Adds a customizable pipeline to the game which works best with material shaders to accompany.

This is in early alpha at the moment, and may not look very pretty. It has several noticeable bugs and visual artifacts. However, it is playable for normal gameplay. Providing feedback and reporting (unknown) bugs is greatly appreciated.

## Currently adds:

- Bloom that supports realistic emissivity values more reminiscent to that of real life, completely customizable (WIP)
- Tonemapping & HDR (WIP)
- Support for vanilla effects
- Fancy extra shader effects for various vanilla situations
- Many misc & memey effects. For those that like fun!

## Known issues:

- Bloom applies to certain things that shouldn't have bloom
- Minor visual artifacts
- Poor optimization
- Some config options may not work correctly 

# Credits

- Spiralhalo's [Canvas Tutorial](https://github.com/spiralhalo/CanvasTutorial/wiki) for teaching me how to make a Canvas pipeline. Also thanks to spiralhalo for helping me solve numerous issues.

- Grondag, author of Canvas and FREX, for creating and maintaining a pleasant shader API to work with.

- Credits to [Lumi Lights](https://github.com/spiralhalo/LumiLights) by Spiralhalo and Canvas Basic/Standard/Dev by Grondag for being great references for working pipelines.  

## Code Credits

- [Blur function used for bloom](https://github.com/XorDev/Ominous-Shaderpack/blob/main/shaders/lib/Blur.inc) by XorDev
- [RGB to HSV functions](https://gist.github.com/sugi-cho/6a01cae436acddd72bdf) by sugi-cho
- [Foam function for water](https://www.shadertoy.com/view/ltfGD7) by Polyflare


<!-- # Screenshots

![screenshot 1](https://github.com/Poisoned-Honey/HoneyShaders/blob/main/images/image1.png?raw=true)
![screenshot 2](https://github.com/Poisoned-Honey/HoneyShaders/blob/main/images/image2.png?raw=true) -->
