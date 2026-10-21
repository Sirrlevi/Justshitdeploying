import * as THREE from 'three';

const $ = (s) => document.querySelector(s);
const canvas = $('#webgl');
const sceneWrap = $('#sceneWrap');
const recordButton = $('#recordButton');
const armButton = $('#armButton');
const recordTitle = $('#trackTitle');
const heroTitle = $('#hero-title');
const progressEl = $('#trackProgress');
const nowPlaying = $('#nowPlaying');
const hint = $('#interactionHint');
const audio = $('#audioPlayer');
const status = $('#systemStatus');

const TRACK_FALLBACK = [
  { filename: 'Hoor.mp3' },
  { filename: 'Tu.mp3' },
  { filename: 'Safar.mp3' }
];
let tracks = [];
let currentIndex = -1;
let currentTrack = null;
let playing = false;
let playQueued = false;
let ignorePauseEventCount = 0;

function setStatus(text=''){ status.textContent = text; }
function titleFromFilename(filename=''){
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([0-9])/gi, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim() || 'untitled';
}
function mapTracks(list){
  return list
    .filter(t => typeof t.filename === 'string' && /\.mp3$/i.test(t.filename))
    .map(t => ({
      url: `/songs/${encodeURIComponent(t.filename)}`,
      title: titleFromFilename(t.filename),
      filename: t.filename
    }));
}
async function loadTracks(){
  try{
    const res = await fetch('/songs/songs.json', { cache: 'no-store' });
    if(!res.ok) throw new Error('track manifest unavailable');
    const data = await res.json();
    tracks = mapTracks(Array.isArray(data.tracks) ? data.tracks : []);
  }catch{
    tracks = mapTracks(TRACK_FALLBACK);
  }
  if(!tracks.length) tracks = mapTracks(TRACK_FALLBACK);
  // Start consistently with the first filename-sorted track.
  selectTrack(0);
}
function selectTrack(index, {preservePlayback=false}={}){
  if(!tracks.length) return;
  currentIndex = (index + tracks.length) % tracks.length;
  currentTrack = tracks[currentIndex];
  // Loading a replacement source pauses the current media element. Suppress that one
  // pause event when this is a seamless track change so it cannot park the arm.
  if(preservePlayback && !audio.paused && !audio.ended) ignorePauseEventCount++;
  audio.pause();
  audio.src = currentTrack.url;
  audio.load();
  updateTrackUI();
}

let renderer, scene, camera, record, recordTop, recordGrooves, tonearm, armNeedle, platter, deckGroup, keyLight;
let recordGroup, recordHitZone, armHitProxy, armPivotProxy;
let ready3D = false;
let clock = new THREE.Clock();
let raycaster = new THREE.Raycaster();
let pointerNdc = new THREE.Vector2();
let spinVelocity = 0;
let spinTarget = 0;
const ARM_PARK_ANGLE = 3.409; // calibrated so the stylus rests on the lower-right cradle, inside the plinth
const ARM_REST_LIFT = .08;
const ARM_CUE_LIFT = .2;
const ARM_PLAY_START_ANGLE = 2.9;
const ARM_PLAY_END_ANGLE = 2.64;
let armTarget = ARM_PARK_ANGLE;
let armCurrent = ARM_PARK_ANGLE;
let armLiftTarget = ARM_REST_LIFT;
let armLiftCurrent = ARM_REST_LIFT;
let armSequence = 'parked';
const RECORD_RPM = 33 + 1 / 3;
const RECORD_ANGULAR_SPEED = RECORD_RPM * Math.PI * 2 / 60;
let baseRecordRotation = Math.random() * Math.PI * 2;

