# Sprites & Visual Art Documentation

`Super Adventure World` utilizes a real-time procedural pixel art generation and offscreen canvas caching system in `js/sprites.js`.

## Features:
1. **Dynamic Pixel Synthesis**: Every sprite (Hero, Sporey Mushroom, Shelly Turtle, Flappy Winged Enemy, Coins, Question Blocks, Bricks, Castle, Clouds, Mountains) is synthesized at run time with authentic retro palettes.
2. **Offline & Zero CORS Restrictions**: Because sprites are generated on in-memory HTML5 Canvas buffers, the game runs directly from double-clicking `index.html` on any device without missing image paths or browser security policy blockades (`file:///`).
3. **Razor-sharp Retro Scaling**: Rendered with `imageSmoothingEnabled = false` for authentic 8-bit/16-bit pixel sharpness at all display resolutions.

A vector visual preview is available in [spritesheet.svg](file:///c:/Users/hp/OneDrive/Desktop/Mario%20Type%20Game/assets/sprites/spritesheet.svg).
