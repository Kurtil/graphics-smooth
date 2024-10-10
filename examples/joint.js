const app = new PIXI.Application({
  antialias: false,
  width: 800,
  height: 700,
  autoDensity: true,
  resolution: 1.0,
  backgroundColor: 0xffffff,
});
document.body.appendChild(app.view);

const graphics = new PIXI.smooth.SmoothGraphics();
app.stage.addChild(graphics);

const graphics2 = new PIXI.Graphics();
PIXI.Graphics.prototype.drawStar =
  PIXI.smooth.SmoothGraphics.prototype.drawStar;
graphics2.y = 300;
app.stage.addChild(graphics2);

let phase = 0; // -Math.PI/2;

function addLine(graphics, y, len, rad) {
  graphics.lineStyle({
    width: 30,
    color: 0,
    alpha: 0.5,
    join: PIXI.LINE_JOIN.MITER,
    cap: PIXI.LINE_CAP.SQUARE,
  });
  graphics.moveTo(150 - len, y);
  graphics.lineTo(150, y);
  graphics.lineTo(150 + Math.cos(phase) * rad, y + Math.sin(phase) * rad);

  graphics.lineStyle({
    width: 30,
    color: 0,
    alpha: 0.5,
    join: PIXI.LINE_JOIN.BEVEL,
    cap: PIXI.LINE_CAP.BUTT,
  });
  graphics.moveTo(350 + Math.cos(phase) * rad, y + Math.sin(phase) * rad);
  graphics.lineTo(350, y);
  graphics.lineTo(350 - len, y);

  graphics.lineStyle({
    width: 30,
    color: 0,
    alpha: 0.5,
    join: PIXI.LINE_JOIN.ROUND,
    cap: PIXI.LINE_CAP.ROUND,
  });
  graphics.moveTo(550 - len, y);
  graphics.lineTo(550, y);
  graphics.lineTo(550 + Math.cos(phase) * rad, y + Math.sin(phase) * rad);
}

function makeFigures(graphics) {
  graphics.clear();

  addLine(graphics, 100, 50, 60);
  addLine(graphics, 200, 50, 60);

  // static collinear lines
  graphics.lineStyle({
    width: 30,
    color: 0,
    alpha: 0.5,
    join: PIXI.LINE_JOIN.MITER,
    cap: PIXI.LINE_CAP.SQUARE,
  });
  graphics.moveTo(150, 20);
  graphics.lineTo(200, 20);
  graphics.lineTo(100, 20);

  graphics.lineStyle({
    width: 30,
    color: 0,
    alpha: 0.5,
    join: PIXI.LINE_JOIN.BEVEL,
    cap: PIXI.LINE_CAP.BUTT,
  });
  graphics.moveTo(350, 20);
  graphics.lineTo(400, 20);
  graphics.lineTo(300, 20);

  graphics.lineStyle({
    width: 30,
    color: 0,
    alpha: 0.5,
    join: PIXI.LINE_JOIN.ROUND,
    cap: PIXI.LINE_CAP.ROUND,
  });
  graphics.moveTo(550, 20);
  graphics.lineTo(600, 20);
  graphics.lineTo(500, 20);

  // static 3 segments
  graphics.lineStyle({
    width: 30,
    color: 0,
    alpha: 0.5,
    join: PIXI.LINE_JOIN.MITER,
    cap: PIXI.LINE_CAP.SQUARE,
  });
  graphics.moveTo(150, 270);
  graphics.lineTo(200, 270);
  graphics.lineTo(230, 250);
  graphics.lineTo(250, 250);


  graphics.lineStyle({
    width: 30,
    color: 0,
    alpha: 0.5,
    join: PIXI.LINE_JOIN.BEVEL,
    cap: PIXI.LINE_CAP.BUTT,
  });
  graphics.moveTo(350, 270);
  graphics.lineTo(400, 270);
  graphics.lineTo(430, 250);
  graphics.lineTo(450, 250);

  graphics.lineStyle({
    width: 30,
    color: 0,
    alpha: 0.5,
    join: PIXI.LINE_JOIN.ROUND,
    cap: PIXI.LINE_CAP.ROUND,
  });
  graphics.moveTo(550, 270);
  graphics.lineTo(600, 270);
  graphics.lineTo(630, 250);
  graphics.lineTo(650, 250);
}

// graphics.rotation = Math.PI * 3 / 2 - 0.0001;
app.ticker.add((delta) => {
  phase -= 0.04 * delta;
  makeFigures(graphics);
  makeFigures(graphics2);
});
