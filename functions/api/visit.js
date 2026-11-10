const RATE_WINDOW_MS = 60000;
const recentByIp = new Map();
const json = (value,status=200)=>new Response(JSON.stringify(value),{status,headers:{"Content-Type":"application/json","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
function clean(value,max=160){
  const s=String(value??"").replaceAll("\r"," ").replaceAll("\n"," ").replaceAll("\t"," ");
  return s.split(" ").filter(Boolean).join(" ").slice(0,max);
}
function rateLimited(ip,now){
  if(!ip)return false;
  const recent=(recentByIp.get(ip)||[]).filter((time)=>now-time<RATE_WINDOW_MS);
  if(recent.length>=30){recentByIp.set(ip,recent);return true;}
  recent.push(now);recentByIp.set(ip,recent);
  if(recentByIp.size>1500){
    for(const [key,times] of recentByIp){
      if(!times.length||now-times[times.length-1]>=RATE_WINDOW_MS)recentByIp.delete(key);
    }
  }
  return false;
}
function limitedNumber(value,min,max){
  const n=Number(value);
  return Number.isFinite(n)&&n>=min&&n<=max?n:null;
}
export async function onRequestPost({request,env}){
  const origin=request.headers.get("Origin");
  const requestOrigin=new URL(request.url).origin;
  if(!origin||origin!==requestOrigin)return json({ok:false},403);
  if(!(request.headers.get("Content-Type")||"").toLowerCase().includes("application/json"))return json({ok:false},415);
  const ip=request.headers.get("CF-Connecting-IP")||"";
  if(rateLimited(ip,Date.now()))return json({ok:false},429);
  const raw=await request.text();
  if(raw.length>4096)return json({ok:false},413);
  let body;
  try{body=JSON.parse(raw);}catch{return json({ok:false},400);}
  if(!body||typeof body!=="object"||Array.isArray(body))return json({ok:false},400);
  const name=clean(body.name,24);
  if(!name)return json({ok:false},400);
  const d=body.details&&typeof body.details==="object"&&!Array.isArray(body.details)?body.details:{};
  const ua=clean(request.headers.get("User-Agent"),320);
  const country=clean(request.cf?.country||"unavailable",48);
  const model=clean(d.model||"not exposed by browser",100);
  const battery=d.battery&&typeof d.battery==="object"
    ? (limitedNumber(d.battery.percent,0,100)??"?")+"% · "+(d.battery.charging===true?"charging":d.battery.charging===false?"not charging":"unknown")
    : "not exposed";
  const bot=d.webdriver===true?"webdriver=true (automation signal)":"webdriver=false (not proof of human)";
  const cfBot=request.cf?.botManagement?.verifiedBot;
  const lines=[
    "CONSENTED WEBSITE VISIT",
    "Name: "+name,
    "Time UTC: "+new Date().toISOString(),
    "Approx country: "+country,
    "Device type: "+(typeof d.mobile==="boolean"?(d.mobile?"mobile":"desktop"):"not exposed"),
    "Device model: "+model,
    "Platform: "+clean(d.platform,80)+" "+clean(d.platformVersion,48),
    "Browser brands: "+clean(d.browserBrands,180),
    "Screen: "+clean(d.screen,40)+"; viewport: "+clean(d.viewport,40)+"; DPR: "+(limitedNumber(d.pixelRatio,.5,8)??"?"),
    "Language: "+clean(d.language,80)+"; timezone: "+clean(d.timezone,80),
    "Memory GB: "+(limitedNumber(d.deviceMemoryGB,.25,1024)??"?")+"; cores: "+(limitedNumber(d.logicalCores,1,512)??"?")+"; touch: "+(limitedNumber(d.touchPoints,0,100)??"?"),
    "Battery: "+battery,
    "Automation signal: "+bot,
    "Cloudflare verified bot: "+(typeof cfBot==="boolean"?(cfBot?"yes":"no"):"unavailable"),
    "User-Agent: "+ua,
    "No IP, precise location, IMEI, serial number or persistent device ID is included in this report."
  ];
  const message=lines.join("\n").slice(0,3900);
  const token=env.TELEGRAM_BOT_TOKEN;
  const chatId=env.TELEGRAM_CHAT_ID;
  if(!token||!chatId)return json({ok:false},503);
  let response;
  try{
    response=await fetch("https://api.telegram.org/bot"+token+"/sendMessage",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({chat_id:chatId,text:message,disable_web_page_preview:true})
    });
  }catch{return json({ok:false},502);}
  if(!response.ok)return json({ok:false},502);
  let result;
  try{result=await response.json();}catch{return json({ok:false},502);}
  if(!result?.ok)return json({ok:false},502);
  return json({ok:true});
}
export async function onRequestGet(){return json({ok:false,error:"method_not_allowed"},405);}
