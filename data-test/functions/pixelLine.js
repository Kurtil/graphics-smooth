/**
 * js equivalent to the glsl function pixelLine:

float pixelLine(float x, float A, float B) {
  return clamp(x + 0.5, 0.0, 1.0);
}
 */

function pixelLine(x, A, B) {
  return Math.min(Math.max(x + 0.5, 0), 1);
}

const x = process.argv[2];

if (!x) {
  console.log("Please provide a x");
  process.exit(1);
}

// const A = process.argv[3];
// const B = process.argv[4];

// console.log(pixelLine(x, A, B));
console.log(pixelLine(x));
