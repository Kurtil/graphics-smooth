const path1 = [20, 20, 100, 100, 200, 20];
const polygone = new PIXI.Polygon(path1);
polygone.closeStroke = false;

const graphics = new PIXI.smooth.SmoothGraphics();
graphics.lineStyle({
  width: 4,
  color: 0xffffff,
  cap: PIXI.LINE_CAP.SQUARE,
  join: PIXI.LINE_JOIN.MITER,
});
graphics.drawShape(polygone);

// =>
const verts = [100, 100, 20, 20, 100, 100, 200, 20, 100, 100];

const joints = [0, 72, 18, 0, 0];
