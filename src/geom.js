/* Deck geometry. Everything lives on a 1120 × 900 grid (1 unit = --k in the CSS). */

export const W = 1120, H = 900;
export const C = { x: 442, y: 450 };          // spindle
export const P = { x: 960, y: 190 };          // tonearm pivot (vertical axis of the bearing)

export const R_REC = 352;                      // record edge
export const R_OUT = 338, R_IN = 135;          // first / last groove
export const R_STOP = 122;                     // arm cannot swing further in than this

export const DEG = 180 / Math.PI;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const wrapPi = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

/* Stylus position in arm space (origin = pivot, +x along the arm's reference line) */
export const TIP = { x: 588, y: 15 };
export const L = Math.hypot(TIP.x, TIP.y);
export const TIP_ANGLE = Math.atan2(TIP.y, TIP.x);
export const D = Math.hypot(C.x - P.x, C.y - P.y);
export const PSI = Math.atan2(C.y - P.y, C.x - P.x);

/* Where the stylus sits when the arm is parked */
export const REST_TIP = { x: 744, y: 737 };
export const R_REST = Math.hypot(REST_TIP.x - C.x, REST_TIP.y - C.y);
export const THETA_REST = Math.atan2(REST_TIP.y - P.y, REST_TIP.x - P.x) - TIP_ANGLE;

/* arm rotation that puts the stylus at distance d from the spindle */
export const thetaForD = (d) => PSI - Math.acos(clamp((L * L + D * D - d * d) / (2 * L * D), -1, 1)) - TIP_ANGLE;
export const dForTheta = (t) => Math.sqrt(Math.max(0, L * L + D * D - 2 * L * D * Math.cos(PSI - (t + TIP_ANGLE))));
export const THETA_IN = thetaForD(R_STOP);
export const THETA_MIN = THETA_REST - 3.2 / DEG;
export const fForD = (d) => clamp((R_OUT - d) / (R_OUT - R_IN), 0, 1);
export const dForF = (f) => R_OUT - f * (R_OUT - R_IN);

/* S-shaped tube, measured at rest in deck coordinates, then moved into arm space */
const TUBE_WORLD = [[950, 214], [943.5, 242.5], [922.9, 286], [917.3, 348.3], [916.7, 410.7], [912.4, 473], [896.7, 529], [875, 576], [853, 613]];
const cr = Math.cos(-THETA_REST), sr = Math.sin(-THETA_REST);
const toLocal = ([x, y]) => [(x - P.x) * cr - (y - P.y) * sr, (x - P.x) * sr + (y - P.y) * cr];
export const TUBE = TUBE_WORLD.map(toLocal);
export const COLLAR_END = TUBE[TUBE.length - 1];
export const HEAD_ANGLE = Math.atan2(TIP.y - COLLAR_END[1], TIP.x - COLLAR_END[0]);
export const HEAD_LEN = Math.hypot(TIP.x - COLLAR_END[0], TIP.y - COLLAR_END[1]);

/* Catmull–Rom through the tube points → cubic bezier path (arm space) */
export function tubePath(pts = TUBE, t = 0.5) {
  let d = `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
    const c1 = [p1[0] + ((p2[0] - p0[0]) * t) / 3, p1[1] + ((p2[1] - p0[1]) * t) / 3];
    const c2 = [p2[0] - ((p3[0] - p1[0]) * t) / 3, p2[1] - ((p3[1] - p1[1]) * t) / 3];
    d += ` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

/* deck coordinates of an arm-space point for a given arm rotation */
export const armToWorld = (x, y, theta) => ({
  x: P.x + x * Math.cos(theta) - y * Math.sin(theta),
  y: P.y + x * Math.sin(theta) + y * Math.cos(theta)
});

export const OMEGA0 = (Math.PI * 2 * 100) / 3 / 60;   // 33⅓ rpm in rad/s
