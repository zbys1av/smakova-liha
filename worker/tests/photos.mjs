import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import worker from '../src/index.js';

const key=await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk=await crypto.subtle.exportKey('jwk',key.publicKey);jwk.kid='test-key';
const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url'),now=Math.floor(Date.now()/1000),unsigned=enc({alg:'RS256',kid:'test-key'})+'.'+enc({iss:'https://accounts.google.com',aud:'test-client',exp:now+3600,iat:now,email_verified:true,email:'zbyslav13@gmail.com',sub:'owner'});
const token=unsigned+'.'+Buffer.from(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key.privateKey,new TextEncoder().encode(unsigned))).toString('base64url');
let saved=null,writes=0;globalThis.fetch=async(url,options={})=>{url=String(url);if(url.includes('googleapis.com/oauth2/v3/certs'))return Response.json({keys:[jwk]});if(url.includes('/contents/photos/')){if((options.method||'GET')==='GET')return saved?Response.json({encoding:'base64',content:saved}):new Response('',{status:404});writes++;saved=JSON.parse(options.body).content;return Response.json({content:{sha:'test'}})}throw Error('Unexpected fetch: '+url)};
const env={ALLOWED_ORIGIN:'https://zbys1av.github.io',GITHUB_OWNER:'zbys1av',GITHUB_REPO:'smakova-liha',GITHUB_BRANCH:'main',GOOGLE_CLIENT_ID:'test-client',GITHUB_TOKEN:'test-token'},headers={Origin:env.ALLOWED_ORIGIN,Authorization:'Bearer '+token,'Content-Type':'application/json'};
const call=(data,auth=true)=>worker.fetch(new Request('https://example.test/photo',{method:'PUT',headers:auth?headers:{Origin:env.ALLOWED_ORIGIN,'Content-Type':'application/json'},body:JSON.stringify({data})}),env);
const image='data:image/webp;base64,'+Buffer.from('RIFF1234WEBPcompressed').toString('base64');
assert.equal((await call(image,false)).status,401);assert.equal((await call('data:image/svg+xml;base64,AAAA')).status,400);assert.equal((await call('data:image/webp;base64,AAAA')).status,400);
const first=await call(image);assert.equal(first.status,200);const firstPath=(await first.json()).path;assert.match(firstPath,/^photos\/[a-f0-9]{64}\.webp$/);assert.equal(writes,1);
const second=await call(image);assert.equal(second.status,200);assert.equal((await second.json()).path,firstPath);assert.equal(writes,1,'same photo is not committed twice');
assert.equal((await call('data:image/webp;base64,'+Buffer.alloc(241*1024).toString('base64'))).status,413);
console.log('PASS: photo authorization, format and size validation, content-addressing, deduplication');

