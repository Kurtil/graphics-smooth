// 2 joined segments -> 1 joint , 2 caps
// 3 points : p1 (20, 20), p2 (100, 100), p3 (200, 20)
const path1 = [20, 20, 100, 100, 200, 20];
const polygone = new PIXI.Polygon(path1);
polygone.closeStroke = false;

graphics.lineStyle({
  width: 4,
  color: 0x0000ff,
  cap: PIXI.LINE_CAP.BUTT,
  join: PIXI.LINE_JOIN.BEVEL,
});

// export enum JOINT_TYPE
// {
//     NONE = 0,
//     JOINT_BEVEL = 4,
//     JOINT_MITER = 8,
//     JOINT_ROUND = 12,
//     JOINT_CAP_BUTT = 16,
//     JOINT_CAP_SQUARE = 18,
//     JOINT_CAP_ROUND = 20,
//     CAP_BUTT = 1 << 5, // 32
//     CAP_SQUARE = 2 << 5, // 64
//     CAP_ROUND = 3 << 5, // 96
// }

// ... change style cap and join to test all possible values

/**
 * cap: BUTT
 * join: BEVEL
 * 
 * 576 to 584      -> { type: 4 , vertexNum: [0-8], capType: 1 } JOINT_BEVEL and CAP_BUTT    geom-buffer : p2 - p1 - p2 - p3
 * then 256 to 259 -> { type: 16, vertexNum: [0-3], capType: 0 } JOINT_CAP_BUTT and no cap   geom-buffer : p1 - p2 - p3 - p2
 */

/**
 * cap: BUTT
 * join: MITER
 * 
 * 640 to 648      -> { type: 8 , vertexNum: [0-8], capType: 1 } JOINT_MITER and CAP_BUTT    geom-buffer : p2 - p1 - p2 - p3
 * then 256 to 259 -> { type: 16, vertexNum: [0-3], capType: 0 } JOINT_CAP_BUTT and no cap   geom-buffer : p1 - p2 - p3 - p2
 */

/**
 * cap: BUTT
 * join: ROUND
 * 
 * 704 to 712      -> { type: 12, vertexNum: [0-8], capType: 1 } JOINT_ROUND and CAP_BUTT    geom-buffer : p2 - p1 - p2 - p3
 * then 256 to 259 -> { type: 16, vertexNum: [0-3], capType: 0 } JOINT_CAP_BUTT and no cap   geom-buffer : p1 - p2 - p3 - p2
 */

/**
 * cap: SQUARE
 * join: BEVEL
 * 
 * 1088 to 1096    -> { type: 4 , vertexNum: [0-8], capType: 2 } JOINT_BEVEL and CAP_SQUARE    geom-buffer : p2 - p1 - p2 - p3
 * then 288 to 291 -> { type: 18, vertexNum: [0-3], capType: 0 } JOINT_CAP_SQUARE and no cap   geom-buffer : p1 - p2 - p3 - p2
 */

/**
 * cap: SQUARE
 * join: MITER
 * 
 * 1152 to 1160    -> { type: 8 , vertexNum: [0-8], capType: 2 } JOINT_MITER and CAP_SQUARE    geom-buffer : p2 - p1 - p2 - p3
 * then 288 to 291 -> { type: 18, vertexNum: [0-3], capType: 0 } JOINT_CAP_SQUARE and no cap   geom-buffer : p1 - p2 - p3 - p2
 */

/**
 * cap: SQUARE
 * join: ROUND
 * 
 * 1216 to 1224    -> { type: 12, vertexNum: [0-8], capType: 2 } JOINT_ROUND and CAP_SQUARE    geom-buffer : p2 - p1 - p2 - p3
 * then 288 to 291 -> { type: 18, vertexNum: [0-3], capType: 0 } JOINT_CAP_SQUARE and no cap   geom-buffer : p1 - p2 - p3 - p2
 */

/**
 * cap: ROUND
 * join: BEVEL
 * 
 * 1536 to 1539   -> { type: 0 , vertexNum: [0-3], capType: 3 } JOINT_NONE and CAP_ROUND      geom-buffer : p1 - p2 - p1 - p2
 * 64 to 72       -> { type: 4 , vertexNum: [0-8], capType: 0 } JOINT_BEVEL and no cap        geom-buffer : p2 - p1 - p2 - p3
 * 320 to 328     -> { type: 20, vertexNum: [0-8], capType: 0 } JOINT_CAP_ROUND and no cap    geom-buffer : p1 - p2 - p3 - p2
 */

/**
 * cap: ROUND
 * join: MITER
 * 
 * 1536 to 1539   -> { type: 0 , vertexNum: [0-3], capType: 3 } JOINT_NONE and CAP_ROUND      geom-buffer : p1 - p2 - p1 - p2
 * 128 to 136     -> { type: 8 , vertexNum: [0-8], capType: 0 } JOINT_MITER and no cap        geom-buffer : p2 - p1 - p2 - p3
 * 320 to 328     -> { type: 20, vertexNum: [0-8], capType: 0 } JOINT_CAP_ROUND and no cap    geom-buffer : p1 - p2 - p3 - p2
 */

/**
 * cap: ROUND
 * join: ROUND
 * 
 * 1536 to 1539   -> { type: 0 , vertexNum: [0-3], capType: 3 } JOINT_NONE and CAP_ROUND      geom-buffer : p1 - p2 - p1 - p2
 * 192 to 200     -> { type: 12, vertexNum: [0-8], capType: 0 } JOINT_ROUND and no cap        geom-buffer : p2 - p1 - p2 - p3
 * 320 to 328     -> { type: 20, vertexNum: [0-8], capType: 0 } JOINT_CAP_ROUND and no cap    geom-buffer : p1 - p2 - p3 - p2
 */
