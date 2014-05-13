LI = (function() {

  function e(d) { if (typeof d == "object") {
    d = JSON.stringify(d,undefined,2); }
    $("#debug").append(d+"\n"); }
  function te(d) { $("#debug").empty(); e(d); }

  // {{{ Draws a line from A to B
  function line(a, b, ca, cx) {
    var w = ca.width/2;
    var h = ca.height/2;
    cx.beginPath();
    cx.moveTo((a.x*w)+w, (-a.y*h)+h);
    cx.lineTo((b.x*w)+w, (-b.y*h)+h);
    cx.stroke();
  } // }}}

  // {{{ Computes relative (rotated) point coordinates
  function rel(p, c, t) {
    var k = $V([p.x - c.x, p.y - c.y, p.z - c.z]);
    k = Matrix.RotationX(-t.r).x(k);
    k = Matrix.RotationY(-t.p).x(k);
    k = Matrix.RotationZ(-t.y).x(k);
    k = k.elements;
    return {x:k[0],y:k[1],z:k[2]};
  } // }}}

  // {{{ Adds two vectors
  function add(a, b) { return {x:(a.x+b.x),y:(a.y+b.y),z:(a.z+b.z)}; } // }}}

  // {{{ Returns a list of points around a rectangular prism
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

  // {{{ Turns the list of points into a list of lines
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

  // {{{ Computes the viewing distance required for the given field of view
  function fov(x) { return 1/Math.tan(x*Math.PI/360);
  } // }}}

  // {{{ Projects a point onto the YZ plane
  function project(p, f) {
    var f = fov(f);
    var q = f/(f-p.x);
    return {x: q*p.y,y: q*p.z};
  } // }}}

  // {{{ Projects the given points around a rectangle
  function projrect(p, f) {
    for (var i=0;i<8;i++) p[i] = project(p[i], f);
    return p;
  } // }}}

  // {{{ Transforms points relative to a given camera
  function camera(p, cam) {
    if (cam.type != "camera") throw new Error("Not a camera!");
    var tau = Math.PI*2; // TODO You may want to remove this.
    var t = {y:-cam.t.y*tau,p:cam.t.p*tau,r:cam.t.r*tau};
    var d = rel(p,cam.c,t); // TODO Don't forget that yaw is negative though.
    return {x:d.x/cam.s, y:d.y/cam.s, z:d.z/cam.s};
  } // }}}

  // {{{ Draws pre-projected objects
  function draw(obj, ca, cx) {
    cx.strokeStyle = obj.k || "#fff";
    for (var i=0;i<obj.p.length;i++) {
      line(obj.p[i].a, obj.p[i].b, ca, cx);
    }
  } // }}}

  // {{{ Turns objects into projected line coordinates
  function process(obj, cam) {
    if (obj.type == "line") {

    } else if (obj.type == "rect") {
      var tau = Math.PI*2; // TODO You may want to remove this.
      var t = {y:obj.t.y*tau,p:obj.t.p*tau,r:obj.t.r*tau};
      var pl = rect(obj.s,obj.c,t);
      for (var i=0;i<pl.length;i++) pl[i] = camera(pl[i], cam);
      return {k:obj.k, p:rectline(projrect(pl,cam.f))};
    } else { return {k:"#fff",p:[]}; }
  } // }}}

  return {
    init: function(ca) {
      this.ca = ca;
      this.cx = this.ca.getContext("2d");
    },

    set: function(a, b, v) {
      this._world[a][b] = v;
      return this;
    },
    get: function(id) {
      return this._world[id];
    },

    load: function(world) {
      this._world = world },
    clear: function() {
      this.cx.clearRect(0, 0, this.ca.width, this.ca.height);},
    render: function() {
      this.clear();
      this.cx.lineCap = "round";
      this.cx.strokeStyle = "#fff";

      for (var i=1;i<this._world.length;i++) {
        draw(process(this._world[i], this._world[0]), this.ca, this.cx); }
    },

    test: function(i) {
      i = JSON.parse(i);
      this.load(i);
      this.render();
    }
  };
})();
