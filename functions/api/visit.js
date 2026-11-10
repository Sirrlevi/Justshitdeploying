const RATE_WINDOW_MS = 60000;
const recentByIp = new Map();
const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }
});
function clean(value, max = 160) {
  return String(value ?? "").replaceAll("\r"," ").replaceAll("\n"," ").replaceAll("\t"," ").split(" ").filter(Boolean).join(" ").slice(0,max);
}
function rateLimited(ip, now) {
  if (!ip) return false;
  const recent = (recentByIp.get(ip)||[]).filter((time)=>now-time<RATE_WINDOW_MS);
  if (recent.length>=30) { recentByIp.set(ip,recent); return true; }
  recent.push(now); recentByIp.set(ip,recent);
  if (recentByIp.size>1500) for (const [key,times] of recentByIp) if (!times.length || now-times[times.length-1]>=RATE_WINDOW_MS) recentByIp.delete(key);
  return false;
}
function limitedNumber(value,min,max) {
  const n=Number(value); return Number.isFinite(n)&&n>=min&&n<=max?n:null;
}
function envCredentials(env) {
  return {
    token: clean(env.TELEGRAM_BOT_TOKEN,200),
    chatId: clean(env.TELEGRAM_CHAT_ID,120)
  };
}
async function telegramCall(token,method,body) {
  const response = await fetch("https://api.telegram.org/bot"+token+"/"+method,{
    method:body?"POST":"GET",
    headers:body?{"Content-Type":"application/json"}:undefined,
    body:body?JSON.stringify(body):undefined
  });
  const result=await response.json().catch(()=>({}));
  return {response,result};
}
export async function onRequestGet({request,env}) {
  const ip=request.headers.get("CF-Connecting-IP")||"";
  if(rateLimited(ip,Date.now())) return json({ok:false,stage:"rate_limited"},429);
  const {token,chatId}=envCredentials(env);
  if(!token||!chatId) return json({ok:false,function:"deployed",tokenConfigured:!!token,chatIdConfigured:!!chatId,stage:"cloudflare_secrets"});
  try {
    const me=await telegramCall(token,"getMe");
    if(!me.response.ok||!me.result?.ok) return json({
      ok:false,function:"deployed",tokenConfigured:true,chatIdConfigured:true,botApi:false,
      stage:"bot_token",detail:clean(me.result?.description||"Telegram rejected the bot token",180)
    });
    const chat=await telegramCall(token,"getChat",{chat_id:chatId});
    if(!chat.response.ok||!chat.result?.ok) return json({
      ok:false,function:"deployed",tokenConfigured:true,chatIdConfigured:true,botApi:true,chatAccessible:false,
      stage:"chat_id_or_bot_access",detail:clean(chat.result?.description||"Telegram cannot access this chat",180)
    });
    return json({ok:true,function:"deployed",tokenConfigured:true,chatIdConfigured:true,botApi:true,chatAccessible:true,stage:"ready"});
  } catch {
    return json({ok:false,function:"deployed",tokenConfigured:!!token,chatIdConfigured:!!chatId,stage:"telegram_network"});
  }
}
export async function onRequestPost({request,env}) {
  const origin=request.headers.get("Origin");
  const requestOrigin=new URL(request.url).origin;
  if(origin&&origin!==requestOrigin) return json({ok:false,code:"origin_rejected"},403);
  if(!(request.headers.get("Content-Type")||"").toLowerCase().includes("application/json")) return json({ok:false,code:"json_required"},415);
  const ip=request.headers.get("CF-Connecting-IP")||"";
  if(rateLimited(ip,Date.now())) return json({ok:false,code:"rate_limited"},429);
  const raw=await request.text();
  if(raw.length>4096) return json({ok:false,code:"payload_too_large"},413);
  let body; try{body=JSON.parse(raw);}catch{return json({ok:false,code:"invalid_json"},400);}
  if(!body||typeof body!=="object"||Array.isArray(body)) return json({ok:false,code:"invalid_payload"},400);
  const name=clean(body.name,24); if(!name) return json({ok:false,code:"name_required"},400);
  const d=body.details&&typeof body.details==="object"&&!Array.isArray(body.details)?body.details:{};
  const ua=clean(request.headers.get("User-Agent"),320);
  const country=clean(request.cf?.country||"unavailable",48);
  const model=clean(d.model||"not exposed by browser",100);
  const battery=d.battery&&typeof d.battery==="object"
    ? (limitedNumber(d.battery.percent,0,100)??"?")+"% · "+(d.battery.charging===true?"charging":d.battery.charging===false?"not charging":"unknown")
    : "not exposed";
  const bot=d.webdriver===true?"webdriver=true (automation signal)":"webdriver=false (not proof of human)";
  const verifiedBot=request.cf?.botManagement?.verifiedBot;
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
    "Cloudflare verified bot: "+(typeof verifiedBot==="boolean"?(verifiedBot?"yes":"no"):"unavailable"),
    "User-Agent: "+ua,
    "No IP, precise location, IMEI, serial number or persistent device ID is included in this report."
  ];
  const message=lines.join("\n").slice(0,3900);
  const {token,chatId}=envCredentials(env);
  if(!token||!chatId) return json({ok:false,code:"missing_cloudflare_secrets"},503);
  try {
    const {response,result}=await telegramCall(token,"sendMessage",{chat_id:chatId,text:message,disable_web_page_preview:true});
    if(!response.ok||!result?.ok) return json({ok:false,code:"telegram_rejected",detail:clean(result?.description||"Telegram sendMessage failed",180)},502);
  } catch {
    return json({ok:false,code:"telegram_network_error"},502);
  }
  return json({ok:true});
}
