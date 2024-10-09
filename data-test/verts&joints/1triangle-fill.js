const path1 = [20, 20, 100, 100, 200, 20];
const polygon1 = new PIXI.Polygon(path1);
polygon1.closeStroke = true;

const graphics = new PIXI.smooth.SmoothGraphics();
graphics.beginFill(0x3500fa, 1.0, true);
graphics.drawShape(polygon1);

// =>

const joints = [31, 0, 0, 0, 0, 0];
const verts = [
  100, 100, 20, 20, 200, 20,
  -0.07421595271473622, 1.339997609658359, -2.4142135623730945, -1, 2.8507810593582117, -0.9999999999999994,
];
