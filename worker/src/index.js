function validLeague(d){return !!d&&d.version===1&&Array.isArray(d.dishes)&&Array.isArray(d.history)&&d.tournaments&&typeof d.tournaments==='object'&&!Array.isArray(d.tournaments)&&Array.isArray(d.champions)&&d.freePairs&&typeof d.freePairs==='object'&&d.dishes.length<10000&&d.history.length<200000&&d.dishes.every(x=>x&&typeof x.id==='string'&&typeof x.name==='string'&&typeof x.category==='string'&&(x.venueName===undefined||typeof x.venueName==='string')&&(x.venueAddress===undefined||typeof x.venueAddress==='string'));}
function validData(d){return validLeague(d)&&(d.restaurant===undefined||(validLeague(d.restaurant)&&d.restaurant.restaurant===undefined));}
// MEDIA / LOG secure GitHub JSON sync — Cloudflare Worker (ES module).
// Never place GITHUB_TOKEN in frontend files or [vars].
const OWNER_EMAIL = 'zbyslav13@gmail.com';
const asJson = (value, status=200) => new Response(JSON.stringify(value), {status, headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'}});
const failure=(status,error)=>asJson({error},status);
const base64url=(s)=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),x=>x.charCodeAt(0));
function utf8b64(s){const bytes=new TextEncoder().encode(s);let b='';for(let i=0;i<bytes.length;i+=8192)b+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(b);}
function unb64(s){return new TextDecoder().decode(base64url(s.replace(/\s/g,'')));}
let keys=null,expires=0;
async function verifyIdentity(req,env){
 const a=/^Bearer\s+([^\s]+)$/i.exec(req.headers.get('authorization')||'');if(!a)throw Object.assign(new Error('Увійди через Google'),{status:401});
 const parts=a[1].split('.');if(parts.length!==3)throw Object.assign(new Error('Некоректний токен'),{status:401});
 let head,p;try{head=JSON.parse(unb64(parts[0]));p=JSON.parse(unb64(parts[1]));}catch{throw Object.assign(new Error('Некоректний токен'),{status:401});}
 if(head.alg!=='RS256'||!head.kid||!env.GOOGLE_CLIENT_ID)throw Object.assign(new Error('Google OAuth не налаштовано'),{status:401});
 if(!keys||Date.now()>expires){const r=await fetch('https://www.googleapis.com/oauth2/v3/certs');if(!r.ok)throw Error('Google keys unavailable');keys=(await r.json()).keys;expires=Date.now()+600000;}
 const jwk=keys.find(k=>k.kid===head.kid&&k.kty==='RSA');if(!jwk)throw Object.assign(new Error('Unknown Google key'),{status:401});
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 const ok=await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,base64url(parts[2]),new TextEncoder().encode(parts[0]+'.'+parts[1]));
 const now=Math.floor(Date.now()/1000);
 if(!ok||!['accounts.google.com','https://accounts.google.com'].includes(p.iss)||p.aud!==env.GOOGLE_CLIENT_ID||typeof p.exp!=='number'||p.exp<=now||typeof p.iat!=='number'||p.iat>now+120||p.email_verified!==true||String(p.email||'').toLowerCase()!==OWNER_EMAIL||!p.sub||(env.GOOGLE_ALLOWED_SUB&&p.sub!==env.GOOGLE_ALLOWED_SUB))throw Object.assign(new Error('Цей Google-акаунт не має прав запису'),{status:401});
 return {email:p.email,sub:p.sub};
}
function endpoint(env){if(!/^[\w.-]+$/.test(env.GITHUB_OWNER||'')||!/^[\w.-]+$/.test(env.GITHUB_REPO||''))throw Error('GitHub settings missing');return 'https://api.github.com/repos/'+encodeURIComponent(env.GITHUB_OWNER)+'/'+encodeURIComponent(env.GITHUB_REPO)+'/contents/data.json';}
async function github(env,method,body){
 const token=String(env.GITHUB_TOKEN||'').trim();
 if(!token)throw Object.assign(new Error('Cloudflare Secret GITHUB_TOKEN is missing; update it in Worker settings'),{status:503});
 if(/^(Bearer|token)\s/i.test(token))throw Object.assign(new Error('GITHUB_TOKEN should contain only the raw GitHub token, without Bearer/token prefix'),{status:503});
 const url=endpoint(env)+(method==='GET'?'?ref='+encodeURIComponent(env.GITHUB_BRANCH||'main'):'');
 return fetch(url,{method,headers:{authorization:'Bearer '+token,accept:'application/vnd.github+json','x-github-api-version':'2022-11-28','user-agent':'SMAKOVA-LIHA-Cloudflare-Worker',...(body?{'content-type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});
}
// Safe, read-only diagnostics for denied writes; no token is returned or logged.
async function diagnoseGithubToken(env){
 const headers={authorization:'Bearer '+env.GITHUB_TOKEN,accept:'application/vnd.github+json','x-github-api-version':'2022-11-28','user-agent':'SMAKOVA-LIHA-Cloudflare-Worker'};
 const result={};
 try{
  const r=await fetch('https://api.github.com/user',{headers});
  result.userHttp=r.status;
  if(r.ok){const profile=await r.json();result.login=profile.login||null;}
 }catch{result.userHttp='unavailable';}
 try{
  const r=await fetch('https://api.github.com/repos/'+encodeURIComponent(env.GITHUB_OWNER)+'/'+encodeURIComponent(env.GITHUB_REPO),{headers});
  result.repoHttp=r.status;
  if(r.ok){const repository=await r.json();result.repoPush=repository.permissions?.push===true;result.repoAdmin=repository.permissions?.admin===true;result.repoFullName=repository.full_name||null;}
 }catch{result.repoHttp='unavailable';}
 return result;
}
// Read with the configured GitHub token whenever available: Cloudflare's shared
// anonymous GitHub API rate limit can otherwise break public repository reads.
// If the token has been rotated or revoked, public data remains readable.
async function githubRead(url,headers){
 let last;
 for(let attempt=0;attempt<3;attempt++){
  try{
   last=await fetch(url,{method:'GET',cache:'no-store',headers});
   if(last.ok||![429,500,502,503,504].includes(last.status)||attempt===2)return last;
  }catch(e){if(attempt===2)throw e;}
  await new Promise(resolve=>setTimeout(resolve,300*(attempt+1)));
 }
 return last;
}
async function remote(env){
 const url=endpoint(env)+'?ref='+encodeURIComponent(env.GITHUB_BRANCH||'main');
 const headers={
  accept:'application/vnd.github+json',
  'x-github-api-version':'2022-11-28',
  'user-agent':'SMAKOVA-LIHA-Cloudflare-Worker',
  'cache-control':'no-cache'
 };
 const token=String(env.GITHUB_TOKEN||'').trim();
 if(token&&!/^(Bearer|token)\\s/i.test(token))headers.authorization='Bearer '+token;
 let res;
 try{
  res=await githubRead(url,headers);
  // Bad/expired PAT must not prevent anonymous reads of this public repository.
  if(!res.ok&&[401,403,404].includes(res.status)&&headers.authorization){
   delete headers.authorization;
   res=await githubRead(url,headers);
  }
 }catch{
  throw Object.assign(new Error('GitHub could not be reached; try again shortly'),{status:502});
 }
 if(res.status===404)return null;
 if(!res.ok){
  const body=await res.json().catch(()=>({}));
  const reason=typeof body?.message==='string'?body.message.slice(0,160):'GitHub returned an error';
  throw Object.assign(new Error('GitHub read ('+res.status+'): '+reason),{status:502});
 }
 const f=await res.json().catch(()=>null);
 if(f?.type!=='file'||f.encoding!=='base64'||!f.sha||!f.content)throw Object.assign(new Error('GitHub file response has an unexpected format'),{status:502});
 let data;
 try{data=JSON.parse(unb64(f.content));}catch{throw Object.assign(new Error('GitHub data.json could not be decoded'),{status:502});}
 if(!validData(data))throw Object.assign(new Error('Invalid GitHub data.json'),{status:502});
 return {data,sha:f.sha};
}
// Content-addressed images: bounded, authenticated and never overwritten.
async function uploadPhoto(req,env){
 await verifyIdentity(req,env);
 const length=Number(req.headers.get('content-length')||0);if(length>350000)return failure(413,'Photo too large');
 const text=await req.text();if(text.length>350000)return failure(413,'Photo too large');
 let body;try{body=JSON.parse(text)}catch{return failure(400,'Invalid photo JSON')}
 const match=/^data:image\/(webp|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(body?.data||'');if(!match)return failure(400,'Only WebP or JPEG images are supported');
 let raw;try{raw=Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0))}catch{return failure(400,'Invalid image encoding')}
 if(!raw.length||raw.length>240*1024)return failure(413,'Photo too large');
 const webp=raw.length>=12&&String.fromCharCode(...raw.slice(0,4))==='RIFF'&&String.fromCharCode(...raw.slice(8,12))==='WEBP',jpeg=raw.length>=3&&raw[0]===255&&raw[1]===216&&raw[2]===255;
 if(match[1]==='webp'?!webp:!jpeg)return failure(400,'Image format mismatch');
 const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',raw)),x=>x.toString(16).padStart(2,'0')).join('');
 const path='photos/'+digest+(webp?'.webp':'.jpg'),base=endpoint(env).replace(/data\.json$/,path),branch=env.GITHUB_BRANCH||'main',token=String(env.GITHUB_TOKEN||'').trim();
 if(!token||/^(Bearer|token)\s/i.test(token))throw Object.assign(new Error('GitHub token unavailable'),{status:503});
 const headers={authorization:'Bearer '+token,accept:'application/vnd.github+json','x-github-api-version':'2022-11-28','user-agent':'SMAKOVA-LIHA-Cloudflare-Worker'};
 async function existing(){const r=await fetch(base+'?ref='+encodeURIComponent(branch),{headers});if(r.status===404)return false;if(!r.ok)throw Object.assign(new Error('GitHub photo lookup failed'),{status:502});const payload=await r.json();if(payload.encoding!=='base64'||!payload.content)throw Object.assign(new Error('Invalid existing photo'),{status:502});const bytes=base64url(payload.content.replace(/\s/g,'')),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');if(hash!==digest)throw Object.assign(new Error('Existing photo does not match its name'),{status:409});return true}
 if(await existing())return asJson({path});
 const result=await fetch(base,{method:'PUT',headers:{...headers,'content-type':'application/json'},body:JSON.stringify({message:'Смакова ліга · фото страви',content:match[2],branch})});
 if([409,422].includes(result.status)&&await existing())return asJson({path});
 if(!result.ok)throw Object.assign(new Error('GitHub photo upload failed'),{status:502});
 return asJson({path});
}
export default {async fetch(req,env){
 const origin=req.headers.get('origin');const allowed=String(env.ALLOWED_ORIGIN||'').replace(/\/$/,'');
 if(origin&&origin!==allowed)return failure(403,'Origin not allowed');
 const cors={'vary':'Origin',...(origin?{'access-control-allow-origin':allowed,'access-control-allow-methods':'GET,PUT,OPTIONS','access-control-allow-headers':'Authorization,Content-Type','access-control-max-age':'600'}:{})};
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 const path=new URL(req.url).pathname;let result;
 try{
 if(path==='/health'&&req.method==='GET')result=asJson({ok:true,service:'smakova-liha-github'});
 else if(path==='/data'&&req.method==='GET'){const f=await remote(env);result=f?asJson(f):failure(404,'data.json not found');}
 else if(path==='/me'&&req.method==='GET'){const user=await verifyIdentity(req,env);result=asJson({authorized:true,email:user.email});}
 else if(path==='/photo'&&req.method==='PUT')result=await uploadPhoto(req,env);
 else if(path==='/data'&&req.method==='PUT'){
   const user=await verifyIdentity(req,env);const text=await req.text();
   if(text.length>5000000)result=failure(413,'JSON too large');
   else {const body=JSON.parse(text);const data=body?.data;
     if(!validData(data))result=failure(400,'Invalid Смакова ліга JSON');
     else {const prev=await remote(env);if((prev?.sha||null)!==(body.expectedSha||null))result=failure(409,'Cloud version changed — reload before saving');
     else {const change={message:'Смакова ліга · cloud save ('+data.history.length+' matches)',content:utf8b64(JSON.stringify(data,null,2)+'\n'),branch:env.GITHUB_BRANCH||'main',...(prev?{sha:prev.sha}:{})};
      const out=await github(env,'PUT',change);
      if(out.status===409||out.status===422)result=failure(409,'GitHub conflict');
      else if(!out.ok){
       const ghError=await out.json().catch(()=>({}));
       const ghMsg=typeof ghError?.message==='string'?ghError.message.slice(0,200):'GitHub write was denied';
       const required=out.headers.get('x-accepted-github-permissions')||'not returned';
       let diag={};
       if(out.status===403||out.status===401)diag=await diagnoseGithubToken(env);
       // The diagnostic is visible only after valid Google sign-in, not to unauthenticated visitors.
       result=failure(502,'GitHub write rejected ('+out.status+'): '+ghMsg
        +' | Required: '+required
        +' | Token user: '+(diag.login||'unknown')+' (HTTP '+(diag.userHttp||'?')+')'
        +' | Repository: '+(diag.repoFullName||'unknown')+' (HTTP '+(diag.repoHttp||'?')+', push='+(diag.repoPush===true?'yes':diag.repoPush===false?'no':'unknown')+')');
      }
      else {const body=await out.json();result=asJson({saved:true,sha:body.content?.sha,commit:body.commit?.sha,email:user.email});}
     }}
   }
 }else result=failure(404,'Not found');
 }catch(e){result=failure(e.status||(/SyntaxError/.test(e.name)?400:500),e.status?e.message:'Cloud synchronization error');}
 const h=new Headers(result.headers);for(const [k,v] of Object.entries(cors))h.set(k,v);return new Response(result.body,{status:result.status,headers:h});
}};