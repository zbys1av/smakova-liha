const assert=require('node:assert/strict'),{boot}=require('./sections.cjs');
(async()=>{
 const a=boot(),r=a.run,one='data:image/webp;base64,UklGRgAAAABXRUJQ',two='data:image/jpeg;base64,/9j/2Q==',p1='photos/'+'a'.repeat(64)+'.webp',p2='photos/'+'b'.repeat(64)+'.jpg';
 Object.assign(a.ctx,{one,two,p1,p2});r("state.dishes[0].photo={inline:one};ui.modal={type:'edit',id:state.dishes[0].id}");
 assert.equal(r('photoDraft(state.dishes[0]).length'),1,'single-photo records remain readable');
 r('ui.modal.photoDraft=[{inline:one},{inline:two}]');const dish=JSON.parse(r('JSON.stringify(state.dishes[0])'));
 a.events.submit({target:{id:'dishForm',data:{name:dish.name,category:dish.category}},preventDefault(){}});
 assert.equal(r('state.dishes[0].photos.length'),2);assert.equal(r('state.dishes[0].photo'),null);assert.match(r('photoGallery(state.dishes[0])'),/photo-gallery/);assert.match(r('renderDishIcon(state.dishes[0])'),/dish-photo/);
 const backup=JSON.parse(r('JSON.stringify(cloudSnapshot())'));assert.equal(backup.dishes[0].photos.length,2);let calls=0;a.ctx.fetch=async(url,opts)=>{calls++;return {ok:true,json:async()=>({path:JSON.parse(opts.body).data===one?p1:p2})}};r("cloud.loginToken='token'");await r('uploadPendingPhotos()');assert.equal(calls,2);assert.equal(r('state.dishes[0].photos[0].path'),p1);assert.equal(r('state.dishes[0].photos[1].path'),p2);assert.doesNotThrow(()=>r('ensureNoPendingPhotos(cloudSnapshot())'));
 const reloaded=boot(JSON.parse(a.values.get('smakova-liga-v1')));assert.equal(reloaded.run('photoList(state.dishes[0]).length'),2);
 const empty=boot();assert.doesNotMatch(empty.run('renderDishIcon(state.dishes[0])'),/dish-photo/);
 const link=boot();link.ctx.URL=URL;link.ctx.AbortController=AbortController;link.ctx.TypeError=TypeError;let fetchOptions;link.ctx.fetch=async(u,o)=>{fetchOptions=o;return {ok:true,headers:{get:()=>null},blob:async()=>({type:'image/jpeg',size:200})}};link.ctx.compressDishPhoto=async blob=>({inline:one,bytes:100});
 assert.equal((await link.run("photoFromUrl('https://example.com/dish.jpg')")).inline,one);assert.equal(fetchOptions.credentials,'omit');assert.equal(fetchOptions.mode,'cors');await assert.rejects(link.run("photoFromUrl('http://example.com/dish.jpg')"),/HTTPS/);
 link.ctx.fetch=async()=>{throw new TypeError('CORS')};link.ctx.Image=class{set src(value){if(value)this.onload()}};
 const external=await link.run("photoFromUrl('https://example.com/image.jpg')");assert.equal(external.url,'https://example.com/image.jpg');assert.equal(external.external,true);assert.equal(link.run("photoSource({url:'https://example.com/image.jpg'})"),'https://example.com/image.jpg');assert.equal(link.run("photoSource({url:'javascript:alert(1)'})"),'');
 link.ctx.Image=class{set src(value){if(value)this.onerror()}};await assert.rejects(link.run("photoFromUrl('https://example.com/not-image')"),/Не вдалося/);
 link.ctx.fetch=async()=>({ok:true,headers:{get:()=>String(21*1024*1024)},blob:async()=>{throw Error('must not read')}});await assert.rejects(link.run("photoFromUrl('https://example.com/large.jpg')"),/20 МБ/);
 console.log('PASS: legacy photo, multiple photos, backup/reload, GitHub uploads, photo sources and HTTPS links');
})().catch(e=>{console.error(e);process.exitCode=1});

