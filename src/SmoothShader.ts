import { Program, Shader } from '@pixi/core';
import { IGraphicsBatchSettings } from './core/BatchDrawCall';

const smoothVert = `#version 300 es
precision highp float;
const float JOINT_BEVEL = 4.0;
const float JOINT_MITER = 8.0;
const float JOINT_ROUND = 12.0;
const float JOINT_CAP_BUTT = 16.0;
const float JOINT_CAP_SQUARE = 18.0;
const float JOINT_CAP_ROUND = 20.0;

const float CAP_BUTT = 1.0;
const float CAP_SQUARE = 2.0;
const float CAP_ROUND = 3.0;

const float MITER_LIMIT = 10.0;

// === geom ===
in vec2 aPrev;
in vec2 aPoint1;
in vec2 aPoint2;
in vec2 aNext;
in float aVertexJoint;
in float aTravel;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform vec4 tint;

out vec4 vSegmentCoreAA;
out vec3 vArc;
out float vType;

uniform float resolution;
uniform float expand;

// === style ===
in float aStyleId;
in vec4 aColor;

out float vTextureId;
out vec4 vColor;
out vec2 vTextureCoord;
out vec2 vTravel;

uniform vec2 styleLine[%MAX_STYLES%];
uniform vec3 styleMatrix[2 * %MAX_STYLES%];
uniform float styleTextureId[%MAX_STYLES%];
uniform vec2 samplerSize[%MAX_TEXTURES%];

vec2 doBisect(vec2 norm, float len, vec2 norm2, float len2,
    float dy, bool inner) {
    vec2 bisect = (norm + norm2) / 2.0;
    bisect /= dot(norm, bisect);
    if (inner) {
        if (len < len2) {
            if (abs(dy * (bisect.x * norm.y - bisect.y * norm.x)) > len) {
                return dy * norm;
            }
        } else {
            if (abs(dy * (bisect.x * norm2.y - bisect.y * norm2.x)) > len2) {
                return dy * norm;
            }
        }
    }
    return dy * bisect;
}

void main(void){
    vec2 pointA = (translationMatrix * vec3(aPoint1, 1.0)).xy;
    vec2 pointB = (translationMatrix * vec3(aPoint2, 1.0)).xy;

    vec2 segment = pointB - pointA;
    float len = length(segment);
    vec2 forward = segment / len;
    vec2 norm = vec2(forward.y, -forward.x); // clockwise 90 degrees rotation

    /**
     * 4 first vertices are for the segment.
     * O to 3 clockwise from pointA to pointB.
     * Segment Head is composed of 0 and 3.
     *
     * 5 to 9 are for the joint / cap.
     * id:4 always represent the joint inner vertex.
     *
     *       SEGMENT        JOINT / CAP
     *    0 _________ 1   5 _____6     
     *     |        /|     |    /  \     
     *     |      /  |     |   /    / 7   
     *     A    /    B     |  /   /  |    
     *     |  /      |     | / /     |   
     *     |/________|     |/_______ |  
     *    3           2   4           8
     *    ^
     *   HEAD 
     *
     *  ^ y
     *  |
     *  |---> x
     * 
     * ( before projection, y is then inverted : important for the cross product sign )
     *
     */

    // TODO change the following lines, getting the correct cap type!
    float type = floor(aVertexJoint / 16.0);
    float vertexNum = aVertexJoint - type * 16.0;
    float capType = floor(type / 32.0); // will be 0 for non-cap types, else [1, 2, 3, 4]
    type -= capType * 32.0; // not changed for non-cap types, else 0 for cap round, 16 for cap butt (type == 48), 18 for cap square (type == 82)

    // cap round treated as the end of joint cap round
    // note: capType: CAP_ROUND is ALWAYS paired with type: NONE (0)
    // note: +4.0 means that the vertex starts at 4.0 for the JOIN/CAP but vertexNum initialy go from 0.0 to 3.0 ONLY. It misses the last joint/cap vertex (8).
    if (capType == CAP_ROUND) {
        vertexNum += 4.0;
        type = JOINT_CAP_ROUND;
        capType = 0.0;
    }

    int styleId = int(aStyleId + 0.5);
    float halfLineWidth = styleLine[styleId].x / 2.;
    vTextureId = floor(styleTextureId[styleId] / 4.0);

    vec2 base, next;
    bool isSegmentHead = vertexNum == 0. || vertexNum == 3.;
    if (isSegmentHead) {
        next = pointA;
        base = (translationMatrix * vec3(aPrev, 1.0)).xy;
    } else {
        next = (translationMatrix * vec3(aNext, 1.0)).xy;
        base = pointB;
    }
    vec2 adjacentSegment = next - base;
    float len2 = length(adjacentSegment);
    vec2 norm2 = vec2(adjacentSegment.y, -adjacentSegment.x) / len2; // clockwise 90 degrees rotation

    float crossProduct = norm.x * norm2.y - norm.y * norm2.x;

    bool isAngleBetweenSegmentsObtus = dot(norm, norm2) < 0.;
    bool colinear = abs(crossProduct) < 0.01;

    bool oppositeDirection = colinear && isAngleBetweenSegmentsObtus;

    if (oppositeDirection && type == JOINT_ROUND) {
        type = JOINT_CAP_ROUND;
    }

    // AA
    vType = 0.0;
    float dy2 = -1000.0;

    /**
     * Used to AA the segment sides.
     * @type { vec4(d: float, w: float, x: float, y: float) }
     * d: signed distance to the center line
     * w: half line width
     * x: aa value for the segment head
     * y: aa value for the segment tail
     * x and y goes from expand to -segment side length.
     */
    vSegmentCoreAA = vec4(0.0, halfLineWidth, 0.0, halfLineWidth);

    /**
     * Used to AA the round caps and joint.
     * @type { vec4(x: float, y: float, z: float, w: float) }
     * CAP
     * x: segment aligned distance to the line end. 0 for vertex 4-5, halfLineWidth + expand for vertex 6-7-8.
     * y: normal aligned distance to the segment. halfLineWidth + expand for vertex 4-7-8, -(halfLineWidth + expand) for vertex 5-6.
     * z: 0
     * JOINT
     * x: bisector aligned distance to segment joint. 0 at joint, +halfLineWidth for outer vertex, - segment length for inner vertex.
     * y: bisector aligned distance to edges. 0 at joint, +halfLineWidth for vertex 5, -halfLineWidth for vertex 8.
     * z: halfLineWidth * dot(norm, norm3) => from halfLineWidth for aligned segments to 0 for opposite segments. Equal across all vertices.
     * BOTH
     * w: half line width
     * SPECIAL CASE FOR BEVEL
     * z: halfLineWidth * dot(norm, norm3) - side * dot(pos, norm3) => from halfLineWidth for aligned segments to 0 for opposite segments.
     */
    vArc = vec3(0.0);

    vec2 pos;
    float dy = halfLineWidth + expand;

    if (vertexNum <= 3.) { 
        /**
         * SEGMENT part of JOINT_(MITER/BEVEL/ROUND) OR JOINT_CAP_BUTT OR JOINT_CAP_SQUARE
         * The last two have only 4 vertices for a JOINT_CAP_*, JOINT_CAP_ROUND has 8.
         * Also handle the segment head CAP_BUTT and CAP_SQUARE.
         *
         *       SEGMENT   
         *    0 _________ 1
         *     |        /| 
         *     |      /  | 
         *     A    /    B 
         *     |  /      | 
         *     |/________| 
         *    3           2
         */
        bool isVertexSegmentLeftSide = vertexNum < 2.;
        if (isVertexSegmentLeftSide) {
            dy = -dy;
        }
        if (oppositeDirection) {
            // terminal segments (and overlapping intermediate segments)
            pos = dy * norm;
        } else {
            // intermediate segments
            bool isInnerVertex = isVertexSegmentLeftSide ? crossProduct >= 0.0 : crossProduct < 0.0;
            if (isSegmentHead) {
                isInnerVertex = !isInnerVertex;
            }
            if (isInnerVertex) {
                pos = doBisect(norm, len, norm2, len2, dy, true);
            } else {
                pos = dy * norm;
            }
        }
        vSegmentCoreAA.w = -1000.0;
        // CAP_BUTT and CAP_SQUARE
        if (capType == CAP_BUTT || capType == CAP_SQUARE) {
            float extra = capType == CAP_SQUARE ? halfLineWidth : 0.;
            vec2 back = -forward;
            if (isSegmentHead) {
                // position is updated only for the segment head to handle the cap
                pos += back * (extra + expand);
                dy2 = expand;
            } else {
                dy2 = dot(segment + pos, back) - extra;
            }
        }
        if (type == JOINT_CAP_BUTT || type == JOINT_CAP_SQUARE) {
            float extra = type == JOINT_CAP_SQUARE ? halfLineWidth : 0.;
            if (isSegmentHead) {
                vSegmentCoreAA.w = dot(-segment + pos, forward) - extra; 
            } else {
                pos += forward * (extra + expand);
                vSegmentCoreAA.w = expand; 
                if (capType != 0.) {
                    // CAP_SQUARE or CAP_BUTT are possible here when the line is one segment long with caps on both sides. dy2 must take into account the cap on segment tail.
                    dy2 -= extra + expand;
                }
            }
        }
    } else if (type == JOINT_CAP_ROUND) {
        /**
         * From vertNum 4 to 8 :
         *
         *    4 ________ 7 & 8  
         *     |        /|   
         *     |      /  | 
         *     x    /    |     x = half circle center. radius = halfLineWidth + expand
         *     |  /      |   
         *     |/_______ |  
         *    5          6
         */
        if (vertexNum == 4.) {
            dy = -dy;
            pos = dy * norm;
        } else if (vertexNum == 5.) {
            pos = dy * norm;
        } else if (vertexNum == 6.) {
            pos = dy * norm + dy * forward;
            vArc.x = dy;
        } else {
            // vertexNum 7 or 8, merged as the same case
            pos = -dy * norm + dy * forward;
            vArc.x = dy;
            dy = -dy;
        }
        vArc.y = dy;
        vArc.z = 0.0;
        vType = 3.0;
    } else {
        /**
         * JOINT PART (opposite to segment) of JOINT_(MITER/BEVEL/ROUND) from vertNum 4 to 8
         * 
         *    5 _____6     
         *     |    /  \     
         *     |   /    / 7   
         *     |  /   /  |    
         *     | / /     |   
         *     |/_______ |  
         *    4           8
         */
        bool isInnerVertex = crossProduct < 0.0;
        if (isInnerVertex) {
            dy = -dy;
        }
        float side = sign(dy);
        vec2 norm3 = normalize(norm + norm2);

        if (type == JOINT_MITER) {
            vec2 farVertex = doBisect(norm, len, norm2, len2, dy, false);
            if (length(farVertex) > abs(dy) * MITER_LIMIT) {
                type = JOINT_BEVEL;
            }
        }

        if (vertexNum == 4.) {
            pos = doBisect(norm, len, norm2, len2, -dy, true);
        } else if (vertexNum == 5.) {
            pos = dy * norm;
        } else if (vertexNum == 8.) {
            pos = dy * norm2;
        } else {
            // vertexNum 6 or 7
            if (type == JOINT_ROUND) {
                pos = doBisect(norm, len, norm2, len2, dy, false);
                float d2 = abs(dy);
                if (length(pos) > abs(dy) * 1.5) {
                    if (vertexNum == 6.) {
                        pos.x = dy * norm.x - d2 * norm.y;
                        pos.y = dy * norm.y + d2 * norm.x;
                    } else {
                        pos.x = dy * norm2.x + d2 * norm2.y;
                        pos.y = dy * norm2.y - d2 * norm2.x;
                    }
                }
            } else if (type == JOINT_MITER) {
                pos = doBisect(norm, len, norm2, len2, dy, false); // not a far vertex because it was handled previously
            } else if (type == JOINT_BEVEL) {
                float d2 = side / resolution;
                if (vertexNum == 6.) {
                    pos = dy * norm + d2 * norm3;
                } else {
                    pos = dy * norm2 + d2 * norm3;
                }
            }
        }

        if (type == JOINT_ROUND) {
            vArc.x = side * dot(pos, norm3);
            vArc.y = pos.x * norm3.y - pos.y * norm3.x; // 2D cross product
            vArc.z = dot(norm, norm3) * halfLineWidth;
            vType = 3.0;
        } else if (type == JOINT_MITER) {
            vType = 1.0;
        } else if (type == JOINT_BEVEL) {
            vType = 2.0;
            vArc.z = dot(norm, norm3) * halfLineWidth - side * dot(pos, norm3);
        }

        dy = side * dot(pos, norm);
        dy2 = side * dot(pos, norm2);
    }

    pos += isSegmentHead ? pointA : pointB;

    vSegmentCoreAA = vec4(dy, vSegmentCoreAA.y, dy2, vSegmentCoreAA.w) * resolution;
    vArc = vArc * resolution;
    vTravel = vec2(aTravel + dot(pos - pointA, vec2(-norm.y, norm.x)), 1.);

    mat3 reverseY = mat3(
        1, 0, 0,
        0, -1, 0,
        0, 0, 1
    ); // TODO dev code to see with y bottom to top

    gl_Position = vec4((reverseY * projectionMatrix * vec3(pos, 1.0)).xy, 0.0, 1.0);

    vColor = aColor * tint;
}`;

