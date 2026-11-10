/* Static — the after-hours mascot. A silent SVG/CSS/JS overlay: no mic, no speech, no network.
   It reads the real player state, lip-syncs to the real audio level, and only ever stands in free space
   or on the outer edge of things (it never covers text or controls). */
import { BeatTracker } from './beat.js';
const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const R = (a, b) => a + Math.random() * (b - a), pick = (a) => a[(Math.random() * a.length) | 0], cl = (v, a, b) => Math.min(b, Math.max(a, v));
const PAPER = '#f4ecd9', INK = '#1d140e', BR = '#d9b47a', TAU = Math.PI * 2;
const PAL = { shout: ['#ffe3d8', '#8a1c14'], angry: ['#ffe3d8', '#8a1c14'], sly: ['#f1eab9', '#4f4210'], sleepy: ['#dde6ec', '#27394a'] };   // bubble colours per mood
const LINES = {
  hi: ['yo. welcome in.', 'oh hey, a human!', 'namaste! chai ho gayi?', 'you made it. sit. spin something.', 'arre wah, mehmaan!', 'psst. the record is the main act.'],
  tap: ["hey! that's my forehead.", 'ow. rude.', "i'm static, not a button.", 'arre, gudgudi!', 'again? okay. again.', 'careful. i bite. (i don’t.)', 'booped. no refunds.', 'stop poking, start vibing.', 'is that all you got?', 'bro. bro. BRO.', 'tap tap tap. i know you’re there.'],
  mic: ['♪ check. one, two.', '♪ sound check. sab theek?', '♪ la la laaa~', 'mic: on. dignity: off.'],
  sing: ['♪ this is MY song now', '♪ na na na na~', '♪ feel it in the groove', '♪ dil se, dil se~', 'ooh this part slaps ♪', '♪ ek baar fir se~'],
  wake: ['…huh? i’m up.', 'i was only resting my eyes.', 'five more minutes…', 'zzz— who? what? oh, hi.'],
  end: ['…and scene.', 'encore? flip the switch again.', 'silence. my favourite song.', 'aaand that’s a wrap.'],
  angry: ['#@$%&!! that was MY spot!', 'you little $%@#!', '@#$%! ... sorry, mom.', 'grrr. %&$#@!!', 'ARGH. *!@#$%^&*', 'who did that?! #$%@!'],
  scared: ['AAAAAH!', 'put me down put me down!', 'no no no NO NO—', 'i can’t fly!!', 'mummyyyy!', 'wheeeee— no wait, AAAH!'],
  land: ['oof.', 'i meant to do that.', 'ow my everything.', 'gravity: 1, me: 0.', 'that was the plan. totally.', 'five stars. would fall again.'],
  dizzy: ['the room is spinning… oh wait, that’s me', 'tweet tweet?', 'i see birds. they’re judging me.', 'wobble wobble…'],
  prank: ['oops. my finger slipped.', 'who touched that? not me.', 'hehe. surprise!', 'just… testing the switch.', 'gotcha!', 'kidding, kidding! back on.'],
  ride: ['hop on! zoom zoom!', 'wooo, a merry-go-round!', 'running in place. cardio!', 'is this a treadmill?!'],
  touch: ['what’s that over there?', 'ooh, shiny.', 'i saw that.', 'poke! got it.'],
  curious: ['ooh. what’s that shiny thing?', 'is that a giant cookie?', 'huh. a very flat wheel.', 'a record! i can’t resist.'],
  spin: ['spin spin spin…', 'weeeee. look, it spins!', 'i’m a DJ now.', 'so many tiny grooves…'],
  toss: ['ta-da!', 'pizza style!', 'nailed it. (almost)'],
  back: ['perfect fit!', 'back where you belong.', 'good as new. better.'],
  prod: ['it’s heavier than it looks.', 'typo? no. perfect.', 'boop. the words wobble.', 'these letters are ticklish.'],
  proud: ['tour complete. i’m kind of a big deal.', 'five stars. i’d rate myself five stars.', 'you’re welcome. now go play.'],
  effort: ['nngh…', 'hnnnngh!', 'c’mon c’mon c’mon…', 'it’s stuck… no wait, it’s not.', 'heavy! who made this?', 'just. a. little. more…', 'push! push! push!'],
  purr: ['mmm… right there.', 'ahhh. okay that’s nice.', 'purr purr (i’m not a cat).', 'more. more. don’t stop.', 'you’re hired. forever. 💛', 'my favourite human 💛'],
  hurt: ['OW!', 'ouch! that hurt!', 'hey!! not so hard!', 'my head!!', 'bonk. rude.'],
  rage: ['#@$%&!! WHO DID THAT?!', 'I’LL BREAK THIS WHOLE %$#@ DECK!', 'ARGH!! *!@#$%^&*', 'you %@#$! you stupid &*$#!', 'GRRRR. @#$%!!', 'I. AM. NOT. A. DRUM!! $#@%'],
  calm: ['…okay. i’m calm. i’m calm.', 'sorry. i lost it. that was a lot.', 'deep breath. in… out… phew.', 'we don’t speak of that. 🙈'],
  annoyed: ['OI! i was VIBING, you %$#@!', 'who stopped it?! @#$%!!', 'rude. RUDE. $%@#!!', 'my song! my stage! you #$%@!'],
  annoyedSkip: ['OI! who changed my song?! @#$%!!', 'i was VIBING to that, you %$#@!', 'skip?! SKIP?! %@#$!!', 'rude! that was MY track! $%@#!'],
  smugSkip: ['fine. but this is MY song now.', 'hmph. ask me before skipping next time.', 'okay okay. i’ll sing this one. don’t touch.', 'skip it again and see what happens. 😤'],
  tired: ['phew… need a breather.', '*pant pant* intermission.', 'give me a sec, i’m dancing hard here.', 'okay okay, tiny break. the song goes on.'],
  recharged: ['okay!! recharged. WATCH THIS.', 'and we’re BACK!!', 'battery full. let’s gooo!', 'intermission over. encore time!'],
  smug: ['told you. my song, my rules.', 'back on. don’t touch it again.', 'try me. i dare you. 😤', 'there. fixed. you’re welcome.'],
  chat: ['i wonder what’s in that mug…', 'that plant is judging me.', 'do headphones dream?', 'someone should dust this desk.', 'i could do this all day.', 'psst, try dragging me.', 'pro tip: fling me. i dare you.', 'i have 0 chill and 3 moods.'],
  track: ['ooh. {t}.', '{t}? good taste.', 'oh this one. {t}!', '{t} hits different.', 'new track: {t}. vibe check.'],
  hit_mug: ['the mug did not move. i did.', 'ow. mug 1, me 0.', 'is it empty? asking for a friend.'], hit_headphones: ['headphones! soft landing.', 'boing. nice cushions.', 'do not borrow my ears.'],
  hit_plant: ['the plant caught me. thanks, plant.', 'leafy. judging me quietly.'], hit_books: ['ow. hardcover.', 'reading is dangerous.'], hit_deck: ['solid wood. ow.', 'the deck says no.'],
  hit_sketchbook: ['soft landing on the sketchbook.', 'i’m in the drawing now.'], hit_oldbook: ['dusty. achoo!', 'old book. older bruise.'],
};
Object.assign(LINES, {
  feel_hype: ['okay THIS one has energy!', 'oh we’re going UP. hold my antenna.', 'the bass is talking. i’m listening!', 'jump scare of joy incoming 💥'],
  feel_groove: ['mmm. nice groove.', 'steady beat. i can work with this.', 'this one’s got a swing to it.', 'bobbing. involuntarily. send help.'],
  feel_chill: ['ooh, a slow one. i’m melting.', 'chai-and-rain kind of song.', 'okay. shoulders down. easy now.', 'softly, softly… 🌙'],
  feel_moody: ['this one has feelings.', 'quiet. dark. i like it.', 'late-night song, no doubt.', 'don’t look at me. i’m having a moment.'],
  shift_up: ['whoa, tempo jump! okay okay okay!', 'from sleepy to sparkly. i respect it.', 'oh, we’re speeding up!'],
  shift_down: ['aaand… we land softly.', 'cooling down. nice.', 'a breather track. thank you.'],
  drop: ['DROP!!', 'oh here it comes—', 'THERE it is!!', 'that drop though!'],
  loud: ['EARS!! my tiny ears!', 'too loud too loud!!', 'volume nahi, volcano!', 'my antenna is vibrating!'],
  quiet: ['hello? did the sound leave?', 'i can hear my own thoughts. scary.', 'psst, it’s whisper mode.'],
  mute: ['…is it broken? or just dramatic?', 'silence. my second favourite song.'],
  fast: ['chipmunk mode! 🐿️', 'speeeedy! i’m dizzy.'],
  slow: ['slooow-mooo…', 'everything sounds like honey.'],
  norm: ['okay, back to normal speed. phew.', 'normal speed. my brain thanks you.'],
  needleUp: ['ooh, you’re carrying the needle!', 'careful careful careful…'],
  needleDown: ['needle down. here we go.', 'smooth landing. 10/10.', 'drop it like it’s hot. (gently.)'],
  parked: ['needle’s home. good night, little needle.', 'parked. very tidy.'],
  lever: ['pause? ok, i’ll wait.', 'lever up. very official.'],
  hold: ['whoa, you’re holding the record!', 'is it stuck? is it okay?'],
  scratch: ['wiki wiki wiki!', 'DJ in the house!', 'scratch it! scratch it!'],
  flick: ['WHEEEE!', 'flick of the wrist. respect.'],
  rewind: ['backwards? bold.', 'rewind! the future is behind us!'],
  seek: ['skipping ahead? spoilers!', 'jump! i like the jumping.'],
  motorOn: ['spinning up! here we go.', 'lights, platter, action.'],
  spam: ['are we doing morse code?', 'flip flop flip. i’m getting dizzy.', 'blink blink. who’s there?'],
  tickle: ['hehe stop! tickles!', 'ahahaha not the antenna!', 'okay okay okay okay!!'],
  konami: ['↑↑↓↓←→←→BA… you know the code!', 'secret unlocked. 30 lives.', 'cheat code accepted. dance mode: MAX.'],
  moon: ['smooth. very smooth.', 'moonwalking. don’t tell anyone.', 'am i going forward or backward? yes.'],
  idea: ['💡 i had an idea!', 'eureka! …and it’s gone.', 'idea! wait, what was it?'],
  belly: ['beep. boop. do not press.', 'bzzzt. rebooting… jk.', 'that’s my tummy button!', 'press again and i’ll order pizza.'],
  mime: ['…i’m trapped in a box!', '*knock knock* let me out!', 'a wall! right here. i swear.'],
  mirror: ['who’s that handsome bot?', 'hello, gorgeous.', 'this record has a good side. i have two.'],
  boo: ['BOO!!', 'got you! i wasn’t even asleep.', 'sleeping? never. BOO!'],
  bow: ['thank you, thank you. you’re too kind.', 'bow. flourish. exit stage left.', 'encore? no? ok. *bows*'],
  guitar: ['ROCK AND ROLL! 🤘', 'this one needs an air guitar.', 'shredding. silently.'],
  midnight: ['it’s past midnight. the best records get played now.', 'late night, low lights. perfect.', 'a night owl! i respect that.'],
  boss: ['that’s the boss’s name. i dust it daily.', 'NEERAJ. legend. architect of this desk.'],
  wakeSoft: ['mmh… oh. music. okay, i’m up.', '*yawn* …is that a beat? i’m awake.', 'five more minutes… no wait, THIS song.'],
  lounge: ['this spot is mine now.', 'best seat in the house.', 'cozy. very cozy.', 'i could live here.'],
  watchRec: ['round and round and round…', 'hypnotic. don’t look too long.', 'just watching the groove go by.'],
});
const bags = {};
const L = (k, t) => { const b = bags[k] || (bags[k] = { q: [], last: '' }); if (!b.q.length) { b.q = [...LINES[k]].sort(() => Math.random() - .5); if (b.q.length > 1 && b.q[b.q.length - 1] === b.last) b.q.reverse(); } b.last = b.q.pop(); return t ? b.last.replace('{t}', t) : b.last; };
const SVG = `<svg viewBox="-20 -14 140 140" aria-hidden="true" focusable="false"><defs>
<radialGradient id="sb" cx=".33" cy=".22" r=".95"><stop offset="0" stop-color="#a08a75"/><stop offset=".42" stop-color="#5a4c40"/><stop offset="1" stop-color="#1e1712"/></radialGradient>
<linearGradient id="ss" x1="0" y1=".4" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
<radialGradient id="se" cx=".38" cy=".28" r=".85"><stop offset="0" stop-color="#fff3d2"/><stop offset=".5" stop-color="${BR}"/><stop offset="1" stop-color="#8f6f3e"/></radialGradient>
<radialGradient id="sh2" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#a28d78"/><stop offset="1" stop-color="#33291f"/></radialGradient>
<filter id="sbl" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.8"/></filter>
<clipPath id="ecl"><ellipse rx="10.5" ry="13.5"/></clipPath><clipPath id="mcl"><path class="mo2"/></clipPath></defs>
<ellipse class="sh" cx="50" cy="118" rx="32" ry="5.5" fill="#000" opacity=".5" filter="url(#sbl)"/><ellipse class="sh0" cx="50" cy="117" rx="17" ry="2.6" fill="#000" opacity=".6" filter="url(#sbl)"/>
<ellipse class="fl" cx="35" cy="113" rx="12" ry="6.5" fill="url(#sh2)"/><ellipse class="fr" cx="65" cy="113" rx="12" ry="6.5" fill="url(#sh2)"/>
<g class="bd"><path class="an" d="M34 14Q26-2 22-9" stroke="#8a7352" stroke-width="3" fill="none" stroke-linecap="round"/><circle class="bhalo" cx="22" cy="-10" r="10" fill="#ffe08a" opacity="0" filter="url(#sbl)"/><circle class="bu" cx="22" cy="-10" r="5" fill="url(#se)"/>
<path d="M50 7C83 7 99 34 99 66C99 98 80 114 50 114C20 114 1 98 1 66C1 34 17 7 50 7Z" fill="url(#sb)"/><path d="M50 7C83 7 99 34 99 66C99 98 80 114 50 114C20 114 1 98 1 66C1 34 17 7 50 7Z" fill="url(#ss)"/>
<path d="M87 30C97 48 98 74 88 94" stroke="${BR}" stroke-opacity=".6" stroke-width="3" fill="none" stroke-linecap="round"/><ellipse cx="34" cy="22" rx="17" ry="7" fill="#fff" opacity=".3" transform="rotate(-26 34 22)" filter="url(#sbl)"/>
<ellipse cx="22" cy="68" rx="6.5" ry="4" fill="#e59a78" style="opacity:var(--bl,.35)"/><ellipse cx="78" cy="68" rx="6.5" ry="4" fill="#e59a78" style="opacity:var(--bl,.35)"/>
<circle class="bel" cx="50" cy="97" r="11" fill="url(#se)" stroke="#6e5530"/><circle cx="50" cy="97" r="3.4" fill="#2a1d12"/><circle cx="46" cy="92.5" r="1.8" fill="#fff" opacity=".7"/>
${['el', 'er'].map((c) => `<g class="${c}"><ellipse rx="10.5" ry="13.5" fill="url(#se)" stroke="#6e5530"/><ellipse class="pp" rx="4.9" ry="7" fill="#24180e"/><circle cx="-3.2" cy="-4.8" r="2.4" fill="#fff" opacity=".92"/><circle cx="2.8" cy="3.2" r="1.1" fill="#fff" opacity=".6"/><g clip-path="url(#ecl)"><rect class="lid" x="-16" y="-18" width="32" height="3" fill="#5f5043"/><ellipse class="lo" cx="0" cy="15" rx="15" ry="0" fill="#5f5043"/></g></g>`).join('')}
<g class="brs" opacity="0"><line class="bl" x1="25" y1="29" x2="43" y2="29" stroke="#2b2018" stroke-width="3.4" stroke-linecap="round"/><line class="br" x1="57" y1="29" x2="75" y2="29" stroke="#2b2018" stroke-width="3.4" stroke-linecap="round"/></g>
<path class="mo" fill="${INK}" stroke="${BR}" stroke-width="1.4" stroke-linejoin="round"/><ellipse class="tg" cx="50" cy="86" rx="7" ry="4" fill="#e8838f" clip-path="url(#mcl)" opacity="0"/>
<g class="mnst" opacity="0"><path d="M17 22L7-4L35 12Z" fill="#eadcb4" stroke="#5a4730" stroke-width="1.5"/><path d="M83 22L93-4L65 12Z" fill="#eadcb4" stroke="#5a4730" stroke-width="1.5"/><path d="M20 30L45 41M80 30L55 41" stroke="#1d140e" stroke-width="6" stroke-linecap="round"/><path d="M39 79h5l-2.5 9zM56 79h5l-2.5 9z" fill="#fff"/></g>
<line class="al" stroke="#4e4136" stroke-width="11" stroke-linecap="round"/><line class="al2" stroke="#9a8570" stroke-width="3.6" stroke-linecap="round" opacity=".55"/><circle class="hl" r="8" fill="url(#sh2)" stroke="${BR}" stroke-width="1.5"/>
<line class="ar" stroke="#4e4136" stroke-width="11" stroke-linecap="round"/><line class="ar2" stroke="#9a8570" stroke-width="3.6" stroke-linecap="round" opacity=".55"/><circle class="hr" r="8" fill="url(#sh2)" stroke="${BR}" stroke-width="1.5"/>
<g class="mc"><rect x="-3" y="-2" width="6" height="15" rx="3" fill="#8a6f45"/><circle cy="-11" r="8" fill="url(#se)" stroke="#7a5f36" stroke-width="1.2"/><path d="M-6-11H6M-5.4-8H5.4M-5.4-14H5.4" stroke="#7a5f36"/><circle cx="-2.6" cy="-13.6" r="2" fill="#fff" opacity=".55"/><circle cy="5" r="5.2" fill="url(#sh2)" stroke="${BR}" stroke-width="1.2"/></g>
<g class="fg" style="display:none"><rect x="-2.8" y="-19" width="5.6" height="17" rx="2.8" fill="url(#sh2)" stroke="${BR}" stroke-width="1.1"/><circle cx="-6.5" cy="-3" r="3.8" fill="url(#sh2)" stroke="${BR}" stroke-width="1"/><circle cx="6.5" cy="-3" r="3.8" fill="url(#sh2)" stroke="${BR}" stroke-width="1"/></g></g>
<g class="bi" style="display:none"><text font-size="13" text-anchor="middle">🐤</text><text font-size="13" text-anchor="middle">🐤</text><text font-size="13" text-anchor="middle">🐤</text></g></svg>`;
const mouthD = (o, w, sm = .35) => { const hw = 6 + w * 7, yc = 78 - sm * 2.6, top = 77 - o * 2 - sm * .8, bot = 78 + (2 + o * 15) * 1.35 + sm * 5; return `M${50 - hw} ${yc}Q50 ${top} ${50 + hw} ${yc}Q50 ${bot} ${50 - hw} ${yc}Z`; };   // sm: -1 frown … +1 smile
const visemeOf = (c) => ('aeiy'.includes(c) ? [.85, .9] : 'ou'.includes(c) ? [.8, .1] : /[a-z]/.test(c) ? [.3, .5] : [.04, .5]);
const star = (cx, cy, rx, ry, st) => { let p = ''; for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU, k = i % 2 ? 1 : 1.16; p += `${cx + Math.cos(a) * rx * k},${cy + Math.sin(a) * ry * k} `; } return `<polygon points="${p}" ${st}/>`; };

