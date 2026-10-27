/* Interface-only translations. Dish names, descriptions and stored records never change. */
(function(){
'use strict';
const LANG_KEY='smakova-liha-ui-lang-v1', THEME_KEY='smakova-liha-ui-theme-v1';
const words={
'Смакова ліга.':'Taste League.','Кухонний чемпіонат':'Kitchen championship','Меню':'Menu',
'Огляд':'Overview','Двобої':'Duels','Калібрування':'Calibration','Турнірна сітка':'Tournament bracket',
'Рейтинг':'Rankings','Страви':'Dishes','Історія':'History','Налаштування':'Settings',
'Кулінарний архів':'Culinary archive','Результати збережено локально':'Results saved locally',
'є незбережені зміни':'unsaved changes','синхронізовано':'synced',
'Раз на певний час робіть резервну копію.':'Remember to back up your data occasionally.',
'ВАШ ОСОБИСТИЙ ГАСТРОНОМІЧНИЙ АРХІВ':'YOUR PERSONAL FOOD ARCHIVE',
'Кожна страва має історію.':'Every dish tells a story.',
'Влаштовуйте двобої, відкривайте фаворитів та спостерігайте, як змінюються ваші смаки.':'Host duels, discover favorites and see how your tastes change.',
'Почати двобій →':'Start a duel →','Усього страв':'Total dishes','Імпортовано з FOOD.xlsx':'Imported from FOOD.xlsx',
'Зіграно двобоїв':'Duels played','У всіх категоріях':'Across all categories','Зароблено балів':'Points earned',
'Ніколи не обнуляються':'Never reset','Завершено турнірів':'Completed tournaments',
'Чемпіони в історії':'Champions in history','Категорії страв':'Dish categories','Окремі ліги':'Separate leagues',
'Лідери категорій':'Category leaders','Увесь рейтинг →':'Full rankings →',
'Турніри й вільні двобої — всередині категорії. Для одиночних страв доступне окреме міжкатегорійне калібрування.':'Tournaments and free duels take place within each category. A single dish can be calibrated against other categories.',
'АРЕНА СМАКІВ':'ARENA OF FLAVORS','Час зробити вибір.':'Time to choose.',
'Порівняйте дві страви. Без оцінок за складність, без компромісів — оберіть ту, яка подобається більше.':'Compare two dishes. Forget difficulty and compromises — pick the one you enjoy more.',
'Турнірна сітка':'Tournament bracket','Вільні двобої':'Free duels','↶ Скасувати останній голос':'↶ Undo last vote',
'↶ Скасувати голос':'↶ Undo vote','Переглянути сітку →':'View bracket →',
'Турнір завершено':'Tournament complete','Поточний турнір':'Current tournament','Новий турнір':'New tournament',
'Нескінченний рейтинг':'Endless ranking','ВЕРХНЯ СІТКА':'UPPER BRACKET','НИЖНЯ СІТКА':'LOWER BRACKET',
'ГРАНД-ФІНАЛ':'GRAND FINAL','ВИРІШАЛЬНИЙ ФІНАЛ':'DECIDING FINAL','ВІЛЬНИЙ ДВОБІЙ':'FREE DUEL',
'ДВОБІЙ':'DUEL','Поки немає з ким змагатися':'No challengers yet','Калібрувати Elo →':'Calibrate Elo →',
'Додати страву':'Add a dish','ЧЕМПІОН ВИЗНАЧЕНИЙ':'CHAMPION CROWNED',
'Підсумок турніру':'Tournament summary','Розпочати турнір?':'Start the tournament?',
'Кожна страва має два шанси. Перша поразка переводить до нижньої сітки, друга вибиває з турніру. Чемпіон отримує свій титул.':'Each dish gets two chances. The first loss leads to the lower bracket and the second eliminates it. The winner becomes champion.',
'Почати турнір →':'Start tournament →','Пропустити цю пару':'Skip this match',
'Оберіть одну страву; відмінити можна наступною дією.':'Choose one dish. You can undo afterwards.',
'Двобоїв більше немає':'No duels remaining','Спробуйте змінити категорію або розпочати новий турнір.':'Choose another category or start a new tournament.',
'Страв у категорії':'Dishes in category','Усього двобоїв':'Total duels','Очок отримано':'Points earned',
'Як працюють результати?':'How do results work?',
'Переможець отримує від 10 до 18 постійних балів. Якщо обираєте аутсайдера, він отримує більший бонус. Elo обох страв коригується окремо після кожного двобою.':'A winner gets 10–18 permanent points, with a bigger reward for an upset. Both dishes’ Elo ratings update after every duel.',
'Що таке дві сітки?':'Why two brackets?','Навіщо вільні двобої?':'Why free duels?',
'У верхній сітці ще немає поразок. Після першої поразки страва переходить у нижню, а після другої вибуває лише з поточного турніру.':'In the upper bracket, dishes are undefeated. A first loss sends a dish to the lower bracket; a second removes it from this tournament only.',
'Цей режим дозволяє продовжувати порівняння між турнірами. Пари підбираються з урахуванням кількості ігор, рівня Elo та недавніх повторів.':'This mode keeps comparisons going between tournaments. Matchups account for game counts, Elo and recent repeat pairings.',
'Претендент':'Contender','Опис поки не додано.':'No description yet.','Опис не додано':'No description yet.',
'Особисте порівняння':'Personal comparison','Обираю цю страву →':'Choose this dish →',
'ДОВГОСТРОКОВІ РЕЗУЛЬТАТИ':'LONG-TERM RESULTS','Рейтинг фаворитів.':'Favorite rankings.',
'Страви впорядковано за консервативним Elo-рейтингом. Накопичені бали показуються окремо й ніколи не обнуляються.':'Dishes are ranked by conservative Elo. Lifetime points appear separately and never reset.',
'Усі категорії':'All categories','За чесним рейтингом':'By fair ranking','За вічними балами':'By lifetime points',
'За перемогами':'By wins','За часткою перемог':'By win rate','Місце':'Place','Страва':'Dish',
'Рейтинг*':'Rating*','Вічні бали':'Lifetime points','Перемоги':'Wins','Успішність':'Win rate',
'Страви за цим запитом не знайдено.':'No dishes match that search.','Пошук за назвою страви...':'Search dish names...',
'Пошук страв':'Search dishes','Категорія рейтингу':'Ranking category','Сортування':'Sort by',
'РЕЦЕПТИ ТА НОТАТКИ':'RECIPES AND NOTES','Усі ваші страви.':'All your dishes.',
'У каталозі збережено назви, описи, тип смаку та історичні оцінки з оригінальної таблиці.':'The catalog keeps names, descriptions, taste types and historical ratings from your original sheet.',
'Знайти страву...':'Find a dish...','+ Додати страву':'+ Add dish','Змінити':'Edit',
'Продовжити калібрування':'Continue calibration','Не знайдено жодної страви.':'No dishes found.',
'ПОВНИЙ ЖУРНАЛ':'COMPLETE LOG','Історія двобоїв.':'Duel history.',
'Кожен результат залишається записаним. При новому турнірі попередні матчі, бали та Elo не скидаються.':'Each result is recorded. New tournaments never reset previous matches, points or Elo.',
'Усі голосування':'All votes','Видалена страва':'Deleted dish','перемогла':'defeated',
'Матч':'Match','Фінал':'Final','Повторний фінал':'Final reset','Верхня сітка':'Upper bracket',
'Нижня сітка':'Lower bracket','Вільний двобій':'Free duel','Автокалібрування':'Auto-calibration',
'Показано останні 200 голосувань. Усі результати доступні в JSON-резервній копії.':'Showing the most recent 200 votes. All results are available in the JSON backup.',
'Історія поки порожня. Проведіть свій перший двобій.':'Your history is empty. Try your first duel.',
'ДАНІ ТА МЕТОДОЛОГІЯ':'DATA AND METHODOLOGY','Налаштування.':'Settings.',
'Тут можна створити резервну копію, перенести результати на інший пристрій та подивитися точні правила оцінювання.':'Back up your data, transfer it between devices and review the rating rules.',
'Резервна копія':'Backup','Завантажте всі страви, історію результатів, турніри та чемпіонів одним JSON-файлом. Це також спосіб перенести дані на інший пристрій.':'Download all dishes, results, tournaments and champions in a single JSON file, also suitable for transferring to another device.',
'Завантажити JSON':'Download JSON','Імпортувати JSON':'Import JSON','Експорт рейтингу':'Export rankings',
'Збережіть поточні результати у форматі CSV. Файл відкривається в Excel і містить рейтинг, бали, перемоги та кількість ігор.':'Export rankings to CSV for Excel, including ratings, points, wins and matches.',
'Експортувати CSV':'Export CSV','Правила чесного рейтингу':'Fair ranking rules',
'НЕЗНИКНЕННІ БАЛИ':'LIFETIME POINTS','ELO ТА НАДІЙНІСТЬ':'ELO AND CONFIDENCE',
'Важливо:':'Important:','Одиночні категорії та калібрування':'Solo categories and calibration',
'Збереження та безпека':'Storage and security','Видалити локальний прогрес та відновити 42 страви':'Clear local progress and restore 42 dishes',
'Приховані страви':'Hidden dishes','Відновити':'Restore',
'Нова страва':'New dish','Редагувати страву':'Edit dish','Назва *':'Name *','Назва страви':'Dish name',
'Категорія *':'Category *','+ Нова категорія...':'+ New category...','Назва нової категорії':'New category name',
'Наприклад, Сніданок':'For example, Breakfast','Тип страви':'Dish type','Попередній вигляд':'Preview',
'Стандартні смакові мітки':'Standard taste labels','Кастомні смакові теги':'Custom taste tags',
'Можна ввести кілька тегів через кому.':'Separate multiple tags with commas.','Опис':'Description',
'Інгредієнти, особливості, спогади...':'Ingredients, details, memories...',
'Видалити страву':'Delete dish','Скасувати':'Cancel','Зберегти страву':'Save dish',
'Закрити':'Close','Оберіть одну або кілька готових міток':'Choose one or more taste labels',
'Мінімалістична SVG-іконка':'Minimal SVG icon',
'ПЕРЕБІГ ТУРНІРУ':'TOURNAMENT PROGRESS','Турнірна сітка.':'Tournament bracket.',
'Верхня сітка — без поразок. Нижня — другий шанс. Дві поразки означають вибуття лише з цього турніру.':'Upper bracket means undefeated; lower bracket offers a second chance. Two losses eliminate a dish from this tournament only.',
'Почати турнір':'Start tournament','Потрібні принаймні дві страви.':'At least two dishes are required.',
'Турнір завершений':'Tournament finished','Чемпіон визначений':'Champion crowned',
'До двобою →':'Go to duel →','Немає учасників':'No contestants','Поки порожньо':'Empty for now',
'Вибули з поточного турніру':'Eliminated from this tournament','Поки жодного вибулого учасника.':'Nobody has been eliminated yet.',
'Колишні чемпіони':'Past champions',
'ПОЧАТКОВИЙ РЕЙТИНГ':'INITIAL RATING','Знайдемо місце для нової страви.':'Let’s find this dish’s place.',
'Калібрування страви.':'Dish calibration.',
'Порівнюйте за особистими вподобаннями. Система сама визначить кількість зіставлень від 1 до 10, залежно від результатів та наявних суперників.':'Compare based on your taste. The system chooses 1–10 matches based on results and available opponents.',
'Поточний Elo':'Current Elo','Початок: 1500':'Starts at 1500','Проведено':'Completed',
'До десяти двобоїв':'Up to ten duels','Без обнулення':'Never resets',
'Підбір першого рейтингу':'Finding initial rating','Результат калібрування':'Calibration result',
'Еталони з інших категорій':'References from other categories','Автоматичний процес':'Automatic process',
'КАЛІБРУВАННЯ ЗАВЕРШЕНО':'CALIBRATION COMPLETE','АВТОМАТИЧНЕ КАЛІБРУВАННЯ':'AUTOMATIC CALIBRATION',
'Інший суперник':'Another opponent','До каталогу →':'To catalog →',
'Чи чесно це для інших страв?':'Is this fair for the other dishes?',
'Чому кількість матчів різна?':'Why do match counts differ?',
'Страву не знайдено.':'Dish not found.',
'Досягнуто максимуму 10 двобоїв':'Maximum of 10 duels reached',
'Результати достатньо послідовні':'Results are sufficiently consistent',
'Використано всіх доступних суперників':'All available opponents used',
'Немає інших страв для порівняння':'No other dishes to compare',
'Початковий рейтинг визначено':'Initial rating established',
'Немає останнього голосу для скасування.':'No vote to undo.',
'Останній результат скасовано.':'Last result undone.',
'Турнір розпочато. Бажаю приємних двобоїв.':'Tournament started. Enjoy the matches.',
'Запропоновано іншу пару.':'Another pairing is ready.',
'Остання версія локально':'Latest local version',
};
const dynamic=[
 [/^(\d+) двобоїв у постійній історії\.$/,'$1 duels in permanent history.'],
 [/^(\d+) двобоїв$/,'$1 duels'],[/^(\d+) перемог$/,'$1 wins'],[/^(\d+) поразок$/,'$1 losses'],
 [/^(\d+) страви$/,'$1 dishes'],[/^(\d+) страв$/,'$1 dishes'],
 [/^(\d+) УЧАСНИКІВ$/,'$1 CONTESTANTS'],[/^(\d+) матчів$/,'$1 matches'],
 [/^РАУНД (\d+)$/,'ROUND $1'],[/^ДВОБІЙ (\d+)$/,'DUEL $1'],
 [/^Претендент (\d+) · /,'Contender $1 · '],
 [/^Останній чемпіон: /,'Latest champion: '],
 [/^Чемпіон: /,'Champion: '],[/^Страва: /,'Dish: '],
 [/^Турнір у процесі/,'Tournament in progress'],
 [/^Калібрування (\d+)\/(\d+)$/,'Calibration $1/$2'],
 [/\bдвобоїв\b/g,'duels'],[/\bперемог\b/g,'wins'],[/\bпоразок\b/g,'losses'],[/\bбалів\b/g,'points'],[/\bрейтинг\b/g,'rating']
];
let lang='uk',theme='dark';
try{if(localStorage.getItem(LANG_KEY)==='en')lang='en';if(localStorage.getItem(THEME_KEY)==='light')theme='light';}catch{}
const skipped='.dish-card h3,.dish-card p,.fighter h3,.fighter-desc,.leader-name,.td-title,.entry-name,.cat-name,.card-cat,.dish-type,.taste-chip,.taste-preview,.fighter-tag,.leader-meta,.td-sub,.notice b,.history-main b,.history-sub,.formula,.dish-icon,.dish-card-meta,.field textarea,.field input,.field select option,.cat-letter,.data-table tbody td:nth-child(2),[data-no-translate]';
function tr(raw){const trimmed=raw.trim();if(!trimmed)return raw;let translated=words[trimmed];if(!translated){translated=trimmed;for(const [rx,to] of dynamic)translated=translated.replace(rx,to);if(translated===trimmed)return raw;}return raw.slice(0,raw.indexOf(trimmed))+translated+raw.slice(raw.indexOf(trimmed)+trimmed.length)}
function controls(){return `<div class="ui-preferences" role="group" aria-label="Language and theme">
<button type="button" class="ui-pref" data-ui-language="uk" aria-label="Українська" title="Українська" data-active="${lang==='uk'}">UA</button>
<button type="button" class="ui-pref" data-ui-language="en" aria-label="English" title="English" data-active="${lang==='en'}">EN</button>
<button type="button" class="ui-pref" data-ui-theme="toggle" title="${theme==='dark'?'Світла тема / Light theme':'Темна тема / Dark theme'}" aria-label="${theme==='dark'?'Switch to light theme':'Switch to dark theme'}"><svg class="mini-icon" viewBox="0 0 24 24" aria-hidden="true">${theme==='dark'?'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>':'<path d="M20.6 14.6A9 9 0 0 1 9.4 3.4a9 9 0 1 0 11.2 11.2Z"/>'}</svg></button></div>`}
function apply(){
 const html=document.documentElement;html.lang=lang;html.dataset.theme=theme;
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#11170f':'#f6f3ec');
 document.title=lang==='en'?'Taste League — Dish Duels':'Смакова ліга — дуелі страв';
 if(lang!=='en')return;
 const root=document.getElementById('app');if(!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 nodes.forEach(n=>{const p=n.parentElement;if(!p||p.closest(skipped)||['SCRIPT','STYLE','TEXTAREA'].includes(p.tagName)||p.isContentEditable)return;n.nodeValue=tr(n.nodeValue)});
 root.querySelectorAll('[placeholder],[aria-label],[title]').forEach(el=>{
  if(el.closest(skipped))return;
  for(const key of ['placeholder','aria-label','title']){const v=el.getAttribute(key);if(v)el.setAttribute(key,tr(v));}
 });
}
function setLang(next){if(!['uk','en'].includes(next))return;lang=next;try{localStorage.setItem(LANG_KEY,lang)}catch{};window.render?.()}
function switchTheme(){theme=theme==='dark'?'light':'dark';try{localStorage.setItem(THEME_KEY,theme)}catch{};window.render?.()}
document.addEventListener('click',e=>{const l=e.target.closest('[data-ui-language]'),t=e.target.closest('[data-ui-theme]');if(l){e.preventDefault();setLang(l.dataset.uiLanguage)}else if(t){e.preventDefault();switchTheme()}});
document.documentElement.dataset.theme=theme;
window.SMAKOVA_UI={controls,apply,getLang:()=>lang,getTheme:()=>theme,translate:tr};
})();