const precision = `#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif
`;

const smoothFrag = `%PRECISION%
in vec4 vColor;
in vec4 vSegmentCoreAA;
in vec3 vArc;
in float vType;
in float vTextureId;
in vec2 vTextureCoord;
in vec2 vTravel;
uniform sampler2D uSamplers[%MAX_TEXTURES%];

out vec4 color;

%PIXEL_LINE%

void main(void){
    %PIXEL_COVERAGE%

    vec4 texColor;
    float textureId = floor(vTextureId+0.5);
    %FOR_LOOP%

    color = vColor * texColor * alpha;
}
`;

const pixelLineFunc = `


/**
 * Returns the pixel coverage from a half-plane.
 * x is the right edge of the half-plane.
 * ex:
 * - if x = 0, the half plane covers the left half of the pixel.
 * - if x = .5, the half plane covers the full pixel.
 * - if x = -.5, the half plane covers nothing.
 *
 *       |-----------|
 *       |           |
 *       |     .     |
 *       |           |
 *       |-----------|
 * 
 *  ---(-.5)---0---(+.5)--> x       
 * 
 * @param {float} x - right edge of the half-plane
 * @return {float} pixel coverage [0, 1]
 */
float pixelLine(float x) {
    return clamp(x + .5, 0.0, 1.);
}
`;

