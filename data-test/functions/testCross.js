const previous = { x: 100, y: 100 };
const pointA = { x: 200, y: 200 };
const pointB = { x: 300, y: 30 };
const next = { x: 400, y: 400 };

function length(segment) {
  return Math.sqrt(segment.x * segment.x + segment.y * segment.y);
}

function getNormal(segment) {
  const len = length(segment);
  return { x: segment.y / len, y: -segment.x / len };
}

function cross(a, b) {
  return a.x * b.y - a.y * b.x;
}

const segment = { x: pointB.x - pointA.x, y: pointB.y - pointA.y };
const norm = getNormal(segment);

const previousSegment = { x: previous.x - pointA.x, y: previous.y - pointA.y };
const previousNorm = getNormal(previousSegment);

console.log("previous cross", cross(norm, previousNorm));

const nextSegment = { x: next.x - pointB.x, y: next.y - pointB.y };
const nextNorm = getNormal(nextSegment);

console.log("next cross", cross(norm, nextNorm));