function mat(color, roughness=.45, metalness=.35){
  return new THREE.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:.35,clearcoatRoughness:.22});
}
function makeGrooves(){
  const geo = new THREE.TorusGeometry(1.91, .005, 4, 160);
  const m = new THREE.MeshBasicMaterial({color:0x777066,transparent:true,opacity:.075});
  const group = new THREE.Group();
  for(let i=0;i<18;i++){
    const ring = new THREE.Mesh(geo,m);
    ring.scale.setScalar(1 - i*.018);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = .005;
    group.add(ring);
  }
  return group;
}
function makeProceduralVinylTexture(){
  const size = 768;
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size*.34,size*.28,size*.03,size*.5,size*.5,size*.55);
  g.addColorStop(0,'#242321'); g.addColorStop(.42,'#050505'); g.addColorStop(.82,'#11100f'); g.addColorStop(1,'#030303');
  ctx.fillStyle=g; ctx.fillRect(0,0,size,size);
  for(let r=size*.27;r<size*.49;r+=2){ctx.beginPath();ctx.arc(size/2,size/2,r,0,Math.PI*2);ctx.strokeStyle=`rgba(205,190,165,${.025+Math.random()*.025})`;ctx.lineWidth=1;ctx.stroke();}
  ctx.beginPath();ctx.arc(size/2,size/2,size*.19,0,Math.PI*2);ctx.fillStyle='#e6d8bd';ctx.fill();
  ctx.beginPath();ctx.arc(size/2,size/2,size*.018,0,Math.PI*2);ctx.fillStyle='#15120e';ctx.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
}