export function initMascot(S, audio, api) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, ac = new AbortController();
  const on = (t, e, f, o) => t.addEventListener(e, f, { signal: ac.signal, ...o });
  const btn = Object.assign(document.createElement('button'), { className: 'stm', type: 'button', innerHTML: SVG });
  // Flashlight: ONE fixed rig that sits on the real hand, turned by the real screen angle toward the target.
  // Torch body + beam live in the same rotated frame, so the light always leaves the lens. Transform/opacity only (no layout per frame).
  const rig = Object.assign(document.createElement('div'), { className: 'mtl', innerHTML: '<div class="mtl__beam"></div><div class="mtl__prop"><i class="mtl__grip"></i><i class="mtl__head"></i><i class="mtl__lens"></i><i class="mtl__fist"></i></div>' });
  const spot = Object.assign(document.createElement('div'), { className: 'mtl-spot' });
  rig.setAttribute('aria-hidden', 'true'); spot.setAttribute('aria-hidden', 'true');
  const rigBeam = rig.querySelector('.mtl__beam'), rigProp = rig.querySelector('.mtl__prop');
  const chalk = Object.assign(document.createElement('span'), { className: 'mchalk' });
  chalk.setAttribute('aria-hidden', 'true'); btn.append(chalk);
  const namePanel = Object.assign(document.createElement('form'), { className: 'mname', hidden: true });
  namePanel.setAttribute('aria-label', 'Choose the name the mascot should call you');
  namePanel.innerHTML = '<span class="mname__ask">hey! what should i call you?</span><input class="mname__input" type="text" name="nickname" maxlength="24" autocomplete="nickname" placeholder="your name" aria-label="Your name"><small class="mname__privacy">By tapping agree &amp; continue, you consent to sending your nickname, public IP address, approximate IP-based location/network details, visited page link, referrer source, and available browser/device details to the site owner’s Telegram for analytics on this and future visits until site data is cleared. IP location can be imprecise and browser values may be limited or spoofed. No GPS, local-network IP scan, canvas/audio fingerprint, font scan, IMEI or serial number is collected. Unavailable data is not invented.</small><div class="mname__actions"><button class="mname__save" type="submit">agree &amp; continue</button><button class="mname__later" type="button">leave</button></div>';
  const nameInput = namePanel.querySelector('.mname__input'), nameLater = namePanel.querySelector('.mname__later');
  const nameDoodle = Object.assign(document.createElement('div'), { className: 'mname-doodle', hidden: true });
  nameDoodle.setAttribute('aria-hidden', 'true');
  const nameDoodleText = Object.assign(document.createElement('span'), { className: 'mname-doodle__text' });
  const nameHeart = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  nameHeart.setAttribute('class', 'mname-doodle__heart'); nameHeart.setAttribute('viewBox', '0 0 72 56');
  nameHeart.setAttribute('aria-hidden', 'true'); nameHeart.setAttribute('hidden', '');
  nameHeart.innerHTML = '<path d="M36 48C29 40 8 28 8 17 8 7 20 3 27 10L36 19 45 10C52 3 64 7 64 17 64 28 43 40 36 48Z"/>';
  nameDoodle.append(nameDoodleText, nameHeart);
  btn.setAttribute('aria-label', 'Static, the little mascot. Tap to poke it, or drag to carry it.');
  const bub = Object.assign(document.createElement('div'), { className: 'mbub', hidden: true, innerHTML: '<svg></svg><div class="mtx"><b></b><i></i></div>' });
  bub.setAttribute('role', 'status');
  const ring = Object.assign(document.createElement('div'), { className: 'mring', hidden: true });
  document.body.append(ring, bub, btn, spot, rig, namePanel, nameDoodle);
  btn.classList.add('on');
  btn.style.transform = `translate3d(${Math.max(8, innerWidth / 2 - 36)}px,${Math.max(64, innerHeight * .16)}px,0)`;
  const q = (c) => btn.querySelector('.' + c), E = Object.fromEntries('bd sh sh0 bhalo bel fl fr an bu el er mo mo2 al al2 hl ar ar2 hr mc bi fg mnst brs bl br tg'.split(' ').map((c) => [c, q(c)]));
  const pps = btn.querySelectorAll('.pp'), bsvg = bub.querySelector('svg'), tt = bub.querySelector('b'), gg = bub.querySelector('i');
  const lids = [...btn.querySelectorAll('.lid')], los = [...btn.querySelectorAll('.lo')];
  let size = 72, BW = 29, BH = 63, gen = 0, alive = true, playing = false, idleAt = performance.now(), T0 = 0, B = null, ht = 0, noteT = 0, told = new Set(), queue = [], lastIdx = S.rec.index, needleT = 0, tapN = 0, welcomed = false, tourT = performance.now() + 9000, mx = -1, my = -1;
  const M = { mood: { n: 'calm', t: 0 }, shake: 0, tilt: 0, nod: 0, mad: 0, pet: 0, petting: 0, eff: 0, grip: null, fing: 0, mon: 0, mode: 'walk', vx: 0, vy: 0, vr: 0, rot: 0, sq: 0, peak: 0, dizzy: 0, wide: 0, hx: 0, hy: 0, jp: null, dc: null, dance: 0, struggle: 0, sway: 0, run: 0, x: 0, y: 0, face: 1, pop: 0, ph: 0, mic: 0, micT: 0, o: 0, ot: 0, w: .5, wt: .5, lx: 0, ly: 0, nb: 2, bl: 0, sleep: 0, sit: 0, rest: 0, sp: 0, glad: 0, go: null, tgt: null, hold: 0,
    L: { a: 102, l: 22, ta: 102, tl: 22 }, Rm: { a: 78, l: 22, ta: 78, tl: 22 } };
  Object.assign(M, { dph: 0, vel: 0, lean: 0, lookS: 0, sx: 0, sy: 0, sacc: 1, air: 0, moon: false, flip: null, gs: null, gAuto: 0, gside: 0, bdir: 1, idea: 0 });
  const beat = new BeatTracker();
  const REST = [[102, 22], [78, 22]], arms = (l, r) => { if (l) [M.L.ta, M.L.tl] = l; if (r) [M.Rm.ta, M.Rm.tl] = r; };
  const pend = new Set(), pendMove = new Set(); let progressAt = performance.now();         // progressAt: the last time anything the behaviour loop awaits actually finished (the supervisor watches it)
  const wait = (ms, g) => new Promise((res, rej) => { if (g !== gen) return rej('x'); const p = { rej }; p.t = setTimeout(() => { pend.delete(p); progressAt = performance.now(); res(); }, ms); pend.add(p); });
  /* walks and hops are promises that the frame loop settles. They are tracked, so interrupt() (or a grab) can never leave one hanging: a hanging one froze the whole behaviour loop for good */
  const mover = (fn) => new Promise((res0, rej0) => { const h = { rej: rej0 }; pendMove.add(h); fn((v) => { pendMove.delete(h); progressAt = performance.now(); res0(v); }, (e) => { pendMove.delete(h); rej0(e); }); });
  const interrupt = () => { gen++; pend.forEach((p) => { clearTimeout(p.t); p.rej('x'); }); pend.clear(); pendMove.forEach((h) => h.rej('x')); pendMove.clear(); };
  const measure = () => { size = btn.offsetWidth || 72; BW = size * .4; BH = size * .88; };
  const inV = (x, y) => x >= BW + 6 && x <= innerWidth - BW - 6 && y >= BH + 6 && y <= innerHeight - 6;

  /* ── what must never be covered: the deck, all text, all controls ── */
  function rects() {
    const out = [], add = (r, p = 5, n) => r.width > 1 && r.height > 1 && out.push({ l: r.left - p, t: r.top - p, r: r.right + p, b: r.bottom + p, n });
    const d = $('#deckFit'); if (d) add(d.getBoundingClientRect(), 0, 'deck'); props().forEach((p) => out.push(p));
    const tx = (e) => { const g = document.createRange(); g.selectNodeContents(e); return g.getBoundingClientRect(); };
    document.querySelectorAll('.domain,.sub,.title,.artist,.tagline,.hint.show,.seek__t,.dot span').forEach((e) => add(tx(e)));
    $$('.skip,.seek,.dot,.links a').forEach((e) => add(e.getBoundingClientRect()));
    if (!namePanel.hidden) add(namePanel.getBoundingClientRect(), 6, 'name-panel');
    if (!nameDoodle.hidden && !nameDoodle.classList.contains('measuring') && !writingDoodle) add(nameDoodle.getBoundingClientRect(), 6, 'name-doodle');
    return out;
  }
  const hit = (x, y, rs) => rs.some((k) => x - BW < k.r && x + BW > k.l && y - BH < k.b - .01 && y > k.t + .01);
  const clear = (a, b, rs) => { const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 8); for (let i = 1; i < n; i++) { const x = a.x + ((b.x - a.x) * i) / n, y = a.y + ((b.y - a.y) * i) / n; if (!inV(x, y) || hit(x, y, rs)) return false; } return true; };
  function plan(from, to, rs) {
    const C = 12, cols = Math.ceil(innerWidth / C), rows = Math.ceil(innerHeight / C), memo = new Map(), id = (x, y) => y * cols + x;
    const free = (x, y) => { const k = id(x, y); if (!memo.has(k)) memo.set(k, inV(x * C + C / 2, y * C + C / 2) && !hit(x * C + C / 2, y * C + C / 2, rs)); return memo.get(k); };
    const cell = (p) => [cl((p.x / C) | 0, 0, cols - 1), cl((p.y / C) | 0, 0, rows - 1)], s = cell(from), g = cell(to), par = new Map([[id(...s), null]]), qu = [s];
    for (let i = 0; i < qu.length && !par.has(id(...g)); i++) { const [x, y] = qu[i]; for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) { const nx = x + dx, ny = y + dy; if ((dx || dy) && nx >= 0 && ny >= 0 && nx < cols && ny < rows && !par.has(id(nx, ny)) && ((nx === g[0] && ny === g[1]) || free(nx, ny))) { par.set(id(nx, ny), [x, y]); qu.push([nx, ny]); } } }
    if (!par.has(id(...g))) return null;
    const pts = []; for (let c = g; c; c = par.get(id(...c))) pts.push({ x: c[0] * C + C / 2, y: c[1] * C + C / 2 });
    pts.reverse(); pts[0] = from; pts.push(to); const out = [from]; let i = 0;
    while (i < pts.length - 1) { let j = pts.length - 1; while (j > i + 1 && !clear(pts[i], pts[j], rs)) j--; out.push(pts[j]); i = j; }
    return out;
  }
  function spots(rs) {
    const out = [], add = (x, y, kind) => inV(x, y) && !hit(x, y, rs) && out.push({ x, y, kind });
    rs.forEach((r) => [.2, .5, .8].forEach((f) => add(r.l + (r.r - r.l) * f, r.t, 'edge')));
    for (let i = 0; i < 14; i++) add(R(BW + 8, innerWidth - BW - 8), R(BH + 8, innerHeight - 8), 'floor');
    const sc = $('#scene')?.getBoundingClientRect(); if (sc) add(sc.left + sc.width / 2, sc.top + sc.height * .115, 'home');   // where the old title used to be
    return out;
  }
  const goTo = (p, g, jump) => { const path = plan({ x: M.x, y: M.y }, p, rects()); if (!path) return jump ? hop(p.x, p.y, g, 700 + Math.hypot(p.x - M.x, p.y - M.y) * .8) : Promise.reject('x'); return mover((res, rej) => { if (M.go) M.go.rej('x'); M.go = { path, i: 1, res, rej, g, t0: performance.now() }; }); };   // no walkable way (e.g. the deck spans the phone): hop over it

  /* ── manga bubbles ── */
  const BUB = { say: ['#fffdf6', '#f5e6c4'], think: ['#f6fbff', '#dcebf7'], sly: ['#f6ffdc', '#d4f08e'], angry: ['#fff1ec', '#ffb5a3'], shout: ['#fff4f7', '#ffc3d2'], sleepy: ['#f0f3fb', '#cdd7ea'] };
  function shape(kind, w, h, tip) {
    const m = 26, cx = m + w / 2, cy = m + h / 2, [c1, c2] = BUB[kind] || BUB.say, fill = 'url(#bg)';
    let s = `<defs><linearGradient id="bg" gradientUnits="userSpaceOnUse" x1="0" y1="${m - 12}" x2="0" y2="${m + h + 8}"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>`;
    if (kind === 'think' || kind === 'sleepy') {                       // fluffy cloud
      const rx = w / 2 + 3, ry = h / 2 + 2, n = Math.max(8, Math.round(((rx + ry) * Math.PI) / 20)); s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
      for (let i = 0; i < n; i++) { const a = (i / n) * TAU; s += `<circle cx="${cx + Math.cos(a) * rx}" cy="${cy + Math.sin(a) * ry}" r="11" fill="${fill}"/>`; }
    } else {                                                            // soft pill with two little cloud bumps
      const rr = Math.min(h / 2 + 2, 26), bx = m + Math.min(34, w * .25);
      s += `<rect x="${m - 2}" y="${m - 1}" width="${w + 4}" height="${h + 2}" rx="${rr}" fill="${fill}"/><circle cx="${bx}" cy="${m}" r="${Math.min(12, h * .42)}" fill="${fill}"/><circle cx="${bx + 17}" cy="${m - 3}" r="${Math.min(9, h * .32)}" fill="${fill}"/>`;
    }
    s += `<ellipse cx="${cx}" cy="${m + 6}" rx="${Math.max(10, w * .34)}" ry="3.2" fill="#fff" opacity=".55"/>`;
    const dx = tip.x - cx, dy = tip.y - cy, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, edge = Math.min(w / 2 / Math.max(Math.abs(ux), .001), h / 2 / Math.max(Math.abs(uy), .001)) + 6;
    [[7, 0], [4.6, 1], [3, 2]].slice(0, kind === 'think' ? 3 : 2).forEach(([r, i]) => { const f = Math.min(d - 3, edge + 7 + i * (r * 2 + 3)); s += `<circle cx="${cx + ux * f}" cy="${cy + uy * f}" r="${r}" fill="${c2}"/>`; });   // little trail of dots from the bubble to the pet
    return s;
  }
  function bestSpot(w, h, gap) {
    const rs = rects(), head = { x: M.x, y: M.y - BH * .55 }, C = [];
    for (let a = 0; a < 360; a += 30) for (const e of [0, 16]) { const r = (a * Math.PI) / 180; C.push([head.x + Math.cos(r) * (w / 2 + BW + gap + e) - w / 2, head.y + Math.sin(r) * (h / 2 + BH * .62 + gap + e) - h / 2]); }
    const ov = (x, y, k) => Math.max(0, Math.min(x + w, k.r) - Math.max(x, k.l)) * Math.max(0, Math.min(y + h, k.b) - Math.max(y, k.t)); let best = { x: 6, y: 6 }, bs = 1e12;
    for (const [x0, y0] of C) { const x = cl(x0, 6, innerWidth - w - 6), y = cl(y0, 6, innerHeight - h - 6); let s = (Math.abs(x - x0) + Math.abs(y - y0)) * 40 + Math.max(0, y + h / 2 - head.y) * .05; rs.forEach((k) => (s += ov(x, y, k) * (k.n === 'deck' ? 1.2 : k.n ? 3 : 8)));   // text matters most, then props, then the deck art
    s += ov(x, y, { l: M.x - BW - 6, r: M.x + BW + 6, t: M.y - BH - 6, b: M.y + 4 }) * 1000; if (s < bs) { bs = s; best = { x, y }; } }
    return best;
  }
  function place() {
    const { w, h, kind } = B, m = 26, p = bestSpot(w, h, kind === 'think' ? 46 : 18); Object.assign(B, { x: p.x, y: p.y, px: M.x, py: M.y });
    const tip = { x: cl(p.x + w / 2, M.x - BW - 7, M.x + BW + 7) - p.x + m, y: cl(p.y + h / 2, M.y - BH - 7, M.y + 7) - p.y + m };   // tail stops on a margin around the bot: it never touches the face
    bsvg.setAttribute('width', w + 2 * m); bsvg.setAttribute('height', h + 2 * m); bsvg.innerHTML = shape(kind, w, h, tip); bub.style.transform = `translate(${p.x - m}px,${p.y - m}px)`;
  }
  function show(text, kind) {
    bub.hidden = false; bub.className = 'mbub ' + kind; tt.textContent = ''; gg.textContent = text;
    const b = bub.querySelector('.mtx'); B = { w: b.offsetWidth, h: b.offsetHeight, kind, text }; place();
  }
  const hide = () => { bub.hidden = true; B = null; M.hold = 0; M.tgt = null; };
  let speechUntil = 0;
  const readMs = (t) => cl(2300 + t.length * 92 + (t.match(/[.!?…]/g) || []).length * 220, 2300, 11000);   // reading time: ~11 characters a second plus a beat per sentence (it used to be fast enough that people could not follow)
  const TYPE = { shout: .8, angry: .82, think: 1.15, sleepy: 1.5, sly: 1.1 };                               // how fast each kind of bubble is typed
  const pace = (c, kind) => (/[.!?]/.test(c) ? 420 : c === '…' ? 520 : /[,;:]/.test(c) ? 240 : c === ' ' ? 80 : 64 + R(0, 22)) * (TYPE[kind] || 1);   // ~14 characters a second, real pauses at punctuation
  async function say(text, kind, g, hold, urgent) {
    const gap = speechUntil - performance.now(); if (gap > 0 && !urgent) await wait(gap, g);          // never talk over a bubble someone is still reading
    show(text, kind); if (B) B.typeUntil = performance.now() + text.length * 90 + 500; M.gside = Math.random() < .5 ? 0 : 1; if (!urgent) await wait(260, g);     // a small breath before the first word
    if (text === '…') { tt.innerHTML = '<span class="dd"><i></i><i></i><i></i></span>'; gg.textContent = ''; const h = Math.max(hold ?? 0, 1300); speechUntil = performance.now() + h + 400; await wait(h, g); hide(); return; }
    for (let i = 1; i <= text.length; i++) { tt.textContent = text.slice(0, i); gg.textContent = text.slice(i); [M.ot, M.wt] = visemeOf(text[i - 1].toLowerCase()); await wait(pace(text[i - 1], kind), g); }
    M.ot = .05; const h = Math.max(hold ?? 0, readMs(text)); speechUntil = performance.now() + h + 1000; await wait(h, g); hide();
  }
  function blurt(text, kind = 'say', ms = 1500) { if (speechUntil - performance.now() > 1200) return; const h = Math.max(ms, readMs(text));      // (a bubble somebody is still reading is never snatched away by a passing reaction)
    show(text, kind); tt.textContent = text; gg.textContent = ''; speechUntil = performance.now() + h + 500; setTimeout(() => { if (B && B.text === text) hide(); }, h); }   // instant bubble, for reactions that can't wait

  let lastChirp = 0;
  const chirp = (key, kind = 'say', ms = 1600) => { const n = performance.now(); if (speechUntil - n > 500 || n - lastChirp < 6000) return false; lastChirp = n; blurt(L(key), kind, ms); return true; };   // a reaction line: never over a bubble being read, at most one every 6 s   // a reaction line that never talks over a bubble someone is reading

  /* ── behaviours ── */
  const notes = () => {
    if (reduce || document.querySelectorAll('.mn').length > 9) return;
    const e = Object.assign(document.createElement('span'), { className: 'mn', textContent: pick(['♪', '♫', '♪', '♬']) });
    const m = E.mc.getBoundingClientRect(), r = m.width > 4 ? m : E.hr.getBoundingClientRect();
    e.style.cssText = `left:${r.left + r.width / 2 + R(-12, 12)}px;top:${r.top - 4}px;color:${pick(['#d9b47a', '#ffe08a', '#ffb3c1', '#b8e6ff'])};--dx:${R(-30, 30)}px;--r:${R(-28, 28)}deg`;
    document.body.append(e); e.onanimationend = () => e.remove();
  };
  const hearts = () => { if (reduce) return; const e = Object.assign(document.createElement('span'), { className: 'mn mh', textContent: '♥' }), r = btn.getBoundingClientRect(); e.style.cssText = `left:${r.left + R(r.width * .2, r.width * .8)}px;top:${r.top + 4}px;--dx:${R(-18, 18)}px;--r:${R(-20, 20)}deg`; document.body.append(e); e.onanimationend = () => e.remove(); };
  const DANCES = [1, 2, 3, 5, 6, 7, 8, 9], MIC_ARM = [104, 33];   // arm patterns live in danceArms(); MIC_ARM holds the mic up beside the mouth
  async function rest(g) {      // a proper breather: walks off, sits, pants, does something calm (no mic, no lip-sync), then bursts back at full energy
    restDue = performance.now() + R(55000, 85000);
    try {
      M.dance = 0; M.micT = 0; M.sway = 0; M.rest = 1; mood('sad', 2.2); arms([60, 26], [120, 26]);
      const spot = pickRest() || pick(spots(rects()));
      if (spot && !reduce) await goTo(spot, g, true);
      if (spot && spot.kind !== 'floor' && spot.kind !== 'home') settleAt(spot); else M.sit = 0;
      M.tilt = 6; M.rest = 1; arms([60, 26], [120, 26]);
      await say(L('tired'), 'sleepy', g, 500);
      const endAt = performance.now() + R(5500, 8500), v = pick(['fan', 'sip', 'listen', 'stretch']);
      if (v === 'fan') { for (let i = 0; i < 40 && playing && performance.now() < endAt; i++) { arms(null, [-125 + (i % 2) * 30, 30]); await wait(220, g); } }
      else if (v === 'sip') {
        M.rest = 3; M.ot = .05; M.wt = .5; arms(null, [-120, 26]); await say('🥤 glug glug glug…', 'think', g, 1300);
        M.rest = 1; arms(null, [102, 22]); mood('happy', 1.6); await say('ahh. that hit the spot.', 'say', g, 700);
      }
      else if (v === 'listen') {
        M.rest = 3; M.ot = .05; M.wt = .5; M.nod = 1; mood('happy', 3); arms([60, 26], [112, 26]);
        for (let i = 0; i < 40 && playing && performance.now() < endAt; i++) { if (i % 3 === 0) notes(); await wait(700, g); }
      }
      else {
        M.rest = 3; M.tilt = 0; mood('sleepy', 3); arms([-70, 30], [-110, 30]); M.ot = 1; M.wt = .3; await wait(1500, g);
        M.ot = .05; arms([-20, 30], [-150, 30]); M.tilt = -8; await wait(1100, g); M.tilt = 8; arms([-150, 30], [-20, 30]); await wait(1100, g);
      }
      M.rest = 0; M.sit = 0; M.nod = 0; M.tilt = 0; M.glad = 1; mood('excited', 2.6); arms([-115, 32], [-65, 32]); if (!reduce) { M.sp = 1; await hop(M.x, M.y, g, 480, 100); }
      await say(addressVisitor(L('recharged')), 'shout', g, 600); M.dance = pick(DANCES); await wait(900, g);
    } finally { M.rest = 0; M.sit = 0; M.nod = 0; M.tilt = 0; M.dance = 0; arms(...REST); }
  }
  async function perform(g) {
    M.micT = 0; let last = '', still = 0;
    const bout = performance.now() + R(22000, 38000);     // a bout of full energy, then hand control back to decide(): pranks, easter eggs and rests all live there
    let anchor = { x: M.x, y: M.y, t: performance.now() };
    const MOV = ['strut', 'micWalk', 'jump', 'micJump', 'strut', 'micWalk'], STL = ['dance', 'micDance', 'bang', 'spin', 'micSway', 'emote'];
    const TBL = {       // the original moves are all here for every kind of song; the feel of the music only tilts the odds (hype: more jumps, headbangs, air guitar; chill: a little swaying between the dancing)
      hype: { mv: .8, mov: [...MOV, 'jump', 'micJump'], st: [...STL, 'guitar', 'bang', 'spin'] },
      groove: { mv: .7, mov: MOV, st: STL },
      chill: { mv: .62, mov: MOV, st: [...STL, 'sway'] },
      moody: { mv: .6, mov: MOV, st: [...STL, 'nod', 'sway'] },
    }, isMover = (m) => ['strut', 'micWalk', 'jump', 'micJump', 'travel'].includes(m);
    const calm = () => { M.dance = 0; M.micT = 0; M.sway = 0; arms(...REST); };
    const hopSide = async (range, ms, ah) => { const x = cl(M.x + R(-range, range), BW + 8, innerWidth - BW - 8); await hop(hit(x, M.y, rects()) ? M.x : x, M.y, g, ms, ah); };
    while (playing && performance.now() < bout) {
      let mv; for (let n = 0; n < 6; n++) { const tb = TBL[beat.mood] || TBL.groove; mv = reduce ? pick(['micSway', 'dance', 'emote']) : (still >= 1 || Math.random() < tb.mv) ? pick(tb.mov) : pick(tb.st); if (mv !== last) break; }
      still = isMover(mv) ? 0 : still + 1; last = mv;
      const nowT = performance.now(); if (Math.hypot(M.x - anchor.x, M.y - anchor.y) > 60) anchor = { x: M.x, y: M.y, t: nowT };
      else if (!reduce && nowT - anchor.t > 6000) { mv = 'travel'; still = 0; }       // anti-stuck: never stand on one spot for more than ~6s while performing     // never two still moves in a row, never the same move twice
      mood(musicMood(), 2.4);
      try {
        if (mv === 'travel') {
          M.micT = Math.random() < .5 ? 1 : 0; M.dance = pick(DANCES); mood('excited', 2);
          const far = spots(rects()).filter((q) => Math.hypot(q.x - M.x, q.y - M.y) > 170);
          if (far.length) await goTo(pick(far), g, true); else await hopSide(220, 700, 90);
          anchor = { x: M.x, y: M.y, t: performance.now() };
        } else if (mv === 'strut' || mv === 'micWalk') {
          if (mv === 'micWalk') M.micT = 1;
          M.dance = mv === 'strut' || Math.random() < .6 ? pick(DANCES) : 0;
          const sp = spots(rects()), far = sp.filter((q) => Math.hypot(q.x - M.x, q.y - M.y) > 120); if (sp.length) await goTo(pick(far.length ? far : sp), g, true); else await wait(1500, g);
        } else if (mv === 'jump' || mv === 'micJump') {
          if (mv === 'micJump') M.micT = 1;
          for (let i = 0; i < 3 && playing; i++) { arms([-115, 32], [-65, 32]); if (i === 1 && !reduce) M.sp = 1; await hopSide(110, 520, R(55, 115)); await wait(60, g); }
        } else if (mv === 'dance' || mv === 'micDance') {
          if (mv === 'micDance') M.micT = 1;
          for (let i = 0; i < 2 && playing; i++) { M.dance = pick(DANCES); if (i && !reduce) M.sp = 1; await wait(R(1500, 2300), g); }
        } else if (mv === 'bang') {
          M.dance = 4; await wait(R(2000, 3000), g); if (!reduce) { M.dance = pick([6, 9]); await wait(1300, g); }
        } else if (mv === 'spin') {
          M.dance = pick(DANCES); for (let i = 0; i < 3 && playing; i++) { M.sp = 1; await wait(950, g); }
        } else if (mv === 'guitar') {
          M.dance = 10; mood('hyped', 2.4); if (Math.random() < .5) chirp('guitar', 'shout', 1500); await wait(R(3600, 5600), g);
        } else if (mv === 'sway') {
          M.sway = 1; M.nod = 1; mood('bliss', 3); for (let i = 0; i < 3 && playing; i++) { await hopSide(50, 620, 8); await wait(R(600, 1100), g); }
        } else if (mv === 'nod') {
          M.nod = 1; M.sway = 1; mood('dreamy', 3.5); await wait(R(3000, 4500), g);
        } else if (mv === 'micSway') {
          M.micT = 1; M.sway = 1;
          if (reduce) await wait(2500, g); else for (let i = 0; i < 3 && playing; i++) { await hopSide(70, 420, 18); await wait(R(150, 450), g); }
        } else {        // emotes: short, readable, always with a body in motion
          const e = pick(['heart', 'wave', 'flex', 'cheer', 'clap', 'point']);
          if (e === 'heart') { mood('shy', 2); arms([-35, 24], [-145, 24]); for (let i = 0; i < 6 && playing; i++) { hearts(); await wait(330, g); } }
          else if (e === 'wave') { mood('happy', 2); for (let i = 0; i < 8 && playing; i++) { arms([-100 + (i % 2) * 34, 34], null); await wait(190, g); } }
          else if (e === 'flex') { mood('smug', 2.4); arms([-25, 24], [-155, 24]); await wait(1100, g); arms([-155, 24], [-25, 24]); await wait(900, g); }
          else if (e === 'cheer') { mood('excited', 2); arms([-115, 32], [-65, 32]); for (let i = 0; i < 2 && playing; i++) { notes(); await hop(M.x, M.y, g, 480, 90); } }
          else if (e === 'clap') { for (let i = 0; i < 10 && playing; i++) { arms(i % 2 ? [150, 26] : [0, 38], i % 2 ? [30, 26] : [180, 38]); if (i % 3 === 0) notes(); await wait(170, g); } }
          else { mood('excited', 2); const tx = R(0, innerWidth), ty = R(0, innerHeight); M.tgt = { x: tx, y: ty }; reach(tx, ty, 50); await wait(1300, g); M.tgt = null; }
        }
      } finally { calm(); }
    }
    M.micT = 0;
  }
  /* ── hands-on: reach, hop, tour (only when asked), pranks, disc ride, physics ── */
  let tourOn = false, tourStop = false, pr = false, prankAt = performance.now() + 20000, pokeAt = 0, born = performance.now(), drag = null, lastHit = '', chipExp = 0, chipP = { x: -9, y: -9 }, chipPinned = false;
  let torchAim = null, torchLit = false, torchInProgress = false, torchStartedAt = 0, torchTries = 0, torchBackoff = 0, torchGuard = 0, chalkAim = null, doodleFadeTimer = 0, doodleHideTimer = 0;
  const torchBusy = () => torchInProgress || !!torchAim;      // the torch and the mic share the same hand: never both
  const micHeld = () => !!M.micT && !torchBusy(), isSinging = () => micHeld() && M.mic > .3;
  const PROPS = [['plant', 0, 0, 165, 250], ['books', 750, 0, 941, 290], ['headphones', 0, 960, 62, 1370], ['mug', 872, 1180, 941, 1400], ['sketchbook', 0, 1470, 165, 1672], ['oldbook', 835, 1550, 941, 1672]];
  const props = () => { const sc = $('#scene')?.getBoundingClientRect(); if (!sc) return []; const u = sc.width / 941; return PROPS.map(([n, l, t, r, b]) => ({ n, l: sc.left + l * u, t: sc.top + t * u, r: sc.left + r * u, b: sc.top + b * u })); };
  const nearTo = (tx, ty, w = 0) => { const rs = rects(), c = spots(rs); for (const k of [w / 2 + 50, w / 2 + 90, w / 2 + 130]) for (let a = 0; a < 360; a += 20) { const x = tx + Math.cos((a * Math.PI) / 180) * k, y = ty + Math.sin((a * Math.PI) / 180) * k * .8 + BH * .5; if (inV(x, y) && !hit(x, y, rs)) c.push({ x, y }); } c.sort((a, b) => Math.hypot(a.x - tx, a.y - BH * .5 - ty) - Math.hypot(b.x - tx, b.y - BH * .5 - ty)); return c[0]; };
  const nearSpot = (el) => { const r = el.getBoundingClientRect(), tx = r.left + r.width / 2, ty = r.top + r.height / 2; return { r, tx, ty, s: nearTo(tx, ty, r.width) }; };
  const reach = (tx, ty, max = 60) => { const u = size / 140, a = Math.atan2(ty - (M.y - 52 * u), tx - (M.x + 38 * u * M.face)), d = Math.hypot(tx - M.x, ty - M.y); arms(null, [((M.face > 0 ? a : Math.PI - a) * 180) / Math.PI, cl(d / u - 22, 18, max)]); };
  const ringOn = (r) => { ringAt = performance.now(); Object.assign(ring.style, { left: r.left - 6 + 'px', top: r.top - 6 + 'px', width: r.width + 12 + 'px', height: r.height + 12 + 'px' }); ring.hidden = false; };
  const hop = (x, y, g, ms = 650, ah) => mover((res, rej) => { if (M.jp) M.jp.rej('x'); M.mode = 'jump'; M.jp = { x0: M.x, y0: M.y, x1: x, y1: y, t: 0, pre: reduce ? 0 : .07, ms: reduce ? 60 : ms, res, rej, g, h: ah ?? Math.min(150, 58 + Math.hypot(x - M.x, y - M.y) * .14) }; });
  const until = async (f, g) => { while (!f()) await wait(120, g); };
  const chip = Object.assign(document.createElement('div'), { className: 'mchip', hidden: true }); document.body.append(chip);
  const hideChip = () => { chip.hidden = true; chipExp = 0; chipPinned = false; chip.classList.remove('docked'); chip.style.transform = ''; };
  const placeChip = () => { if (chip.hidden || chipPinned) return; const p = bestSpot(chip.offsetWidth, chip.offsetHeight, 10); chipP = { x: M.x, y: M.y }; chip.style.transform = `translate(${p.x}px,${p.y}px)`; };
  const setChip = (text, btns, ms = 0) => { chip.hidden = false; chip.textContent = ''; const s = document.createElement('span'); s.textContent = text; chip.append(s); btns.forEach(([t, f]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.onclick = (e) => { e.stopPropagation(); f(); }; chip.append(b); }); chipExp = ms ? performance.now() + ms : 0; placeChip(); };
  // One-time reset: existing browsers receive the fresh visitor prompt on their next load.
  // Player settings (volume and playback preference) are deliberately preserved.
  try {
    const resetKey = 'static.visitor-reset.v2';
    if (localStorage.getItem(resetKey) !== '1') {
      [
        'static.visitor-name.v1',
        'static.visitor-name.skip.v1',
        'static.visit-consent.v1',
        'static.visit-report-session.v1',
        'static.visitor-doodle.v1',
        'static.engraving-torch.v1',
        'static.guide.v1',
        'static.guide'
      ].forEach((key) => localStorage.removeItem(key));
      [
        'static.visitor-name.skip.v1',
        'static.visitor-doodle.visit.v1',
        'static.engraving-torch.visit.v1'
      ].forEach((key) => sessionStorage.removeItem(key));
      localStorage.setItem(resetKey, '1');
    }
  } catch { /* storage may be unavailable; prompt still starts as a fresh visitor */ }
  // The analytics scope now includes the public IP, referrer and page URL, so obtain fresh consent.
  try {
    const consentResetKey = 'static.visitor-consent-reset.v3';
    if (localStorage.getItem(consentResetKey) !== '1') {
      ['static.visitor-name.v1', 'static.visit-consent.v1', 'static.visit-report-session.v1'].forEach((key) => localStorage.removeItem(key));
      localStorage.setItem(consentResetKey, '1');
    }
  } catch { /* storage may be unavailable */ }
  try { sessionStorage.removeItem('static.visitor-name.skip.v1'); } catch { /* session storage may be unavailable */ }
  try { document.cookie = 'static_guide=; Max-Age=0; Path=/; SameSite=Lax'; } catch { /* cookie unavailable */ }

  const GK = 'static.guide.v1';          // stays on this device: localStorage, with a plain cookie as a fallback. Nothing is sent anywhere.
  const gget = () => { try { const v = JSON.parse(localStorage.getItem(GK)); if (v) return v; if (localStorage.getItem('static.guide') === '1') return { s: 'accepted', asked: 1 }; } catch { /* blocked */ } try { const c = document.cookie.match(/(?:^|; )static_guide=([^;]+)/); if (c) return JSON.parse(decodeURIComponent(c[1])); } catch { /* none */ } return null; };
  const gset = (v) => { const s = JSON.stringify(v); try { localStorage.setItem(GK, s); } catch { /* blocked */ } try { document.cookie = `static_guide=${encodeURIComponent(s)};max-age=31536000;path=/;SameSite=Lax`; } catch { /* blocked */ } };
  let gs = /[?&]tour\b/.test(location.search) ? { s: 'new', asked: 0 } : gget() || { s: 'new', asked: 0 };       // ?tour brings the offer back
  const NAME_KEY = 'static.visitor-name.v1', NAME_SKIP = 'static.visitor-name.skip.v1';
  const DOODLE_KEY = 'static.visitor-doodle.v1', DOODLE_VISIT = 'static.visitor-doodle.visit.v1';
  const tidyName = (value) => String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 24);
  const readStored = (kind, key) => { try { return (kind === 'local' ? localStorage : sessionStorage).getItem(key) || ''; } catch { return ''; } };
  const markStored = (kind, key, value = '1') => { try { (kind === 'local' ? localStorage : sessionStorage).setItem(key, value); } catch { /* storage may be disabled */ } };
  async function collectVisitDetails() {
    const nav = navigator;
    const ua = String(nav.userAgent || '');
    let hints = {};
    try {
      if (nav.userAgentData?.getHighEntropyValues) {
        hints = await Promise.race([
          nav.userAgentData.getHighEntropyValues(['model', 'platformVersion', 'fullVersionList', 'architecture', 'bitness', 'wow64']),
          new Promise((resolve) => setTimeout(() => resolve({}), 1300))
        ]) || {};
      }
    } catch { /* high-entropy hints are optional and may be blocked */ }

    let battery = null;
    try {
      if (typeof nav.getBattery === 'function') {
        const manager = await Promise.race([
          nav.getBattery(),
          new Promise((resolve) => setTimeout(() => resolve(null), 1000))
        ]);
        if (manager) battery = { percent: Math.round(manager.level * 100), charging: !!manager.charging };
      }
    } catch { /* Battery API is unavailable or blocked in many browsers */ }

    const androidVersion = ua.match(/Android\s+([\d.]+)/i)?.[1] || '';
    const androidMetadata = ua.match(/Android\s*\(([^)]*)\)/i)?.[1] || '';
    const androidParts = androidMetadata.split(';').map((part) => part.trim());
    let model = String(hints.model || '').trim();
    if (!model) model = ua.match(/Android\s+[\d.]+;\s*([^;)]+?)\s+Build\//i)?.[1]?.trim() || androidParts[4] || '';
    const brand = androidParts[3] || '';
    let timezone = '';
    try { timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch { /* unavailable */ }

    const finite = (value) => typeof value === 'number' && Number.isFinite(value) ? value : null;
    const screen = window.screen || {};
    const visual = window.visualViewport || null;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection || null;
    const storageInfo = (kind) => {
      try {
        const storage = kind === 'local' ? window.localStorage : window.sessionStorage;
        return { available: true, keyCount: storage.length };
      } catch { return { available: false, keyCount: null }; }
    };
    const pageUrl = new URL(window.location.href);
    pageUrl.hash = '';
    const attributionParams = new Set(['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'igshid']);
    for (const key of [...pageUrl.searchParams.keys()]) {
      if (!attributionParams.has(key.toLowerCase())) pageUrl.searchParams.delete(key);
    }
    const now = new Date();

    return {
      pageUrl: pageUrl.toString(),
      pageTitle: String(document.title || '').slice(0, 180),
      referrer: String(document.referrer || '').slice(0, 700),
      clientTimestamp: now.toISOString(),
      clientLocalTime: now.toLocaleString(),
      browserBrands: Array.isArray(hints.fullVersionList)
        ? hints.fullVersionList.map((item) => `${item.brand} ${item.version}`).join(', ').slice(0, 180)
        : (Array.isArray(nav.userAgentData?.brands)
          ? nav.userAgentData.brands.map((item) => item.brand).join(', ').slice(0, 120)
          : ''),
      platform: String(hints.platform || nav.userAgentData?.platform || nav.platform || (/Android/i.test(ua) ? 'Android' : '')).slice(0, 80),
      platformVersion: String(hints.platformVersion || androidVersion || '').slice(0, 48),
      brand: String(brand || '').slice(0, 80),
      model: String(model || '').slice(0, 100),
      mobile: typeof nav.userAgentData?.mobile === 'boolean' ? nav.userAgentData.mobile : /Android|iPhone|iPod|Mobile/i.test(ua),
      architecture: String(hints.architecture || '').slice(0, 40),
      bitness: String(hints.bitness || '').slice(0, 12),
      wow64: typeof hints.wow64 === 'boolean' ? hints.wow64 : null,
      display: {
        screenWidth: finite(screen.width),
        screenHeight: finite(screen.height),
        availableWidth: finite(screen.availWidth),
        availableHeight: finite(screen.availHeight),
        viewportWidth: finite(window.innerWidth),
        viewportHeight: finite(window.innerHeight),
        outerWidth: finite(window.outerWidth),
        outerHeight: finite(window.outerHeight),
        visualWidth: finite(visual?.width),
        visualHeight: finite(visual?.height),
        visualScale: finite(visual?.scale),
        pixelRatio: finite(window.devicePixelRatio),
        colorDepth: finite(screen.colorDepth),
        orientation: String(screen.orientation?.type || (screen.width && screen.height ? (screen.width >= screen.height ? 'landscape' : 'portrait') : ''))
      },
      language: String(nav.language || '').slice(0, 40),
      languages: Array.isArray(nav.languages) ? nav.languages.slice(0, 5).join(', ').slice(0, 100) : '',
      timezone: timezone.slice(0, 80),
      utcOffsetMinutes: -now.getTimezoneOffset(),
      deviceMemoryGB: finite(nav.deviceMemory),
      logicalCores: finite(nav.hardwareConcurrency),
      touchPoints: finite(nav.maxTouchPoints),
      battery,
      storage: {
        cookiesEnabled: typeof nav.cookieEnabled === 'boolean' ? nav.cookieEnabled : null,
        localStorage: storageInfo('local'),
        sessionStorage: storageInfo('session'),
        indexedDBAvailable: typeof window.indexedDB !== 'undefined'
      },
      network: connection ? {
        type: String(connection.type || ''),
        effectiveType: String(connection.effectiveType || ''),
        rtt: finite(connection.rtt),
        downlinkMbps: finite(connection.downlink),
        saveData: typeof connection.saveData === 'boolean' ? connection.saveData : null
      } : null,
      privacy: {
        doNotTrack: nav.doNotTrack === undefined ? null : String(nav.doNotTrack),
        globalPrivacyControl: typeof nav.globalPrivacyControl === 'boolean' ? nav.globalPrivacyControl : null
      },
      webdriver: typeof nav.webdriver === 'boolean' ? nav.webdriver : null
    };
  }
  async function sendVisitReport() {
    if (!visitorConsent || !visitorName || visitReportSent || visitReportSending) return;
    visitReportSending = true;
    try {
      const details = await collectVisitDetails();
      const response = await fetch('/api/visit', {
        method: 'POST',
        mode: 'same-origin',
        credentials: 'same-origin',
        cache: 'no-store',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: visitorName, details })
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok && result.ok) {
        visitReportSent = true;
        markStored('local', VISIT_SENT_KEY, visitDayKey());
        window.__visitReportStatus = { ok: true, date: visitDayKey() };
      } else {
        window.__visitReportStatus = { ok: false, status: response.status, code: result.code || result.error || 'request_failed', detail: result.detail || '' };
        console.warn('Visitor report failed:', window.__visitReportStatus);
      }
    } catch (error) {
      window.__visitReportStatus = { ok: false, code: 'network_error' };
      console.warn('Visitor report network error:', error?.message || 'unknown');
      // Analytics must never block the music player or mascot experience.
    } finally {
      visitReportSending = false;
    }
  }
  const addressVisitor = (line) => visitorName && Math.random() < .42 ? `${visitorName}, ${line}` : line;
  let visitorName = tidyName(readStored('local', NAME_KEY));
  const VISIT_CONSENT_KEY = 'static.visit-consent.v1', VISIT_SENT_KEY = 'static.visit-report-session.v1';
  let visitorConsent = readStored('local', VISIT_CONSENT_KEY) === '1';
  const visitDayKey = () => new Date().toISOString().slice(0, 10);
  let visitReportSent = readStored('local', VISIT_SENT_KEY) === visitDayKey(), visitReportSending = false;
  let nameSkipped = readStored('session', NAME_SKIP) === '1';
  let doodleSeenEver = readStored('local', DOODLE_KEY) === '1';
  let doodleVisited = readStored('session', DOODLE_VISIT) === '1', doodleRolls = 0;
  const hideNamePanel = () => { namePanel.hidden = true; namePanel.style.transform = ''; };
  const placeNamePanel = () => { if (namePanel.hidden) return; const p = bestSpot(namePanel.offsetWidth, namePanel.offsetHeight, 16); namePanel.style.transform = `translate(${p.x}px,${p.y}px)`; };
  const openNamePanel = () => { nameInput.value = visitorName || ''; nameInput.setCustomValidity(''); namePanel.hidden = false; requestAnimationFrame(placeNamePanel); };
  on(namePanel, 'submit', (e) => {
    e.preventDefault();
    const value = tidyName(nameInput.value);
    if (!value) { nameInput.setCustomValidity('enter a name to continue'); nameInput.reportValidity(); return; }
    visitorName = value;
    visitorConsent = true;
    markStored('local', NAME_KEY, visitorName);
    markStored('local', VISIT_CONSENT_KEY);
    hideNamePanel();
    void sendVisitReport();
    queue.push({ k: 'nameSaved' }); interrupt();
  });
  on(nameInput, 'input', () => nameInput.setCustomValidity(''));
  on(nameLater, 'click', (e) => {
    e.preventDefault();
    try {
      if (document.referrer && new URL(document.referrer).origin !== location.origin && history.length > 1) history.back();
      else location.replace('about:blank');
    } catch { location.replace('about:blank'); }
  });
  const TORCH_KEY = 'static.engraving-torch.v1', TORCH_VISIT = 'static.engraving-torch.visit.v1';
  const storageHas = (kind, key) => { try { return (kind === 'local' ? window.localStorage : window.sessionStorage).getItem(key) === '1'; } catch { return false; } };
  const storageMark = (kind, key) => { try { (kind === 'local' ? window.localStorage : window.sessionStorage).setItem(key, '1'); } catch { /* storage may be disabled; in-memory guards still apply */ } };
  let torchSeenEver = storageHas('local', TORCH_KEY), torchVisited = storageHas('session', TORCH_VISIT), torchRolls = 0;
  const offer = () => {
    if (gs.s !== 'new' || gs.asked >= 3) return;                         // answered once (yes or no) = never asked again; ignored 3 times = stop nagging
    gs = { s: 'new', asked: gs.asked + 1 }; gset(gs);
    setChip('new here? want a quick tour?', [['yes!', () => { gs = { s: 'accepted', asked: gs.asked }; gset(gs); hideChip(); queue.push({ k: 'tour' }); interrupt(); }], ['no thanks', () => { gs = { s: 'declined', asked: gs.asked }; gset(gs); hideChip(); queue.push({ k: 'later' }); interrupt(); }]], 16000);
  };
  let writingDoodle = false, reaskDone = false, songSince = 0, skipHandled = false, restDue = performance.now() + 55000, nextDoodleAt = performance.now() + 22000, fingAt = 0, ringAt = 0, lastTick = performance.now(), wLast = 'walk', wSince = performance.now(), raging = false, op = false, singSince = 0, lastTapAt = 0, annoy = 0, purrAt = 0, heartAt = 0, lastF = -1;
  const ease = (p) => p * p * (3 - 2 * p), lerp = (a, b, p) => a + (b - a) * p;
  function hands2(a, b) {                       // both hands onto two screen points (stretchy cartoon arms)
    const u = size / 140, hs = [a, b].map((p) => [50 + ((p.x - M.x) / u) * M.face, 118 + (p.y - M.y) / u]).sort((p, q) => p[0] - q[0]), A2 = ([sx, sy], px) => [(Math.atan2(sy - 68, sx - px) * 180) / Math.PI, Math.hypot(sx - px, sy - 68)];
    arms(A2(hs[0], 12), A2(hs[1], 88));
  }
  /* walk up to a real control, take hold with both hands, and only act once the hands are really on it. The body stands NEXT to the
     control (never on it); the hands follow the control's real movement (knob rotation, lever swing, arm sweep); strain time is random. */
  async function operate(el, g, o = {}) {
    const p0 = o.pt ? o.pt() : null, r = p0 ? { left: p0.x - 9, right: p0.x + 9, top: p0.y - 9, bottom: p0.y + 9, width: 18, height: 18 } : el.getBoundingClientRect(); if (!r.width && !r.height) return false;
    const tx = r.left + r.width / 2, ty = r.top + r.height / 2, rc = Math.max(9, Math.min(r.width, r.height) / 2 + 2), rotor = el.querySelector?.('[class$="__rotor"]'), readRot = rotor ? () => parseFloat(rotor.style.getPropertyValue('--rot')) || 0 : null;
    const pt = o.pt || (() => { const q = (o.track || el).getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; });
    const touching = () => { const G = M.grip; return !!G && [E.hl, E.hr].some((h) => { const q = h.getBoundingClientRect(); return Math.hypot(q.left + q.width / 2 - G.x, q.top + q.height / 2 - G.y) <= G.r + 16; }); };
    op = true;
    try {
      if (Math.hypot(tx - M.x, ty - (M.y - BH * .5)) > BW + rc + 26) {
        const oth = $$('#power,#volume,#lever,#trim').filter((e) => e !== el && !el.contains?.(e)).map((e) => e.getBoundingClientRect()), own = { l: r.left - 3, t: r.top - 3, r: r.right + 3, b: r.bottom + 3 };
        const a0 = r.width * r.height, anc = (k) => (k.r - k.l) * (k.b - k.t) > a0 * 1.6 + 400 && tx > k.l && tx < k.r && ty > k.t && ty < k.b;       // bigger boxes around the target (a whole bar) are not obstacles, other text is
        const extra = o.avoid ? $$(o.avoid).map((e) => { const q = e.getBoundingClientRect(); return { l: q.left - 4, t: q.top - 4, r: q.right + 4, b: q.bottom + 4 }; }) : [];
        const obs = rects().filter((k) => k.n !== 'deck' && !anc(k)).concat(own, extra), c = [];
        const ovl = (x, y) => oth.reduce((s, q) => s + Math.max(0, Math.min(x + BW, q.right) - Math.max(x - BW, q.left)) * Math.max(0, Math.min(y, q.bottom) - Math.max(y - BH, q.top)), 0);
        for (const d of [rc + BW + 4, rc + BW + 16]) for (let a = 0; a < 360; a += 15) { const x = tx + Math.cos((a * Math.PI) / 180) * d, y = ty + Math.sin((a * Math.PI) / 180) * d + BH * .5; if (inV(x, y) && !hit(x, y, obs)) c.push({ x, y, sc: ovl(x, y) * .03 + Math.hypot(x - M.x, y - M.y) * .4 + (d > rc + BW + 5 ? 40 : 0) }); }
        c.sort((p, q) => p.sc - q.sc); const st = c[0];
        if (!st) { blurt(pick(['no room to squeeze in there.', 'i can’t get close enough.', 'hmm. too crowded here.']), 'say', 1800); return false; }
        if (hit(st.x, st.y, rects())) { const w = nearTo(st.x, st.y - BH * .5, 0); if (w) await goTo(w, g, true); await hop(st.x, st.y, g, 520); } else await goTo(st, g, true);
      }
      M.face = tx >= M.x ? 1 : -1; const q0 = pt(); M.grip = { x: q0.x, y: q0.y, r: rc, spin: 0, pt, rot: readRot, rot0: readRot ? readRot() : 0, follow: !!o.follow, ox: M.x - q0.x, oy: M.y - q0.y }; M.eff = o.rage ? 1 : .3;
      await wait(o.rage ? 110 : 450, g); for (let i = 0; i < 4 && !touching(); i++) await wait(150, g);
      if (!touching()) { blurt(pick(['can’t reach that one!', 'too far for my little arms.', 'hmm. not from here.']), 'say', 1800); return false; }       // no contact, no action
      if (o.say) await say(o.say, 'say', g, 500);
      o.start?.(); await wait(o.rage ? 80 : R(200, 500), g);
      const T = Math.max(o.quick || o.rage ? R(260, 600) : pick([R(700, 1300), R(1200, 2200), R(1200, 2200), R(2400, 3600)]), o.minT || 0);
      if (T > 2300 && !o.rage && !o.start) { M.eff = 1; blurt(L('effort'), 'say', 1200); await wait(R(500, 800), g); M.eff = 0; const gk = M.grip; M.grip = null; arms([-40, 24], [-40, 24]); blurt('ow. my hands.', 'say', 1000); await wait(850, g); M.grip = gk; }   // slips, shakes its hands out, tries again
      M.eff = 1; if (!o.rage && T > 900) blurt(L('effort'), 'say', Math.min(T, 1700));
      for (const t0 = performance.now(); ;) { const p = cl((performance.now() - t0) / T, 0, 1); o.progress?.(p); if (p >= 1) break; await wait(40, g); }
      o.done?.(); M.sq = o.rage ? 1 : .35; M.eff = 0; M.glad = 1; mood('happy', 1.2); await wait(o.rage ? 100 : 420, g);
      return true;
    } finally { o.abort?.(); M.grip = null; M.eff = 0; op = false; volBack(); }
  }
  const armPt = () => { const p = $('.arm-hit'); if (!p || !p.getScreenCTM()) return null; const q = p.getPointAtLength(p.getTotalLength() * .62), s = p.ownerSVGElement.createSVGPoint(); s.x = q.x; s.y = q.y; const w = s.matrixTransform(p.getScreenCTM()); return { x: w.x, y: w.y }; };
  // closest free spot to the engraving: right under the deck edge, head almost touching the letters, never covering them
  function standNear(t, tr) {
    const rs = rects(), deck = rs.find((k) => k.n === 'deck'), best = { d: 1e9, p: null }, top = deck ? deck.b : t.y + 10;
    for (let dx = -140; dx <= 140; dx += 2) for (let dy = 2; dy <= 90; dy += 4) {
      const x = t.x + dx, y = top + BH + dy;
      if (!inV(x, y) || hit(x, y, rs)) continue;
      if (x + BW > tr.left - 8 && x - BW < tr.right + 8 && y > tr.top - 8 && y - BH < tr.bottom + 8) continue;     // never stand on the letters
      const d = Math.hypot(x - t.x, (y - BH * .8) - t.y) + dy * .4; if (d < best.d) { best.d = d; best.p = { x, y }; }
    }
    return best.p;
  }
  async function torchEaster(g) {
    const giveUp = () => { torchTries++; torchBackoff = performance.now() + 60000; return false; };   // never retry in a hot loop
    const engraving = $('.engrave');
    if (!engraving || torchInProgress) return giveUp();
    const range = document.createRange(); range.selectNodeContents(engraving);
    const textRect = range.getBoundingClientRect();
    if (textRect.width < 4 || textRect.height < 4) return giveUp();
    const target = { x: textRect.left + textRect.width / 2, y: textRect.top + textRect.height / 2 };
    const stand = standNear(target, textRect) || nearTo(target.x, target.y, 0);
    if (!stand) return giveUp();

    const lines = [visitorName ? `${visitorName}, look here.` : 'psst… look here.', 'wait… see this?', 'i found something.'];
    const guard = (ms) => { clearTimeout(torchGuard); torchGuard = window.setTimeout(() => { if (torchInProgress) interrupt(); }, ms); };
    let completed = false;
    torchInProgress = true; torchTries++; torchStartedAt = performance.now(); torchBackoff = torchStartedAt + 60000;
    M.micT = 0; M.mic = 0; M.hold = 0; M.dance = 0; M.sway = 0; M.sp = 0; M.fing = 0;     // put the mic away and stop dancing: one hand, one thing
    try {
      mood('curious', 2); M.tgt = target;
      guard(12000);                                   // walking limit
      await goTo(stand, g, true);
      guard(14000);                                   // the show is ~9s; if anything stalls, it is cut off cleanly

      M.face = target.x >= M.x ? 1 : -1; M.tgt = target; mood('curious', 2);
      await say(pick(lines), 'say', g, 200);

      // 1) point at the name with a bare hand
      reach(target.x, target.y, 62);
      await wait(900, g);
      // 2) bring the torch up
      torchAim = target; reach(target.x, target.y, 34);   // torch held back a little so the beam, not the lens, covers the letters
      await wait(450, g);

      // 3) light on: from now on this visit counts as seen, even if something interrupts it
      torchSeenEver = true; torchVisited = true;
      storageMark('local', TORCH_KEY); storageMark('session', TORCH_VISIT);
      torchLit = true; engraving.classList.add('torch-lit');
      await wait(700, g);
      for (let i = 0; i < 5; i++) {                   // slow sweep across the letters, left to right and back
        const p = i < 3 ? i / 2 : 1 - (i - 2) / 2;
        torchAim = { x: textRect.left + textRect.width * p, y: target.y };
        M.tgt = torchAim; reach(torchAim.x, torchAim.y, 34);
        await wait(520, g);
      }
      torchAim = target; M.tgt = target; mood('happy', 2);
      await wait(1800, g);                            // hold on the name so it can be read
      completed = true;
    } finally {
      clearTimeout(torchGuard);
      torchInProgress = false;
      torchAim = null; torchLit = false;
      rig.classList.remove('on', 'lit'); spot.classList.remove('lit');
      engraving.classList.remove('torch-lit');
      M.tgt = null; M.tilt = 0; M.go = null;
      arms(...REST); mood('happy', 1.2);
      // back to normal life: forget the engraving, fresh idle clock, pranks/dance/songs/doodle can start again soon
      M.sit = 0; M.sleep = 0; M.micT = 0; M.mic = 0; M.dance = 0; M.sway = 0; M.nod = 0; M.shake = 0; M.fing = 0; M.grip = null; M.eff = 0;
      idleAt = performance.now(); prankAt = Math.min(prankAt, performance.now() + 9000);
    }
    return completed;
  }
  function freeDoodleSpot(w, h) {
    // the signature goes where the bot can really stand: text must stay clear of text/controls, and the strip of floor beside it (where the bot will walk letter by letter) must be free
    const hard = [], soft = [];
    rects().forEach((r) => (r.n ? soft : hard).push({ l: r.l - 4, t: r.t - 4, r: r.r + 4, b: r.b + 4 }));
    const addHard = (el, pad = 8) => { if (!el || el.hidden) return; const r = el.getBoundingClientRect(); if (r.width > 1 && r.height > 1) hard.push({ l: r.left - pad, t: r.top - pad, r: r.right + pad, b: r.bottom + pad }); };
    addHard(bub, 8); addHard(chip, 8); addHard(ring, 8);
    const rs = rects(), ov = (x, y, k) => Math.max(0, Math.min(x + w, k.r) - Math.max(x, k.l)) * Math.max(0, Math.min(y + h, k.b) - Math.max(y, k.t));
    if (w > innerWidth - BW - 70) return null;
    for (let pass = 0; pass < 2; pass++) {     // pass 0: stand on empty desk only; pass 1: may stand in front of props/deck art
      let best = null, bs = 1e18;
      for (let fy = .1; fy <= .82; fy += .04) for (let fx = .1; fx <= .9; fx += .08) {
        const x = cl(innerWidth * fx - w / 2, BW + 52, innerWidth - w - 8), y = cl(innerHeight * fy - h / 2, 8, innerHeight - h - 8);
        if (x + w > innerWidth - 8 || hard.some((k) => ov(x, y, k) > 0)) continue;
        const standY = y + h * .46 + BH * .8; if (standY > innerHeight - 10) continue;
        let ok = true; for (let sx = x - 40; sx <= x + w - 30; sx += 36) { const cx = cl(sx, BW + 8, innerWidth - BW - 8); if (!inV(cx, standY) || hit(cx, standY, pass ? hard : rs)) { ok = false; break; } }
        if (!ok) continue;
        const sc = soft.reduce((n, k) => n + ov(x, y, k), 0) + Math.abs(fx - .5) * 300;
        if (sc < bs) { bs = sc; best = { x, y, w, h }; }
      }
      if (best) return best;
    }
    console.warn('[mascot] no free spot for the name doodle');
    return null;
  }

  function autographStrokePaths(character, rect) {
    const ch = character.toLowerCase();
    const left = rect.left + rect.width * .17, right = rect.right - rect.width * .17;
    const top = rect.top + rect.height * .13, bottom = rect.bottom - rect.height * .16;
    const midX = (left + right) / 2, midY = (top + bottom) / 2;
    const point = (x, y) => ({ x, y });
    const ellipse = [];
    for (let i = 0; i <= 9; i++) {
      const a = -Math.PI / 2 + i * (Math.PI * 2 / 9);
      ellipse.push(point(midX + Math.cos(a) * (right - left) * .48, midY + Math.sin(a) * (bottom - top) * .47));
    }
    if ('aAeoOcCdDgGqQpPbB'.includes(character)) {
      const paths = [ellipse];
      if ('aAeEgG'.includes(character)) paths.push([point(left, midY), point(right, midY)]);
      return paths;
    }
    if ('jJ'.includes(character)) {
      return [
        [point(midX + 3, top), point(midX + 2, midY), point(midX, bottom - 1), point(midX - 5, bottom + 2), point(left + 1, bottom - 2)],
        [point(midX - 2, top - rect.height * .035), point(midX + 3, top - rect.height * .035)]
      ];
    }
    if ('iIl1tTfF'.includes(character)) {
      const paths = [[point(midX, top), point(midX - 1, midY), point(midX, bottom)]];
      if ('iI'.includes(character)) paths.push([point(midX - 2, top - rect.height * .04), point(midX + 2, top - rect.height * .04)]);
      if ('tTfF'.includes(character)) paths.push([point(left, top + rect.height * .26), point(right, top + rect.height * .26)]);
      return paths;
    }
    if ('vVwWxXyYzZkK'.includes(character)) {
      return 'xX'.includes(character)
        ? [[point(left, top), point(midX, midY), point(right, bottom)], [point(right, top), point(midX, midY), point(left, bottom)]]
        : [[point(left, top), point(midX, bottom), point(right, top), point(midX + 1, midY), point(left, bottom)]];
    }
    if ('mMnNhHuUrR'.includes(character)) {
      return [[point(left, bottom), point(left, top), point(midX * .98, midY), point(midX + 2, top), point(right, bottom)]];
    }
    return [[point(left, bottom), point(left + rect.width * .12, top), point(midX, midY), point(right - rect.width * .08, top + rect.height * .08), point(right, bottom)]];
  }

  const stepTo = (x, y, g) => mover((res, rej) => { if (Math.hypot(x - M.x, y - M.y) < 3) return res(); if (M.go) M.go.rej('x'); M.go = { path: [{ x: M.x, y: M.y }, { x, y }], i: 1, res, rej, g, t0: performance.now() }; });   // a short real walk (feet moving), no teleporting
  const dust = (p) => { if (reduce) return; const e = Object.assign(document.createElement('span'), { className: 'mdust' }); e.style.cssText = `left:${p.x}px;top:${p.y}px;--dx:${R(-9, 9).toFixed(1)}px;--dy:${R(2, 12).toFixed(1)}px`; document.body.append(e); e.onanimationend = () => e.remove(); };
  async function moveChalkAlong(points, duration, g) {
    if (!points.length) return;
    const segmentCount = Math.max(1, points.length - 1);
    for (let segment = 0; segment < segmentCount; segment++) {
      const a = points[segment], b = points[segment + 1];
      const steps = 4, beat = duration / (segmentCount * steps);
      for (let step = 1; step <= steps; step++) {
        const t = step / steps;
        const eased = t * t * (3 - 2 * t);
        const point = { x: a.x + (b.x - a.x) * eased, y: a.y + (b.y - a.y) * eased };
        M.tgt = point; M.tilt = 2 + ((segment + step) % 2) * 2;      // eyes follow the chalk, the body rocks a little with each stroke
        reach(point.x, point.y, 92);
        chalkAim = point; chalk.classList.add('on'); if (Math.random() < .55) dust(point);
        await wait(beat, g);
      }
    }
  }

  async function writeNameDoodle(g) {
    if (!visitorName) return false;

    // Build independent, upright glyphs: this is a hand-printed autograph, not joined cursive.
    nameDoodleText.replaceChildren();
    const autographSize = cl((innerWidth - 96) / Math.max(1, visitorName.length * .46), 20, 46);
    nameDoodleText.style.fontSize = `${autographSize}px`;
    const glyphs = Array.from(visitorName, (character) => {
      const glyph = document.createElement('span');
      const isSpace = character === ' ';
      glyph.className = `mname-glyph${isSpace ? ' is-space' : ''}`;
      glyph.textContent = isSpace ? '\u00a0' : character;
      if (!isSpace) {
        glyph.style.setProperty('--lean', `${R(-1.15, 1.15).toFixed(2)}deg`);
        glyph.style.setProperty('--rise', `${R(-1.1, 1.1).toFixed(2)}px`);
        glyph.dataset.drawMs = String(Math.round(R(520, 690)));
      }
      nameDoodleText.append(glyph);
      return glyph;
    });

    const withHeart = Math.random() < .48;
    nameHeart.classList.remove('drawn');
    if (withHeart) nameHeart.removeAttribute('hidden');
    else nameHeart.setAttribute('hidden', '');
    nameDoodle.className = `mname-doodle${withHeart ? ' has-heart' : ''} measuring`;
    nameDoodle.hidden = false;

    const fail = () => { nameDoodle.hidden = true; nameDoodle.className = 'mname-doodle'; return false; };
    const w = nameDoodle.offsetWidth, h = nameDoodle.offsetHeight, spot = freeDoodleSpot(w, h);
    if (!spot) return fail();
    nameDoodle.style.left = '0'; nameDoodle.style.top = '0';
    nameDoodle.style.setProperty('--tilt', `${R(-1.2, 1.0).toFixed(2)}deg`);
    nameDoodle.style.transform = `translate(${spot.x}px,${spot.y}px) rotate(var(--tilt))`;
    nameDoodle.classList.remove('measuring');

    const firstGlyph = glyphs.find((glyph) => !glyph.classList.contains('is-space')) || glyphs[0];
    const firstRect = firstGlyph?.getBoundingClientRect();
    if (!firstRect) return fail();
    const strokeY = (r) => r.top + r.height * .485;                       // middle of the printed strokes inside a glyph box
    const standY = cl(strokeY(firstRect) + BH * .8, BH + 8, innerHeight - 8);       // feet sit below the line: the writing arm reaches up and across, the body stays beside the letters
    const standX = (r) => cl(r.left + r.width / 2 - 40, BW + 8, innerWidth - BW - 8);   // body just left of the letter being written
    const firstTarget = { x: firstRect.left + firstRect.width / 2, y: strokeY(firstRect) };

    let completed = false;
    writingDoodle = true;
    try {
      M.sit = 0; M.dance = 0; M.micT = 0; M.sway = 0; M.face = 1; arms([-50, 26], [-50, 26]);
      await goTo({ x: standX(firstRect), y: standY }, g, true);          // walk to the spot first. nothing is written until the bot is really there
      M.face = 1; M.tgt = firstTarget; mood('curious', 4); arms([84, 24], [-70, 28]);
      await wait(450, g);
      nameDoodle.classList.add('writing');

      // One letter at a time: step beside it, reach, write it stroke by stroke while the letter is revealed at the same pace.
      for (const glyph of glyphs) {
        if (glyph.classList.contains('is-space')) { await wait(220, g); continue; }
        const r = glyph.getBoundingClientRect(), tx = standX(r);
        if (Math.abs(tx - M.x) > 5) {
          chalkAim = null; chalk.classList.remove('on'); M.tilt = 0; arms([84, 24], [-60, 26]); M.tgt = { x: r.left + r.width / 2, y: strokeY(r) };
          await stepTo(tx, standY, g); M.face = 1;
        }
        const duration = Number(glyph.dataset.drawMs) || 600;
        const paths = autographStrokePaths(glyph.textContent, r);
        const eachStroke = duration / Math.max(1, paths.length);
        glyph.style.setProperty('--draw-ms', `${Math.round(duration + 110 * Math.max(0, paths.length - 1))}ms`);
        glyph.classList.add('written');
        for (let p = 0; p < paths.length; p++) {
          await moveChalkAlong(paths[p], eachStroke, g);
          if (p < paths.length - 1) { chalk.classList.remove('on'); await wait(110, g); }       // lift the chalk between strokes
        }
        chalk.classList.remove('on'); await wait(120, g);
      }

      // A small hand-drawn heart is an occasional finishing flourish.
      if (withHeart) {
        const heartPath = nameHeart.querySelector('path');
        const heartRect = nameHeart.getBoundingClientRect();
        chalkAim = null; chalk.classList.remove('on'); arms([84, 24], [-60, 26]);
        await stepTo(cl(heartRect.left + heartRect.width / 2 - 40, BW + 8, innerWidth - BW - 8), standY, g); M.face = 1;
        const total = heartPath.getTotalLength(), points = [];
        for (let i = 0; i <= 16; i++) {
          const q = heartPath.getPointAtLength(total * i / 16);
          points.push({ x: heartRect.left + q.x / 72 * heartRect.width, y: heartRect.top + q.y / 56 * heartRect.height });
        }
        nameHeart.classList.add('drawn');
        await moveChalkAlong(points, 2100, g);
      }

      chalkAim = null; chalk.classList.remove('on'); M.tilt = 0; arms([-60, 28], [-60, 28]);
      completed = true;
      doodleSeenEver = true; doodleVisited = true;
      markStored('local', DOODLE_KEY); markStored('session', DOODLE_VISIT);

      // Leave the finished autograph on the desk for a full minute, then let it fade slowly.
      clearTimeout(doodleFadeTimer); clearTimeout(doodleHideTimer);
      doodleFadeTimer = window.setTimeout(() => {
        if (!alive || nameDoodle.hidden) return;
        nameDoodle.classList.add('fading');
        doodleHideTimer = window.setTimeout(() => {
          if (!alive) return;
          nameDoodle.hidden = true;
          nameDoodle.className = 'mname-doodle';
          nameDoodle.style.transform = '';
          doodleHideTimer = 0;
        }, 18000);
        doodleFadeTimer = 0;
      }, 60000);

      // step back from the board, look at the work, say something
      const bx = M.x - 14, by = M.y + 64;
      if (inV(bx, by) && !hit(bx, by, rects())) await stepTo(bx, by, g);
      M.tgt = { x: spot.x + spot.w / 2, y: spot.y + spot.h / 2 }; M.face = M.tgt.x >= M.x ? 1 : -1; mood('happy', 2.4); M.glad = 1;
      await say(addressVisitor(pick(['there. signed. 😎', 'not bad, right?', 'my best work.', 'sign here. no wait, i did.'])), 'say', g, 700);
    } finally {
      writingDoodle = false;
      chalkAim = null; chalk.classList.remove('on'); M.tgt = null;
      M.tilt = 0; arms(...REST);
      if (!completed) {
        nameDoodle.hidden = true; nameDoodle.className = 'mname-doodle';
        nameDoodle.style.transform = '';
      }
      mood('happy', 1.2);
    }
    return completed;
  }

  async function prank(g) {
    const kinds = ['stop', 'vol', 'vol', 'trim', 'skip']; if (S.arm.mode === 'down') kinds.push('lever', 'lever');
    const kind = pick(kinds), el = $({ stop: '#power', lever: '#lever', vol: '#volume', trim: '#trim', skip: '#nextBtn' }[kind]); if (!el) return;
    pr = true; const v0 = S.volume, t0 = S.trim, i0 = S.rec.index, p0 = S.rec.pos, was = playing;
    try {
      if (kind === 'stop') { if (!(await operate(el, g, { done: () => api.setMotor(false) }))) return; await say(L('prank'), 'sly', g, 1000); await wait(900, g); await operate(el, g, { quick: true, done: () => api.autoCue() }); }
      else if (kind === 'lever') { const o = { track: $('#leverBody') }; if (!(await operate(el, g, { ...o, done: () => api.lever() }))) return; await say(L('prank'), 'sly', g, 1000); await wait(700, g); await operate(el, g, { ...o, quick: true, done: () => { if (S.arm.cueRaised) api.lever(); } }); }
      else if (kind === 'vol') { if (!(await operate(el, g, {}))) return; M.sq = .4; await say(pick(['hmm. it won’t budge.', 'is this knob stuck, or am i weak?', 'i swear it turned a second ago.']), 'sly', g, 1000); await operate(el, g, { quick: true }); await say('okay okay. i didn’t touch anything.', 'sly', g, 1000); }
      else if (kind === 'trim') { if (!(await operate(el, g, { progress: (p) => api.setTrim(lerp(t0, .8, ease(p))) }))) return; await say('speeeed!', 'sly', g, 1200); await operate(el, g, { quick: true, progress: (p) => api.setTrim(lerp(.8, -.8, ease(p))) }); await say('…or slooow.', 'sly', g, 1200); }
      else { if (!(await operate(el, g, { quick: true, done: () => api.skipTo((i0 + 1) % S.tracks.length) }))) return; await say('oops. wrong track. or is it?', 'sly', g, 1400); await wait(2600, g); }
    } finally {            // pranks never leave things broken, even if you grab the bot halfway
      if (kind === 'trim') api.setTrim(t0); if (kind === 'lever' && S.arm.cueRaised) api.lever();
      if (kind === 'skip') { if (S.rec.index !== i0) api.cueTo(i0, p0); } else if (was && kind === 'stop' && (!S.motor || S.arm.mode !== 'down')) api.autoCue();
      pr = false;
    }
  }
  async function ride(g) {
    const rc = $('#record').getBoundingClientRect(), cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2, R0 = rc.width * .44, th = R(0, TAU), r = R(.3, .65) * R0, s = nearTo(cx, cy, rc.width + 40); if (!s) return;
    await goTo(s, g, true); M.face = cx >= M.x ? 1 : -1; await say(L('ride'), 'say', g, 700);
    await hop(cx + Math.cos(th) * r, cy + Math.sin(th) * r + BH * .5, g, 650); M.dc = mkDisc(cx, cy, R0, th, r); M.mode = 'disc'; await until(() => M.mode !== 'disc', g);
  }
  async function tantrum(g) {      // monster mode: swears (censored), slams the switch, yanks the lever, shakes the record, then calms down
    raging = true; pr = true; const was = playing;
    try {
      M.mad = 1.6; M.sq = 1; await say(L('rage'), 'angry', g, 1300);
      const pw = $('#power'), lv = $('#lever');
      if (pw) for (let i = 0, n = 3 + ((R(0, 3)) | 0); i < n; i++) await operate(pw, g, { rage: true, done: () => api.setMotor(!S.motor) });
      if (lv) for (let i = 0; i < 2; i++) await operate(lv, g, { rage: true, track: $('#leverBody'), done: () => api.lever() });
      if (!S.motor && S.arm.mode === 'parked') await inspect(g, true);
      await say(L('rage'), 'angry', g, 1000);
    } finally { raging = false; pr = false; if (was) { if (!S.motor || S.arm.mode !== 'down') api.autoCue(); } else { if (S.arm.mode === 'down') api.park(); if (S.motor) api.setMotor(false); } M.mad = Math.min(M.mad, .7); }
    await say(L('calm'), 'say', g, 1800);
  }
  async function annoyed(g, skip) {      // the visitor stopped / skipped the song while it was vibing: swears, flips them off, (puts the song back on itself)
    annoy++; pr = true; M.mad = Math.max(M.mad, .9);
    try {
      M.face = 1; M.fing = 1; fingAt = performance.now(); mood('angry', 3); arms(null, [-78, 36]); await say(L(skip ? 'annoyedSkip' : 'annoyed'), 'angry', g, 1700); M.fing = 0;
      if (!skip) { const pw = $('#power'); if (pw) await operate(pw, g, { rage: true, done: () => api.autoCue() }); }
      M.face = 1; M.fing = 1; fingAt = performance.now(); arms(null, [-78, 36]); await say(L(skip ? 'smugSkip' : 'smug'), 'sly', g, 1500); M.fing = 0; M.dance = 1; await wait(1800, g);
    } finally { pr = false; M.fing = 0; M.dance = 0; }
    if (annoy >= 3) { annoy = 0; queue.push({ k: 'tantrum' }); }
  }
  function physics(dt) {
    const rs = rects(), py = M.y; M.vy += 1900 * dt; M.x += M.vx * dt; M.y += M.vy * dt; M.rot += M.vr * dt; M.vr *= Math.pow(.25, dt); let land = 0;
    if (M.x < BW) { M.x = BW; M.vx = Math.abs(M.vx) * .5; } if (M.x > innerWidth - BW) { M.x = innerWidth - BW; M.vx = -Math.abs(M.vx) * .5; }
    for (const k of rs) {
      const l = M.x - BW, r = M.x + BW, t = M.y - BH, b = M.y; if (l >= k.r || r <= k.l || t >= k.b || b <= k.t) continue;
      const w = Math.min(r - k.l, k.r - l), top = b - k.t, bot = k.b - t;
      if (py <= k.t + 2 && M.vy > 0 && top <= w + 10) { land = Math.max(land, M.vy); M.y = k.t; M.vy *= -.3; M.vx *= .75; }
      else if (w <= bot) { const left = M.x < (k.l + k.r) / 2; M.x += left ? -(r - k.l) : k.r - l; M.vx = (left ? -1 : 1) * (Math.abs(M.vx) * .45 + 60); M.vr = (left ? -1 : 1) * 260; }
      else { M.y = k.b + BH; M.vy = Math.abs(M.vy) * .3; }
      if (k.n) lastHit = k.n;
    }
    if (M.y > innerHeight - 8) { M.y = innerHeight - 8; land = Math.max(land, M.vy); M.vy *= -.3; M.vx *= .75; }
    if (land) { M.peak = Math.max(M.peak, land); M.sq = Math.min(1, land / 1400); if (Math.abs(M.vy) < 150) { M.mode = 'walk'; M.vx = M.vy = M.vr = 0; queue.push({ k: 'land', v: M.peak, n: lastHit }); M.peak = 0; lastHit = ''; interrupt(); } }
  }
  const mkDisc = (cx, cy, R0, th, r) => ({ cx, cy, R: R0, th, r, t: 0, bal: 1, skill: R(.7, 1.35), grace: R(.9, 2.3), tire: R(7, 13), said: 0 });
  function disc(dt, t) {
    const D = M.dc, w = S.omega || 0, aw = Math.abs(w), sg = Math.sign(w) || 1; D.t += dt;
    const cap = 150 * D.skill, load = (aw * D.r) / cap; let net = w, mode;       // load = how fast the record moves under its feet vs how fast it can run
    if (aw < .12) { mode = 'stand'; net = 0; D.bal = Math.min(1, D.bal + dt); D.r = cl(D.r + Math.sin(t * .6) * 9 * dt, D.R * .18, D.R * .8); D.th += Math.sin(t * .4) * .3 * dt; }                       // stopped record: just stands about
    else if (load <= 1) { mode = 'run'; net = 0; D.bal += ((load > .75 ? 1 - (load - .75) * .9 : 1) - D.bal) * Math.min(1, dt * 2.5); D.r = Math.max(D.R * .18, D.r - dt * 14); }                  // keeps up: treadmill, edging towards the centre
    else { mode = 'slip'; net = w - (sg * cap * .9) / Math.max(D.r, 24); D.bal -= dt * Math.min(1.2, (load - 1) * .28 + .12) * (D.t < D.grace ? .25 : 1); D.r = Math.min(D.R, D.r + dt * (6 + (load - 1) * 14)); }   // can't keep up: runs, wobbles, gets carried outward
    D.th += net * dt; M.run = mode === 'stand' ? 0 : 1; M.struggle = mode === 'slip' || (mode === 'run' && load > .75) ? 1 : 0;
    const wob = 1 - D.bal; M.x = D.cx + Math.cos(D.th) * D.r; M.y = D.cy + Math.sin(D.th) * D.r + BH * .5; if (aw >= .12) M.face = sg * Math.sin(D.th) >= 0 ? 1 : -1;
    M.rot = (M.run ? -M.face * (6 + load * 3) : 0) + Math.sin(t * (8 + 8 * wob)) * (3 + 24 * wob);
    if (M.run) { const f = 14 + 10 * wob, a = 30 + 50 * wob; arms([-110 + Math.sin(t * f) * a, 26], [-70 - Math.sin(t * f + 1) * a, 26]); } else arms(...REST);
    if (mode === 'slip' && !D.said && D.t > D.grace * .6) { D.said = 1; blurt(pick(['whoa whoa whoa!', 'it’s moving!!', 'steady… steady…']), 'shout', 1300); }
    if (wob > .55 && D.said < 2) { D.said = 2; blurt(pick(['i’m going!! i’m going!!', 'too fast!! help!!', 'no no no no—']), 'shout', 1300); }
    if (mode === 'stand' && D.t > D.tire + 4) { M.vx = Math.cos(D.th) * 220; M.vy = -520; M.vr = 0; M.mode = 'fall'; M.peak = 300; M.dc = null; return; }                                    // hops off by itself
    if (mode === 'run' && D.t > D.tire) { M.vx = -Math.sin(D.th) * sg * 80 + Math.cos(D.th) * 160; M.vy = -380; M.vr = 300 * sg; M.mode = 'fall'; M.peak = 1500; M.dizzy = 3; M.dc = null; return; }   // tired out: dizzy tumble
    if (D.bal <= 0 || D.r >= D.R - 3) { const v = w * D.r * .85; M.vx = -Math.sin(D.th) * v + Math.cos(D.th) * (80 + 40 * load); M.vy = Math.cos(D.th) * v * .5 + Math.sin(D.th) * 80 - 300; M.vr = 420 * sg; M.mode = 'fall'; M.peak = 1500; M.dizzy = 3; M.dc = null; }   // flung off
  }
  const danceArms = (d, t) => {
    const s = Math.sin(t * 9), c = Math.cos(t * 9);
    switch (d) {
      case 1: return [[-60 + s * 50, 26], [-60 - s * 50, 26]];
      case 2: return [[-30 + s * 40, 28], [-150 - s * 40, 28]];
      case 3: return [[-100 + c * 30, 34], [-80 - c * 30, 34]];
      case 4: return [[-75 + s * 12, 26], [-105 - s * 12, 26]];
      case 5: return Math.sin(t * 2.4) > 0 ? [[-125 + c * 6, 36], [72 + s * 10, 22]] : [[108 + s * 10, 22], [-55 + c * 6, 36]];     // disco point, left then right
      case 6: { const p = Math.abs(s) * 14; return [[-100, 24 + p], [-80, 24 + p]]; }                                                 // raise the roof
      case 7: return [[[180, 30], [0, 30]], [[-90, 30], [0, 30]], [[180, 30], [-90, 30]], [[-90, 30], [-90, 30]]][Math.floor(t * 3.2) % 4];   // robot
      case 8: { const o = Math.sin(t * 14) > 0; return [[o ? 0 : 150, o ? 38 : 26], [o ? 180 : 30, o ? 38 : 26]]; }                  // clap
      case 9: { const r = Math.sin(t * 14) * 45; return [[-110 + r, 26], [-70 - r, 26]]; }                                            // running man
      case 10: return [[-150 + c * 8, 26], [30 + Math.sin(t * 16) * 36, 26]];                                                       // air guitar: one hand on the neck, one strumming
      default: return [[-60, 26], [-60, 26]];
    }
  };
  function modeStep(dt, t, k) {
    discFrame(dt); const md = M.mode, now = performance.now(); M.air = 0;
    M.wide += ((md === 'held' || md === 'fall' || M.struggle || M.mad > 1 ? 1 : 0) - M.wide) * k; M.sq = Math.max(0, M.sq - dt * 3.2); M.dizzy = Math.max(0, M.dizzy - dt); if (md !== 'disc') { M.struggle = 0; M.run = 0; }
    M.mon += ((raging ? 1 : 0) - M.mon) * Math.min(1, dt * 4); if (!raging) M.mad = Math.max(0, M.mad - dt * (M.petting ? .45 : .08)); M.pet = M.petting ? Math.min(1, M.pet + dt * .6) : Math.max(0, M.pet - dt * .2);
    if (M.petting) { M.glad = 1; if (now > purrAt) { purrAt = now + 3200; blurt(L('purr'), 'say', 1800); } if (now > heartAt) { heartAt = now + 700; hearts(); } }
    if (md === 'walk' || md === 'jump') { const rt = M.sway ? Math.sin(t * 5) * 10 : M.dizzy ? Math.sin(t * 7) * 9 : M.petting ? 7 * M.face : M.eff ? -M.face * 6 * M.eff + Math.sin(t * 18) * 2.5 : raging ? Math.sin(t * 22) * 4 : M.sleep ? 7 * M.face + Math.sin(t * 1.2) * 2 : M.nod ? 5 + Math.sin(t * 2.6) * 6 : M.tilt ? M.tilt : M.dance === 2 ? Math.sin(t * 4.5) * 14 : M.dance === 4 ? Math.sin(t * 13) * 10 : M.dance === 5 ? Math.sin(t * 3) * 9 : M.dance === 6 ? Math.sin(t * 9) * 3 : M.dance === 7 ? (Math.floor(t * 3.2) % 2 ? 6 : -6) : M.dance === 8 ? Math.sin(t * 7) * 6 : M.dance === 9 ? Math.sin(t * 14) * 7 : M.dance === 10 ? Math.sin(t * 5) * 9 : Math.sin(t * .7) * 1.2 + M.lookS * 2.6; M.rot += (rt + M.lean - M.rot) * k * 2; }
    if (M.eff) { M.ot = .2; M.wt = .12; M.glad = Math.max(M.glad, .5 * M.eff); }
    if (md === 'held') { M.x += (M.hx - M.x) * Math.min(1, dt * 18); M.y += (M.hy + BH * .95 - M.y) * Math.min(1, dt * 18); M.rot = cl((M.hx - M.x) * .9, -28, 28) + Math.sin(t * 9) * 7; M.ot = .9; M.wt = .5; arms([-150 + Math.sin(t * 17) * 40, 26], [-30 - Math.sin(t * 15) * 40, 26]); }
    else if (md === 'fall') physics(dt); else if (md === 'disc') disc(dt, t);
    else if (M.jp) { const j = M.jp; if (j.g !== gen) { M.jp = null; M.mode = 'fall'; M.vx = M.vy = 0; j.rej('x'); } else if (j.pre > 0) { j.pre -= dt; M.sq = Math.max(M.sq, .42); } else { j.t += (dt * 1000) / j.ms; const u = Math.min(1, j.t); M.x = j.x0 + (j.x1 - j.x0) * u; M.y = j.y0 + (j.y1 - j.y0) * u - Math.sin(u * Math.PI) * j.h; M.air = Math.sin(u * Math.PI) * j.h; M.face = j.x1 >= j.x0 ? 1 : -1; if (u >= 1) { M.jp = null; M.mode = 'walk'; M.air = 0; M.sq = Math.max(M.sq, Math.min(.55, .22 + j.h / 320)); dust({ x: M.x, y: M.y - 3 }); j.res(); } } }
    else if (M.grip) {                 // hands stay on the control wherever it goes, and turn with it by exactly the amount (and direction) it really turns
      const G = M.grip, p = G.pt && G.pt(); if (p) { G.x = p.x; G.y = p.y; } if (G.rot) G.spin = ((G.rot() - G.rot0) * Math.PI) / 180;
      if (G.follow) { const q = Math.min(1, dt * 10); M.x += (G.x + G.ox - M.x) * q; M.y += (G.y + G.oy - M.y) * q; }
      const a0 = Math.atan2(M.y - BH * .5 - G.y, M.x - G.x) + G.spin, rr = G.r * .9; hands2({ x: G.x + Math.cos(a0 - .75) * rr, y: G.y + Math.sin(a0 - .75) * rr }, { x: G.x + Math.cos(a0 + .75) * rr, y: G.y + Math.sin(a0 + .75) * rr });
    }
    else if (M.dance) { const f = danceArms(M.dance, M.dph / 9); if (micHeld()) arms(f[0], null); else arms(...f); }
    if (micHeld() && (md === 'walk' || md === 'jump') && !M.grip) { arms(null, MIC_ARM); if (!M.dance) arms([-58 + Math.sin(t * 4.2) * 36, 26], null); }     // mic hand stays up beside the mouth; the free hand pumps the beat
    // gestures: a timed pose on top of whatever else is going on, and hands that talk along with the speech bubble
    if (M.gs && (now > M.gs.until || M.grip || md === 'held' || md === 'disc' || raging)) M.gs = null;
    const talk = !!B && now < (B.typeUntil || 0) && B.kind !== 'sleepy';
    const free = md === 'walk' && !M.go && !M.dance && !M.grip && !M.eff && !M.petting && !M.sleep && !M.rest && !M.fing && !micHeld() && !torchBusy() && !chalkAim && !writingDoodle && !op && !raging;
    if (M.gs) arms(M.gs.l, M.gs.r);
    else if (talk && free && (M.gAuto || (Math.abs(M.L.ta - REST[0][0]) < 8 && Math.abs(M.Rm.ta - REST[1][0]) < 8))) {
      const sg = Math.sin(t * 5.1), em = Math.max(0, Math.sin(t * 2.2 + M.gside * 2)); M.gAuto = 1;
      if (M.gside) arms([-128 + sg * 14 - em * 10, 24 + em * 6], REST[1]); else arms(REST[0], [-52 - sg * 14 + em * 10, 24 + em * 6]);
    } else if (M.gAuto) { M.gAuto = 0; if (free) arms(...REST); }
    E.bi.style.display = M.dizzy ? '' : 'none'; if (M.dizzy) E.bi.querySelectorAll('text').forEach((e, i) => { const a = t * 5 + i * 2.09; e.setAttribute('x', 50 + Math.cos(a) * 24); e.setAttribute('y', 2 + Math.sin(a) * 7); });
    if (!chip.hidden) { if (chipExp && performance.now() > chipExp) hideChip(); else if (Math.hypot(chipP.x - M.x, chipP.y - M.y) > 8) placeChip(); }
  }

  /* ── curiosity: lift the real record with both hands, inspect it, spin it, toss it, put it back ── */
  let curious = false;
  const D = { el: null, W: 1, x: 0, y: 0, s: 1, a: 0, spin: 0, lift: 0, p: 1, ms: 1, from: { x: 0, y: 0, s: 1 }, to: () => ({ x: 0, y: 0, s: 1 }), hold: false };
  function discFrame(dt) {
    if (!D.el) return; D.a += D.spin * dt; if (D.p < 1) D.p = Math.min(1, D.p + (dt * 1000) / D.ms);
    const t = D.to(), e = 1 - Math.pow(1 - D.p, 3), f = D.from; D.x = f.x + (t.x - f.x) * e; D.y = f.y + (t.y - f.y) * e; D.s = f.s + (t.s - f.s) * e;
    D.el.style.transform = `translate(${D.x - D.W / 2}px,${D.y - D.W / 2 - D.lift}px)scale(${D.s})rotate(${D.a}deg)`;
    if (D.hold) { const u = size / 140, r = (D.W * D.s) / 2, y2 = D.y - D.lift + .7 * r, hs = [-.62, .62].map((k) => [50 + ((D.x + k * r - M.x) / u) * M.face, 118 + (y2 - M.y) / u]).sort((p, q) => p[0] - q[0]), A2 = ([sx, sy], px) => [(Math.atan2(sy - 68, sx - px) * 180) / Math.PI, Math.hypot(sx - px, sy - 68)]; arms(A2(hs[0], 12), A2(hs[1], 88)); }   // both hands under the disc
  }
  const flyTo = (to, ms, g) => { D.from = { x: D.x, y: D.y, s: D.s }; D.to = to; D.ms = ms; D.p = 0; return until(() => D.p >= 1, g); };
  async function inspect(g, rage) {
    const rec = $('#record'), sheen = $('.sheen'); if (!rec || S.motor || S.arm.mode !== 'parked') return;
    const rc = rec.getBoundingClientRect(), cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2, s = nearTo(cx, cy, rc.width + 40); if (!s) return;
    curious = true; const bh0 = BH, Dh = size * .95;
    try {
      await goTo(s, g, true); M.face = cx >= M.x ? 1 : -1; M.tgt = { x: cx, y: cy }; reach(cx, cy, 60); await say(rage ? L('rage') : L('curious'), rage ? 'angry' : 'say', g, 800);
      const el = Object.assign(document.createElement('div'), { className: 'mdisc' }); el.style.cssText = `width:${rc.width}px;height:${rc.width}px;--k:${rc.width / 704}px`;
      const c2 = rec.cloneNode(true); c2.removeAttribute('id'); c2.style.cssText = 'left:0;top:0;transform:none;visibility:visible'; el.append(c2); document.body.append(el);
      Object.assign(D, { el, W: rc.width, x: cx, y: cy, s: 1, a: ((S.spin % TAU) * 180) / Math.PI, spin: 700, lift: 0, hold: false }); rec.style.visibility = 'hidden'; if (sheen) sheen.style.visibility = 'hidden';
      await flyTo(() => ({ x: M.x, y: M.y - bh0 - Dh * .38, s: Dh / rc.width }), rage ? 450 : 900, g);
      D.hold = true; BH = bh0 + Dh * .9; D.spin = 40; M.tgt = null; M.sway = 1; await say('whoa. it’s heavy… and so shiny.', 'say', g, 900);
      D.spin = rage ? 1500 : 420; await say(rage ? L('rage') : L('spin'), rage ? 'angry' : 'say', g, 1100); M.glad = 1;
      for (let i = 0; i <= 30; i++) { D.lift = Math.sin((i / 30) * Math.PI) * 80; D.spin = 900; await wait(30, g); } D.lift = 0; D.spin = 60;
      await say(L('toss'), 'say', g, 900); D.hold = false; BH = bh0; M.sway = 0; arms([-70, 28], [-70, 28]);
      D.spin = 500; await flyTo(() => ({ x: cx, y: cy, s: 1 }), 950, g);
    } finally { D.hold = false; D.spin = 0; if (D.el) { D.el.remove(); D.el = null; } rec.style.visibility = ''; if (sheen) sheen.style.visibility = ''; BH = bh0; M.tgt = null; M.sway = 0; curious = false; }   // always puts the real record back
    if (!rage) { M.dance = 1; await say(L('back'), 'say', g, 1500); }
  }
  /* nudge a line of text, but only from right beside it, with the hands on its edge (no pushing things from across the room) */
  async function shove(g) {
    const el = $(pick(['.tagline', '#title', '#artist'])); if (!el || !el.offsetWidth) return;
    const rg = document.createRange(); rg.selectNodeContents(el); const r = rg.getBoundingClientRect(); if (r.width < 8) return;
    const cy = (r.top + r.bottom) / 2, rs = rects(), side = pick([-1, 1]);
    for (const s of [side, -side]) {
      const x = s < 0 ? r.left - 5 - BW - 2 : r.right + 5 + BW + 2, y = cy + BH * .55, ex = s < 0 ? r.left : r.right;
      if (!inV(x, y) || hit(x, y, rs)) continue;
      await goTo({ x, y }, g); M.face = -s; M.grip = { x: ex, y: cy, r: 8, spin: 0, pt: () => ({ x: ex, y: cy }) }; M.eff = .4; op = true;
      try {
        await wait(500, g); const G = M.grip, hs = [E.hl, E.hr].map((h) => h.getBoundingClientRect());
        if (!hs.some((q) => Math.hypot(q.left + q.width / 2 - G.x, q.top + q.height / 2 - G.y) <= G.r + 16)) return;      // hands not on the text: leave it alone
        M.eff = 1; blurt(L('effort'), 'say', 1300); await wait(700, g); el.style.setProperty('--wd', `${-s * 6}px`); el.classList.add('m-wob'); setTimeout(() => el.classList.remove('m-wob'), 900); mood('smug', 2); await wait(500, g); await say(L('prod'), 'sly', g, 1000);
      } finally { M.grip = null; M.eff = 0; op = false; }
      return;
    }
  }
  on(bub.querySelector('.mtx'), 'click', () => { if (!tourOn && !curious) interrupt(); });   // tap a bubble to dismiss it
  async function antic(g) {
    const k = pick(reduce ? ['look', 'chat', 'yawn', 'stretch'] : ['look', 'look', 'chat', 'chat', 'yawn', 'stretch', 'hum', 'spin', 'dance', 'hiccup', 'sneeze', 'scratch', 'shiver', 'tilt', 'proud', 'rage']);
    if (k === 'look') { mood('curious', 2.6); M.tgt = { x: R(0, innerWidth), y: R(0, innerHeight) }; await wait(R(1400, 2600), g); M.tgt = null; }
    else if (k === 'stretch') { mood('happy', 1.8); arms([-70, 30], [-110, 30]); await wait(1300, g); arms(...REST); }
    else if (k === 'yawn') { mood('sleepy', 2.4); M.ot = 1; M.wt = .3; await wait(1500, g); M.ot = 0; }
    else if (k === 'spin' && !reduce) { mood('happy', 1.6); M.sp = 1; await wait(1000, g); }
    else if (k === 'chat') { mood(pick(['curious', 'happy', 'calm']), 2.6); await say(L('chat'), 'say', g); }
    else if (k === 'dance') { mood('happy', 3.4); M.dance = pick([1, 2, 3]); await wait(3200, g); M.dance = 0; }
    else if (k === 'hiccup') { for (let i = 0; i < 2; i++) { M.sq = .55; await hop(M.x, M.y, g, 300, 14); blurt('hic!', 'say', 900); await wait(900, g); } }
    else if (k === 'sneeze') { mood('surprised', 1.2); arms([-70, 26], [-110, 26]); await wait(700, g); M.sq = .8; M.rot = 14; blurt('…ah… ACHOO!', 'shout', 1500); await wait(1500, g); }
    else if (k === 'scratch') { mood('happy', 2.2); arms(null, [-125, 30]); for (let i = 0; i < 6; i++) { M.Rm.ta = -125 + (i % 2) * 18; await wait(260, g); } }
    else if (k === 'shiver') { mood('sad', 2); M.shake = 1.4; blurt('brr. cold desk.', 'think', 1600); await wait(1600, g); }
    else if (k === 'tilt') { mood('curious', 2.4); M.tilt = pick([-12, 12]); await wait(2000, g); M.tilt = 0; }
    else if (k === 'proud') { mood('smug', 2.6); arms([-30, 24], [-150, 24]); await say(pick(['i look good today.', 'strong. handsome. a little round.', 'still got it.']), 'sly', g); }
    else if (k === 'rage') { btn.classList.add('mad'); mood('angry', 1.6); await say(L('angry'), 'angry', g, 900); btn.classList.remove('mad'); }
    else await say(L('sing'), 'think', g, 900);
    await wait(R(2200, 4600), g);
  }
  async function wander(g) {
    if (!reduce && Math.random() < .14) return shove(g);
    if (!reduce && Math.random() < .08) return lounge(g);
    const rs = rects(), sp = spots(rs); if (!sp.length || reduce) { await antic(g); return; }
    const home = sp.find((s) => s.kind === 'home'), t = home && Math.random() < .2 ? home : pick(sp);
    await goTo(t, g, true); M.sit = t.kind === 'edge' ? 1 : 0;      // no walkable path (boxed in by deck/text)? hop out instead of failing silently forever
    for (let i = 0, n = 1 + ((R(0, 2)) | 0); i < n; i++) await antic(g);
  }
  async function run(a, g) {
    if (a.k === 'nameSaved') { mood('happy', 2.5); await say(`nice to meet you, ${visitorName}!`, 'say', g, 900); offer(); return; }
    if (a.k === 'nameLater') { mood('happy', 1.5); await say('no pressure. i’ll call you friend for now.', 'say', g, 900); offer(); return; }
    if (a.k === 'wake') {
      if (a.soft) { mood('sleepy', 2.4); M.ot = 1; M.wt = .3; arms([-70, 30], [-110, 30]); await wait(1300, g); M.ot = 0; arms(...REST); mood('happy', 2); await say(L('wakeSoft'), 'say', g, 500); return; }     // woken by the music: stretch, yawn, then hello
      mood('surprised', 1); await say(addressVisitor(L('wake')), 'say', g); return;
    }
    if (a.k === 'egg') return egg(g, a.n);
    if (a.k === 'tour') return tour(g);
    if (a.k === 'feel') {
      mood(({ hype: 'hyped', groove: 'happy', chill: 'bliss', moody: 'dreamy' })[a.m] || 'happy', 2.6); if (!reduce && a.m === 'hype') M.sp = 1; if (a.m === 'chill' || a.m === 'moody') M.nod = 1;
      await say(addressVisitor(L(a.key)), a.m === 'hype' ? 'shout' : a.m === 'moody' ? 'think' : 'say', g, 900); M.nod = 0; return;
    }
    if (a.k === 'move') return goTo(a, g, true);
    if (a.k === 'ride') return ride(g);
    if (a.k === 'prank') return prank(g);
    if (a.k === 'inspect') return inspect(g);
    if (a.k === 'shove') return shove(g);
    if (a.k === 'tantrum') return tantrum(g);
    if (a.k === 'annoyed') return annoyed(g, a.skip);
    if (a.k === 'later') { mood('happy', 1.5); return say(visitorName ? `okay, ${visitorName}. i’m here if you need me.` : 'okay! i’m here if you need me.', 'say', g, 1000); }
    if (a.k === 'tap') {
      const n = tapN++; M.sit = 0;
      if (!a.hard && speechUntil - performance.now() > 900) { M.glad = 1; M.sq = .45; arms([-60, 28], [-60, 28]); mood('surprised', .5); await wait(500, g); return; }     // mid-sentence: a little jump, no new bubble
      M.glad = 1;
      if (a.hard) { M.sq = .7; mood('sad', 1.4); arms([-60, 28], [-60, 28]); await say(L('hurt'), 'shout', g, 1000, true); }
      else if (n % 4 === 1 && !playing && !reduce) { M.micT = 1; M.hold = 1; mood('happy', 2); arms(null, [138, 30]); notes(); await say(L('mic'), 'think', g, 1400); M.hold = 0; M.micT = 0; }
      else { if (n % 3 === 0 && !reduce) M.sp = 1; mood('happy', 1.6); arms([-60, 28], [-60, 28]); await say(addressVisitor(L('tap')), 'say', g); }
    } else if (a.k === 'track') { if (playing && !reduce) { arms([-70, 28], [-70, 28]); M.sp = 1; } mood('excited', 2); await say(addressVisitor(L('track', a.title)), 'say', g, 1200); }
    else if (a.k === 'end') { mood('sad', 1.8); await say(L('end'), 'say', g); if (!reduce && Math.random() < .35) return egg(g, 'bow'); }
    else if (a.k === 'land') {
      arms([-50, 26], [-50, 26]);
      if (a.v > 1000) { M.dizzy = 3; await say(L('dizzy'), 'think', g, 1800, true); mood('sad', 2); }
      else if (a.v < 520) { mood('happy', 2); if (!reduce) M.sp = 1; await say(pick(['wheee! again!', 'soft landing. 10/10.', 'ha! i bounced.']), 'say', g, 1000, true); }
      else { mood('surprised', 1.2); await say(a.n && LINES['hit_' + a.n] ? L('hit_' + a.n) : L('land'), 'say', g, 1000, true); }
    }
    else if (a.k === 'poke') { const s = nearTo(a.x, a.y, 0); if (s && Math.hypot(s.x - a.x, s.y - BH * .5 - a.y) < 110) { await goTo(s, g, true); M.face = a.x >= M.x ? 1 : -1; reach(a.x, a.y, 50); M.tgt = { x: a.x, y: a.y }; mood('curious', 2); await say(addressVisitor(L('touch')), 'say', g, 1000); } else { M.tgt = { x: a.x, y: a.y }; mood('curious', 1.6); await wait(1600, g); } }     // too far to reach: just look at it
  }
  async function vibe(g, ms = 2400) {      // a panel or the tour chip is open: keep dancing in place (no walking over the UI), never freeze
    try { M.micT = Math.random() < .5 ? 1 : 0; M.dance = pick(DANCES); mood('happy', 2); await wait(ms, g); } finally { M.dance = 0; M.micT = 0; arms(...REST); }
  }
  async function decide(g) {
    while (M.mode !== 'walk') await wait(140, g);
    const now = performance.now(); lastTick = now; if (!M.hold) M.micT = 0; arms(...REST); M.tgt = null; M.dance = 0; M.sway = 0; M.fing = 0; M.rest = 0; M.tilt = 0; M.nod = 0; M.shake = 0;
    if (queue.length > 6) queue.splice(0, queue.length - 6);            // never a backlog of stale reactions
    if (!namePanel.hidden) { if (playing) return vibe(g); await wait(450, g); return; }
    if (queue.length) return run(queue.shift(), g);
    if (!welcomed) {
      welcomed = true; mood('happy', 3); arms(null, [-62, 30]);
      await say(visitorName ? `hey, ${visitorName}! good to see you again.` : L('hi'), 'say', g, 1000);
      if (!visitorConsent) { openNamePanel(); return; }
      void sendVisitReport();
      offer(); return;
    }
    if (chipExp && !chip.hidden) { if (playing) return vibe(g); await wait(500, g); return; }
    const quiet = now - idleAt;
    if (!torchVisited && !torchInProgress && torchTries < 3 && now > torchBackoff && now - born > 22000 && quiet > 9000 && !tourOn && !pr && !raging && !curious && !op && !drag && !M.petting && !M.sleep) {
      torchRolls++;
      if ((!torchSeenEver && torchRolls >= 4) || Math.random() < (torchSeenEver ? .045 : .16)) {
        if (await torchEaster(g)) return;             // if it could not run, carry on with normal life instead of retrying
      }
    }
    if (visitorName && now > nextDoodleAt && now - born > 20000 && (playing || quiet > 2500) && !tourOn && !pr && !raging && !curious && !op && !drag && !M.petting && !M.sleep && !chalkAim && !torchAim && namePanel.hidden) {
      nextDoodleAt = now + 15000;        // if something interrupts it, try again soon; if it can't find room, wait a bit
      const done = await writeNameDoodle(g);
      if (done) { doodleVisited = false; nextDoodleAt = performance.now() + R(180000, 300000); }     // signed it: sign again every few minutes
      else nextDoodleAt = performance.now() + 20000;
      return;
    }
    if (!visitorName && !reaskDone && !playing && quiet > 14000 && now - born > 40000 && !tourOn && !pr && !raging && !op && !M.petting && !M.sleep) {      // never got a name: ask once more before nodding off
      reaskDone = true; nameSkipped = false; mood('curious', 2); await say('psst… i never got your name. tell me, and i’ll write it in chalk for you.', 'say', g, 800); openNamePanel(); return;
    }
    if (!reduce && now > eggAt && now - born > 25000 && !tourOn && !pr && !raging && !curious && !op && !drag && !M.petting && !M.sleep && namePanel.hidden && !chipExp) {     // a rare easter egg, every few minutes at most
      eggAt = now + R(50000, 110000); const n = pickEgg(); if (n) return egg(g, n);
    }
    if (!playing && quiet > 30000) return snooze(g);        // walks to a cosy spot, yawns, nods off, then sleeps until touched
    if (!reduce && now > prankAt && (playing || quiet > 3500) && (playing || quiet < 26000) && now - born > 18000 && !M.petting) { prankAt = now + R(22000, 48000); return playing ? prank(g) : Math.random() < .5 && !S.motor && S.arm.mode === 'parked' ? inspect(g) : ride(g); }
    if (playing && now > restDue) return rest(g);
    if (playing) return perform(g);
    return wander(g);
  }
  let volBase = null;                                                                     // your volume, remembered while the bot turns the knob for a demo
  const botVol = (v) => { if (volBase == null) volBase = S.volume; api.setVolume(v); };
  const volBack = () => { if (volBase != null) { const v = volBase; volBase = null; api.setVolume(v); } };
  on(document, 'pointerdown', (e) => { if (e.target.closest && e.target.closest('#volume')) volBase = null; }, { capture: true });     // you took the knob yourself: nothing to give back
  let loopId = 0;
  function loop() {
    const id = ++loopId;
    (async () => {
      while (alive && id === loopId) {
        const g = ++gen, t0 = performance.now();
        try { await decide(g); } catch (e) {
          if (id !== loopId) return; if (e !== 'x') console.warn(e);
          hide(); btn.classList.remove('mad'); M.dance = 0; M.sway = 0; M.fing = 0; M.rest = 0; M.grip = null; M.eff = 0; M.tilt = 0; M.nod = 0; M.shake = 0; M.ot = 0; M.gs = null; M.moon = false; M.flip = null; volBack();
          speechUntil = Math.min(speechUntil, performance.now() + 300); await new Promise((r) => setTimeout(r, 80));
        }
        if (id !== loopId) return; if (performance.now() - t0 < 6) await new Promise((r) => setTimeout(r, 50));
      }
    })();
  }
  /* the supervisor: if nothing the loop waits for has finished for 25 s (and nobody is holding the bot, it is not asleep), whatever it was stuck on is abandoned and a fresh loop takes over */
  function revive(why) {
    console.warn('static: behaviour loop restarted (' + why + ')');
    interrupt(); M.go = null; M.jp = null; M.dc = null; M.grip = null; M.eff = 0; M.dance = 0; M.sway = 0; M.nod = 0; M.tilt = 0; M.moon = false; M.flip = null; M.gs = null; M.micT = 0; M.rest = 0; M.fing = 0; M.shake = 0; M.ot = 0; M.petting = 0;
    pr = false; op = false; raging = false; curious = false; tourOn = false; writingDoodle = false; torchInProgress = false; btn.classList.remove('mad'); hide(); ring.hidden = true; arms(...REST); volBack();
    if (M.mode !== 'held') { M.mode = 'fall'; M.vx = M.vy = 0; }
    progressAt = performance.now(); loop();
  }

  const MOODS = {
    calm: { cover: .05, tilt: 0, low: 0, smile: .4, brow: 0, bt: 0, pup: 1 }, happy: { cover: 0, tilt: 0, low: .45, smile: 1, brow: .3, bt: -3, pup: 1.08 },
    excited: { cover: 0, tilt: 0, low: .3, smile: 1, brow: .9, bt: -5, pup: 1.22 }, sleepy: { cover: .66, tilt: 0, low: .08, smile: .15, brow: -.2, bt: 0, pup: .9 },
    angry: { cover: .34, tilt: 20, low: 0, smile: -.9, brow: -.6, bt: 22, pup: .8 }, sad: { cover: .3, tilt: -16, low: 0, smile: -.7, brow: .4, bt: -18, pup: 1.18 },
    scared: { cover: 0, tilt: 0, low: 0, smile: -.35, brow: 1, bt: -8, pup: .55 }, surprised: { cover: 0, tilt: 0, low: 0, smile: -.1, brow: 1, bt: -4, pup: .7 },
    smug: { cover: .38, tilt: 8, low: .12, smile: .8, brow: .1, bt: 8, pup: .95 }, curious: { cover: 0, tilt: 0, low: 0, smile: .5, brow: .6, bt: -4, pup: 1.12 },
    dizzy: { cover: .12, tilt: 0, low: 0, smile: -.25, brow: 0, bt: 0, pup: .85 }, shy: { cover: .18, tilt: -6, low: .3, smile: .55, brow: .2, bt: -6, pup: 1.1 },
    bliss: { cover: .5, tilt: 0, low: .5, smile: 1, brow: .1, bt: -2, pup: 1.1 }, dreamy: { cover: .38, tilt: -5, low: .25, smile: .45, brow: .25, bt: -5, pup: 1.2 }, hyped: { cover: 0, tilt: 0, low: .35, smile: 1, brow: 1, bt: -6, pup: 1.28 },
  };
  const FS = { ...MOODS.calm }, mood = (n, s = 2) => { M.mood = { n, t: s }; };
  function faceTarget() {
    const base = M.sleep ? 'sleepy' : M.dizzy > 0 ? 'dizzy' : M.mode === 'held' || M.mode === 'fall' ? 'scared' : raging ? 'angry' : M.petting ? 'happy' : M.mood.t > 0 ? M.mood.n : M.mad > .35 ? 'angry' : playing ? musicFace() : 'calm';
    const f = { ...MOODS[base] }, a = raging ? 1 : cl((M.mad - .15) / .85, 0, 1); if (a > 0 && base !== 'angry') for (const key in f) f[key] = lerp(f[key], MOODS.angry[key], a * .8);
    if (M.sleep) f.cover = .97; f.low = cl(f.low + M.glad * .4, 0, .85); return f;
  }

  const STEPS = [
    { sel: '#power', text: 'this is the power switch. watch me flip it!', mk: () => ({ done: () => api.setMotor(true) }) },
    { sel: '#arm', ring: false, when: () => S.arm.mode !== 'down', text: 'now the needle. i’ll carry the tonearm onto the record.', mk: () => { const th0 = api.theta(), th1 = api.thetaFor(S.rec.index, S.rec.pos); return { pt: armPt, follow: true, minT: 1800, start: () => api.armStart(), progress: (p) => api.armMove(lerp(th0, th1, ease(p))), done: () => api.armDrop(), abort: () => api.armDrop() }; } },
    { sel: '#lever', when: () => S.arm.mode === 'down', text: 'this little lever lifts the needle…', mk: () => ({ track: $('#leverBody'), done: () => api.lever() }) },
    { sel: '#lever', when: () => S.arm.cueRaised, text: '…and sets it back down.', mk: () => ({ track: $('#leverBody'), quick: true, done: () => api.lever() }) },
    { sel: '#volume', text: 'turn this knob for volume. like so…', mk: () => { const v0 = S.volume; return { progress: (p) => botVol(p < .5 ? lerp(v0, .2, ease(p * 2)) : lerp(.2, v0, ease(p * 2 - 1))), done: () => volBack(), abort: () => volBack() }; } },
    { sel: '.seek__knob', text: 'drag this knob to jump around the song.', mk: () => ({ avoid: '.seek__bar', done: () => api.cueTo(S.rec.index, (S.span[S.rec.index] || 60) * .55) }) },
    { sel: () => { const d = $$('.dot'); return d[S.rec.index === d.length - 1 ? 0 : d.length - 1]; }, text: 'and tap a dot to pick another song.', mk: () => ({ quick: true, done: () => api.skipTo(S.rec.index === S.tracks.length - 1 ? 0 : S.tracks.length - 1) }) },
  ];
  async function tour(g) {
    tourOn = true; tourStop = false; chipPinned = true; chip.classList.add('docked'); chip.style.transform = 'none'; setChip('tour on', [['stop', () => { tourStop = true; interrupt(); }]]);
    try {
      M.face = 1; arms(null, [-62, 30]); mood('happy', 3); await say(visitorName ? `okay, ${visitorName}. follow me. i’ll show you everything.` : 'okay! follow me. i’ll show you everything.', 'say', g, 800);
      for (const st of STEPS) {
        if (st.when && !st.when()) continue; const el = typeof st.sel === 'function' ? st.sel() : $(st.sel); if (!el) continue;
        if (st.ring !== false) ringOn(el.getBoundingClientRect()); const ok = await operate(el, g, { ...st.mk(), say: st.text }); ring.hidden = true; arms(...REST); if (!ok) await wait(600, g);
      }
      mood('happy', 3); M.dance = 1; await say(L('proud'), 'say', g, 2000);
    } finally { tourOn = false; M.sway = 0; M.dance = 0; ring.hidden = true; hideChip(); volBack(); }
  }

  /* ── v2: music feel, attention, reactions, resting spots and easter eggs ── */
  const FEEL = { hype: 'hyped', groove: 'happy', chill: 'bliss', moody: 'dreamy' };
  const musicFace = () => FEEL[beat.mood] || 'happy';
  const musicMood = () => pick({ hype: ['excited', 'hyped', 'happy'], groove: ['happy', 'excited', 'happy'], chill: ['bliss', 'happy', 'bliss'], moody: ['dreamy', 'bliss', 'calm'] }[beat.mood] || ['happy']);
  const walkMul = () => (playing && !tourOn && !pr && beat.mood === 'hype' ? 1.25 : 1);   // a hype song makes it hurry
  const gesture = (l, r, ms = 900) => { M.gs = { l, r, until: performance.now() + ms }; };
  const box = (x, y, w, h) => ({ left: x, top: y, width: w, height: h, right: x + w, bottom: y + h });
  let faceAt = 0, zT = 0, lastBeatNote = 0, prevFeel = '', lastMouseAt = 0, lastDown = null, ptrDown = null, focusAtt = null, touchPt = null, glance = null, glanceAt = performance.now() + 6000, watchNext = 0, revSince = 0, lastSign = 0, scratchN = 0, scratchT = 0;

  /* beats, drops and the first impression of each track */
  function onBeat() {
    M.bdir = -M.bdir;
    if (M.dance || M.sway) { const d = (((M.dph - Math.PI / 2) % Math.PI) + Math.PI * 1.5) % Math.PI - Math.PI / 2; M.dph -= d * .4; }       // nudge the hop so its peak lands on the beat
    if (isSinging() && beat.strength > .45 && performance.now() - lastBeatNote > 380 && Math.random() < .55) { lastBeatNote = performance.now(); notes(); }
  }
  function onDrop() {
    if (reduce || tourOn || pr || raging || op || M.sleep || M.rest || curious) return;
    M.sp = 1; M.sq = .5; mood('hyped', 2.4); gesture([-115, 32], [-65, 32], 1300); for (let i = 0; i < 3; i++) setTimeout(notes, i * 140);
    if (Math.random() < .6) chirp('drop', 'shout', 1200);
  }
  function onJudged() {
    const was = prevFeel, m = beat.mood; prevFeel = m;
    if (!welcomed || tourOn || pr || raging || op || curious || M.sleep || M.rest || speechUntil - performance.now() > 500) return;
    const up = (was === 'chill' || was === 'moody') && (m === 'hype' || m === 'groove'), down = (was === 'hype' || was === 'groove') && (m === 'chill' || m === 'moody');
    if (!up && !down && was && Math.random() < .35) return;
    queue.push({ k: 'feel', m, key: up ? 'shift_up' : down ? 'shift_down' : 'feel_' + m }); interrupt();
  }
  const zzz = () => {
    if (reduce) return; const r = btn.getBoundingClientRect(), e = Object.assign(document.createElement('span'), { className: 'mz', textContent: pick(['z', 'Z', 'z']) });
    e.style.cssText = `left:${r.left + r.width * (M.face > 0 ? .68 : .22)}px;top:${r.top + r.height * .12}px;--dx:${(R(6, 20) * (M.face > 0 ? 1 : -1)).toFixed(0)}px;font-size:${R(13, 19).toFixed(0)}px`;
    document.body.append(e); e.onanimationend = () => e.remove();
  };

  /* ── attention: it looks at what you are doing, not just at the cursor ── */
  const CTRL = '#power,#volume,#trim,#lever,#seek,.dot,.skip,#platterHit,#armKey';
  const ctrlOf = (n) => (n && n.closest ? n.closest(CTRL) : null);
  const mid = (el, why) => { if (!el || !el.isConnected) return null; const r = el.getBoundingClientRect(); return r.width || r.height ? { x: r.left + r.width / 2, y: r.top + r.height / 2, why, el } : null; };
  const recMid = () => mid($('#record'), 'record');
  const glanceTargets = () => {
    const out = $$('#record,#lamp,#title,.engrave,#power,#volume,#trim,.seek__bar').filter((e) => e.getBoundingClientRect().width > 0), a = $('.arm-hit');
    if (a) out.push(a); if (playing) { const r = $('#record'); if (r) out.push(r, r); }
    props().forEach((p) => out.push({ x: (p.l + p.r) / 2, y: (p.t + p.b) / 2, why: 'glance' })); return out;
  };
  function attention(now) {
    if (!op && S.arm.mode === 'held') { const p = armPt(); if (p) return { x: p.x, y: p.y, why: 'arm' }; }                       // you are carrying the needle
    if (!op && S.hold && S.hold.active) { const r = recMid(); if (r) return r; }                                                  // you are holding the record
    if (ptrDown && now - ptrDown.t < (ptrDown.up ? 1700 : 6000)) { const r = mid(ptrDown.el, 'control'); if (r) return r; }       // the control you just touched
    if (focusAtt && now < focusAtt.until) { const r = mid(focusAtt.el, 'focus'); if (r) return r; }                               // the control you selected with the keyboard
    if (touchPt && now - touchPt.t < 2600) return touchPt;
    if (glance && now < glance.until) { const th = glance.th, r = th.getBoundingClientRect ? mid(th, 'glance') : th; if (r) return r; }
    if (mx >= 0 && now - lastMouseAt < 7000) return { x: mx, y: my, why: 'mouse' };
    if (now > glanceAt && !M.sleep) { glanceAt = now + R(5000, 11000); const c = glanceTargets(); if (c.length) glance = { th: pick(c), until: now + R(900, 2200) }; }   // nothing going on: a curious glance round the desk
    return null;
  }
  const faceToward = (tg, now) => {
    if (!tg || !tg.why || tg.why === 'mouse' || tg.why === 'glance' || M.go || M.dance || M.grip || M.jp || M.mode !== 'walk' || M.sleep || now < faceAt) return;
    const sg = tg.x >= M.x ? 1 : -1; if (sg !== M.face && Math.abs(tg.x - M.x) > 70) { M.face = sg; faceAt = now + 1600; }
  };
  on(document, 'pointerdown', (e) => {
    const now = performance.now(); lastDown = { el: e.target, t: now };
    if (e.pointerType !== 'mouse') touchPt = { x: e.clientX, y: e.clientY, why: 'touch', t: now };
    const c = ctrlOf(e.target) || (e.target.classList && e.target.classList.contains('arm-hit') ? e.target : null); if (c) ptrDown = { el: c, t: now, up: false };
  }, { capture: true });
  const pUp = () => { if (ptrDown) { ptrDown.up = true; ptrDown.t = performance.now(); } };
  on(document, 'pointerup', pUp, { capture: true }); on(document, 'pointercancel', pUp, { capture: true });
  on(document, 'focusin', (e) => { const c = ctrlOf(e.target); if (c && performance.now() - lastKeyAt < 1500) focusAtt = { el: c, until: performance.now() + 4500 }; });
  let lastKeyAt = 0;

  /* ── reactions: small, visible, never interrupting what the bot is doing ── */
  const rxAt = {}, can = (k, ms) => { const n = performance.now(); if (n - (rxAt[k] || 0) < ms) return false; rxAt[k] = n; return true; };
  const rx = (o) => {
    if (o.mood) mood(o.mood, o.ms || 1.6); if (o.arms && !reduce) gesture(o.arms[0], o.arms[1], o.gms || 900);
    if (o.sq) M.sq = Math.max(M.sq, o.sq); if (o.sp && !reduce) M.sp = 1; if (o.line) chirp(o.line, o.kind || 'say', 1700);
  };
  const djArms = () => { if (reduce) return; let i = 0; const iv = setInterval(() => { if (++i > 10 || !alive) return clearInterval(iv); gesture(i % 2 ? [-30, 30] : [-70, 24], i % 2 ? [-110, 24] : [-150, 30], 220); }, 180); };
  const snap = { vol: S.volume, trim: S.trim, motor: S.motor, mode: S.arm.mode, cue: S.arm.cueRaised, hold: false, idx: S.rec.index, pos: S.rec.pos }, hist = { vol: [], motor: [] };
  function watchUser(now) {
    if (now < watchNext) return; watchNext = now + 120;
    const hold = !!(S.hold && S.hold.active), am = S.arm.mode;
    const calm = welcomed && !(op || pr || raging || curious || writingDoodle || torchInProgress || tourOn || M.sleep || drag || (M.mode !== 'walk' && M.mode !== 'jump'));
    if (calm) {
      hist.vol.push([now, S.volume]); while (hist.vol.length && now - hist.vol[0][0] > 1200) hist.vol.shift();
      const dv = S.volume - hist.vol[0][1];
      if (S.volume > .9 && snap.vol <= .9 && can('loud', 9000)) rx({ mood: 'scared', ms: 1.4, arms: [[-105, 16], [-75, 16]], gms: 1400, sq: .35, line: 'loud', kind: 'shout' });     // hands over the ears
      else if (dv > .38 && can('loudj', 9000)) rx({ mood: 'surprised', ms: 1.2, sq: .5, line: 'loud', kind: 'shout' });
      else if (S.volume < .04 && snap.vol >= .04 && can('mute', 12000)) rx({ mood: 'curious', ms: 2, line: 'mute', kind: 'think' });
      else if (dv < -.4 && S.volume < .3 && can('quiet', 12000)) rx({ mood: 'curious', ms: 1.6, line: 'quiet', kind: 'think' });
      if (Math.abs(S.trim) > .7 && Math.abs(snap.trim) <= .7 && can('trim', 10000)) rx({ mood: S.trim > 0 ? 'excited' : 'sleepy', ms: 2, line: S.trim > 0 ? 'fast' : 'slow', sp: S.trim > 0 });
      else if (Math.abs(S.trim) < .1 && Math.abs(snap.trim) > .5 && can('norm', 10000)) rx({ mood: 'happy', ms: 1.4, line: 'norm' });
      if (S.motor !== snap.motor) {
        hist.motor.push(now); hist.motor = hist.motor.filter((x) => now - x < 4500);
        if (hist.motor.length >= 4 && can('spam', 22000)) { hist.motor = []; M.dizzy = 2; rx({ mood: 'dizzy', ms: 2.2, line: 'spam', kind: 'think' }); }          // flicking the switch like morse code
        else if (S.motor && can('motorOn', 5000) && Math.random() < .55) rx({ mood: 'excited', ms: 1.4, sq: .3, line: 'motorOn' });
      }
      if (am !== snap.mode) {
        if (am === 'held' && can('up', 8000)) rx({ mood: 'curious', ms: 2.2, line: Math.random() < .5 ? 'needleUp' : '' });
        else if (am === 'down' && snap.mode !== 'down' && can('down', 6000)) rx({ mood: 'happy', ms: 1.6, arms: [[-58, 28], [-122, 28]], gms: 700, line: 'needleDown' });
        else if (am === 'parked' && snap.mode !== 'parked' && can('park', 14000) && Math.random() < .4) rx({ mood: 'sleepy', ms: 1.6, line: 'parked', kind: 'think' });
      }
      if (S.arm.cueRaised && !snap.cue && can('lever', 12000) && Math.random() < .5) rx({ mood: 'curious', ms: 1.4, line: 'lever' });
      if (hold && !snap.hold && can('hold', 9000) && Math.random() < .6) rx({ mood: 'surprised', ms: 1.4, line: 'hold' });
      if (hold) {                                         // scratching: the record changes direction again and again under your finger
        const sg = Math.abs(S.omega) > 1.5 ? Math.sign(S.omega) : 0; if (sg && sg !== lastSign) { if (lastSign) { scratchN++; scratchT = now; } lastSign = sg; } if (now - scratchT > 1500) scratchN = 0;
        if (scratchN >= 3 && can('scratch', 14000)) { scratchN = 0; rx({ mood: 'excited', ms: 2.4, line: 'scratch', kind: 'shout' }); djArms(); }
      } else { lastSign = 0; scratchN = 0; }
      if (!hold && snap.hold && Math.abs(S.omega) > 12 && can('flick', 10000)) rx({ mood: 'excited', ms: 1.6, sp: true, line: 'flick', kind: 'shout' });
      if (S.omega < -4 && S.motor) { revSince = revSince || now; if (now - revSince > 1500 && can('rewind', 25000)) { rx({ mood: 'curious', ms: 2, line: 'rewind', kind: 'think' }); if (!reduce && Math.random() < .45) { queue.push({ k: 'egg', n: 'moon' }); interrupt(); } } } else revSince = 0;
      if (S.rec.index === snap.idx && Math.abs(S.rec.pos - snap.pos) > 2.6 && am !== 'held' && !hold && can('seek', 9000)) { focusAtt = { el: $('#seek'), until: now + 2200 }; if (Math.random() < .5) rx({ mood: 'curious', ms: 1.2, line: 'seek' }); }
    }
    Object.assign(snap, { vol: S.volume, trim: S.trim, motor: S.motor, mode: am, cue: S.arm.cueRaised, hold, idx: S.rec.index, pos: S.rec.pos });
  }
  const tk = { dir: 0, n: 0, t: 0, x: 0 };
  function tickle(e) {                                  // a quick wiggle of the cursor right over the bot
    if (drag || M.sleep || tourOn || pr || raging || op || curious) return; const r = btn.getBoundingClientRect();
    if (e.clientX < r.left - 6 || e.clientX > r.right + 6 || e.clientY < r.top - 6 || e.clientY > r.bottom + 6) { tk.n = 0; tk.x = e.clientX; return; }
    const now = performance.now(), dx = e.clientX - tk.x; tk.x = e.clientX; if (Math.abs(dx) < 3) return; const d = Math.sign(dx);
    if (now - tk.t > 800) tk.n = 0; tk.t = now; if (d !== tk.dir) { tk.dir = d; tk.n++; }
    if (tk.n >= 9 && can('tickle', 14000)) { tk.n = 0; M.shake = 1.1; M.glad = 1; hearts(); rx({ mood: 'happy', ms: 2, sq: .3, line: 'tickle' }); }
  }
  const bt = { bulb: 0, bulbT: 0, belly: 0, bellyT: 0 };
  function bodyTap(e) {                                 // tiny hidden hot-spots: the antenna bulb (3 taps) and the tummy button (2 taps)
    const now = performance.now(), near = (el, pad) => { const r = el.getBoundingClientRect(); return e.clientX > r.left - pad && e.clientX < r.right + pad && e.clientY > r.top - pad && e.clientY < r.bottom + pad; };
    // the first taps only glow / squash (the bot stays put so the next tap lands); the last one starts the egg
    if (near(E.bu, 16)) { M.idea = Math.max(M.idea, .35); bt.bulb = now - bt.bulbT < 3500 ? bt.bulb + 1 : 1; bt.bulbT = now; if (bt.bulb >= 3) { bt.bulb = 0; return 'idea'; } return 'hold'; }
    if (near(E.bel, 8)) { bt.belly = now - bt.bellyT < 3500 ? bt.belly + 1 : 1; bt.bellyT = now; if (bt.belly >= 2) { bt.belly = 0; return 'belly'; } M.sq = Math.max(M.sq, .35); return 'hold'; }
    return '';
  }

  /* ── natural resting spots: on a desk edge, near the turntable, on a prop; asleep there too ── */
  const PROP_NAMES = new Set(PROPS.map((p) => p[0])), usedRest = [];
  function restSpots() {
    const rs = rects(), out = [], deck = rs.find((k) => k.n === 'deck'), rec = $('#record')?.getBoundingClientRect();
    const add = (x, y, kind) => { if (inV(x, y) && !hit(x, y, rs)) out.push({ x, y, kind }); };
    for (const r of rs) {
      const w = r.r - r.l; if (w < BW * 1.6 || r.n === 'name-panel' || r.n === 'name-doodle') continue;
      const kind = r.n === 'deck' ? 'deck' : PROP_NAMES.has(r.n) ? 'prop' : r.n ? null : 'ledge'; if (!kind) continue;
      (w > BW * 4.5 ? [.22, .5, .78] : [.5]).forEach((f) => add(r.l + w * f, r.t, kind));
    }
    if (deck && rec) {
      const cx = rec.left + rec.width / 2;
      [-.3, 0, .3].forEach((f) => add(cx + rec.width * f, deck.t, 'vinyl'));                                                      // on the turntable's back edge, facing the record
      for (const sd of [-1, 1]) { const x = sd < 0 ? deck.l - BW - 4 : deck.r + BW + 4; [.35, .6, .85].forEach((f) => add(x, deck.t + (deck.b - deck.t) * f + BH * .5, 'side')); }   // standing beside it (wide screens)
      add(cx, deck.b + BH + 3, 'vinyl');
    }
    return out;
  }
  function pickRest() {
    const sp = restSpots(); if (!sp.length) return null; const W = { vinyl: 5, side: 4.6, prop: 4, deck: 2.8, ledge: 2 };
    for (const q of sp) {
      q.sc = (W[q.kind] || 1) + R(0, 1.6) - Math.hypot(q.x - M.x, q.y - M.y) / 500 + (playing && (q.kind === 'vinyl' || q.kind === 'side') ? 1.6 : 0) + (S.omega > 1 && q.kind === 'vinyl' ? 1 : 0);
      if (usedRest.some((u) => Math.hypot(u.x - q.x, u.y - q.y) < 90)) q.sc -= 3.5;      // do not always pick the same seat
    }
    sp.sort((a, b) => b.sc - a.sc); const q = sp[0]; usedRest.push(q); if (usedRest.length > 3) usedRest.shift(); return q;
  }
  const settleAt = (q) => { const rc = $('#record')?.getBoundingClientRect(), cx = rc ? rc.left + rc.width / 2 : q.x; M.sit = q.kind === 'side' ? 0 : 1; M.face = q.kind === 'side' ? (q.x < cx ? 1 : -1) : cx >= M.x ? 1 : -1; };
  async function snooze(g) {
    const q = reduce ? null : pickRest(); mood('sleepy', 5);
    if (q) { await goTo(q, g, true); settleAt(q); }
    M.ot = 1; M.wt = .3; await wait(1500, g); M.ot = 0; arms([-70, 30], [-110, 30]); await wait(900, g); arms(...REST);
    M.nod = 1; await wait(1600, g); M.nod = 0; M.sleep = 1; if (reduce) show('zZz…', 'sleepy'); return wait(6e5, g);
  }
  async function lounge(g) {
    const q = pickRest(); if (!q) return antic(g);
    await goTo(q, g, true); settleAt(q);
    try {
      for (let i = 0, n = 1 + ((R(0, 2)) | 0); i < n; i++) {
        const k = pick(S.omega > 1 ? ['watch', 'watch', 'look', 'hum', 'swing'] : ['look', 'look', 'hum', 'swing', 'yawn', 'chat']);
        if (k === 'watch') { const r = recMid(); if (r) M.tgt = { x: r.x, y: r.y }; mood('curious', 2.4); if (Math.random() < .45) await say(L('watchRec'), 'think', g, 400); else await wait(R(2600, 4200), g); M.tgt = null; }
        else if (k === 'look') { mood('curious', 2.4); const th = pick(glanceTargets()), m2 = th && (th.getBoundingClientRect ? mid(th, 'look') : th); M.tgt = m2 ? { x: m2.x, y: m2.y } : { x: R(0, innerWidth), y: R(0, innerHeight) }; await wait(R(1800, 3200), g); M.tgt = null; }
        else if (k === 'hum') { mood('bliss', 3); M.nod = 1; if (!reduce) notes(); await wait(R(2400, 3600), g); M.nod = 0; }
        else if (k === 'swing') { mood('happy', 2.4); await wait(R(2200, 3400), g); }                                           // the legs dangle on their own
        else if (k === 'yawn') { mood('sleepy', 2.4); M.ot = 1; M.wt = .3; await wait(1500, g); M.ot = 0; }
        else await say(L('lounge'), 'say', g);
        await wait(R(900, 2200), g);
      }
    } finally { M.tgt = null; M.nod = 0; }
  }

  /* ── rare easter eggs: secret dances, odd little routines, hidden hot-spots ── */
  const KON = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], WORDS = { static: 'konami', neeraj: 'boss', moon: 'moon', flip: 'flip', rock: 'guitar', boo: 'boo' };
  let eggAt = performance.now() + R(35000, 70000), midnightDone = false, kn = 0, word = '';
  function pickEgg() {
    const ok = []; if (!reduce) ok.push('moon', 'flip', 'mime');
    if (!playing && !S.motor && S.arm.mode === 'parked' && $('#record')) ok.push('mirror');
    if (!playing) ok.push('boo'); if (playing && beat.mood !== 'chill' && beat.mood !== 'moody') ok.push('guitar');
    if (new Date().getHours() < 5 && !midnightDone) ok.push('midnight', 'midnight', 'midnight');
    return ok.length ? pick(ok) : null;
  }
  async function egg(g, n) {
    pr = true;
    const goFar = async (min = 180) => { const far = spots(rects()).filter((q) => Math.hypot(q.x - M.x, q.y - M.y) > min); if (far.length && !reduce) await goTo(pick(far), g, true); };
    try {
      M.micT = 0; M.dance = 0; M.sway = 0;
      if (n === 'konami') {
        mood('excited', 3); M.face = 1; await say(L('konami'), 'shout', g, 500);
        M.moon = true; arms([-35, 24], [-145, 24]); await goFar(200); M.moon = false;
        for (const d of [2, 7, 5, 9, 8, 3]) { M.dance = d; if (!reduce) M.sp = 1; mood('excited', 1.6); notes(); hearts(); await wait(1300, g); }
        M.dance = 0; gesture([-115, 32], [-65, 32], 1400); M.sq = .5; hearts(); await say('ta-da!', 'shout', g, 900);
      } else if (n === 'moon') {
        mood('smug', 3); await say(L('moon'), 'sly', g, 400); M.moon = true; arms([-35, 24], [-145, 24]); await goFar(220); M.moon = false; mood('smug', 2); gesture([-30, 24], [-150, 24], 1200); await wait(900, g);
      } else if (n === 'flip') {
        mood('excited', 2); M.face = Math.random() < .5 ? 1 : -1; await wait(300, g); gesture([-115, 32], [-65, 32], 800); M.flip = { t0: performance.now(), ms: 700, dir: M.face }; await hop(M.x, M.y, g, 700, 120); M.flip = null;
        M.sq = .6; mood('happy', 2); await say(pick(['ta-da!', 'stuck the landing.', 'ten points.']), 'say', g, 500);
      } else if (n === 'mime') {
        mood('curious', 3); await say(L('mime'), 'think', g, 300);
        for (let i = 0; i < 8; i++) { gesture([180 - (i % 2) * 22, 30], [(i % 2) * 22, 30], 280); M.tilt = i % 2 ? 3 : -3; await wait(300, g); } M.tilt = 0;
        if (!reduce) await hop(M.x, M.y, g, 450, 40);
      } else if (n === 'mirror') {
        const rc = $('#record').getBoundingClientRect(), cx = rc.left + rc.width / 2, cy = rc.top + rc.height / 2, q = nearTo(cx, cy, rc.width + 40); if (!q) return;
        await goTo(q, g, true); M.face = cx >= M.x ? 1 : -1; M.tgt = { x: cx, y: cy }; mood('curious', 2); await wait(900, g);
        for (const m2 of ['happy', 'smug', 'shy', 'angry', 'excited']) { mood(m2, 1.2); M.sq = .2; await wait(650, g); }
        await say(L('mirror'), 'sly', g, 600);
      } else if (n === 'boo') {
        const q = reduce ? null : pickRest(); if (q) { await goTo(q, g, true); settleAt(q); }
        mood('sleepy', 5); M.ot = 1; M.wt = .3; await wait(1100, g); M.ot = 0; M.sleep = 1; await wait(R(3200, 4800), g); M.sleep = 0;
        mood('excited', 1.2); M.sq = .7; M.sp = 1; gesture([-115, 32], [-65, 32], 900); if (!reduce) await hop(M.x, M.y, g, 420, 70); await say(L('boo'), 'shout', g, 700);
      } else if (n === 'guitar') {
        M.dance = 10; mood('hyped', 3); chirp('guitar', 'shout', 1600); await wait(R(4200, 6000), g);
      } else if (n === 'bow' || n === 'boss') {
        mood('happy', 3); M.face = 1; if (n === 'boss') await say(L('boss'), 'say', g, 300);
        for (let i = 0; i < 2; i++) { arms([-40, 26], [-140, 26]); M.tilt = 26 * M.face; await wait(850, g); M.tilt = 0; arms(...REST); await wait(450, g); }
        await say(L('bow'), 'say', g, 400);
      } else if (n === 'midnight') {
        midnightDone = true; mood('dreamy', 4); M.nod = 1; await say(L('midnight'), 'think', g, 900); M.nod = 0;
      } else if (n === 'idea') {
        M.idea = 1.8; mood('surprised', 1.4); M.sq = .4; gesture([-60, 24], [-120, 24], 900); await say(L('idea'), 'shout', g, 700); await wait(400, g); mood('curious', 2);
      } else if (n === 'belly') {
        mood('surprised', 1); M.sq = .5; await say(L('belly'), 'sly', g, 400); M.dance = 7; mood('smug', 3); await wait(2200, g);
      }
    } finally { pr = false; M.moon = false; M.flip = null; M.dance = 0; M.sway = 0; M.nod = 0; M.tilt = 0; M.micT = 0; M.tgt = null; if (n === 'boo') M.sleep = 0; arms(...REST); }
  }
  on(window, 'keydown', (e) => {
    if (!e.key) return;                                 // autofill / some phone keyboards send key-less events
    lastKeyAt = performance.now(); const c = ctrlOf(e.target); if (c) focusAtt = { el: c, until: lastKeyAt + 4500 };
    if (e.target.closest && e.target.closest('input,textarea')) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (key === KON[kn]) { kn++; if (kn > 4 && key.startsWith('Arrow')) e.preventDefault(); if (kn === KON.length) { kn = 0; if (!tourOn && !pr) { queue.push({ k: 'egg', n: 'konami' }); interrupt(); } } }      // once ↑↑↓↓ is typed the next arrows belong to the code, not to the track skipper
    else kn = key === KON[0] ? 1 : 0;
    if (e.key.length === 1 && /[a-z]/i.test(e.key)) { word = (word + key).slice(-8); for (const w in WORDS) if (word.endsWith(w)) { word = ''; if (!tourOn && !pr) { queue.push({ k: 'egg', n: WORDS[w] }); interrupt(); } break; } }
  }, { capture: true });

  /* ── frame: smooth everything, then write the SVG ── */
  function frame(now) {
    if (!alive) return; requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - T0) / 1000 || .016), t = now / 1000, k = 1 - Math.pow(.001, dt); T0 = now;
    const pl = !!(S.motor && S.arm.mode === 'down');
    if (pl !== playing) {
      playing = pl; if (pl) { singSince = songSince = performance.now(); restDue = songSince + R(40000, 60000); beat.newTrack(); if (M.sleep) wake(false, true); }
      if (!tourOn && !pr && !raging && !op && (M.mode === 'walk' || M.mode === 'jump')) {
        if (!pl) {
          const t0 = performance.now(), byUser = t0 - (S.userSkipAt || 0) < 1500, vibing = singSince && t0 - songSince > 2500;
          if (byUser && vibing) { queue.push({ k: 'annoyed', skip: true }); skipHandled = true; }        // the visitor skipped the track while it was singing
          else if (!byUser) queue.push(vibing && S.rec.pos > .6 ? { k: 'annoyed' } : { k: 'end' });       // stopped mid-song = angry; the side running out by itself = sad
        }
        interrupt();
      }
    }
    if (S.rec.index !== lastIdx) { lastIdx = S.rec.index; songSince = performance.now(); beat.newTrack(); if (skipHandled) skipHandled = false; else if (S.motor && welcomed && !tourOn && !pr) { queue.push({ k: 'track', title: S.tracks[lastIdx]?.title || 'this one' }); interrupt(); } }
    modeStep(dt, t, k);
    if (M.go) { const go = M.go; if (go.g !== gen) { M.go = null; M.vel = 0; go.rej('x'); } else {
      const p = go.path[go.i], dx = p.x - M.x, dy = p.y - M.y, d = Math.hypot(dx, dy); let rem = d; for (let i = go.i + 1; i < go.path.length; i++) rem += Math.hypot(go.path[i].x - go.path[i - 1].x, go.path[i].y - go.path[i - 1].y);
      M.vel += ((reduce ? 400 : 210) * walkMul() * cl(rem / 46, .3, 1) - M.vel) * Math.min(1, dt * 8); const v = M.vel * dt;      // eases in from a standstill, slows down as it arrives
      if (d <= Math.max(2, v)) { M.x = p.x; M.y = p.y; if (++go.i >= go.path.length) { M.go = null; M.vel = 0; go.res(); } }
      else {
        M.x += (dx / d) * v; M.y += (dy / d) * v;
        if (Math.abs(dx) > 1) { M.face = (dx > 0 ? 1 : -1) * (M.moon ? -1 : 1); M.lean += ((dx > 0 ? 1 : -1) * cl(M.vel / 210, 0, 1.4) * 5 - M.lean) * Math.min(1, dt * 8); }     // leans into the walk
        const ph0 = M.ph; M.ph += dt * 13 * cl(M.vel / 210, .35, 1.6) * (M.moon ? .45 : 1); M.sit = 0;                                                                      // stride rate follows speed: no skating
        if (!M.moon && M.vel > 150 && Math.sin(M.ph) * Math.sin(ph0) < 0 && Math.random() < .4) dust({ x: M.x + R(-8, 8), y: M.y - 2 });                                      // a puff on some heel strikes
      }
    } } else { M.vel = 0; M.lean *= Math.exp(-dt * 8); }
    M.pop = Math.min(1, M.pop + dt * (reduce ? 20 : 2.6)); const pop = 1 + Math.sin(M.pop * Math.PI) * .12 * (M.pop < 1), sc = M.pop < 1 ? Math.min(1, M.pop * 1.6) : 1;
    const bands = playing && audio.bands ? audio.bands() : null, lvRaw = playing && audio.level ? audio.level() : 0;
    beat.update(now, dt, bands, lvRaw, playing && !M.sleep);
    if (beat.beat) onBeat(); if (beat.drop) onDrop(); if (beat.judged) onJudged();
    M.dph += dt * Math.PI * 2 * cl(beat.bpm || 92, 80, 130) / 60 * (playing ? 1 : .7);       // two hops per beat: as lively as it ever was, now in time
    const bpulse = playing && !M.sleep ? beat.pulse : 0; watchUser(now);
    const tb = torchBusy(), sing = isSinging(); let lv = 0;
    if (M.rest && !tb) { if (M.rest === 1) { M.ot = .14 + .12 * Math.abs(Math.sin(t * 3.2)); M.wt = .5; } }      // resting: no lip-sync, just catching breath
    else if (playing && !tb) {
      lv = lvRaw; if (lv < .02) lv = .22 + .2 * Math.abs(Math.sin(t * 7));
      if (sing) { const syl = Math.abs(Math.sin(t * 8.5 + Math.sin(t * 2.3) * 2)); M.ot = cl(.2 + syl * (.5 + lv * .4), .12, 1); M.wt = .3 + .45 * Math.abs(Math.sin(t * 5.3 + 1)); }     // real singing: the mouth opens and closes on every syllable, even in quiet bits
      else { M.ot = cl(lv * 1.7, .05, 1); M.wt = .45 + Math.sin(t * 9) * .3; }
    } else if (tb && !B) { M.ot = .06; M.wt = .5; }     // holding the torch: mouth stays shut, no lip-sync
    M.o += (M.ot - M.o) * (1 - Math.pow(1e-4, dt)); M.w += (M.wt - M.w) * k; M.glad = Math.max(0, M.glad - dt * .8); M.sp = Math.max(0, M.sp - dt * 1.3); M.shake = Math.max(0, M.shake - dt);
    if (!playing && !B && !M.hold && !M.go) { M.ot = Math.max(0, M.ot - dt); }
    M.mic = tb ? 0 : M.mic + ((M.micT ? 1 : 0) - M.mic) * k;
    // face: the current mood decides lids, brows, mouth curve and pupils; blinking is a lid, so every mood blinks in its own way
    M.mood.t = Math.max(0, M.mood.t - dt); M.nb -= dt; if (M.nb < 0) { M.bl = 1; M.nb = Math.random() < .2 ? .3 : R(2, 5); } M.bl = Math.max(0, M.bl - dt * 7);
    const hx = M.x, hy = M.y - BH * .55, tg = M.tgt || attention(now), rawX = tg ? cl((tg.x - hx) / 180, -1, 1) : 0, lx = rawX * M.face, ly = tg ? cl((tg.y - hy) / 180, -1, 1) : 0;
    if (Math.abs(lx - M.lx) + Math.abs(ly - M.ly) > .55 && M.bl === 0 && M.nb > .25) M.nb = .02;                                  // a big glance comes with a blink
    M.sacc -= dt; if (M.sacc < 0) { M.sacc = R(.35, 1.7); M.sx = R(-.14, .14); M.sy = R(-.1, .1); }                                  // tiny eye darts: nobody stares perfectly still
    M.lx += (lx + M.sx * (tg ? 1 : 1.6) - M.lx) * Math.min(1, k * 1.6); M.ly += (ly + M.sy - M.ly) * Math.min(1, k * 1.6); M.lookS += (rawX - M.lookS) * k; faceToward(tg, now);
    const F = faceTarget(); for (const key in F) FS[key] += (F[key] - FS[key]) * Math.min(1, dt * (M.sleep ? 1.8 : 7));
    const cover = cl(FS.cover + Math.sin(M.bl * Math.PI) * (1 - FS.cover) + M.ly * .09, 0, 1), ew = 1 + M.wide * .25;
    E.el.setAttribute('transform', `translate(34 46)scale(${ew})`); E.er.setAttribute('transform', `translate(66 46)scale(${ew})`);
    lids.forEach((l, i) => { l.setAttribute('height', (3.5 + cover * 27).toFixed(1)); l.setAttribute('transform', `rotate(${((i ? -1 : 1) * FS.tilt).toFixed(1)})`); }); los.forEach((l) => l.setAttribute('ry', (FS.low * 14).toFixed(1)));
    pps.forEach((p, i) => { const sw = M.dizzy > 0 ? 2.5 : 0; p.setAttribute('rx', (4.9 * FS.pup * (1 + bpulse * .1)).toFixed(2)); p.setAttribute('ry', (7 * FS.pup * (1 + bpulse * .1)).toFixed(2)); p.setAttribute('cx', (M.lx * 3.6 + Math.cos(t * 9 + i * 2) * sw).toFixed(2)); p.setAttribute('cy', (M.ly * 4 + Math.sin(t * 9 + i * 2) * sw).toFixed(2)); });
    E.brs.setAttribute('opacity', cl(Math.abs(FS.brow) * 1.1 + Math.abs(FS.bt) / 22, 0, 1).toFixed(2)); E.bl.setAttribute('transform', `translate(0 ${(-FS.brow * 5).toFixed(2)})rotate(${FS.bt.toFixed(1)} 34 29)`); E.br.setAttribute('transform', `translate(0 ${(-FS.brow * 5).toFixed(2)})rotate(${(-FS.bt).toFixed(1)} 66 29)`);
    const mo = M.sleep ? .08 + Math.max(0, Math.sin(t * 1.4)) * .06 : M.o, md2 = mouthD(mo, M.w, FS.smile); E.mo.setAttribute('d', md2); E.mo2.setAttribute('d', md2); E.tg.setAttribute('opacity', (mo > .3 ? cl((mo - .3) * 2.2, 0, 1) : 0).toFixed(2)); E.tg.setAttribute('cy', (80 + mo * 8).toFixed(1));
    // arms + mic
    const wk = M.go && !M.grip && !M.dance && !M.eff && !M.gs && !micHeld() ? cl(M.vel / 160, 0, 1) : 0, trail = wk * 9, wob = wk * Math.sin(M.ph) * 14;       // walking: arms trail a little and swing against each other
    const sw = Math.sin(t * 1.7) * 2.5, A = (m, ln, hd, px, w, l2) => { m.a += (m.ta - m.a) * k; m.l += (m.tl - m.l) * k; const a = ((m.a + sw * w + trail + wob * w) * Math.PI) / 180, x = px + Math.cos(a) * m.l, y = 68 + Math.sin(a) * m.l; ln.setAttribute('x1', px); ln.setAttribute('y1', 68); ln.setAttribute('x2', x); ln.setAttribute('y2', y); l2.setAttribute('x1', px - 2); l2.setAttribute('y1', 66); l2.setAttribute('x2', x - 2); l2.setAttribute('y2', y - 2); hd.setAttribute('cx', x); hd.setAttribute('cy', y); return [x, y]; };
    A(M.L, E.al, E.hl, 12, 1, E.al2); const [hxr, hyr] = A(M.Rm, E.ar, E.hr, 88, -1, E.ar2);
    E.mc.setAttribute('transform', `translate(${hxr} ${hyr})rotate(${(-12 + (sing ? Math.sin(t * 6) * 5 : 0)).toFixed(1)})scale(${(1.45 * M.mic * (1 + (sing ? lv * .08 : 0))).toFixed(3)})`); E.mc.style.display = M.mic > .03 ? '' : 'none';
    if (sing && now > noteT) { noteT = now + R(560, 980); notes(); }     // a note every beat or so, every time the mic is out
    E.fg.style.display = M.fing ? '' : 'none'; if (M.fing) E.fg.setAttribute('transform', `translate(${hxr} ${hyr})scale(1.3)rotate(${(Math.sin(now / 45) * 6).toFixed(1)})`);     // the middle finger: big, and it trembles with rage
    chalk.classList.toggle('on', !!chalkAim);
    if (chalkAim) {
      chalk.style.left = `${((hxr + 20) / 140) * 100}%`; chalk.style.top = `${((hyr + 14) / 140) * 100}%`;
      const hand = E.hr.getBoundingClientRect(), hx = hand.left + hand.width / 2, hy = hand.top + hand.height / 2;
      const dx = chalkAim.x - hx, dy = chalkAim.y - hy;
      chalk.style.transform = `translate(-12%,-50%) rotate(${Math.atan2(dy, dx * M.face) * 180 / Math.PI}deg)`;
    }
    if (torchAim) {
      const hand = E.hr.getBoundingClientRect(), hx = hand.left + hand.width / 2, hy = hand.top + hand.height / 2;
      const dx = torchAim.x - hx, dy = torchAim.y - hy, len = Math.max(1, Math.hypot(dx, dy)), ang = Math.atan2(dy, dx) * 180 / Math.PI;
      const ku = size / 72, bl = cl(len - 30 * ku, 24, 520);
      rig.style.transform = `translate3d(${hx.toFixed(1)}px,${hy.toFixed(1)}px,0) rotate(${ang.toFixed(1)}deg)`;
      rigProp.style.transform = `scale(${ku.toFixed(3)}) scaleY(${Math.abs(ang) > 90 ? -1 : 1})`;     // keep the torch right-side up when it points left
      rigBeam.style.transform = `translateX(${(30 * ku).toFixed(1)}px) scale(${(bl / 420).toFixed(3)})`;
      spot.style.transform = `translate3d(${torchAim.x.toFixed(1)}px,${torchAim.y.toFixed(1)}px,0)`;
      rig.classList.add('on'); rig.classList.toggle('lit', torchLit); spot.classList.toggle('lit', torchLit);
    } else if (rig.classList.contains('on') || spot.classList.contains('lit')) {
      rig.classList.remove('on', 'lit'); spot.classList.remove('lit');
    }
    E.an.setAttribute('transform', `rotate(${(Math.sin(t * 3) * 5 + lv * 14 + bpulse * 12 * M.bdir + (M.sleep ? 14 : 0)).toFixed(2)} 34 12)`); M.idea = Math.max(0, M.idea - dt);
    E.bu.setAttribute('opacity', M.idea > 0 ? 1 : cl(M.sleep ? .15 : playing ? .35 + lv + bpulse * .35 : .55 + Math.sin(t * 2) * .35, 0, 1).toFixed(2));
    E.bhalo.setAttribute('opacity', M.idea > 0 ? (cl(M.idea * 1.6, 0, 1) * (.65 + .35 * Math.sin(t * 28))).toFixed(2) : (bpulse * .35).toFixed(2));
    // body
    const walk = !!M.go, sit = M.sit && !walk, stride = walk ? Math.sin(M.ph) : 0;
    const hop = walk ? (M.moon ? 0 : Math.abs(stride) * 5 * cl(M.vel / 140, .3, 1.3)) : M.dance || M.run ? Math.abs(Math.sin(M.dph)) * (4 + 10 * (playing ? Math.max(.3, lv) : .7)) : 0;
    const beatBob = playing && !M.sleep && !M.rest ? bpulse * (M.dance ? 2.5 : sit ? 1.6 : 2.2) : 0;
    const bob = hop + beatBob + (playing ? lv * 3 : Math.sin(t * (M.sleep ? 1.2 : 2)) * (M.sleep ? 1.6 : .8)) + (sit ? 4 : 0) + (M.sleep ? 5 : 0), fx = Math.cos((1 - M.sp) * TAU);
    let flipA = 0; if (M.flip) { const p = (now - M.flip.t0) / M.flip.ms; if (p >= 1) M.flip = null; else flipA = ease(p) * 360 * -M.flip.dir; }
    const breath = M.sleep ? Math.sin(t * 1.15) * .028 : Math.sin(t * 2) * .012, headBeat = bpulse * M.bdir * (M.dance ? 2.5 : 3.2);
    E.bd.setAttribute('transform', `rotate(${(M.rot + flipA + headBeat).toFixed(2)} 50 84)translate(50 118)scale(${M.face * (M.sp ? fx : 1) * sc * pop} ${sc * pop * (1 + (walk ? Math.sin(M.ph * 2) * .03 : breath))})translate(-50 -118)translate(0 ${-bob})`);
    // feet: heel-to-toe strides while walking, legs dangling while sitting; the shadow stays on the floor and shrinks when the bot is in the air
    const dang = Math.sin(t * 2.6), sw2 = walk ? stride * 4 : M.mode === 'held' || M.struggle || M.run ? Math.sin(t * 24) * 7 : sit ? dang * 3.2 : 0;
    E.fl.setAttribute('cy', (113 + sw2).toFixed(2)); E.fr.setAttribute('cy', (113 - sw2).toFixed(2));
    E.fl.setAttribute('cx', (35 + (walk ? Math.cos(M.ph) * 3.2 : sit ? -dang * 1.2 : 0)).toFixed(2)); E.fr.setAttribute('cx', (65 + (walk ? -Math.cos(M.ph) * 3.2 : sit ? dang * 1.2 : 0)).toFixed(2));
    E.fl.setAttribute('ry', (6.5 - (walk ? Math.max(0, -stride) * 1.3 : 0)).toFixed(2)); E.fr.setAttribute('ry', (6.5 - (walk ? Math.max(0, stride) * 1.3 : 0)).toFixed(2));
    const u1 = size / 140, airU = M.air / u1 + (sit || M.sleep ? 0 : bob), lift = cl(airU / 80, 0, 1), sqz = 1 + M.sq * .18;
    E.sh.setAttribute('cx', (53 + lift * 3).toFixed(1)); E.sh.setAttribute('cy', (118 + M.air / u1).toFixed(1)); E.sh.setAttribute('rx', (32 * (1 - lift * .4) * sqz).toFixed(1)); E.sh.setAttribute('ry', (5.5 * (1 - lift * .3)).toFixed(2)); E.sh.setAttribute('opacity', (.5 * sc * (1 - lift * .65)).toFixed(2));
    E.sh0.setAttribute('cy', (117 + M.air / u1).toFixed(1)); E.sh0.setAttribute('rx', (17 * (1 - lift * .55) * sqz).toFixed(1)); E.sh0.setAttribute('opacity', (.6 * sc * (1 - lift * .9)).toFixed(2));
    if (M.sleep && now > zT) { zT = now + R(1900, 2800); zzz(); }
    const jx = (M.eff ? Math.sin(t * 55) * 1.4 * M.eff : raging ? Math.sin(t * 40) * 2 : 0) + (M.shake > 0 ? Math.sin(t * 50) * 1.3 : 0), mk = Math.round(Math.min(1.5, M.mad) * 20), key = mk * 100 + Math.round(M.mon * 10) * 10 + Math.round(M.pet * 5);
    if (key !== lastF) { lastF = key; const v = mk / 20; btn.style.filter = v > .02 || M.mon > .3 ? `hue-rotate(${-24 * v}deg) saturate(${1 + 1.5 * v}) brightness(${1 + .1 * v})${M.mon > .3 ? ' drop-shadow(0 0 12px rgba(255,70,40,.85))' : ''}` : ''; btn.style.setProperty('--bl', (.35 + .5 * M.pet + .25 * Math.min(1, M.mad)).toFixed(2)); E.mnst.setAttribute('opacity', M.mon.toFixed(2)); }
    const big = 1 + .28 * M.mon; btn.style.transform = `translate3d(${M.x - size / 2 + jx}px,${M.y - 0.943 * size}px,0)scale(${(1 + M.sq * .18) * big},${(1 - M.sq * .28) * big})`;
    if (B && Math.hypot(B.px - M.x, B.py - M.y) > 8) place();
  }

  /* ── wiring ── */
  const wake = (quiet, soft) => { if (!M.sleep) return; M.sleep = 0; hide(); if (soft) mood('sleepy', 2.4); else { mood('surprised', 1.4); M.sq = .6; } M.nod = 0; if (!quiet) queue.unshift({ k: 'wake', soft: !!soft }); interrupt(); };   // touching it wakes it at once, face included
  const activity = () => { idleAt = performance.now(); wake(); };
  const grab = () => { wake(true); interrupt(); M.go = null; M.jp = null; M.dc = null; M.grip = null; M.mode = 'held'; M.micT = 0; M.peak = 0; M.petting = 0; btn.classList.add('held'); setTimeout(() => { if (M.mode === 'held') { show(L('scared'), 'shout'); tt.textContent = B.text; gg.textContent = ''; speechUntil = performance.now() + 2600; } }, 90); };
  let pt = 0;
  on(btn, 'pointerdown', (e) => { e.preventDefault(); btn.setPointerCapture(e.pointerId); drag = { id: e.pointerId, x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY, t0: performance.now(), moved: false, pet: false, hist: [], shake: 0 }; activity(); clearTimeout(pt); pt = setTimeout(() => { if (drag && !drag.moved && !tourOn) { drag.pet = true; M.petting = 1; } }, 520); });   // hold still = gentle petting
  on(btn, 'pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return; const now = performance.now(), d = Math.hypot(e.clientX - drag.x, e.clientY - drag.y);
    if (!drag.moved) {
      const b = btn.getBoundingClientRect(), inside = e.clientX > b.left && e.clientX < b.right && e.clientY > b.top && e.clientY < b.bottom;
      if (d > 14 && (now - drag.t0 < 320 || !inside || d > size * 1.1)) { drag.moved = true; clearTimeout(pt); M.petting = 0; grab(); }          // quick or far = pick it up
      else if (d > 3 && !tourOn) { drag.pet = true; M.petting = 1; M.pet = Math.min(1, M.pet + .01); }                                          // slow strokes on the body = petting
    }
    if (drag.moved) {
      drag.hist.push([now, e.clientX, e.clientY]); drag.hist = drag.hist.filter((h) => now - h[0] < 90); M.hx = e.clientX; M.hy = e.clientY;
      const dtm = Math.max(8, now - (drag.lt || now - 16)), vx = ((e.clientX - (drag.lx ?? e.clientX)) / dtm) * 1000, vy = ((e.clientY - (drag.ly ?? e.clientY)) / dtm) * 1000;
      if (drag.lvx !== undefined && vx * drag.lvx + vy * drag.lvy < 0 && Math.hypot(vx, vy) > 450) drag.shake++;          // direction keeps flipping fast = being shaken
      drag.lvx = vx; drag.lvy = vy; drag.lx = e.clientX; drag.ly = e.clientY; drag.lt = now;
      if (drag.shake >= 6) { drag.shake = 0; M.dizzy = 3.5; blurt(pick(['stop shaking!! i’m dizzy…', 'ohhh the room is spinning', 'not the shaking! not the shaking!']), 'shout', 1800); }
    }
  });
  const drop = (e, cancel) => {
    if (!drag || e.pointerId !== drag.id) return; const d = drag; drag = null; clearTimeout(pt); M.petting = 0; btn.classList.remove('held');
    if (!d.moved) {
      const eg = !cancel && !d.pet && !tourOn && !raging && !reduce ? bodyTap(e) : ''; if (eg === 'hold') return; if (eg) { queue.push({ k: 'egg', n: eg }); interrupt(); return; }       // antenna bulb x3 / tummy button x2
      if (!cancel && !d.pet && !tourOn && !raging) { const now = performance.now(), gap = now - lastTapAt, hard = gap < 750; lastTapAt = now; M.mad = Math.min(1.7, M.mad + (hard ? .3 : gap < 1800 ? .14 : .05)); queue.push(M.mad >= 1 ? { k: 'tantrum' } : { k: 'tap', hard }); interrupt(); }   // rapid taps hurt; too many and it snaps
      return;
    }
    const h = d.hist; let vx = 0, vy = 0; if (h.length > 1) { const a = h[0], b = h[h.length - 1], dt = (b[0] - a[0]) / 1000 || 1; vx = (b[1] - a[1]) / dt; vy = (b[2] - a[2]) / dt; }
    const rc = $('#record')?.getBoundingClientRect(), cx = rc ? rc.left + rc.width / 2 : -1e4, cy = rc ? rc.top + rc.height / 2 : -1e4, rr = Math.hypot(M.x - cx, M.y - BH * .5 - cy);
    hide(); if (rc && rr < rc.width * .44) { M.dc = mkDisc(cx, cy, rc.width * .44, Math.atan2(M.y - BH * .5 - cy, M.x - cx), rr); M.mode = 'disc'; }
    else { M.vx = cl(vx, -1600, 1600); M.vy = cl(vy, -1600, 1600); M.vr = M.vx * .3; M.peak = 0; M.mode = 'fall'; }
  };
  on(btn, 'pointerup', (e) => drop(e, false)); on(btn, 'pointercancel', (e) => drop(e, true));
  on(btn, 'click', (e) => { if (e.detail === 0 && !tourOn) { queue.push({ k: 'tap' }); interrupt(); } });
  on(document, 'pointerdown', (e) => { activity(); if (curious && e.target.closest && e.target.closest('#deckFit')) interrupt(); if (e.target.closest && e.target.closest('.stm,.mchip,.mname,.mname-doodle,button,[role],a,#deckFit') || tourOn || reduce || performance.now() < pokeAt || Math.random() > .3) return; pokeAt = performance.now() + 14000; queue.push({ k: 'poke', x: e.clientX, y: e.clientY }); interrupt(); }, { capture: true });
  let jx = 0, jy = 0, jt = 0, jd = 0;
  on(window, 'pointermove', (e) => {
    const now = performance.now();
    if (e.pointerType === 'mouse') { mx = e.clientX; my = e.clientY; lastMouseAt = now; tickle(e); } else touchPt = { x: e.clientX, y: e.clientY, why: 'touch', t: now };
    idleAt = now;
    if (M.sleep) { if (now - jt > 700) jd = 0; jt = now; jd += Math.hypot(e.clientX - jx, e.clientY - jy); if (jd > 220) { jd = 0; wake(false, true); } }     // a sleeping bot ignores a twitch of the mouse, not a real wave
    jx = e.clientX; jy = e.clientY;
  });
  on(window, 'keydown', () => { activity(); if (curious) interrupt(); }); on(window, 'scroll', activity, { passive: true });
  let rt = 0; on(window, 'resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); if (M.mode === 'walk' && !op && !raging && !curious && (hit(M.x, M.y, rects()) || !inV(M.x, M.y))) { const s = spots(rects()); if (s.length) { const p = pick(s); M.x = p.x; M.y = p.y; interrupt(); } } }, 160); });
  const settle = setInterval(() => { if (!M.go && !M.sleep && M.mode === 'walk' && !tourOn && !curious && !op && !raging && !writingDoodle && !M.grip && hit(M.x, M.y, rects())) { const s = spots(rects()); if (s.length) { queue.unshift({ k: 'move', ...pick(s) }); interrupt(); } } }, 800);
  const watch = setInterval(() => {       // watchdog: no mode, flag or loop can stay stuck
    const now = performance.now(); if (M.mode !== wLast) { wLast = M.mode; wSince = now; }
    if (M.mode === 'held' && !drag) { M.mode = 'fall'; M.vx = M.vy = 0; }
    if (M.mode !== 'walk' && now - wSince > (M.mode === 'disc' ? 40000 : 15000)) { M.mode = 'fall'; M.dc = null; M.jp = null; M.vx = M.vy = 0; interrupt(); }
    if (M.go && now - M.go.t0 > 16000) interrupt();
    if (torchInProgress && now - torchStartedAt > 22000) interrupt();
    if (M.sleep && (playing || tourOn)) wake(false, true);
    if (!torchInProgress && (torchAim || torchLit)) { torchAim = null; torchLit = false; $('.engrave')?.classList.remove('torch-lit'); }
    if (!op && M.grip) M.grip = null; if (!op && !raging && M.eff) M.eff = 0;
    if (!tourOn && !op && !ring.hidden && now - ringAt > 15000) ring.hidden = true;
    if (!drag && M.petting) M.petting = 0; if (!playing && M.micT && !M.hold && !tourOn) M.micT = 0;
    if (M.fing && now - fingAt > 9000) M.fing = 0; if (M.sleep && M.mode !== 'walk') M.sleep = 0;
    if (!M.sleep && !tourOn && M.mode === 'walk' && now - lastTick > 80000) interrupt();
    if (!M.sleep && !drag && M.mode !== 'held' && now - progressAt > 25000) revive('no progress for 25 s');
  }, 1000);

  measure(); const sp = spots(rects()), home = sp.find((s) => s.kind === 'home'), s0 = (home && Math.random() < .5 ? home : pick(sp.filter((s) => s.kind !== 'home')) || home) || { x: innerWidth / 2, y: innerHeight - 12 };
  M.x = s0.x; M.y = s0.y; M.sit = s0.kind === 'edge' ? 1 : 0; btn.classList.add('on'); requestAnimationFrame(frame); setTimeout(loop, reduce ? 300 : 1100);
  if (location.search.includes('debug')) window.__static = { M, get pr() { return pr; }, setIdle: (ms) => { idleAt = performance.now() - ms; interrupt(); }, get raging() { return raging; }, get op() { return op; }, get curious() { return curious; }, queue, interrupt, chip, get tourOn() { return tourOn; }, get bub() { return B; }, get writing() { return writingDoodle; }, get visitor() { return visitorName; }, get gen() { return gen; }, get lastTick() { return lastTick; }, get eggAt() { return eggAt; }, set eggAt(v) { eggAt = v; }, rects, spots, say, get playing() { return playing; }, doodle: () => { born = performance.now() - 60000; nextDoodleAt = 0; interrupt(); }, hit, BW: () => BW, BH: () => BH, beat, egg: (n) => { queue.push({ k: 'egg', n }); interrupt(); }, attention: () => attention(performance.now()), restSpots, pickRest };
  return () => { chip.remove(); namePanel.remove(); nameDoodle.remove(); D.el?.remove(); alive = false; interrupt(); ac.abort(); clearInterval(settle); clearInterval(watch); clearTimeout(ht); clearTimeout(doodleFadeTimer); clearTimeout(doodleHideTimer); btn.remove(); bub.remove(); ring.remove(); rig.remove(); spot.remove(); $('.engrave')?.classList.remove('torch-lit'); };
}
