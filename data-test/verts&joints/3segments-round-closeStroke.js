const path1 = [20, 20, 100, 100, 200, 10];
const polygone = new PIXI.Polygon(path1);
polygone.closeStroke = true;

const graphics = new PIXI.smooth.SmoothGraphics();
graphics.lineStyle({
  width: 4,
  color: 0xffffff,
  cap: PIXI.LINE_CAP.ROUND,
  join: PIXI.LINE_JOIN.ROUND,
});
graphics.drawShape(polygone);

// =>
const verts = [200, 10, 20, 20, 100, 100, 200, 10, 20, 20, 100, 100]

const joints = [0, 12, 12, 12, 0, 0];
