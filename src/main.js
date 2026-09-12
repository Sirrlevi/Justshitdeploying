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
const quietText = $('#quietText');
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

const lines = ['crafted slowly','धीरे-धीरे गढ़ा गया','creado lentamente','façonné lentement','creato lentamente','ゆっくりと作られた','صُنع ببطء','천천히 만들어진','criado lentamente','langsam gefertigt','создано медленно','yavaşça işlendi'];
let lineIndex = 0;

function setStatus(text=''){ status.textContent = text; }
function mapTracks(list){ return list.map(t => ({ url:`songs/${t.filename}`, title:t.title })); }
async function loadTracks(){
  try{
    const res = await fetch('songs/songs.json',{cache:'no-store'});
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

let renderer, scene, camera, pmrem, record, recordTop, recordGrooves, tonearm, armNeedle, platter, deckGroup, keyLight;
let ready3D = false;
let clock = new THREE.Clock();
let pointerTarget = new THREE.Vector2();
let pointer = new THREE.Vector2();
let spinVelocity = 0;
let spinTarget = 0;
let armTarget = -0.52;
let armCurrent = -0.52;
let armLiftTarget = .22;
let armLiftCurrent = .22;
let armPlaying = false;
let baseRecordRotation = Math.random()*Math.PI*2;
let audioTime = 0;

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
    ring.position.y = .055;
    group.add(ring);
  }
  return group;
}
function cylinderBetween(a,b,r,material){
  const dir = new THREE.Vector3().subVectors(b,a);
  const mid = new THREE.Vector3().addVectors(a,b).multiplyScalar(.5);
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r,r,dir.length(),16,1,false),material);
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());
  return mesh;
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
  const texture = await loader.loadAsync('assets/vinyl-record.png');
  texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  recordTop = new THREE.Mesh(new THREE.CircleGeometry(1.99,128),new THREE.MeshPhysicalMaterial({map:texture,transparent:true,roughness:.27,metalness:.18,clearcoat:.9,clearcoatRoughness:.08}));
  recordTop.rotation.x=-Math.PI/2; recordTop.position.set(-.2,.415,0); recordTop.castShadow=true; deckGroup.add(recordTop);
  recordGrooves = makeGrooves(); recordGrooves.position.set(-.2,.43,0); deckGroup.add(recordGrooves);

  const label = new THREE.Mesh(new THREE.CylinderGeometry(.53,.53,.035,64),new THREE.MeshPhysicalMaterial({color:0xe6d8bd,roughness:.72,metalness:.02}));
  label.position.set(-.2,.44,0); deckGroup.add(label);
  const spindle = new THREE.Mesh(new THREE.CylinderGeometry(.075,.09,.16,32),mat(0x54483b,.32,.55)); spindle.position.set(-.2,.5,0); deckGroup.add(spindle);

  tonearm = new THREE.Group(); tonearm.position.set(2.58,.48,-1.82); deckGroup.add(tonearm);
  const pivot = new THREE.Mesh(new THREE.CylinderGeometry(.36,.43,.22,48),mat(0x2c241d,.3,.75)); pivot.rotation.x=Math.PI/2; pivot.castShadow=true; tonearm.add(pivot);
  const pivotCap = new THREE.Mesh(new THREE.CylinderGeometry(.16,.2,.25,32),mat(0x66584a,.28,.72)); pivotCap.rotation.x=Math.PI/2; pivotCap.position.y=.1; tonearm.add(pivotCap);
  const armRoot = new THREE.Group(); armRoot.rotation.y=armCurrent; armRoot.position.y=.18; tonearm.add(armRoot);
  const armTube = new THREE.Mesh(new THREE.CylinderGeometry(.075,.105,3.05,20),mat(0x5b5147,.28,.75)); armTube.rotation.x=Math.PI/2; armTube.position.z=-1.52; armTube.castShadow=true; armRoot.add(armTube);
  const counter = new THREE.Mesh(new THREE.CylinderGeometry(.25,.3,.58,32),mat(0x25201b,.3,.72)); counter.rotation.x=Math.PI/2; counter.position.z=.25; armRoot.add(counter);
  const head = new THREE.Mesh(new THREE.BoxGeometry(.28,.16,.48),mat(0x2b241d,.35,.65)); head.position.set(0,.0,-3.03); head.castShadow=true; armRoot.add(head);
  armNeedle = new THREE.Mesh(new THREE.CylinderGeometry(.025,.018,.35,10),mat(0xc3a179,.3,.7)); armNeedle.position.set(0,-.18,-3.23); armNeedle.rotation.x=Math.PI; armRoot.add(armNeedle);
  tonearm.userData.armRoot=armRoot;

  const lightStrip = new THREE.Mesh(new THREE.PlaneGeometry(1.2,.8),new THREE.MeshBasicMaterial({color:0xd4a66d,transparent:true,opacity:.07,side:THREE.DoubleSide})); lightStrip.rotation.x=-Math.PI/2; lightStrip.position.set(-1.2,.52,-1.2); deckGroup.add(lightStrip);

  ready3D=true;
  resize();
  setStatus('3D deck ready');
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
  armTarget=-.52 + p*.28;
}
function render(now){
  const dt=Math.min(clock.getDelta(),.05);
  pointer.lerp(pointerTarget,1-Math.pow(.001,dt));
  if(ready3D){
    const motorTau=spinTarget?1-Math.exp(-dt/.72):1-Math.exp(-dt/1.05);
    spinVelocity += (spinTarget-spinVelocity)*motorTau;
    baseRecordRotation += spinVelocity*dt;
    record.rotation.y=baseRecordRotation;
    recordTop.rotation.z=-baseRecordRotation;
    recordGrooves.rotation.y=baseRecordRotation;
    if(playing) animateArmToTrack();
    armCurrent += (armTarget-armCurrent)*(1-Math.exp(-dt/0.85));
    armLiftCurrent += (armLiftTarget-armLiftCurrent)*(1-Math.exp(-dt/.42));
    tonearm.userData.armRoot.rotation.y=armCurrent;
    tonearm.position.y=.48+armLiftCurrent;
    deckGroup.rotation.y=pointer.x*.065;
    deckGroup.rotation.z=pointer.y*.018;
    camera.position.x += (pointer.x*.42-camera.position.x)*.025;
    camera.position.y += ((6.2+pointer.y*.22)-camera.position.y)*.025;
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
  spinTarget=playing?Math.PI*2/3:0; // one revolution / 3 seconds-ish; eased to 33⅓-feeling
  armLiftTarget=playing?.22:.38;
  if(!playing) setTimeout(()=>{if(!playing) armTarget=-.52},700);
}
function canPlayAudio(){ return Boolean(audio.src) && audio.readyState>=2; }
async function play(){
  if(!currentTrack) return;
  playQueued=true; setStatus('cueing'); spinTarget=Math.PI*2/3; armTarget=-.55; armLiftTarget=.36;
  if(!audioAvailable){
    try{ await audio.play(); audioAvailable=true; }catch{
      setStatus('3D only — add MP3 files to /songs');
      setPlayingState(true);
      return;
    }
  }else{
    try{ await audio.play(); }catch{ setStatus('tap again to start audio'); return; }
  }
  playQueued=false; setPlayingState(true); setStatus('playing'); hint.classList.remove('show');
}
function pause(){ audio.pause(); playQueued=false; setPlayingState(false); setStatus('paused'); }
async function toggle(){ if(playing||playQueued) pause(); else await play(); }
async function next(){
  if(!tracks.length) return;
  let n; do n=Math.floor(Math.random()*tracks.length); while(tracks.length>1&&n===currentIndex);
  selectTrack(n); audio.currentTime=0; await play();
}

recordButton.addEventListener('click',toggle);
armButton.addEventListener('click',next);
recordButton.addEventListener('pointerdown',()=>sceneWrap.classList.add('is-pressed'));
recordButton.addEventListener('pointerup',()=>sceneWrap.classList.remove('is-pressed'));
recordButton.addEventListener('pointercancel',()=>sceneWrap.classList.remove('is-pressed'));

sceneWrap.addEventListener('pointermove',(e)=>{
  if(reduceMotion) return;
  const r=sceneWrap.getBoundingClientRect();
  pointerTarget.x=(e.clientX-r.left)/r.width*2-1;
  pointerTarget.y=(e.clientY-r.top)/r.height*2-1;
});
sceneWrap.addEventListener('pointerleave',()=>pointerTarget.set(0,0));
window.addEventListener('resize',resize,{passive:true});
document.addEventListener('visibilitychange',()=>{ if(document.hidden) spinTarget=0; else spinTarget=playing?Math.PI*2/3:0; });

audio.addEventListener('loadeddata',()=>{ audioAvailable=true; setStatus('audio ready'); });
audio.addEventListener('play',()=>{ if(!playing) setPlayingState(true); });
audio.addEventListener('pause',()=>{ if(playing&&!playQueued) setPlayingState(false); });
audio.addEventListener('timeupdate',()=>{ if(audio.duration) progressEl.style.transform=`scaleX(${Math.min(audio.currentTime/audio.duration,1)})`; });
audio.addEventListener('ended',()=>{ setPlayingState(false); next(); });
audio.addEventListener('error',()=>{ audioAvailable=false; setStatus('3D deck active — audio file missing'); });

let interacted=false;
try{interacted=localStorage.getItem('deck.v2.seen')==='1';}catch{}
setTimeout(()=>{ if(!interacted&&!playing){hint.classList.add('show');} },1600);
function remember(){try{localStorage.setItem('deck.v2.seen','1')}catch{}}
recordButton.addEventListener('click',()=>{interacted=true;remember();hint.classList.remove('show')},{once:false});

setInterval(()=>{
  quietText.classList.add('out');
  setTimeout(()=>{lineIndex=(lineIndex+1)%lines.length;quietText.textContent=lines[lineIndex];quietText.classList.remove('out')},700);
},6200);

if(reduceMotion) setStatus('reduced motion enabled');
if(!('WebGLRenderingContext' in window)) document.documentElement.classList.add('is-no-webgl');

loadTracks();
init3D().catch(err=>{
  console.warn(err);
  document.documentElement.classList.add('is-no-webgl');
  setStatus('static fallback');
});
