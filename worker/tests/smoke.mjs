import assert from 'node:assert/strict';
import worker from '../src/index.js';
const env={ALLOWED_ORIGIN:'https://zbys1av.github.io',GITHUB_OWNER:'zbys1av',GITHUB_REPO:'smakova-liha',GITHUB_BRANCH:'main',GOOGLE_CLIENT_ID:'test.apps.googleusercontent.com'};
const origin='https://zbys1av.github.io';
async function request(path,method='GET',headers={}){return worker.fetch(new Request('https://smakova-test.workers.dev'+path,{method,headers}),env)}
const health=await request('/health');assert.equal(health.status,200);assert.equal((await health.json()).service,'smakova-liha-github');
const preflight=await request('/data','OPTIONS',{Origin:origin,'Access-Control-Request-Method':'PUT'});assert.equal(preflight.status,204);assert.equal(preflight.headers.get('access-control-allow-origin'),origin);
const denied=await request('/data','PUT',{Origin:origin,'Content-Type':'application/json'});assert.equal(denied.status,401);
const noUser=await request('/me','GET',{Origin:origin});assert.equal(noUser.status,401);
const wrongOrigin=await request('/health','GET',{Origin:'https://evil.example'});assert.equal(wrongOrigin.status,403);
const miss=await request('/missing');assert.equal(miss.status,404);
console.log('SMAKOVA Worker smoke: health, CORS, unauthorized write, unauthorized identity, forbidden origin, 404 OK');