async function init3D(){
  if(!canvas || !window.WebGLRenderingContext) throw new Error('WebGL unavailable');
  renderer = new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x090705,.035);
  camera = new THREE.PerspectiveCamera(34,1,.1,50);
  camera.position.set(0,6.2,7.8);
  camera.lookAt(0,.1,0);

  scene.add(new THREE.HemisphereLight(0xdbc4a2,0x070604,1.3));
  keyLight = new THREE.DirectionalLight(0xffdfb0,4.5);
  keyLight.position.set(-3,7,4); keyLight.castShadow=true; keyLight.shadow.mapSize.set(1024,1024); keyLight.shadow.bias=-.0004; scene.add(keyLight);
  const rim = new THREE.PointLight(0xa77d50,1.7,10); rim.position.set(4,2,-2); scene.add(rim);

  deckGroup = new THREE.Group();
  deckGroup.rotation.x = THREE.MathUtils.degToRad(8);
  scene.add(deckGroup);

  const deck = new THREE.Mesh(new THREE.BoxGeometry(6.4,.48,5.15),mat(0x17100b,.5,.18));
  deck.position.y=-.28; deck.castShadow=true; deck.receiveShadow=true; deckGroup.add(deck);
  const wood = new THREE.Mesh(new THREE.BoxGeometry(6.1,.18,4.86),mat(0x3a281b,.62,.08));
  wood.position.y=.02; wood.castShadow=true; deckGroup.add(wood);
  const inlay = new THREE.Mesh(new THREE.BoxGeometry(5.86,.08,4.6),mat(0x0d0a07,.72,.03));
  inlay.position.y=.12; inlay.receiveShadow=true; deckGroup.add(inlay);

  platter = new THREE.Mesh(new THREE.CylinderGeometry(2.18,2.13,.16,96),mat(0x11100f,.26,.82));
  platter.position.set(-.2,.23,0); platter.castShadow=true; platter.receiveShadow=true; deckGroup.add(platter);

  // One shared transform keeps the disc, printed label, grooves, spindle and hit target concentric.
  recordGroup = new THREE.Group();
  recordGroup.position.set(-.2,0,0);
  deckGroup.add(recordGroup);

  const recordMat = new THREE.MeshPhysicalMaterial({color:0x0a0a09,roughness:.24,metalness:.42,clearcoat:1,clearcoatRoughness:.1});
  record = new THREE.Mesh(new THREE.CylinderGeometry(2.04,2.015,.12,128),recordMat);
  record.position.set(0,.35,0); record.castShadow=true; record.receiveShadow=true; recordGroup.add(record);

  const loader = new THREE.TextureLoader();
  let texture;
  try { texture = await loader.loadAsync('/assets/vinyl-record.png'); }
  catch { texture = makeProceduralVinylTexture(); }
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  recordTop = new THREE.Mesh(
    new THREE.CircleGeometry(1.99,128),
    new THREE.MeshPhysicalMaterial({map:texture,roughness:.31,metalness:.1,clearcoat:.62,clearcoatRoughness:.16})
  );
  recordTop.rotation.x = -Math.PI/2;
  recordTop.position.set(0,.415,0);
  recordTop.castShadow = true;
  recordTop.receiveShadow = true;
  recordGroup.add(recordTop);

  recordGrooves = makeGrooves();
  recordGrooves.position.set(0,.419,0);
  recordGroup.add(recordGrooves);

  // The real center hole is painted out of the label texture; this single short spindle sits exactly on-axis.
  const spindle = new THREE.Mesh(
    new THREE.CylinderGeometry(.018,.023,.038,32),
    mat(0x807464,.24,.82)
  );
  spindle.position.set(0,.434,0);
  spindle.castShadow = false;
  recordGroup.add(spindle);

  // Invisible, concentric hit plane: taps on the visible vinyl itself toggle playback.
  recordHitZone = new THREE.Mesh(
    new THREE.CircleGeometry(1.975,96),
    new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,colorWrite:false,depthWrite:false,side:THREE.DoubleSide})
  );
  recordHitZone.rotation.x = -Math.PI/2;
  recordHitZone.position.set(0,.426,0);
  recordHitZone.userData.deckInteraction = 'record';
  recordGroup.add(recordHitZone);

  // Tonearm assembly: explicitly placed over the platter with a visible metallic tube,
  // counterweight, cartridge, and stylus. The stylus rests just above the record surface.
  tonearm = new THREE.Group(); tonearm.position.set(2.0,.48,-1.35); deckGroup.add(tonearm);
  const baseMetal = new THREE.MeshPhysicalMaterial({color:0x51483e,roughness:.24,metalness:.88,clearcoat:.65,clearcoatRoughness:.16});
  const brightMetal = new THREE.MeshPhysicalMaterial({color:0xb9ad9b,roughness:.2,metalness:.92,clearcoat:.8,clearcoatRoughness:.12});
  const darkMetal = new THREE.MeshPhysicalMaterial({color:0x211d18,roughness:.3,metalness:.82,clearcoat:.55});
  const brass = new THREE.MeshPhysicalMaterial({color:0xb39a75,roughness:.28,metalness:.78,clearcoat:.55});
  const pivotBase = new THREE.Mesh(new THREE.CylinderGeometry(.31,.34,.09,48),baseMetal);
  pivotBase.position.y=.05; pivotBase.castShadow=true; pivotBase.receiveShadow=true; tonearm.add(pivotBase);
  const pivot = new THREE.Mesh(new THREE.CylinderGeometry(.205,.24,.2,48),baseMetal);
  pivot.position.y=.18; pivot.castShadow=true; pivot.receiveShadow=true; tonearm.add(pivot);
  const pivotRing = new THREE.Mesh(new THREE.TorusGeometry(.17,.018,8,48),brightMetal);
  pivotRing.rotation.x=Math.PI/2; pivotRing.position.y=.285; tonearm.add(pivotRing);
  const pivotCap = new THREE.Mesh(new THREE.CylinderGeometry(.115,.14,.1,40),brightMetal);
  pivotCap.position.y=.32; pivotCap.castShadow=true; tonearm.add(pivotCap);
  const pivotPin = new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.11,24),darkMetal);
  pivotPin.position.y=.405; tonearm.add(pivotPin);

  const armRoot = new THREE.Group(); armRoot.rotation.y=ARM_PARK_ANGLE; armRoot.position.y=.32; tonearm.add(armRoot);
  const armTube = new THREE.Mesh(new THREE.CylinderGeometry(.039,.052,2.0,24),brightMetal);
  armTube.rotation.x=Math.PI/2; armTube.position.z=-1.0; armTube.castShadow=true; armTube.receiveShadow=true; armRoot.add(armTube);
  const armHighlight = new THREE.Mesh(new THREE.CylinderGeometry(.008,.01,1.72,12),new THREE.MeshStandardMaterial({color:0xe1d4bd,metalness:.9,roughness:.19}));
  armHighlight.rotation.x=Math.PI/2; armHighlight.position.set(-.012,.027,-1.0); armRoot.add(armHighlight);
  const rearCollar = new THREE.Mesh(new THREE.CylinderGeometry(.072,.072,.14,24),darkMetal);
  rearCollar.rotation.x=Math.PI/2; rearCollar.position.z=.12; armRoot.add(rearCollar);
  const counterStem = new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.32,20),baseMetal);
  counterStem.rotation.x=Math.PI/2; counterStem.position.z=.27; armRoot.add(counterStem);
  const counter = new THREE.Mesh(new THREE.CylinderGeometry(.145,.16,.32,32),darkMetal);
  counter.rotation.x=Math.PI/2; counter.position.z=.46; counter.castShadow=true; armRoot.add(counter);
  const counterBand = new THREE.Mesh(new THREE.CylinderGeometry(.163,.163,.045,32),brass);
  counterBand.rotation.x=Math.PI/2; counterBand.position.z=.39; armRoot.add(counterBand);

  const headBracket = new THREE.Mesh(new THREE.BoxGeometry(.22,.075,.2),baseMetal);
  headBracket.position.set(0,-.035,-1.91); headBracket.castShadow=true; armRoot.add(headBracket);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.29,.125,.28),darkMetal);
  head.position.set(0,-.055,-2.0); head.castShadow=true; head.receiveShadow=true; armRoot.add(head);
  const headTop = new THREE.Mesh(new THREE.BoxGeometry(.235,.018,.19),brass);
  headTop.position.set(0,.014,-1.99); armRoot.add(headTop);
  const headPlate = new THREE.Mesh(new THREE.BoxGeometry(.225,.022,.2),brightMetal);
  headPlate.position.set(0,-.125,-2.035); armRoot.add(headPlate);
  const stylusMount = new THREE.Mesh(new THREE.BoxGeometry(.085,.07,.095),darkMetal);
  stylusMount.position.set(0,-.15,-2.075); armRoot.add(stylusMount);
  armNeedle = new THREE.Mesh(new THREE.CylinderGeometry(.009,.0025,.085,12),brightMetal);
  armNeedle.position.set(0,-.185,-2.085); armNeedle.castShadow=true; armRoot.add(armNeedle);
  const stylusTip = new THREE.Mesh(new THREE.SphereGeometry(.012,12,8),brass);
  stylusTip.position.set(0,-.202,-2.085); armRoot.add(stylusTip);
  // A transparent raycast capsule follows the actual arm, so tapping the arm changes track precisely.
  armHitProxy = new THREE.Mesh(
    new THREE.CylinderGeometry(.13,.13,2.55,12),
    new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,colorWrite:false,depthWrite:false,side:THREE.DoubleSide})
  );
  armHitProxy.rotation.x = Math.PI/2;
  armHitProxy.position.set(0,-.005,-1.04);
  armHitProxy.userData.deckInteraction = 'arm';
  armRoot.add(armHitProxy);
  armPivotProxy = new THREE.Mesh(
    new THREE.SphereGeometry(.34,16,12),
    new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:0,colorWrite:false,depthWrite:false,side:THREE.DoubleSide})
  );
  armPivotProxy.position.set(0,.2,0);
  armPivotProxy.userData.deckInteraction = 'arm';
  tonearm.add(armPivotProxy);
  tonearm.userData.armRoot=armRoot;

  // Dedicated arm rest / cradle, positioned at the exact parked stylus coordinates.
  // With the calibrated rest angle, the stylus is at deckGroup x=2.55, z=0.66.
  const restPad = new THREE.Mesh(new THREE.BoxGeometry(.19,.045,.23), darkMetal);
  restPad.position.set(2.55,.19,.66); restPad.castShadow=true; restPad.receiveShadow=true; deckGroup.add(restPad);
  const restPost = new THREE.Mesh(new THREE.CylinderGeometry(.026,.038,.17,20), baseMetal);
  restPost.position.set(2.55,.295,.66); restPost.castShadow=true; deckGroup.add(restPost);
  const restCradle = new THREE.Mesh(new THREE.TorusGeometry(.075,.014,8,28), brass);
  restCradle.rotation.x=Math.PI/2; restCradle.position.set(2.55,.39,.66); restCradle.castShadow=true; deckGroup.add(restCradle);

  ready3D=true;
  resize();
  setStatus('');
  requestAnimationFrame(render);
}
function resize(){
  if(!renderer||!camera) return;
  const r = sceneWrap.getBoundingClientRect();
  if(!r.width || !r.height) return;
  renderer.setSize(r.width, r.height, false);
  const compact = r.width < 560;
  camera.aspect = r.width / r.height;
  camera.position.set(0, compact ? 7.0 : 6.2, compact ? 8.9 : 7.8);
  camera.fov = compact ? 35 : 34;
  camera.updateProjectionMatrix();
  camera.lookAt(0,.1,0);
}
function angleForProgress(){
  if(!audio.duration || !Number.isFinite(audio.duration)) return ARM_PLAY_START_ANGLE;
  const p = THREE.MathUtils.clamp(audio.currentTime / audio.duration, 0, 1);
  return THREE.MathUtils.lerp(ARM_PLAY_START_ANGLE, ARM_PLAY_END_ANGLE, p);
}
function cueTonearm(){
  armLiftTarget = ARM_CUE_LIFT;
  armTarget = angleForProgress();
  armSequence = 'cue';
}
function parkTonearm(){
  // Lift first, swing to the calibrated cradle, then lower into the resting height.
  armLiftTarget = ARM_CUE_LIFT;
  armSequence = 'park-lift';
}
function render(){
  const dt = Math.min(clock.getDelta(), .05);
  if(ready3D){
    const motorTau = spinTarget ? 1-Math.exp(-dt/.72) : 1-Math.exp(-dt/.85);
    spinVelocity += (spinTarget-spinVelocity)*motorTau;
    baseRecordRotation += spinVelocity*dt;
    recordGroup.rotation.y = baseRecordRotation;

    if(playing && armSequence !== 'cue' && armSequence !== 'cue-lower') armTarget = angleForProgress();
    armCurrent += (armTarget-armCurrent)*(1-Math.exp(-dt/.42));
    armLiftCurrent += (armLiftTarget-armLiftCurrent)*(1-Math.exp(-dt/.2));
    tonearm.userData.armRoot.rotation.y = armCurrent;
    tonearm.userData.armRoot.position.y = .12 + armLiftCurrent;

    if(armSequence === 'park-lift' && armLiftCurrent > .16){
      armTarget = ARM_PARK_ANGLE;
      armSequence = 'parking';
    } else if(armSequence === 'parking' && Math.abs(armCurrent-ARM_PARK_ANGLE) < .018){
      armLiftTarget = ARM_REST_LIFT;
      armSequence = 'park-lower';
    } else if(armSequence === 'park-lower' && Math.abs(armLiftCurrent-ARM_REST_LIFT) < .012){
      armSequence = 'parked';
    } else if(armSequence === 'cue' && Math.abs(armCurrent-armTarget) < .018){
      armLiftTarget = .025;
      armSequence = 'cue-lower';
    } else if(armSequence === 'cue-lower' && Math.abs(armLiftCurrent-armLiftTarget) < .012){
      armSequence = 'playing';
    }

    camera.lookAt(0,.1,0);
    renderer.render(scene,camera);
  }
  requestAnimationFrame(render);
}
function updateInstruction(mode){
  if(!hint) return;
  if(mode === 'change-track') hint.textContent = 'tap the tonearm to change song';
  else if(mode === 'pause') hint.textContent = 'tap the vinyl to pause';
  else hint.textContent = 'tap the vinyl to play';
  hint.classList.add('show');
}
function handleDeckTap(event){
  if(!ready3D || !renderer || !camera) return;
  const rect = canvas.getBoundingClientRect();
  if(!rect.width || !rect.height) return;
  pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointerNdc.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  raycaster.setFromCamera(pointerNdc, camera);
  const hits = raycaster.intersectObjects([armHitProxy, armPivotProxy, recordHitZone], true);
  if(!hits.length) return;
  const action = hits[0].object.userData.deckInteraction;
  if(action === 'arm'){
    changeTrackFromTonearm();
  }else if(action === 'record'){
    toggle();
  }
}

