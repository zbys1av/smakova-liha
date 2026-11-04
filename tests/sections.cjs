// Dependency-free regression coverage of the actual application script.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const source=html.match(/<script>\s*('use strict';[\s\S]*?)<\/script>/)[1];
function boot(stored,mode='home'){
 const values=new Map(stored?[['smakova-liga-v1',JSON.stringify(stored)]]:[]);
 values.set('smakova-liha-food-mode-v1',mode);
 const events={},windowEvents={};
 const element={innerHTML:'',textContent:'',classList:{add(){},remove(){},toggle(){}},addEventListener(type,fn){events['import:'+type]=fn}};
 const ctx={console,Date,Math,JSON,Map,Set,Number,String,Object,Array,RegExp,Boolean,Promise,
  setTimeout(){return 1},clearTimeout(){},confirm:()=>true,location:{protocol:'file:'},
  FormData:class{constructor(form){this.data=form.data}get(k){return this.data[k]??null}},
  localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},
  document:{documentElement:{dataset:{}},querySelector:s=>['#app','#toast','#importFile'].includes(s)?element:null,addEventListener:(k,fn)=>events[k]=fn},
  window:{SMAKOVA_UI:{controls:()=>'',apply(){}},scrollTo(){},addEventListener:(k,fn)=>windowEvents[k]=fn}};
 vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'dish-appearance.js'),'utf8'),ctx);vm.runInContext(source,ctx);
 return {ctx,values,events,windowEvents,element,run:code=>vm.runInContext(code,ctx)};
}
async function main(){
 const app=boot();const run=app.run;
 assert.equal(run('state.dishes.length'),42);
 const original=run('JSON.stringify(state)');
 const base={name:'Test',type:'Торт / пиріг',category:'Десерт',tasteTags:[],tasteCustom:''};app.ctx.iconTest=base;
 const plain=run('renderDishIcon(iconTest)');for(const country of ['JP','UA','IT','']){app.ctx.iconTest={...base,cuisineCountry:country};assert.equal(run('renderDishIcon(iconTest)'),plain,'country must not affect dish SVG')}assert.match(run("cuisineFlag({cuisineCountry:'JP'})"),/flags\/jp.svg/);
 for(const changed of [{category:'Перше'},{type:'Суп / перше'},{tasteTags:['Шоколадне']},{tasteCustom:'святкове'}]){app.ctx.iconTest={...base,...changed};assert.notEqual(run('renderDishIcon(iconTest)'),plain)}
 app.ctx.iconTest={...base,tasteTags:['Солодке','Ягідне']};const sorted=run('renderDishIcon(iconTest)');app.ctx.iconTest.tasteTags.reverse();assert.equal(run('renderDishIcon(iconTest)'),sorted);
 assert.equal(run('JSON.stringify(state)'),original,'rendering icons never mutates saved state');
 app.ctx.iconTest={...base,tasteCustom:'<script>alert(1)</script>'};assert.doesNotMatch(run('renderDishIcon(iconTest)'),/<script>/);
 const optional=boot(); optional.run("switchFoodMode('restaurant');ui.modal={type:'add'}");optional.events.submit({target:{id:'dishForm',data:{name:'Без закладу',category:'Друге',cuisineCountry:'JP'}},preventDefault(){}});assert.equal(optional.run('state.dishes.length'),1);assert.equal(optional.run('state.dishes[0].cuisineCountry'),'JP');assert.match(optional.run('cuisineFlag(state.dishes[0])'),/flags\/jp.svg/);assert.equal(optional.run("resolveCountry('  Бразилія  ')"),'BR');assert.equal(optional.run("resolveCountry('Mexico')"),'MX');assert.equal(optional.run("resolveCountry('сша')"),'US');assert.equal(optional.run("resolveCountry('не країна')"),null);assert.equal(optional.run("typeLabel('Рис / крупа')"),'Страви зі злаків');assert.equal(optional.run('CUISINE_COUNTRIES.length'),249);assert.equal(optional.run('cuisineFlag({})'),'');
 run("switchFoodMode('restaurant')");
 assert.equal(run('state.dishes.length'),0);
 assert.match(app.element.innerHTML,/Улюблені страви улюблених закладів/);
 assert.equal(run('JSON.stringify(leagues.home)'),original);
 run("ui.modal={type:'add'};render()");
 assert.doesNotMatch(app.element.innerHTML,/name="venueName"[^>]*required/);
 assert.doesNotMatch(app.element.innerHTML,/name="venueAddress"[^>]*required/);
 function submit(data){app.events.submit({target:{id:'dishForm',data},preventDefault(){}})}

 const fields={name:'Паста',category:'Друге',cuisineCountry:'IT',venueName:'  Бістро А  ',venueAddress:'Київ, вул. Тестова, 1'};
 submit(fields);
 assert.equal(run('state.dishes[0].venueName'),'Бістро А');
 assert.equal(run('stats()[state.dishes[0].id].rating'),1500);
 run("ui.modal={type:'add'}");submit(fields);
 assert.equal(run('state.dishes.length'),1,'exact duplicate blocked');
 submit({...fields,venueName:'Бістро Б'});
 assert.equal(run('state.dishes.length'),2,'same dish at another venue allowed');
 run("ui.modal={type:'add'}");submit({...fields,venueAddress:'Львів, вул. Тестова, 2'});
 assert.equal(run('state.dishes.length'),3,'another branch allowed');
 run("ui.search='львів'");assert.equal(run('state.dishes.filter(matchesSearch).length'),1);
 run("ui.search='бістро'");assert.equal(run('state.dishes.filter(matchesSearch).length'),3);
 run("ui.modal={type:'edit',id:state.dishes[0].id}");submit({...fields,venueAddress:'Київ, вул. Нова, 3'});
 assert.equal(run('state.dishes[0].venueAddress'),'Київ, вул. Нова, 3');
 run("ui.calibrationTarget=state.dishes[1].id;voteCalibration(ui.calibrationTarget)");
 assert.equal(run('state.history.length'),1,'automatic calibration works');
 assert.equal(run('leagues.home.history.length'),0);
 run("ui.mode='free';ui.category='Друге';ensureFreePair(ui.category);vote(state.freePairs[ui.category].a)");
 assert.equal(run('state.history.length'),2);
 run("switchFoodMode('home')");
 assert.equal(run('JSON.stringify(state)'),original,'restaurant edits leave all home data unchanged');
 run("ui.mode='free';ui.category='Десерт';ensureFreePair(ui.category);vote(state.freePairs[ui.category].a)");
 assert.equal(run('state.history.length'),1);
 run("switchFoodMode('restaurant');undoLast()");
 assert.equal(run('state.history.length'),1,'undo affects active section only');
 assert.equal(run('leagues.home.history.length'),1);
 run("ui.category='Друге';ui.mode='tournament';initTournament('Друге')");
 let matches=0;
 while(!run("state.tournaments['Друге'].finished")&&matches++<30)run("vote(state.tournaments['Друге'].current.a)");
 assert.equal(run('state.champions.length'),1,'restaurant tournament completes');
 assert.equal(run('leagues.home.champions.length'),0);
 for(const page of ['home','duel','calibration','bracket','leaderboard','dishes','history','settings'])run(`ui.page='${page}';render()`);
 const backup=JSON.parse(run('JSON.stringify(cloudSnapshot())'));
 assert.equal(backup.restaurant.dishes.length,3);
 assert.equal(backup.history.length,1);
 assert.equal(backup.undo,null);assert.equal(backup.restaurant.undo,null);
 const reloaded=boot(JSON.parse(app.values.get('smakova-liga-v1')),'restaurant');
 assert.equal(reloaded.run('state.dishes.length'),3);
 assert.equal(reloaded.run('state.champions.length'),1);
 assert.equal(reloaded.run('leagues.home.history.length'),1);
 assert.equal(run('cloudSignature()'),run("switchFoodMode('home');cloudSignature()"),'switching does not dirty cloud data');
 run("switchFoodMode('restaurant');handleAction({dataset:{action:'resetAll'}})");
 assert.equal(run('state.dishes.length'),0);
 assert.equal(run('leagues.home.history.length'),1,'reset preserves other section');
 app.ctx.backup=backup;run("cloudApply(backup,'test-sha')");
 assert.equal(run('state.dishes.length'),3);
 assert.equal(run('cloudHasUnsaved()'),false);
 app.ctx.bad={...backup,restaurant:{...backup.restaurant,dishes:[{id:'x',name:'x',category:'x',venueName:123}]}};
 assert.equal(run('validState(bad)'),false,'malformed restaurant backup rejected');
 app.windowEvents.storage({key:'smakova-liga-v1',newValue:JSON.stringify(backup)});
 assert.equal(run('state.dishes.length'),3);
 const legacy=JSON.parse(fs.readFileSync(path.join(root,'data.json'),'utf8'));
 const old=boot(legacy);assert.equal(old.run('state.dishes.length'),legacy.dishes.length);
 assert.equal(old.run('leagues.restaurant.dishes.length'),0,'v1 migration starts empty restaurant section');
 await app.events['import:change']({target:{files:[{text:async()=>JSON.stringify(backup)}],value:'test'}});
 assert.equal(run('state.dishes.length'),3,'JSON import restores both sections');
 let csv;app.ctx.capture=(...args)=>csv=args;run('download=(...args)=>capture(...args);exportCsv()');
 assert.match(csv[0],/restaurant/);assert.match(csv[2],/Бістро А/);assert.match(csv[2],/Адреса/);
 // Local work done while the first cloud fetch is pending must not be discarded.
 const race=boot();let resolveFetch;
 race.ctx.fetch=()=>new Promise(resolve=>resolveFetch=resolve);
 const pending=race.run('cloudRefresh({automatic:true})');
 race.run("switchFoodMode('restaurant');state.dishes.push(normalizeDish({id:'new',name:'New',category:'Друге',venueName:'Place',venueAddress:'Street'}));save()");
 resolveFetch({ok:true,json:async()=>legacy});await pending;
 assert.equal(race.run('state.dishes.length'),1);
 // Server validation accepts old and new payloads, rejecting malformed nested leagues.
 const worker=fs.readFileSync(path.join(root,'worker/src/index.js'),'utf8').split('// MEDIA / LOG')[0];
 const server=vm.createContext({backup,legacy,bad:app.ctx.bad});vm.runInContext(worker,server);
 assert.equal(vm.runInContext('validData(legacy)&&validData(backup)&&!validData(bad)',server),true);
 console.log('PASS: legacy migration, required fields, venue duplicates, edit/search, calibration, votes, undo, tournament, all pages, reset isolation, reload, JSON/CSV, cloud round-trip/race, cross-tab sync and Worker validation');
}
main().catch(e=>{console.error(e);process.exitCode=1});

