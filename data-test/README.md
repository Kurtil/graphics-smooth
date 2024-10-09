# Smooth Graphics

## Smooth Graphics

Contains fill style, line style, matrix AND some methods to create a path (POLYGONE) with a points array.
Then, delegate the drawing to SmoothGraphicsGeometry:
```js
public drawShape(shape: IShape): this
{
  if (!this._holeMode) {
    this._geometry.drawShape(shape, this._fillStyle.clone(), this._lineStyle.clone(), this._matrix );
  } else {
    this._geometry.drawHole(shape, this._matrix);
  }

  return this;
}
```

## Smooth Graphics Geometry

`drawShape` only add a new `SmoothGraphicsData` into its `graphicsData`array.

It contains two importants data containers:
- graphicsData: an array of SmoothGraphicsData, related to shapes
- BuildData : verts, joints... no buffers yet

## IShapeBuiler

Contains three methods:

`path(graphicsData: SmoothGraphicsData, target: BuildData): void;`

=> Used to set/clean the `graphicsData.points` array.

`line(graphicsData: SmoothGraphicsData, target: BuildData): void;`
`fill(graphicsData: SmoothGraphicsData, target: BuildData): void;`

=> From `graphicsData` properties and especially the `points` array, these methods fill the `buildData` `verts` and `joints` arrays.
Only the `fill` methods uses/sets the `graphicsData.triangles` array.
