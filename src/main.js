import * as THREE from 'three';

const $ = (s) => document.querySelector(s);
const root = document.documentElement;
const canvas = $('#webgl');
const sceneWrap = $('#sceneWrap');
const recordButton = $('#recordButton');
const armButton = $('#armButton');
const recordTitle = $('#trackTitle');
const progressEl = $('#trackProgress');
const nowPlaying = $('#nowPlaying');
const hint = $('#interactionHint');
const audio = $('#audioPlayer');
const status = $('#systemStatus');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const TRACK_FALLBACK = [
  { filename: 'song1.mp3', title: 'Track One' },
  { filename: 'song2.mp3', title: 'Track Two' },
  { filename: 'song3.mp3', title: 'Track Three' }
];
let tracks = [];
let currentIndex = -1;
let currentTrack = null;
let playing = false;
let playQueued = false;
let audioAvailable = false;

function setStatus(text=''){ status.textContent = text; }
function mapTracks(list){ return list.map(t => ({ url:`/songs/${t.filename}`, title:t.title })); }
async function loadTracks(){
  try{
    const res = await fetch('/songs/songs.json',{cache:'no-store'});
    if(!res.ok) throw new Error('tracks manifest');
    const data = await res.json();
    tracks = mapTracks(Array.isArray(data.tracks) ? data.tracks : TRACK_FALLBACK);
  }catch{ tracks = mapTracks(TRACK_FALLBACK); }
  selectTrack(Math.max(0, Math.floor(Math.random()*tracks.length)));
}
function selectTrack(index){
  if(!tracks.length) return;
  currentIndex = (index + tracks.length) % tracks.length;
  currentTrack = tracks[currentIndex];
  audio.src = currentTrack.url;
  recordTitle.textContent = currentTrack.title;
  nowPlaying.classList.add('show');
}

let renderer, scene, camera, record, recordTop, recordGrooves, tonearm, armNeedle, platter, deckGroup, keyLight;
let ready3D = false;
let clock = new THREE.Clock();
let spinVelocity = 0;
let spinTarget = 0;
let armTarget = 2.8;
let armCurrent = 2.8;
let armLiftTarget = .2;
let armLiftCurrent = .2;
const RECORD_RPM = 33 + 1 / 3;
const RECORD_ANGULAR_SPEED = RECORD_RPM * Math.PI * 2 / 60;
let baseRecordRotation = Math.random()*Math.PI*2;

function mat(color, roughness=.45, metalness=.35){
  return new THREE.MeshPhysicalMaterial({color,roughness,metalness,clearcoat:.35,clearcoatRoughness:.22});
}
function makeGrooves(){
  const geo = new THREE.TorusGeometry(1.98, .009, 5, 160);
  const m = new THREE.MeshBasicMaterial({color:0x777066,transparent:true,opacity:.08});
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
  camera.lookAt(0,0,0);

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

  platter = new THREE.Mesh(new THREE.CylinderGeometry(2.18,.2,.16,96),mat(0x11100f,.26,.82));
  platter.position.set(-.2,.23,0); platter.castShadow=true; platter.receiveShadow=true; deckGroup.add(platter);

  const recordMat = new THREE.MeshPhysicalMaterial({color:0x0a0a09,roughness:.2,metalness:.5,clearcoat:1,clearcoatRoughness:.08});
  record = new THREE.Mesh(new THREE.CylinderGeometry(2.04,.055,.12,128),recordMat);
  record.position.set(-.2,.35,0); record.castShadow=true; record.receiveShadow=true; deckGroup.add(record);

  const loader = new THREE.TextureLoader();
  let texture;
  try { texture = await loader.loadAsync('/assets/vinyl-record.png'); }
  catch { texture = makeProceduralVinylTexture(); }
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  recordTop = new THREE.Mesh(new THREE.CircleGeometry(1.99,128),new THREE.MeshPhysicalMaterial({map:texture,transparent:true,roughness:.27,metalness:.18,clearcoat:.9,clearcoatRoughness:.08}));
  recordTop.rotation.x=-Math.PI/2; recordTop.position.set(-.2,.415,0); recordTop.castShadow=true; deckGroup.add(recordTop);
  recordGrooves = makeGrooves(); recordGrooves.position.set(-.2,.425,0); deckGroup.add(recordGrooves);

  const label = new THREE.Mesh(new THREE.CylinderGeometry(.53,.53,.035,64),new THREE.MeshPhysicalMaterial({color:0xe6d8bd,roughness:.72,metalness:.02}));
  label.position.set(-.2,.44,0); deckGroup.add(label);
  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(.075,.09,.16,32),mat(0x54483b,.32,.55)); spindle.position.set(-.2,.5,0); deckGroup.add(spindle);

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

  const armRoot = new THREE.Group(); armRoot.rotation.y=2.8; armRoot.position.y=.32; tonearm.add(armRoot);
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
  tonearm.userData.armRoot=armRoot;

  const lightStrip = new THREE.Mesh(new THREE.PlaneGeometry(1.2,.8),new THREE.MeshBasicMaterial({color:0xd4a66d,transparent:true,opacity:.07,side:THREE.DoubleSide})); lightStrip.rotation.x=-Math.PI/2; lightStrip.position.set(-1.2,.52,-1.2); deckGroup.add(lightStrip);

  ready3D=true;
  resize();
  setStatus('');
  requestAnimationFrame(render);
}
function resize(){
  if(!renderer||!camera) return;
  const r=sceneWrap.getBoundingClientRect();
  renderer.setSize(r.width,r.height,false);
  camera.aspect=r.width/r.height; camera.updateProjectionMatrix();
}
function animateArmToTrack(){
  if(!audio.duration||!Number.isFinite(audio.duration)) return;
  const p=Math.min(audio.currentTime/audio.duration,1);
  armTarget=2.8 - p*.25;
}
function render(now){
  const dt=Math.min(clock.getDelta(),.05);
  if(ready3D){
    const motorTau=spinTarget?1-Math.exp(-dt/.82):1-Math.exp(-dt/.58);
    spinVelocity += (spinTarget-spinVelocity)*motorTau;
    baseRecordRotation += spinVelocity*dt;
    record.rotation.y=baseRecordRotation;
    recordTop.rotation.z=-baseRecordRotation;
    recordGrooves.rotation.y=baseRecordRotation;
    if(playing) animateArmToTrack();
    armCurrent += (armTarget-armCurrent)*(1-Math.exp(-dt/0.85));
    armLiftCurrent += (armLiftTarget-armLiftCurrent)*(1-Math.exp(-dt/.42));
    tonearm.userData.armRoot.rotation.y=armCurrent;
    tonearm.userData.armRoot.position.y=.12+armLiftCurrent;
    // Keep the camera and deck composition locked: touch interactions never shift the page or scene.
    camera.lookAt(0,.1,0);
    renderer.render(scene,camera);
  }
  requestAnimationFrame(render);
}

