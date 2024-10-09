const path1 = [20, 20, 100, 100];
graphics.lineStyle({
  width: 4,
  color: 0xffffff,
  cap: PIXI.LINE_CAP.ROUND,
  join: PIXI.LINE_JOIN.ROUND,
});
graphics.drawShape(new PIXI.Polygon(path1));

// =>
const verts = [100, 100, 20, 20, 100, 100, 20, 20, 100, 100];

const joints = [0, 12, 12, 0, 0];
