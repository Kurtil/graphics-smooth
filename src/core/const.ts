export enum JOINT_TYPE
{
    NONE = 0,
    JOINT_BEVEL = 4,
    JOINT_MITER = 8,
    JOINT_ROUND = 12,
    JOINT_CAP_BUTT = 16,
    JOINT_CAP_SQUARE = 18,
    JOINT_CAP_ROUND = 20,
    CAP_BUTT = 1 << 5, // 32
    CAP_SQUARE = 2 << 5, // 64
    CAP_ROUND = 3 << 5, // 96
}
