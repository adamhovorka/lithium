/*
**  lithium.js - v2.0.0
**
**  A slightly more sane stylized 3D engine
**  [#] WebGL SchmebGL. I want pixely wireframes.
**
**  (i) Requires Dot: https://github.com/adamhovorka/dot
**
**  Copyleft @ 2014 Adam Hovorka - All Rights Reversed
*/

Li = (function() {
  // {{{ Private methods

  // {{{ Line drawing
  //  -= Draws a line from A to B
  function line(a, b, dot) {
    dot.line2(a.x, a.y, b.x, b.y); } // }}}
  // {{{ Relative coordinates
  //  -= Computes relative (rotated) point coordinates
  function rel(p, c, t) {
    var s = Math.sin, q = Math.cos;
    var i = { x:p.x-c.x, y:p.y-c.y, z:p.z-c.z}, j = {};

    // X-Axis rotation
    j.y = (i.y*q(-t.r)) - (i.z*s(-t.r));
    j.z = (i.y*s(-t.r)) + (i.z*q(-t.r));
    i.y = j.y; i.z = j.z;

    // Y-Axis rotation
    j.x = (i.z*s(-t.p)) + (i.x*q(-t.p));
    j.z = (i.z*q(-t.p)) - (i.x*s(-t.p));
    i.x = j.x; i.z = j.z;

    // Z-Axis rotation
    j.x = (i.x*q(-t.y)) - (i.y*s(-t.y));
    j.y = (i.x*s(-t.y)) + (i.y*q(-t.y));

    return {x:j.x,y:j.y,z:j.z};
  } // }}}
  // {{{ Vector addition
  function add(a, b) { return {x:(a.x+b.x),y:(a.y+b.y),z:(a.z+b.z)}; } // }}}
  // {{{ Field of view
  //  -= Computes the viewing distance required for the given field of view
  function fov(x) { return 1/Math.tan(x*Math.PI/360); } // }}}
  // {{{ Point projection
  //  -= Projects a point onto the YZ plane
  function project(p, f) {
    var f = fov(f);
    var q = f/(f-p.x);
    return {x: q*p.y,y: q*p.z};
  } // }}}
  // {{{ Rectangular prism corner calculation
  //  -= Returns a list of points
  function rect(s, c, t) {
    var n = [
      [ 1, 1, 1], [ 1, 1,-1],
      [ 1,-1, 1], [ 1,-1,-1],
      [-1, 1, 1], [-1, 1,-1],
      [-1,-1, 1], [-1,-1,-1],
    ], o = []; for (var i=0;i<8;i++) {
      var j = n[i];
      o[i] = add(rel({
      x: (j[0]*(s.x/2))+c.x,
      y: (j[1]*(s.y/2))+c.y,
      z: (j[2]*(s.z/2))+c.z
      },c,t),c);
    } return o;
  } // }}}
  // {{{ Rectangular prism edge calculation
  //  -= Turns the given list of points into a list of lines
  function rectline(p) { return [
    {a:p[0],b:p[1]},
    {a:p[0],b:p[2]},
    {a:p[0],b:p[4]},
    {a:p[1],b:p[3]},
    {a:p[1],b:p[5]},
    {a:p[2],b:p[3]},
    {a:p[2],b:p[6]},
    {a:p[3],b:p[7]},
    {a:p[4],b:p[5]},
    {a:p[4],b:p[6]},
    {a:p[5],b:p[7]},
    {a:p[6],b:p[7]}
  ];} // }}}
  // {{{ Rectangular prism projection
  //  -= Projects the given points around a rectangle
  function projrect(p, f) {
    for (var i=0;i<8;i++) p[i] = project(p[i], f);
    return p;
  } // }}}
  // {{{ Camera transform
  //  -= Transforms points relative to a given camera
  function camera(p, cam) {
    if (cam.type != "camera") throw new Error("Not a camera!");
    var tau = Math.PI*2; // XXX You may want to remove this.
    var t = {y:-cam.t.y*tau,p:cam.t.p*tau,r:cam.t.r*tau};
    var d = rel(p,cam.c,t); // XXX Don't forget that yaw is negative though.
    return {x:d.x/cam.s, y:d.y/cam.s, z:d.z/cam.s};
  } // }}}
  // {{{ World object -> lines
  //  -= Turns objects into projected line coordinates
  function process(obj, cam) {
    // TODO Implement groups of lines/objects
    if (obj.type == "line") {
      return {k:obj.k, p:[{a:project(obj.a, cam.f), b:project(obj.b, cam.f)}]};
    } else if (obj.type == "rect") {
      var tau = Math.PI*2; // XXX You may want to remove this.
      var t = {y:obj.t.y*tau,p:obj.t.p*tau,r:obj.t.r*tau};
      var pl = rect(obj.s,obj.c,t);
      for (var i=0;i<pl.length;i++) pl[i] = camera(pl[i], cam);
      return {k:obj.k, p:rectline(projrect(pl,cam.f))};
    } else { return {k:"#fff",p:[]}; }
  } // }}}
  // {{{ Draw
  //  -= Draws pre-projected objects
  function draw(obj, dot) {
    dot.setColor(obj.k || "#fff");
    for (var i=0;i<obj.p.length;i++) {
      line(obj.p[i].a, obj.p[i].b, dot);
    }
  } // }}}

  // }}}
  // {{{ Public methods
  return function(ca) {

    // {{{ Canvas selection:       setCA
    this.setCA = function(ca) {
      if (typeof ca == "string") {
         this._dot.setCA(document.getElementById(ca));
      } else { this._dot.setCA(ca); }
    }; // }}}
    // {{{ Magnification:          setX
    this.setX = function(x) { this._dot.setX(x); return this; }; // }}}
    // {{{ World manipulation:     set, get
    this.set = function(a, b, c, v) {
      if (v!==undefined) { this._world[a][b][c] = v;
      } else if (c!==undefined) { this._world[a][b] = c;
      } else { this._world[a] = b; }
      return this;
    };

    this.get = function(id) {
      return this._world[id];
    }; // }}}
    // {{{ Loading a whole world:  load
    this.load = function(world) {
      // What follows is, apparently, the most efficient way to deep clone an object.
      this._world = JSON.parse(JSON.stringify(world));

      if (this._world[0].type != "camera")
        throw new Error("First object in world isn't a camera!");

      return this;
    }; // }}}
    // {{{ Rendering:              render
    this.render = function() {
      if (this._world[0].type != "camera")
        throw new Error("First object in world isn't a camera!");

      this._dot.clear().setColor("#fff");
      for (var i=1;i<this._world.length;i++) {
        draw(process(this._world[i], this._world[0]), this._dot); }

      return this;
    }; // }}}

    // {{{ Initialization
    this._dot = new Dot()
    if (ca) { this.setCA(ca); } // }}}

  }; // }}}
})();
