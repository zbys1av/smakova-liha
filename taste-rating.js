// Personal taste and practical notes are independent of Elo and duel history.
function ratingText(uk,en){return window.SMAKOVA_UI.getLang?.()==='en'?en:uk}
const RATING_FIELDS={
 home:{cost:[['cheap','Дешево','Low'],['moderate','Помірно','Moderate'],['expensive','Дорого','High']],difficulty:[['easy','Легко','Easy'],['medium','Середньо','Medium'],['hard','Складно','Hard']],time:[['quick','До 30 хв','Under 30 min'],['medium','30–60 хв','30–60 min'],['long','Понад 60 хв','Over 60 min']],again:[['yes','Так','Yes'],['maybe','Можливо','Maybe'],['no','Ні','No']]},
 restaurant:{portion:[['small','Мала','Small'],['normal','Нормальна','Regular'],['large','Велика','Large']],value:[['good','Вигідно','Good value'],['fair','Справедливо','Fair value'],['poor','Невигідно','Poor value']],again:[['yes','Так','Yes'],['maybe','Можливо','Maybe'],['no','Ні','No']]}
};
function tasteScore(value){if(value===null||value===undefined||value==='')return null;const n=Number(value);return Number.isFinite(n)&&n>=1&&n<=10&&Number.isInteger(n*2)?n:null}
function tasteCaption(value){const n=tasteScore(value);return n===null?ratingText('Ще без оцінки','Not rated yet'):n>=9?ratingText('Незабутньо','Outstanding'):n>=8?ratingText('Дуже смачно','Delicious'):n>=6?ratingText('Смачно','Tasty'):n>=4?ratingText('Посередньо','Average'):ratingText('Не мій смак','Not for me')}
function tasteTier(value){const n=tasteScore(value);return n===null?'':n>=9?'S':n>=8?'A':n>=6?'B':n>=4?'C':'D'}
function ratingOrigin(d){return ['home','restaurant'].includes(d?.assessment?.origin)?d.assessment.origin:foodMode}
function practicalNote(a={}){
 const score=tasteScore(a.taste),good=score!==null&&score>=8,p=a[a.origin]||{};
 if(a.origin==='restaurant'){
  if(good&&p.value==='poor')return ratingText('Смачно, але невигідно','Tasty, but poor value');
  if(good&&p.value==='good')return ratingText('Смачно й вигідно','Tasty and good value');
  if(p.again==='yes')return ratingText('Варто замовити знову','Worth ordering again');
  if(p.value==='poor')return ratingText('Не найкраще співвідношення ціни та цінності','Not the best value for money');
  if(p.value==='good')return ratingText('Вигідний вибір','Good value');
 }else if(a.origin==='home'){
  if(good&&p.difficulty==='hard')return ratingText('Чудова страва, але складна в приготуванні','Great dish, but difficult to prepare');
  if(good&&p.cost==='cheap')return ratingText('Смачно й недорого','Tasty and inexpensive');
  if(p.time==='quick'&&p.difficulty==='easy')return ratingText('Легко й швидко приготувати','Quick and easy to prepare');
  if(p.again==='yes')return ratingText('Варто приготувати знову','Worth cooking again');
  if(p.time==='long'&&p.difficulty==='hard')return ratingText('Потребує часу та зусиль','Takes time and effort');
 }
 return '';
}
function ratingLabel(mode,key){const labels={cost:['Вартість інгредієнтів','Ingredient cost'],difficulty:['Складність','Difficulty'],time:['Час приготування','Preparation time'],portion:['Розмір порції','Portion size'],value:['Ціна / цінність','Value for money'],again:mode==='home'?['Приготую знову','Would cook again']:['Замовлю знову','Would order again']};return ratingText(...labels[key])}
function ratingSegments(mode,key,value){const id='rating-'+mode+'-'+key;return `<fieldset class="rating-field"><legend>${ratingLabel(mode,key)}</legend><input type="hidden" id="${id}" name="${id}" value="${esc(value||'')}"><div class="rating-segments">${RATING_FIELDS[mode][key].map(([v,uk,en])=>`<button type="button" data-rating-field="${id}" data-rating-value="${v}" aria-pressed="${value===v}">${ratingText(uk,en)}</button>`).join('')}</div></fieldset>`}
function ratingForm(d){const a=d.assessment||{},origin=ratingOrigin(d),score=tasteScore(a.taste),percent=score===null?0:(score-1)/9*100;return `<section class="taste-editor" id="tasteEditor" data-no-translate>
 <div class="taste-heading"><label for="tasteSlider">${ratingText('Смак страви','Dish taste')}</label><button type="button" class="taste-clear" data-rating-clear>${ratingText('Очистити','Clear')}</button></div>
 <div class="taste-value-row"><output id="tasteValue" for="tasteSlider">${score??'—'}</output><span>/ 10</span><span id="tasteTier" class="taste-tier" ${a.showTier&&score!==null?'':'hidden'}>${tasteTier(score)}</span></div>
 <div class="taste-caption" id="tasteCaption">${tasteCaption(score)}</div>
 <input type="hidden" name="rating-taste" id="rating-taste" value="${score??''}">
 <input class="taste-slider" type="range" id="tasteSlider" min="1" max="10" step="0.5" value="${score??5.5}" style="--taste-progress:${percent}%" aria-valuetext="${score===null?ratingText('Без оцінки. Змініть повзунок, щоб оцінити.','Not rated. Move the slider to rate.'):`${score} / 10 — ${tasteCaption(score)}`}" aria-describedby="tasteHelp">
 <div class="taste-scale"><span>1</span><span>5,5</span><span>10</span></div>
 <div class="taste-options"><span id="tasteHelp">${ratingText('Крок 0,5 · незалежно від Elo','Step 0.5 · independent of Elo')}</span></div>
 <fieldset class="rating-field rating-origin"><legend>${ratingText('Походження страви','Dish origin')}</legend><input type="hidden" id="rating-origin" name="rating-origin" value="${origin}"><div class="rating-segments">${[['home','Домашня','Home cooking'],['restaurant','Ресторанна','Dining out']].map(([v,uk,en])=>`<button type="button" data-rating-origin="${v}" aria-pressed="${origin===v}">${ratingText(uk,en)}</button>`).join('')}</div></fieldset>
 <details class="rating-extras"><summary>${ratingText('Додаткові враження','More impressions')} <span>${ratingText('необов’язково','optional')}</span></summary>
 <div class="rating-pane" data-rating-pane="home" ${origin==='home'?'':'hidden'}>${Object.keys(RATING_FIELDS.home).map(key=>ratingSegments('home',key,a.home?.[key])).join('')}</div>
 <div class="rating-pane" data-rating-pane="restaurant" ${origin==='restaurant'?'':'hidden'}><div class="rating-price"><label for="rating-price">${ratingText('Ціна (необов’язково)','Price (optional)')}</label><input type="number" min="0" step="any" inputmode="decimal" id="rating-price" name="rating-price" value="${Number.isFinite(a.restaurant?.price)&&a.restaurant.price>=0?a.restaurant.price:''}" placeholder="—"></div>${Object.keys(RATING_FIELDS.restaurant).map(key=>ratingSegments('restaurant',key,a.restaurant?.[key])).join('')}<div class="rating-help">${ratingText('Цінність — ваше враження від смаку, порції та ціни разом. Оберіть самі; автоматичного розрахунку немає.','Value is your overall impression of taste, portion and price. Choose it yourself; it is not calculated automatically.')}</div></div>
 <div class="rating-help">${ratingText('Натисніть вибрану відповідь ще раз, щоб прибрати її.','Press a selected answer again to clear it.')}</div></details>
 <div id="ratingCalculated" class="rating-help">${ratingText('Математична','Mathematical')}: ${calculatedLabel(a,origin)}${calculatedRating(a,origin)?' · '+esc(calculatedFactors(a,origin)):''}</div><div id="ratingPractical" class="rating-practical" role="status" ${practicalNote({...a,origin})?'':'hidden'}>${practicalNote({...a,origin})}</div>
 </section>`}
