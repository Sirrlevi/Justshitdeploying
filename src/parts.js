/* SVG artwork for the parts that move or cast shadows. Arm space: origin = pivot, +x along the arm's reference line. */

import { P, TUBE, tubePath, COLLAR_END, HEAD_ANGLE, HEAD_LEN, TIP, THETA_REST, DEG } from './geom.js';

const f = (n) => (+n).toFixed(2);

/* ───────── tonearm ───────── */
export function buildArm() {
  const [ex, ey] = COLLAR_END;
  const ha = HEAD_ANGLE * DEG;
  const Lh = HEAD_LEN;
  const tube = tubePath();
  const plateLen = Lh - 16;

  const defs = `
    <linearGradient id="gCw" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3b3a37"/><stop offset=".22" stop-color="#cfcbc1"/><stop offset=".42" stop-color="#f3f1ea"/>
      <stop offset=".7" stop-color="#8b8880"/><stop offset="1" stop-color="#33322f"/>
    </linearGradient>
    <linearGradient id="gShaft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#55534f"/><stop offset=".4" stop-color="#e6e3db"/><stop offset="1" stop-color="#4a4844"/>
    </linearGradient>
    <linearGradient id="gRubber" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0d0d0c"/><stop offset=".3" stop-color="#3b3a37"/><stop offset=".55" stop-color="#171615"/><stop offset="1" stop-color="#080808"/>
    </linearGradient>
    <linearGradient id="gPlate" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8d8a83"/><stop offset=".28" stop-color="#f1efe8"/><stop offset=".62" stop-color="#bebab0"/><stop offset="1" stop-color="#6c6963"/>
    </linearGradient>
    <linearGradient id="gCart" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#1b1a19"/><stop offset=".3" stop-color="#4c4a45"/><stop offset=".55" stop-color="#242321"/><stop offset="1" stop-color="#0c0c0b"/>
    </linearGradient>
    <filter id="fArmBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur id="armBlur" stdDeviation="3"/></filter>`;

  const ribs = Array.from({ length: 6 }, (_, i) => `<path d="M${-132 + i * 4} -27V27" stroke="#000" stroke-opacity=".25" stroke-width="1"/>`).join('');

  const holes = [24, 50, 76, 102].map((x, i) => {
    const y = i % 2 ? 6.5 : -6.5;
    return `<g transform="translate(${x} ${y})">
      <circle r="6" fill="#171615"/><circle r="6" fill="none" stroke="#caa764" stroke-width="1.7"/>
      <circle r="6.9" fill="none" stroke="#000" stroke-opacity=".35" stroke-width=".8"/>
      <path d="M-3 -1.5 A3.6 3.6 0 0 1 3 -2" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="1"/></g>`;
  }).join('');

  const body = `
    <!-- counterweight -->
    <rect x="-70" y="-7" width="30" height="14" fill="url(#gShaft)"/>
    <rect x="-158" y="-12" width="20" height="24" rx="3.5" fill="url(#gCw)"/>
    <rect x="-146" y="-27" width="80" height="54" rx="7" fill="url(#gCw)"/>
    <rect x="-108" y="-27" width="18" height="54" fill="url(#gRubber)"/>${ribs}
    <rect x="-146" y="-27" width="80" height="54" rx="7" fill="none" stroke="#000" stroke-opacity=".4"/>
    <rect x="-145" y="-26" width="78" height="52" rx="6.5" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width=".8"/>
    <!-- tube -->
    <path d="${tube}" fill="none" stroke="#37363a" stroke-width="26" stroke-linecap="butt" stroke-linejoin="round" opacity=".9"/>
    <path d="${tube}" fill="none" stroke="#6f6c66" stroke-width="23.5" stroke-linecap="butt" stroke-linejoin="round"/>
    <path d="${tube}" fill="none" stroke="#a9a59b" stroke-width="18" stroke-linecap="butt" stroke-linejoin="round"/>
    <path d="${tube}" fill="none" stroke="#d6d2c8" stroke-width="11.5" stroke-linecap="butt" stroke-linejoin="round" transform="translate(-1.1 -.8)"/>
    <path d="${tube}" fill="none" stroke="#f9f7f0" stroke-width="4.2" stroke-linecap="butt" stroke-linejoin="round" transform="translate(-2.6 -1.9)" opacity=".95"/>
    <!-- collar + headshell -->
    <g transform="translate(${f(ex)} ${f(ey)}) rotate(${f(ha)})">
      <rect x="${f(Lh - 66)}" y="-21" width="64" height="42" rx="3.5" fill="url(#gCart)"/>
      <rect x="${f(Lh - 66)}" y="-21" width="64" height="42" rx="3.5" fill="none" stroke="#fff" stroke-opacity=".16"/>
      <rect x="${f(Lh - 22)}" y="-21" width="20" height="42" rx="3" fill="#2d2c2a"/>
      <path d="M${f(Lh - 8)} -3.6 L${f(Lh + 2)} 0 L${f(Lh - 8)} 3.6Z" fill="#d6b26c"/>
      <rect x="3" y="-17" width="${f(plateLen)}" height="34" rx="5" fill="url(#gPlate)"/>
      <rect x="3" y="-17" width="${f(plateLen)}" height="34" rx="5" fill="none" stroke="#3b3935" stroke-opacity=".7"/>
      <rect x="4.5" y="-15.5" width="${f(plateLen - 3)}" height="31" rx="4" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".8"/>
      ${holes}
      <path d="M46 -16 C 60 -22 68 -31 78 -44" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="3.8" stroke-linecap="round"/>
      <path d="M46 -16 C 60 -22 68 -31 78 -44" fill="none" stroke="#d9d5cb" stroke-width="2.6" stroke-linecap="round"/>
      <circle cx="78.5" cy="-44.5" r="3.4" fill="#b9b5aa" stroke="#000" stroke-opacity=".45" stroke-width=".8"/>
      <rect x="-30" y="-15.5" width="36" height="31" rx="4.5" fill="url(#gShaft)"/>
      <path d="M-22 -15.5V15.5M-8 -15.5V15.5M2 -15.5V15.5" stroke="#000" stroke-opacity=".3" stroke-width="1.1"/>
      <rect x="-30" y="-15.5" width="36" height="31" rx="4.5" fill="none" stroke="#000" stroke-opacity=".4"/>
    </g>
    <!-- bearing yoke at the pivot -->
    <path class="arm-hit" d="${tube} L${f(TIP.x)} ${f(TIP.y)}"/>`;

  const sil = `
    <rect x="-158" y="-27" width="92" height="54" rx="7" stroke="none"/>
    <path d="${tube}" fill="none" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(${f(ex)} ${f(ey)}) rotate(${f(ha)})" stroke="none">
      <rect x="${f(Lh - 66)}" y="-21" width="66" height="42" rx="4"/>
      <rect x="-30" y="-16" width="${f(Lh - 8)}" height="32" rx="5"/>
      <path d="M46 -16 C 60 -22 68 -31 78 -44" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/>
    </g>`;

  return { defs, body, sil };
}

