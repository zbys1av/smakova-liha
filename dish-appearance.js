/* Pure, deterministic decoration. Stored dish types and ratings never change. */
function appearanceTags(d){return [...new Set([...(d.tasteTags||[]),...String(d.tasteCustom||'').split(/[,|]/),...(!d.tasteTags?.length&&!d.tasteCustom?String(d.taste||'').split(/[,|]/):[])].map(s=>String(s).trim().toLowerCase()).filter(Boolean))].sort()}
function appearanceKey(d){return JSON.stringify([d.type||'',d.category||'',appearanceTags(d),!!String(d.tasteCustom||'').trim()])}
function blendIconColor(a,b,amount){const hex=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));const x=hex(a),y=hex(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*amount).toString(16).padStart(2,'0')).join('')}
function iconAppearance(d,type,variant){
 const palette={...paletteFor(type,variant)},tags=appearanceTags(d),text=tags.join(' '),seed=hashStr(appearanceKey(d));
 const has=rx=>rx.test(text),decor=[];
 // Ingredients explicitly named by the user influence food color, not nationality.
 if(has(/шоколад|какао|chocolat|cocoa/)){palette.a=blendIconColor(palette.a,'#76503a',.48);palette.b=blendIconColor(palette.b,'#593c2f',.35);decor.push('<g fill="#644331"><rect x="25" y="28" width="3" height="3" rx=".5"/><rect x="34" y="32" width="3" height="3" rx=".5"/></g>')}
 if(has(/ягід|полуниц|малин|вишн|berr|cherry/)){palette.c=blendIconColor(palette.c,'#b84463',.6);decor.push('<g fill="#bd526b"><circle cx="39" cy="25" r="2.5"/><circle cx="43" cy="28" r="2"/></g>')}
 if(has(/вершк|ніжн|cream|delicate/)){palette.b=blendIconColor(palette.b,'#fff0d8',.55);decor.push('<path d="M25 30q7-4 13 0" fill="none" stroke="#fff0d8" stroke-width="2"/>')}
 if(has(/сирн|chees/)){palette.a=blendIconColor(palette.a,'#edc76a',.25);decor.push('<path d="m25 25 3 2m4-2 3 2m-5 4 3 2" stroke="#f8dd91" stroke-width="1.5"/>')}
 if(has(/пікант|гостр|чилі|spicy|chili/)){decor.push('<path d="M39 31q9-1 6 5-2 4-7 3 5-2 1-8" fill="#c75a42"/><path d="m39 31-1-3" stroke="#62865a" stroke-width="1.3"/>')}
 if(has(/овоч|прян|зелень|базил|herb|veget|basil/)){decor.push('<g fill="#648b58"><path d="M21 30q-6-7 2-5 3 3-2 5M25 34q0-8 5-4-1 5-5 4"/></g>')}
 if(has(/кисл|лимон|цитрус|sour|lemon|citrus/)){decor.push('<path d="M39 27a5 5 0 0 0 9 0z" fill="#f5d76b" stroke="#d7ac43" stroke-width=".7"/>')}
 if(has(/хруст|crispy|crunch/)){decor.push('<g fill="#ba8849"><circle cx="23" cy="33" r="1"/><circle cx="29" cy="26" r="1"/><circle cx="38" cy="37" r="1"/></g>')}
 if(has(/солод|sweet/)){decor.push('<g fill="#fff4df"><circle cx="23" cy="28" r=".9"/><circle cx="32" cy="24" r=".9"/><circle cx="40" cy="33" r=".9"/></g>')}
 // Category changes the serving dish; custom categories receive a quiet stable tint.
 const categoryColors={'Десерт':'#d7b0a7','Перше':'#a9bfba','Друге':'#b8b49b','Не повне':'#b8c3a2'};
 const rim=categoryColors[d.category]||['#c0b4a6','#b4c1b9','#c7b5bd'][hashStr(d.category||'')%3];
 const plate='<ellipse cx="32" cy="53" rx="25" ry="5" fill="#fff9eb" stroke="'+rim+'" stroke-width="1.2"/>';
 // Additional tags alter only a few garnish specks, even for unrecognized free text.
 const specks=tags.length?'<g fill="'+palette.c+'" opacity=".55">'+Array.from({length:Math.min(3,tags.length)},(_,i)=>'<circle cx="'+(20+(seed>>>(i*5))%24)+'" cy="'+(32+(seed>>>(i*4))%8)+'" r=".65"/>').join('')+'</g>':'';
 const custom=String(d.tasteCustom||'').trim()?'<path d="m46 45 1.4 1.4-1.4 1.4-1.4-1.4z" fill="'+palette.c+'" opacity=".7"/>':'';
 return {palette,plate,details:decor.slice(0,3).join('')+specks+custom};
}
function updateDishPreview(){
 const form=document.querySelector('#dishForm'),slot=document.querySelector('#dishIconPreview');if(!form||!slot)return;
 const data=new FormData(form),previous=ui.modal?.id?dish(ui.modal.id):{};
 const category=data.get('category')==='__new'?data.get('newCategory'):(data.get('category')||previous?.category||'');
 const draft={name:data.get('name')||'',type:data.get('dishType')||'',category,tasteTags:String(data.get('tasteTags')||'').split('|').filter(Boolean),tasteCustom:data.get('tasteCustom')||''};
 slot.innerHTML=renderDishIcon(draft,'modal-preview');
}
