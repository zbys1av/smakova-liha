const assert=require('node:assert/strict'),{boot}=require('./sections.cjs');
(async()=>{const a=boot(),r=a.run,inline='data:image/webp;base64,UklGRgAAAABXRUJQ',path='photos/'+'a'.repeat(64)+'.webp';
assert.equal(r('photoSource(null)'), '');a.ctx.inline=inline;a.ctx.validPath=path;
assert.equal(r('photoSource({inline})'),inline);assert.equal(r('photoSource({path:validPath})'),'./'+path);
assert.equal(r("photoSource({path:'../secret.jpg'})"),'');assert.equal(r("photoSource({inline:'data:image/svg+xml;base64,abcd'})"),'');
r('state.dishes[0].photo={inline};state.dishes[1].photo={inline};save()');assert.match(r('renderDishIcon(state.dishes[0])'),/dish-photo/);assert.match(r('renderDishIcon(state.dishes[2])'),/<svg/);
assert.throws(()=>r('ensureNoPendingPhotos(cloudSnapshot())'),/незавантажене/,'pending uploads must never enter cloud data');
assert.equal(JSON.parse(r('JSON.stringify(cloudSnapshot())')).dishes[0].photo.inline,inline,'pending image is included in backup');
let requests=0;a.ctx.fetch=async(url,options)=>{requests++;assert.ok(url.endsWith('/photo'));assert.equal(JSON.parse(options.body).data,inline);return {ok:true,json:async()=>({path})}};
r("cloud.loginToken='test-token'");await r('uploadPendingPhotos()');assert.equal(requests,1,'identical photos upload once');assert.equal(r('state.dishes[0].photo.path'),path);assert.equal(r('state.dishes[1].photo.path'),path);assert.equal(JSON.parse(a.values.get('smakova-liga-v1')).dishes[0].photo.path,path);
assert.doesNotThrow(()=>r('ensureNoPendingPhotos(cloudSnapshot())'));
r('state.dishes[0].photo={inline}');a.ctx.fetch=async()=>({ok:false,json:async()=>({error:'offline'})});await assert.rejects(r('uploadPendingPhotos()'),/offline/);assert.equal(r('state.dishes[0].photo.inline'),inline,'failed upload retains pending data');
let q=[],revoked=false;a.ctx.URL={createObjectURL:()=> 'blob:test',revokeObjectURL:()=>{revoked=true}};a.ctx.Image=class{constructor(){this.naturalWidth=3000;this.naturalHeight=2000}set src(v){this.onload()}};a.ctx.FileReader=class{readAsDataURL(){this.result=inline;this.onload()}};a.ctx.document.createElement=()=>({width:0,height:0,getContext:()=>({fillRect(){},drawImage(){}}),toBlob(cb,mime,quality){q.push([this.width,this.height,mime,quality]);cb({size:quality>.74?150000:100000,type:mime})}});
const compressed=await r("compressDishPhoto({type:'image/jpeg',size:1000000})");assert.equal(compressed.inline,inline);assert.deepEqual(q.map(x=>x[0]),[1280,1280]);assert.equal(q[1][3],.74);assert.ok(revoked);
await assert.rejects(r("compressDishPhoto({type:'text/plain',size:1})"));
 const edit=boot(),er=edit.run;edit.ctx.inline=inline;er("ui.modal={type:'edit',id:state.dishes[0].id};ui.modal.photoDraft=[{inline}]");
 const original=JSON.parse(er('JSON.stringify(state.dishes[0])'));const data={name:original.name,description:original.description,category:original.category,dishType:original.type,tasteTags:original.tasteTags.join('|'),tasteCustom:original.tasteCustom,cuisineCountry:original.cuisineCountry||''};
 edit.events.submit({target:{id:'dishForm',data},preventDefault(){}});assert.equal(er('state.dishes[0].photos[0].inline'),inline,'editing saves the selected photo');
 er("ui.modal={type:'createVersion',id:state.dishes[0].id}");edit.events.submit({target:{id:'dishForm',data:{...data,recipeVersionName:'Photo version'}},preventDefault(){}});assert.equal(er('state.dishes.at(-1).photos[0].inline'),inline,'new recipe versions inherit the photo');
 er("ui.modal={type:'edit',id:state.dishes[0].id};ui.modal.photoDraft=[]");edit.events.submit({target:{id:'dishForm',data},preventDefault(){}});assert.equal(er('state.dishes[0].photos.length'),0,'photo removal returns to icon');assert.doesNotMatch(er('renderDishIcon(state.dishes[0])'),/dish-photo/);
 const reload=boot(JSON.parse(edit.values.get('smakova-liga-v1')));assert.equal(reload.run('state.dishes.at(-1).photos[0].inline'),inline,'pending photo survives reload and backup');
 const full=boot();full.ctx.inline=inline;full.run("ui.modal={type:'edit',id:state.dishes[0].id,photoDraft:[{inline}]}");full.ctx.localStorage.setItem=()=>{throw Error('quota')};const unchanged=JSON.stringify(full.run('state.dishes[0]'));const dish=JSON.parse(unchanged);full.events.submit({target:{id:'dishForm',data:{name:dish.name,category:dish.category}},preventDefault(){}});assert.equal(JSON.stringify(full.run('state.dishes[0]')),unchanged,'quota failure does not alter the dish');
console.log('PASS: photo fallback, compression, deduplication, backup, offline failure and upload persistence');})().catch(e=>{console.error(e);process.exitCode=1});


