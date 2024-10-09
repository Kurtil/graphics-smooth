// Only one triangle with only fill style

const path1 = [20, 20, 100, 100, 200, 20];
const polygon1 = new PIXI.Polygon(path1);
polygon1.closeStroke = true;
graphics.beginFill(0x3500FA, 1.0, true);
graphics.drawShape(polygon1);

// indexes 0, 1, 2

const data = {
  "0": 100,
  "1": 100,
  "2": 20,
  "3": 20,
  "4": 200,
  "5": 20,
  "6": -0.07421595603227615,
  "7": 1.33999764919281,
  "8": 0,
  "9": 496,
  "10": 0,
  "11": null,

  "12": 100,
  "13": 100,
  "14": 20,
  "15": 20,
  "16": 200,
  "17": 20,
  "18": -2.4142136573791504,
  "19": -1,
  "20": 0,
  "21": 497,
  "22": 0,
  "23": null,

  "24": 100,
  "25": 100,
  "26": 20,
  "27": 20,
  "28": 200,
  "29": 20,
  "30": 2.850780963897705,
  "31": -1,
  "32": 0,
  "33": 498,
  "34": 0,
  "35": null
}

/**
 * 496: { type: 31, vertexNum: 0, capType: 0 }
 * 497: { type: 31, vertexNum: 1, capType: 0 }
 * 498:  { type: 31, vertexNum: 2, capType: 0 }
 */

// 496 / 16 = 31

// for type 31
// flag1 = 1
// flag2 = 1
// flag3 = 1