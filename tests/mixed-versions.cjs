const assert=require('node:assert/strict'),{boot}=require('./sections.cjs'),app=boot(),r=app.run;
function submit(id,data){const e={target:{id,data},preventDefault(){}};for(const fn of app.eventsAll.submit)fn(e)}
const root=JSON.parse(r('JSON.stringify(state.dishes[0])'));
r("state.dishes[0].assessment={origin:'home',taste:8,home:{cost:'cheap'}}");
const mainId=root.id;
function add(data){r(`recipeAction('recipeNew',{dataset:{id:${JSON.stringify(mainId)}}})`);submit('dishForm',{name:root.name,category:root.category,dishType:root.type,recipeVersionName:'Variant',recipeChanges:'New sauce',...data});return JSON.parse(r('JSON.stringify(state.dishes.at(-1))'))}
const a=add({'rating-origin':'restaurant','rating-taste':'9',venueName:'Заклад А',venueCountry:'Україна',venueCity:'Львів',venueStreet:'Ринок 1',cuisineCountry:'IT'});
const b=add({'rating-origin':'restaurant','rating-taste':'7',venueName:'Заклад Б',venueCountry:'Україна',venueCity:'Київ',venueStreet:'Київська 4',cuisineCountry:'IT'});
const home=add({'rating-origin':'home','rating-taste':'9.5','rating-home-cost':'cheap'});
assert.equal(r('recipeVersions(state.dishes[0]).length'),4);assert.equal(a.recipeRootId,mainId);assert.equal(b.recipeRootId,mainId);assert.equal(home.recipeRootId,mainId);
assert.equal(r('activeDishes().filter(recipeIsPrimary).length'),42);assert.equal(a.venueCity,'Львів');assert.equal(b.venueCity,'Київ');assert.equal(a.assessment.taste,9);assert.equal(b.assessment.taste,7);
assert.equal(r('stats()[state.dishes[0].id].rating'),1500);assert.equal(r('stats()[state.dishes.at(-1).id].rating'),1500);
assert.equal(r("recipeRepresentative(state.dishes[0],'home','home').id"),mainId);assert.equal(r("recipeRepresentative(state.dishes[0],'restaurant','home').id"),b.id,'most recently created rated restaurant version');
r("unifiedOrigin='restaurant';recipeShowAll=false");let ranking=r('unifiedRankings()');assert.match(ranking,new RegExp('data-detail-id="'+b.id+'"'));assert.doesNotMatch(ranking,new RegExp('data-detail-id="'+a.id+'"'));
r("recipeShowAll=true");ranking=r('unifiedRankings()');assert.match(ranking,new RegExp('data-detail-id="'+a.id+'"'));assert.match(ranking,new RegExp('data-detail-id="'+b.id+'"'));
const before=[mainId,a.id,b.id,home.id].map(id=>r(`recipeColor(dish(${JSON.stringify(id)}))`));assert.equal(new Set(before).size,4,'new versions get distinct colors');
submit('recipeTasteForm',{versionId:a.id,date:'2026-01-01',taste:'9',comment:'A'});submit('recipeTasteForm',{versionId:b.id,date:'2026-01-01',taste:'7',comment:'B'});
const chart=r(`recipeChart(recipeVersions(dish(${JSON.stringify(mainId)})),${JSON.stringify(mainId)},'all')`);assert.ok(chart.includes('fill="'+before[1]+'"'));assert.ok(chart.includes('fill="'+before[2]+'"'));assert.equal((chart.match(/data-action="recipePoint"/g)||[]).length,2);
assert.match(r(`recipeRecent(dish(${JSON.stringify(a.id)}))`),new RegExp(before[1].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
const data=JSON.parse(r('JSON.stringify(cloudSnapshot())')),reloaded=boot(data);const after=[mainId,a.id,b.id,home.id].map(id=>reloaded.run(`recipeColor(dish(${JSON.stringify(id)}))`));assert.deepEqual(after,before);
assert.equal(reloaded.run(`dish(${JSON.stringify(a.id)}).tastings.length`),1);assert.equal(reloaded.run(`dish(${JSON.stringify(b.id)}).tastings.length`),1);
reloaded.run(`recipeAction('recipePrimary',{dataset:{id:${JSON.stringify(a.id)}}})`);assert.equal(reloaded.run("recipeRepresentative(state.dishes[0],'restaurant','home').id"),a.id);assert.equal(reloaded.run("recipeRepresentative(state.dishes[0],'home','home').id"),home.id);assert.deepEqual([mainId,a.id,b.id,home.id].map(id=>reloaded.run(`recipeColor(dish(${JSON.stringify(id)}))`)),before);
const detail=reloaded.run(`collectionDetail(dish(${JSON.stringify(a.id)}))`);assert.match(detail,/Заклад А/);assert.match(detail,/Львів/);const card=reloaded.run(`compactDishCard(recipePrimary(dish(${JSON.stringify(mainId)})),stats())`);assert.match(card,/4 рецепти/);assert.match(card,/Домашня \+ Ресторанна/);
console.log('PASS: mixed origins and venues, one-card grouping, independent ratings, per-origin representatives, colors and cloud round-trip');
