Lithium ![v2.0.0](http://img.shields.io/badge/version-2.0.0-brightgreen.svg)
=================

Apparently I'm A: too lazy to learn WebGL, and B: too opinionated to even bother looking for an alternative. On the upside, writing this was a heck of a learning experience, and I'm rather pleased with how it turned out. I think it'll complement [console](https://github.com/adamhovorka/console) v2 quite nicely.

## Requirements

- [Dot.js](https://github.com/adamhovorka/dot) >=2.0.0

## Example Code

    var w = new Li("myCanvas")
      .load([
        { "type":"camera",
          "c":{"x":0,"y":0,"z":0},
          "t":{"y":0,"p":0,"r":0},
          "f":90,"s":1 },

        { "type":"rect",
          "s":{"x":1,"y":1,"z":1},
          "c":{"x":-1,"y":0,"z":0},
          "t":{"y":-0.0625,"p":-0.03125,"r":0.02},
          "k":"#fff" }

      ]).render();

A more complete example can be seen in `demo.html`.

## Usage

An instance is created with var `w = new Li();` which can optionally be passed a canvas or the ID of a canvas. If an canvas isn't passed on instantiation, a canvas object or id must later be passed into `w.setCA(canvas)`.

### Instance Methods

All instance methods are chainable except `get`.

- Canvas selection: `w.setCA(<canvas or id>)`
- Dot magnification: `w.setX(magnification level)`
- Loading a whole new world: `w.load(world)`
- World manipulation: `w.set(id, [property,] [sub-property,] value)`, `w.get(id)`
- Rendering: `w.render()`

### Onjects

There are only three kinds of objects at the moment: `camera`, `line`, and `rect`.

#### Cameras

The first object in any world (position 0) must be a camera. They have the following properties:

- `type: "camera"`
- `c:` (center)
  - `{x, y, z}`
- `t:` (rotation)
  - `{y (yaw), p (pitch), r (roll)}`
- `f` (field of view, degrees)
- `s` (size)

#### Lines

Lines have the following properties:

- `type: "line"`
- `a: {x, y, z}`
- `b: {x, y, z}`
- `k: "#(hexadecimal color)"`

#### Rects

Rects have the following properties:

- `type: "rect"`
- `s:` (size)
  - `{x, y, z}`
- `c:` (center)
  - `{x, y, z}`
- `t:` (rotation)
  - `{y (yaw), p (pitch), r (roll)}`
- `k: "#(hexadecimal color)"`