/* ───────── static plate details and the rest stand ───────── */
export function buildDecor() {
  const screw = (x, y, r, rot) => `
    <g transform="translate(${x} ${y}) rotate(${rot})">
      <circle r="${r + 1.6}" fill="#000" opacity=".35"/><circle r="${r}" fill="url(#gScrew)"/>
      <circle r="${r}" fill="none" stroke="#000" stroke-opacity=".4" stroke-width=".8"/>
      <path d="M${-r * .72} 0H${r * .72}" stroke="#2b2926" stroke-width="${r * .26}" stroke-linecap="round"/>
      <path d="M${-r * .72} ${r * .3}H${r * .72}" stroke="#fff" stroke-opacity=".4" stroke-width=".7"/></g>`;

  // curved slot in the plate, left of the housing
  const slot = `
    <path d="M931 266 A80 80 0 0 1 880 208" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="16" stroke-linecap="round" transform="translate(1.4 1.8)"/>
    <path d="M931 266 A80 80 0 0 1 880 208" fill="none" stroke="#121110" stroke-width="13" stroke-linecap="round"/>
    <path d="M931 266 A80 80 0 0 1 880 208" fill="none" stroke="#000" stroke-opacity=".55" stroke-width="13" stroke-linecap="round" transform="translate(-1 -1.2)" opacity=".5"/>`;

  const stat = `${slot}
    ${screw(886, 146, 8.5, 20)}${screw(903, 284, 7.5, -35)}${screw(1022, 252, 6.8, 70)}
    <circle cx="1010" cy="272" r="13" fill="#000" opacity=".4" filter="url(#fSoft)"/>
    <circle cx="1010" cy="272" r="12" fill="url(#gScrew)"/><circle cx="1010" cy="272" r="12" fill="none" stroke="#000" stroke-opacity=".45"/>`;

  // rest stand under the parked arm
  const a = TUBE_REST_POINT;
  const stand = `
    <g transform="translate(${f(a.x)} ${f(a.y)}) rotate(${f(a.rot)})">
      <rect x="-42" y="-14" width="84" height="34" rx="8" fill="#000" opacity=".5" filter="url(#fSoft)" transform="translate(6 9)"/>
      <rect x="-42" y="-17" width="84" height="34" rx="8" fill="url(#gSteel)"/>
      <rect x="-42" y="-17" width="84" height="34" rx="8" fill="none" stroke="#000" stroke-opacity=".5"/>
      <rect x="-40.5" y="-15.5" width="81" height="31" rx="7" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width=".9"/>
      <rect x="-33" y="-12" width="15" height="24" rx="5" fill="url(#gRubber)"/><rect x="18" y="-12" width="15" height="24" rx="5" fill="url(#gRubber)"/>
      <rect x="-31" y="-11" width="4" height="22" rx="2" fill="#fff" opacity=".12"/><rect x="20" y="-11" width="4" height="22" rx="2" fill="#fff" opacity=".12"/>
      ${screw(-37.5, 12, 3.6, 30)}
      ${screw(37.5, -12, 3.6, -20)}
    </g>`;
  return { stat, stand };
}

