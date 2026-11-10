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
    token: String(env.TELEGRAM_BOT_TOKEN ?? "").trim(),
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
function shown(value,max=160) {
  return value===null||value===undefined||value==="" ? "Unavailable" : (clean(value,max)||"Unavailable");
}
function shownNumber(value,min,max,suffix="") {
  if(value===null||value===undefined||value==="") return "Unavailable";
  const n=limitedNumber(value,min,max);
  return n===null ? "Unavailable" : String(n)+suffix;
}
function yesNo(value) {
  return typeof value==="boolean" ? (value?"Yes":"No") : "Unknown / not exposed";
}
function dimensions(width,height) {
  return Number.isFinite(width)&&Number.isFinite(height) ? Math.round(width)+" × "+Math.round(height) : "Unavailable";
}
function countryLabel(code) {
  if(!code||code==="XX"||code==="T1") return "Unavailable";
  try {
    const name=new Intl.DisplayNames(["en"],{type:"region"}).of(code);
    return name&&name!==code ? name : code;
  } catch { return code; }
}
function continentLabel(code) {
  return ({
    AF:"Africa",AN:"Antarctica",AS:"Asia",EU:"Europe",
    NA:"North America",OC:"Oceania",SA:"South America"
  })[code]||code||"Unavailable";
}
const ATTRIBUTION_PARAMS = new Set(["utm_source","utm_medium","utm_campaign","utm_content","utm_term","fbclid","gclid","igshid"]);
function safeUrl(value,expectedOrigin=null) {
  if(!value) return "";
  try {
    const url=new URL(String(value));
    if(url.protocol!=="https:"&&url.protocol!=="http:") return "";
    if(expectedOrigin&&url.origin!==expectedOrigin) return "";
    url.username="";
    url.password="";
    url.hash="";
    for(const key of [...url.searchParams.keys()]) {
      if(!ATTRIBUTION_PARAMS.has(key.toLowerCase())) url.searchParams.delete(key);
    }
    return url.toString().slice(0,700);
  } catch { return ""; }
}
function browserName(ua) {
  const instagram=ua.match(/Instagram\/([\d.]+)/i)?.[1];
  const edge=ua.match(/(?:EdgA|EdgiOS|Edg)\/([\d.]+)/i)?.[1];
  const chrome=ua.match(/(?:Chrome|CriOS)\/([\d.]+)/i)?.[1];
  const firefox=ua.match(/(?:Firefox|FxiOS)\/([\d.]+)/i)?.[1];
  const samsung=ua.match(/SamsungBrowser\/([\d.]+)/i)?.[1];
  const safari=ua.match(/Version\/([\d.]+).*Safari/i)?.[1];
  const engine= edge ? "Edge "+edge : samsung ? "Samsung Internet "+samsung :
    firefox ? "Firefox "+firefox : chrome ? ((/\bwv\b/i.test(ua)||/; wv\)/i.test(ua)) ? "Chrome WebView "+chrome : "Chrome/Chromium "+chrome :
    safari ? "Safari "+safari : "Unavailable";
  return instagram ? "Instagram in-app "+instagram+" · "+engine : engine;
}
export async function onRequestGet({request,env}) {
  const ip=request.headers.get("CF-Connecting-IP")||"";
  if(rateLimited(ip,Date.now())) return json({ok:false,stage:"rate_limited"},429);
  const {token,chatId}=envCredentials(env);
  if(!token||!chatId) return json({ok:false,function:"deployed",tokenConfigured:!!token,chatIdConfigured:!!chatId,stage:"cloudflare_secrets"});
  try {
    const me=await telegramCall(token,"getMe");
    if(!me.response.ok||!me.result?.ok) {
      const rawToken=String(env.TELEGRAM_BOT_TOKEN ?? "");
      const normalizedToken=rawToken.trim();
      return json({
        ok:false,function:"deployed",tokenConfigured:true,chatIdConfigured:true,botApi:false,
        stage:"bot_token",detail:clean(me.result?.description||"Telegram rejected the bot token",180),
        tokenLength:normalizedToken.length,
        tokenFormatLooksValid:/^\d{5,15}:[A-Za-z0-9_-]{20,}$/.test(normalizedToken),
        tokenHasOuterWhitespace:rawToken!==normalizedToken,
        tokenHasInternalWhitespace:/\s/.test(normalizedToken),
        tokenHasBotPrefix:/^bot\s/i.test(normalizedToken)
      });
    }
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
  const ipForRateLimit=request.headers.get("CF-Connecting-IP")||"";
  if(rateLimited(ipForRateLimit,Date.now())) return json({ok:false,code:"rate_limited"},429);
  const raw=await request.text();
  if(raw.length>8192) return json({ok:false,code:"payload_too_large"},413);
  let body; try{body=JSON.parse(raw);}catch{return json({ok:false,code:"invalid_json"},400);}
  if(!body||typeof body!=="object"||Array.isArray(body)) return json({ok:false,code:"invalid_payload"},400);
  const name=clean(body.name,24); if(!name) return json({ok:false,code:"name_required"},400);
  const d=body.details&&typeof body.details==="object"&&!Array.isArray(body.details)?body.details:{};
  const cf=request.cf||{};
  const ip=clean(request.headers.get("CF-Connecting-IP")||"",80)||"Unavailable";
  const countryCode=clean(cf.country||request.headers.get("CF-IPCountry")||"",8).toUpperCase();
  const country=countryCode&&countryCode!=="XX"&&countryCode!=="T1" ? countryLabel(countryCode)+" ("+countryCode+")" : "Unavailable";
  const latitude=limitedNumber(cf.latitude,-90,90);
  const longitude=limitedNumber(cf.longitude,-180,180);
  const coordinates=latitude!==null&&longitude!==null ? latitude.toFixed(4)+", "+longitude.toFixed(4)+" (approx. IP location)" : "Unavailable";
  const ua=clean(request.headers.get("User-Agent")||"",760);
  const pageUrl=safeUrl(d.pageUrl,requestOrigin);
  const referrerUrl=safeUrl(d.referrer);
  const page=pageUrl?new URL(pageUrl):null;
  const clientDate=d.clientTimestamp?new Date(d.clientTimestamp):null;
  const clientTimestamp=clientDate&&Number.isFinite(clientDate.getTime())?clientDate.toISOString():"Unavailable";
  const battery=d.battery&&typeof d.battery==="object"&&d.battery.percent!==null&&d.battery.percent!==undefined
    ? shownNumber(d.battery.percent,0,100,"%")+" · "+(d.battery.charging===true?"Charging":d.battery.charging===false?"Not charging":"Charging status unavailable")
    : "Unavailable (browser did not expose Battery API)";
  const display=d.display&&typeof d.display==="object"?d.display:{};
  const storage=d.storage&&typeof d.storage==="object"?d.storage:{};
  const connection=d.network&&typeof d.network==="object"?d.network:null;
  const privacy=d.privacy&&typeof d.privacy==="object"?d.privacy:{};
  const browser=browserName(ua);
  const verifiedBot=cf.botManagement?.verifiedBot;
  const webdriver=typeof d.webdriver==="boolean"?(d.webdriver?"Yes (automation flag set)":"No automation flag reported"):"Unavailable";
  const mobile=typeof d.mobile==="boolean"?(d.mobile?"Yes":"No"):"Unknown";
  const localStorageInfo=storage.localStorage&&typeof storage.localStorage==="object"
    ? (storage.localStorage.available===true?"Available · "+shownNumber(storage.localStorage.keyCount,0,10000)+" keys":storage.localStorage.available===false?"Unavailable / blocked":"Unknown")
    : "Unavailable";
  const sessionStorageInfo=storage.sessionStorage&&typeof storage.sessionStorage==="object"
    ? (storage.sessionStorage.available===true?"Available · "+shownNumber(storage.sessionStorage.keyCount,0,10000)+" keys":storage.sessionStorage.available===false?"Unavailable / blocked":"Unknown")
    : "Unavailable";
  const connectionSummary=connection
    ? [
        "Type: "+shown(connection.type,32),
        "Effective: "+shown(connection.effectiveType,16),
        "RTT: "+shownNumber(connection.rtt,0,60000," ms"),
        "Downlink: "+shownNumber(connection.downlinkMbps,0,10000," Mbps"),
        "Save Data: "+yesNo(connection.saveData)
      ].join(" · ")
    : "Unavailable (Network Information API not exposed)";
  const clientLocalTime=shown(d.clientLocalTime,100);
  const browserBrands=shown(d.browserBrands,180);
  const platform=shown(d.platform,60);
  const platformVersion=shown(d.platformVersion,40);
  const platformLine=platform==="Unavailable"? "Unavailable" : platform+(platformVersion!=="Unavailable"?" "+platformVersion:"");
  const region=shown(cf.region,100)+(cf.regionCode?" ("+clean(cf.regionCode,12)+")":"");
  const asn=cf.asn!==undefined&&cf.asn!==null?"AS"+shownNumber(cf.asn,1,4294967295):"Unavailable";
  const asOrg=shown(cf.asOrganization,160);
  const cfNetwork=[
    "ASN: "+asn,
    "ASN organization: "+asOrg,
    "ISP: Not separately identified by Cloudflare",
    "Cloudflare colo: "+shown(cf.colo,12),
    "TCP RTT: "+shownNumber(cf.clientTcpRtt,0,60000," ms"),
    "HTTP: "+shown(cf.httpProtocol,24),
    "TLS: "+shown(cf.tlsVersion,24)
  ].join("\n│  ");
  const extraIpData="Unavailable (Cloudflare does not provide these fields; no separate IP intelligence database is configured)";
  const lines=[
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "             📡 VISITOR TELEMETRY",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
    "┌── VISITOR & TIMESTAMP",
    "│",
    "│  👤 Name: "+name,
    "│  ⏱️ Server received (UTC): "+new Date().toISOString(),
    "│  🕐 Browser local time: "+clientLocalTime,
    "│  🌐 Client timestamp (UTC): "+clientTimestamp,
    "└──",
    "",
    "┌── IP & GEOLOCATION (Cloudflare edge; approximate)",
    "│",
    "│  🌐 IP seen by Cloudflare: "+ip,
    "│  🌍 Country: "+country,
    "│  🏙️ City: "+shown(cf.city,100),
    "│  🗺️ Region: "+region,
    "│  📮 Postal code: "+shown(cf.postalCode,24),
    "│  📍 Coordinates: "+coordinates,
    "│  🕐 IP timezone: "+shown(cf.timezone,80),
    "│  🌐 Continent: "+continentLabel(clean(cf.continent,4).toUpperCase()),
    "│  🛡️ Proxy/VPN: Unknown (no VPN-detection source configured)",
    "│",
    "│  Currency / languages / area / population / capital / TLD / calling code:",
    "│  "+extraIpData,
    "└──",
    "",
    "┌── NETWORK (Cloudflare-observed)",
    "│",
    "│  🔌 "+cfNetwork,
    "│  🔗 Local/private LAN IPs: Not collected",
    "└──",
    "",
    "┌── DEVICE (browser-reported; may be withheld)",
    "│",
    "│  🏷️ Brand: "+shown(d.brand,80),
    "│  📱 Model: "+shown(d.model,100),
    "│  ⚙️ Platform: "+platformLine,
    "│  🧠 Architecture: "+shown(d.architecture,40),
    "│  📊 Bitness: "+shown(d.bitness,12),
    "│  💻 64-bit WOW: "+yesNo(d.wow64),
    "│  📱 Mobile: "+mobile,
    "└──",
    "",
    "┌── BROWSER",
    "│",
    "│  🌐 Browser: "+browser,
    "│  🏷️ Client hints brands: "+browserBrands,
    "│  🔍 User-Agent: "+(ua||"Unavailable"),
    "└──",
    "",
    "┌── DISPLAY",
    "│",
    "│  🖥️ Screen: "+dimensions(display.screenWidth,display.screenHeight),
    "│  📐 Available: "+dimensions(display.availableWidth,display.availableHeight),
    "│  👁️ Viewport: "+dimensions(display.viewportWidth,display.viewportHeight),
    "│  🖼️ Outer: "+dimensions(display.outerWidth,display.outerHeight),
    "│  🔎 Visual viewport: "+dimensions(display.visualWidth,display.visualHeight)+" · scale "+shownNumber(display.visualScale,0,10),
    "│  🔍 Pixel ratio: "+shownNumber(display.pixelRatio,0.1,10),
    "│  🎨 Color depth: "+shownNumber(display.colorDepth,1,128," bit"),
    "│  🖱️ Touch points: "+shownNumber(d.touchPoints,0,100),
    "│  🔄 Orientation: "+shown(display.orientation,32),
    "└──",
    "",
    "┌── LOCALE",
    "│",
    "│  🌐 Language: "+shown(d.language,40),
    "│  🌍 Languages: "+shown(d.languages,100),
    "│  🕐 Timezone: "+shown(d.timezone,80),
    "│  ⏱️ UTC offset: "+shownNumber(d.utcOffsetMinutes,-840,840," minutes"),
    "└──",
    "",
    "┌── STORAGE",
    "│",
    "│  🍪 Cookies enabled: "+yesNo(storage.cookiesEnabled),
    "│  🗄️ LocalStorage: "+localStorageInfo,
    "│  📦 SessionStorage: "+sessionStorageInfo,
    "│  🗃️ IndexedDB supported: "+yesNo(storage.indexedDBAvailable),
    "└──",
    "",
    "┌── HARDWARE",
    "│",
    "│  🧠 CPU cores reported: "+shownNumber(d.logicalCores,1,512),
    "│  💾 Device memory: "+shownNumber(d.deviceMemoryGB,0.1,1024," GB"),
    "│  🔋 Battery: "+battery,
    "│  🖱️ Max touch points: "+shownNumber(d.touchPoints,0,100),
    "└──",
    "",
    "┌── NETWORK CONNECTION (browser API)",
    "│",
    "│  📶 "+connectionSummary,
    "└──",
    "",
    "┌── PAGE & SOURCE",
    "│",
    "│  🔗 Visited URL: "+(pageUrl||"Unavailable (URL did not match this site origin)"),
    "│  🏠 Origin: "+(page?page.origin:"Unavailable"),
    "│  📂 Path: "+(page?page.pathname+page.search:"Unavailable"),
    "│  🖥️ Host: "+(page?page.host:"Unavailable"),
    "│  🔐 Protocol: "+(page?page.protocol.replace(":",""):"Unavailable"),
    "│  📝 Page title: "+shown(d.pageTitle,180),
    "│  ↩️ Referrer/source: "+(referrerUrl||"Direct / unavailable (browser did not provide a referrer)"),
    "│  ℹ️ Non-attribution query parameters and URL fragments are omitted",
    "└──",
    "",
    "┌── PRIVACY & COLLECTION LIMITS",
    "│",
    "│  🚫 Do Not Track: "+shown(privacy.doNotTrack,24),
    "│  🛡️ Global Privacy Control: "+yesNo(privacy.globalPrivacyControl),
    "│  🤖 navigator.webdriver: "+webdriver,
    "│  🤖 Cloudflare verified bot: "+(typeof verifiedBot==="boolean"?(verifiedBot?"Yes":"No"):"Unavailable"),
    "│  🎨 Canvas fingerprint: Not collected",
    "│  🔤 Installed-font enumeration: Not collected",
    "│  🎮 WebGL renderer fingerprint: Not collected",
    "│  🔊 Audio fingerprint: Not collected",
    "│  📍 GPS / precise location: Not requested or collected",
    "│  🪪 IMEI / serial / persistent device ID: Not collected",
    "└──",
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "✅ Sent to Telegram only after explicit visitor consent."
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