const pixelCoverage = `float alpha = 1.0;
float signedDistance = vSegmentCoreAA.x; // signed distance to center line goes from -(halfLineWidth + 1) to halfLineWidth + 1 (left to right)
float halfLineWidth = vSegmentCoreAA.y;

if (vType == 0.) {
    // SEGMENT
    float left = pixelLine(signedDistance - halfLineWidth);
    float right = pixelLine(signedDistance + halfLineWidth);
    float segmentSideAlpha = right - left;
    
    float top = vSegmentCoreAA.w - 0.5;
    float bottom = min(vSegmentCoreAA.w + 0.5, 0.0);
    float segmentEndAlpha = max(bottom - top, 0.0);

    float near = vSegmentCoreAA.z - 0.5;
    float far = min(vSegmentCoreAA.z + 0.5, 0.0);
    float segmentStartAlpha = max(far - near, 0.0);

    alpha = segmentSideAlpha * segmentStartAlpha * segmentEndAlpha;
} else {
    float a1 = pixelLine(- halfLineWidth - signedDistance);
    float a2 = pixelLine(halfLineWidth - signedDistance);
    float b1 = pixelLine(- vSegmentCoreAA.w - vSegmentCoreAA.z);
    float b2 = pixelLine(vSegmentCoreAA.w - vSegmentCoreAA.z);

    alpha = a2 * b2 - a1 * b1;

    if (vType == 2.) {
        // BEVEL
        alpha *= pixelLine(vArc.z);
    } else if (vType == 3.) {
        // ROUND
        float alpha_plane = pixelLine(vArc.z - vArc.x);
    
        float d = length(vArc.xy);
        float alpha_circle = pixelLine(halfLineWidth - d);

        float alpha_round = max(alpha_circle, alpha_plane);
    
        alpha = min(alpha, alpha_round);
    }
}
`;

