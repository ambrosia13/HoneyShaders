# Honey Shaders

Shaderpack for the [Canvas Renderer](https://github.com/vram-guild/canvas). Adds a customizable pipeline to the game which works best with material shaders to accompany.

This is in early alpha at the moment, and may not look very pretty. It has several noticeable bugs and visual artifacts.

## Currently adds:

- Bloom that supports realistic emissivity values more reminiscent to that of real life, completely customizable (WIP)
- Tonemapping & HDR support (WIP, currently only for bloom)
- Support for vanilla effects
- Underwater & underlava blur and screen tints
- Shader effects triggered by potion activation
- Many misc & memey effects. For those that like fun!

## Known issues:

- Bloom "lags" behind the original image
- Some objects look strange with bloom. For example, entities will have bloom if against the sky.
- Some visual artifacts & probably poor performance
- The shaderpack is generally very incomplete and not very suitable for normal gameplay. I wouldn't recommend using it if you want pretty pictures.

# Credits

- Xordev for providing me permission to use their blur function from the [Ominous Shaderpack](https://github.com/XorDev/Ominous-Shaderpack) (used for bloom and blur effects)

- Spiralhalo's [Canvas Tutorial](https://github.com/spiralhalo/CanvasTutorial/wiki) for teaching me how to make a Canvas pipeline. Also credits to their shaderpack [Lumi Lights](https://github.com/spiralhalo/LumiLights) for being a great example for a working pipeline.

- Grondag, author of Canvas and FREX, for creating and maintaining such a nice shader API.

# Screenshots

![screenshot 1](https://github.com/Poisoned-Honey/HoneyShaders/blob/main/images/image1.png?raw=true)
![screenshot 2](https://github.com/Poisoned-Honey/HoneyShaders/blob/main/images/image2.png?raw=true)