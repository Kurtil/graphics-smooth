const path1 = [20, 20, 100, 100, 200, 150, 200, 20];
const polygon1 = new PIXI.Polygon(path1);
polygon1.closeStroke = true;

const graphics = new PIXI.smooth.SmoothGraphics();
graphics.beginFill(0x3500fa, 1.0, true);
graphics.drawShape(polygon1);

// =>

const joints = [27, 0, 0, 0, 0, 0, 27, 0, 0, 0, 0, 0];
const verts = [
  100, 100, 20, 20, 200, 20,
  -0.5923591472464005, 0.8218544151266948, -2.4142135623730945, -1, 1, -1,
  200, 20, 200, 150, 100, 100,
  1, -1, 1.0000000000000004, 1.6180339887498953, -0.5923591472464005, 0.8218544151266948,
];