function setPlayingState(next){
  playing=next;
  document.body.classList.toggle('playing',playing);
  recordButton.setAttribute('aria-pressed',String(playing));
  nowPlaying.classList.add('show');
  spinTarget=playing?RECORD_ANGULAR_SPEED:0;
  armLiftTarget=playing?.025:.2;
}
async function play(){
  if(!currentTrack) return;
  playQueued=true; setStatus(''); spinTarget=RECORD_ANGULAR_SPEED;
  if(!audio.currentTime) armTarget=2.8; else animateArmToTrack();
  armLiftTarget=.025;
  if(!audioAvailable){
    try{ await audio.play(); audioAvailable=true; }catch{
      // If audio is blocked or unavailable, keep the physical deck interaction working silently.
      playQueued=false;
      setStatus('');
      setPlayingState(true);
      hint.classList.remove('show');
      return;
    }
  }else{
    try{ await audio.play(); }catch{ playQueued=false; setStatus(''); setPlayingState(true); hint.classList.remove('show'); return; }
  }
  playQueued=false; setPlayingState(true); setStatus(''); hint.classList.remove('show');
}
function pause(){ audio.pause(); playQueued=false; setPlayingState(false); setStatus(''); }
async function toggle(){ if(playing||playQueued) pause(); else await play(); }
async function next(){
  if(!tracks.length) return;
  let n; do n=Math.floor(Math.random()*tracks.length); while(tracks.length>1&&n===currentIndex);
  selectTrack(n); audio.currentTime=0; await play();
}

recordButton.addEventListener('click',toggle);
armButton.addEventListener('click',next);

window.addEventListener('resize',resize,{passive:true});
if ('ResizeObserver' in window && sceneWrap) new ResizeObserver(resize).observe(sceneWrap);
document.addEventListener('visibilitychange',()=>{ if(document.hidden) spinTarget=0; else spinTarget=playing?RECORD_ANGULAR_SPEED:0; });

audio.addEventListener('loadeddata',()=>{ audioAvailable=true; setStatus(''); });
audio.addEventListener('play',()=>{ if(!playing) setPlayingState(true); });
audio.addEventListener('pause',()=>{ if(playing&&!playQueued) setPlayingState(false); });
audio.addEventListener('timeupdate',()=>{ if(audio.duration) progressEl.style.transform=`scaleX(${Math.min(audio.currentTime/audio.duration,1)})`; });
audio.addEventListener('ended',()=>{ setPlayingState(false); next(); });
audio.addEventListener('error',()=>{ audioAvailable=false; setStatus(''); });

let interacted=false;
try{interacted=localStorage.getItem('deck.v2.seen')==='1';}catch{}
setTimeout(()=>{ if(!interacted&&!playing){hint.classList.add('show');} },1600);
function remember(){try{localStorage.setItem('deck.v2.seen','1')}catch{}}
recordButton.addEventListener('click',()=>{interacted=true;remember();hint.classList.remove('show')},{once:false});

if(reduceMotion) setStatus('');
if(!('WebGLRenderingContext' in window)) document.documentElement.classList.add('is-no-webgl');

loadTracks();
init3D().catch(err=>{
  console.warn(err);
  document.documentElement.classList.add('is-no-webgl');
  setStatus('');
});