function setPlayingState(next){
  const wasPlaying = playing;
  playing = next;
  document.body.classList.toggle('playing', playing);
  recordButton.setAttribute('aria-pressed', String(playing));
  nowPlaying.classList.add('show');
  spinTarget = playing ? RECORD_ANGULAR_SPEED : 0;
  if(playing && !wasPlaying) cueTonearm();
  else if(!playing && wasPlaying) parkTonearm();
}
function updateTrackUI(){
  if(!currentTrack) return;
  recordTitle.textContent = currentTrack.title;
  if(heroTitle) heroTitle.textContent = currentTrack.title;
  document.title = `${currentTrack.title} — record deck`;
  progressEl.style.transform = 'scaleX(0)';
  nowPlaying.classList.add('show');
}
async function play(){
  if(!currentTrack || playing || playQueued) return;
  playQueued = true;
  setStatus('');
  try{
    const promise = audio.play();
    setPlayingState(true);
    if(promise && typeof promise.then === 'function') await promise;
    playQueued = false;
    updateInstruction('change-track');
  }catch{
    playQueued = false;
    setPlayingState(false);
    setStatus('');
    updateInstruction('play');
  }
}
function pause(){
  playQueued = false;
  audio.pause();
  setPlayingState(false);
  updateInstruction('play');
}
async function toggle(){
  if(playing || playQueued) pause();
  else await play();
}
async function changeTrackFromTonearm(){
  if(!tracks.length) return;
  const nextIndex = (currentIndex + 1) % tracks.length;
  const shouldKeepPlaying = playing || playQueued;

  if(!shouldKeepPlaying){
    // When stopped, change the selected title only; the arm remains parked until the vinyl is tapped.
    selectTrack(nextIndex);
    armTarget = ARM_PARK_ANGLE;
    armSequence = 'parked';
    armLiftTarget = ARM_REST_LIFT;
    updateInstruction('play');
    return;
  }

  // Suppress the pause event from the old track so it cannot trigger a false park animation.
  playQueued = true;
  selectTrack(nextIndex, {preservePlayback:true});
  cueTonearm();
  updateInstruction('change-track');
  try{
    const promise = audio.play();
    if(promise && typeof promise.then === 'function') await promise;
    playQueued = false;
    // Keep the playing flag and motor state intact: changing tracks never sends the arm to rest.
  }catch{
    playQueued = false;
    setPlayingState(false);
    setStatus('');
    updateInstruction('play');
  }
}
function next(){
  return changeTrackFromTonearm();
}

