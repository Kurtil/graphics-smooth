/**
 * Compute the type of a vertex joint, like the one returned by the vertexJoint attribute of the vertex shader + computation :
    float type = floor(aVertexJoint / 16.0);
    float vertexNum = aVertexJoint - type * 16.0;
    float capType = floor(type / 32.0); // will be 0 for non-cap types, else [1, 2, 3, 4]
    type -= capType * 32.0; // not changed for non-cap types, else 0 for cap round, 16 for cap butt (type == 48), 18 for cap square (type == 82)
 **/
function computeType(vertexJoint) {
  let type = Math.floor(vertexJoint / 16);
  const vertexNum = vertexJoint - type * 16;
  const capType = Math.floor(type / 32);
  type -= capType * 32;

  return {
    type,
    vertexNum,
    capType
  };
}

const vertexJoint = process.argv[2];

if (!vertexJoint) {
  console.log("Please provide a vertex joint");
  process.exit(1);
}

console.log(computeType(vertexJoint));