/**
 * @memberof PIXI.smooth
 */
export class SmoothGraphicsShader extends Shader
{
    settings: IGraphicsBatchSettings;

    constructor(settings: IGraphicsBatchSettings,
        vert = smoothVert,
        frag = smoothFrag,
        uniforms = {})
    {
        vert = SmoothGraphicsShader.generateVertexSrc(settings, vert);
        frag = SmoothGraphicsShader.generateFragmentSrc(settings, frag);

        const { maxStyles, maxTextures } = settings;
        const sampleValues = new Int32Array(maxTextures);

        for (let i = 0; i < maxTextures; i++)
        {
            sampleValues[i] = i;
        }
        super(Program.from(vert, frag), (Object as any).assign(uniforms, {
            styleMatrix: new Float32Array(6 * maxStyles),
            styleTextureId: new Float32Array(maxStyles),
            styleLine: new Float32Array(2 * maxStyles),
            samplerSize: new Float32Array(2 * maxTextures),
            uSamplers: sampleValues,
            tint: new Float32Array([1, 1, 1, 1]),
            resolution: 1,
            expand: 1,
        }));
        this.settings = settings;
    }

    static generateVertexSrc(settings: IGraphicsBatchSettings, vertexSrc = smoothVert): string
    {
        const { maxStyles, maxTextures } = settings;

        vertexSrc = vertexSrc.replace(/%MAX_TEXTURES%/gi, `${maxTextures}`)
            .replace(/%MAX_STYLES%/gi, `${maxStyles}`);

        return vertexSrc;
    }

    static generateFragmentSrc(settings: IGraphicsBatchSettings, fragmentSrc = smoothFrag): string
    {
        const { maxTextures, pixelLine } = settings;

        fragmentSrc = fragmentSrc.replace(/%PRECISION%/gi, precision)
            .replace(/%PIXEL_LINE%/gi, pixelLineFunc)
            .replace(/%PIXEL_COVERAGE%/gi, pixelCoverage)
            .replace(/%MAX_TEXTURES%/gi, `${maxTextures}`)
            .replace(/%FOR_LOOP%/gi, this.generateSampleSrc(maxTextures));

        return fragmentSrc;
    }

    static generateSampleSrc(maxTextures: number): string
    {
        let src = '';

        src += '\n';
        src += '\n';

        for (let i = 0; i < maxTextures; i++)
        {
            if (i > 0)
            {
                src += '\nelse ';
            }

            if (i < maxTextures - 1)
            {
                src += `if(textureId < ${i}.5)`;
            }

            src += '\n{';
            src += `\n\ttexColor = texture(uSamplers[${i}], vTextureCoord);`;
            src += '\n}';
        }

        src += '\n';
        src += '\n';

        return src;
    }
}
