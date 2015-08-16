# metaProcedural
Procedural generation library for meta2d engine.

# Usage
1. Add script manually or write 
`meta.import("Procedural");`
2. 
```javascript
var tilesX = 64;
var tilesY = 64;

var generator = new Procedural.Generator();
generator.gen(tilesX, tilesY);

console.log(generator.cellsX, generator.cellsY, generator.data);
```