// The transparent DOM buttons remain keyboard-accessible; pointer taps use exact 3D raycasting.
recordButton.addEventListener('click', toggle);
armButton.addEventListener('click', changeTrackFromTonearm);
canvas.addEventListener('click', handleDeckTap);

window.addEventListener('resize', resize, {passive:true});
if ('ResizeObserver' in window && sceneWrap) new ResizeObserver(resize).observe(sceneWrap);
document.addEventListener('visibilitychange',()=>{
  if(document.hidden) spinTarget = 0;
  else spinTarget = playing ? RECORD_ANGULAR_SPEED : 0;
});

audio.addEventListener('loadeddata',()=>{ setStatus(''); });
audio.addEventListener('play',()=>{ if(!playing) setPlayingState(true); });
audio.addEventListener('pause',()=>{
  if(ignorePauseEventCount > 0){ ignorePauseEventCount--; return; }
  if(playing && !playQueued) setPlayingState(false);
});
audio.addEventListener('timeupdate',()=>{
  if(audio.duration) progressEl.style.transform = `scaleX(${Math.min(audio.currentTime/audio.duration,1)})`;
});
audio.addEventListener('ended',()=>{ playQueued=false; setPlayingState(false); updateInstruction('play'); });
audio.addEventListener('error',()=>{ setStatus(''); });

// Show a fresh, useful instruction on every visit; no stale localStorage flag can suppress it.
updateInstruction('play');
if(!('WebGLRenderingContext' in window)) document.documentElement.classList.add('is-no-webgl');

loadTracks();
init3D().catch(err=>{
  console.warn(err);
  document.documentElement.classList.add('is-no-webgl');
  setStatus('');
});