/* where the parked tube crosses the stand: a point on the rest-pose tube plus the base's rotation */
const TUBE_REST_POINT = (() => {
  const w = [[917.3, 348.3], [916.7, 410.7]];
  const mid = { x: 917.1, y: 342 };
  const ang = Math.atan2(w[1][1] - w[0][1], w[1][0] - w[0][0]) * DEG;
  return { x: mid.x, y: mid.y, rot: ang - 90 };
})();

/* ───────── cue lever ───────── */
export const LEVER = { x: 1010, y: 272, down: 74, up: 36 };
export function buildLever() {
  return `
    <g>
      <rect x="2" y="-3" width="56" height="6" rx="3" fill="url(#gLever)"/>
      <rect x="2" y="-3" width="56" height="6" rx="3" fill="none" stroke="#000" stroke-opacity=".4" stroke-width=".8"/>
      <rect x="52" y="-5.6" width="32" height="11.2" rx="5.6" fill="url(#gBlack)"/>
      <rect x="52" y="-5.6" width="32" height="11.2" rx="5.6" fill="none" stroke="#000" stroke-opacity=".6" stroke-width=".8"/>
      <path d="M58 -3.4H80" stroke="#fff" stroke-opacity=".38" stroke-width="1.2" stroke-linecap="round"/>
      <circle r="8" fill="url(#gScrew)" stroke="#000" stroke-opacity=".45"/>
      <circle r="2.6" fill="#2a2825"/>
    </g>`;
}
export const LEVER_SIL = `<rect x="2" y="-3" width="56" height="6" rx="3"/><rect x="52" y="-5.6" width="32" height="11.2" rx="5.6"/><circle r="8"/>`;

/* ───────── volume scale ───────── */
export function buildTicks(n = 11, from = -135, to = 135) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = ((from + ((to - from) * i) / (n - 1)) * Math.PI) / 180;
    const major = i % 5 === 0 || i === n - 1;
    const r1 = 49, r2 = major ? 57 : 53.5;
    const x1 = Math.sin(a) * r1, y1 = -Math.cos(a) * r1, x2 = Math.sin(a) * r2, y2 = -Math.cos(a) * r2;
    s += `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}" stroke="#2b2926" stroke-width="${major ? 2.4 : 1.7}" stroke-linecap="round"/>`;
    s += `<path d="M${f(x1 + 0.7)} ${f(y1 + 0.9)}L${f(x2 + 0.7)} ${f(y2 + 0.9)}" stroke="#fff" stroke-opacity=".35" stroke-width=".8" stroke-linecap="round"/>`;
  }
  return s;
}

export const PIVOT = P;
export const REST_ANGLE = THETA_REST;
