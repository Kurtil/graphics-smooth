/**
 * Compute the type of a fill flags, like the one returned by the vertex shader + computation :
    float flags = type - FILL_EXPAND;
    float flag3 = floor(flags / 4.0);
    float flag2 = floor((flags - flag3 * 4.0) / 2.0);
    float flag1 = flags - flag3 * 4.0 - flag2 * 2.0;
 **/

const FILL_EXPAND = 24;

function computeFillFlags(type) {
  const flags = type - FILL_EXPAND;
  const flag3 = Math.floor(flags / 4);
  const flag2 = Math.floor((flags - flag3 * 4) / 2);
  const flag1 = flags - flag3 * 4 - flag2 * 2;

  return {
    flag1,
    flag2,
    flag3,
  };
}

const vertexJoint = process.argv[2];

if (!vertexJoint) {
  console.log("Please provide a type");
  process.exit(1);
}

console.log(computeFillFlags(vertexJoint));