function readAssessment(form,previous={}){
 const f=new FormData(form);if(f.get('rating-origin')===null)return previous;
 const raw=f.get('rating-taste'),taste=tasteScore(raw);
 if(raw!==''&&raw!==null&&taste===null)throw Error(ratingText('Оцініть смак від 1 до 10 з кроком 0,5.','Rate taste from 1 to 10 in steps of 0.5.'));
 const origin=f.get('rating-origin');if(!['home','restaurant'].includes(origin))throw Error(ratingText('Оберіть походження страви.','Choose the dish origin.'));
 const result={...previous,taste,origin,showTier:previous.showTier};
 for(const mode of ['home','restaurant']){result[mode]={...(previous[mode]||{})};for(const key of Object.keys(RATING_FIELDS[mode])){const value=f.get('rating-'+mode+'-'+key)||'';result[mode][key]=RATING_FIELDS[mode][key].some(o=>o[0]===value)?value:null}}
 const price=f.get('rating-price');if(price===null||String(price).trim()==='')result.restaurant.price=null;else{const n=Number(price);if(!Number.isFinite(n)||n<0)throw Error(ratingText('Вкажіть невід’ємну ціну або залиште поле порожнім.','Enter a non-negative price or leave it blank.'));result.restaurant.price=n}
 return result;
}
function ratingDetails(a){const origin=a.origin,p=a[origin]||{},parts=[];if(!RATING_FIELDS[origin])return parts;for(const key of Object.keys(RATING_FIELDS[origin])){const option=RATING_FIELDS[origin][key].find(o=>o[0]===p[key]);if(option)parts.push([ratingLabel(origin,key),ratingText(option[1],option[2])])}if(origin==='restaurant'&&Number.isFinite(p.price)&&p.price>=0)parts.unshift([ratingText('Ціна','Price'),String(p.price)]);return parts}
function ratingIndicators(a){const origin=a.origin,p=a[origin]||{},keys=origin==='home'?['time','difficulty']:['portion','value'];return keys.map(key=>{const option=RATING_FIELDS[origin]?.[key]?.find(o=>o[0]===p[key]);if(!option)return '';const symbol=key==='time'?'<circle cx="8" cy="8" r="6"/><path d="M8 4v4l3 2"/>':key==='portion'?'<path d="M2 7h12c-1 5-11 5-12 0ZM3 4h10"/>':'<path d="m3 8 3 3 7-7"/>';return '<span class="rating-indicator" title="'+esc(ratingLabel(origin,key))+'"><svg viewBox="0 0 16 16" aria-hidden="true">'+symbol+'</svg>'+esc(ratingText(option[1],option[2]))+'</span>'}).join('')}
function ratingCard(d){const a=d.assessment||{},score=tasteScore(a.taste),note=practicalNote(a),details=ratingDetails(a);return `<div class="taste-card" data-no-translate><div class="taste-card-main"><div><div class="taste-card-label">${ratingText('Смак','Taste')}</div><strong>${score??'—'}<small> / 10</small></strong></div>${a.showTier&&score!==null?`<span class="taste-tier">${tasteTier(score)}</span>`:''}<span class="taste-card-caption">${tasteCaption(score)}</span></div><div class="rating-indicators">${ratingIndicators(a)}</div>${note?`<div class="rating-practical">${esc(note)}</div>`:''}${details.length?`<details class="rating-card-details"><summary>${ratingText('Практичні деталі','Practical details')} <span>${details.length}</span></summary><dl>${details.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></details>`:''}</div>`}
function refreshRatingEditor(form){
 const value=form.querySelector('#rating-taste').value,score=tasteScore(value),slider=form.querySelector('#tasteSlider');
 form.querySelector('#tasteValue').textContent=score??'—';form.querySelector('#tasteCaption').textContent=tasteCaption(score);
 const tier=form.querySelector('#tasteTier');tier.textContent=tasteTier(score);tier.hidden=score===null||!form.querySelector('#rating-showTier')?.checked;
 slider.style.setProperty('--taste-progress',(score===null?0:(score-1)/9*100)+'%');slider.setAttribute('aria-valuetext',score===null?ratingText('Без оцінки','Not rated'):`${score} / 10 — ${tasteCaption(score)}`);
 try{const a=readAssessment(form),note=form.querySelector('#ratingPractical');const calc=form.querySelector('#ratingCalculated');if(calc)calc.textContent=ratingText('Математична','Mathematical')+': '+calculatedLabel(a,a.origin)+(calculatedRating(a,a.origin)?' · '+calculatedFactors(a,a.origin):'');note.textContent=practicalNote(a);note.hidden=!note.textContent}catch{}
}
function handleRatingClick(e){const form=e.target.closest('#dishForm');if(!form)return false;
 const choice=e.target.closest('[data-rating-field]'),origin=e.target.closest('[data-rating-origin]'),clear=e.target.closest('[data-rating-clear]');
 if(choice){const field=form.querySelector('#'+choice.dataset.ratingField);field.value=field.value===choice.dataset.ratingValue?'':choice.dataset.ratingValue;form.querySelectorAll('[data-rating-field="'+choice.dataset.ratingField+'"]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.ratingValue===field.value)))}
 else if(origin){form.querySelector('#rating-origin').value=origin.dataset.ratingOrigin;form.querySelectorAll('[data-rating-origin]').forEach(b=>b.setAttribute('aria-pressed',String(b===origin)));form.querySelectorAll('[data-rating-pane]').forEach(p=>p.hidden=p.dataset.ratingPane!==origin.dataset.ratingOrigin);const venue=form.querySelector('#ratingVenueFields');if(venue)venue.hidden=origin.dataset.ratingOrigin!=='restaurant'}
 else if(clear){form.querySelector('#rating-taste').value='';form.querySelector('#tasteSlider').value='5.5'}else return false;
 refreshRatingEditor(form);return true;
}
function handleRatingInput(e){const form=e.target.closest('#dishForm');if(!form||!form.querySelector('#tasteEditor'))return;if(e.target.id==='tasteSlider')form.querySelector('#rating-taste').value=e.target.value;if(['tasteSlider','rating-showTier','rating-price'].includes(e.target.id))refreshRatingEditor(form)}

