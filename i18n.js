'use strict';
/* ===== Localization =====
   To add a language: add a block to `translations` (same keys as `en`)
   and one entry to `LANGS` (code + native name). Nothing else is required.
   Missing keys fall back to English; unknown keys return the key itself. */
const LANG_KEY='cw_lang';
const LANGS=[['en','English'],['ru','Русский']];
const translations={
en:{
 title:'Brick Breaker: Crystal Worlds',
 logo1:'BRICK BREAKER',logo2:'CRYSTAL WORLDS',
 'menu.continue':'CONTINUE','menu.levels':'LEVELS','menu.upgrades':'UPGRADES','menu.worlds':'WORLDS','menu.settings':'SETTINGS','menu.menu':'MENU',
 back:'BACK',play:'PLAY',on:'ON',off:'OFF',
 'levels.title':'Levels',
 'worlds.title':'Worlds','worlds.progress':'{c}/20 levels','worlds.locked':'Clear level {n} to unlock',
 'world.0':'Emerald Forest','world.1':'Frozen Crystals','world.2':'Cosmic Nebula','world.3':'Golden Ruins','world.4':'Void Dimension',
 'upgrades.title':'Upgrades','up.level':'Lv {l}','up.max':'MAX',
 'up.0.name':'Ball Damage','up.0.desc':'+1 damage per hit',
 'up.1.name':'Starting Balls','up.1.desc':'+1 ball each shot',
 'up.2.name':'Bonus Chance','up.2.desc':'More bonus bricks drop power-ups',
 'up.3.name':'Energy Reward','up.3.desc':'+10% energy per level',
 'up.4.name':'Special Ball Power','up.4.desc':'Stronger explosions',
 'settings.title':'Settings','set.language':'Language','set.music':'Music','set.musicVol':'Music volume','set.sfx':'Sound effects','set.sfxVol':'Effects volume',
 'win.title':'Level {n} clear!','win.newWorld':'New world unlocked: {w}','win.next':'NEXT LEVEL','win.allDone':'You restored every world!','win.replay':'REPLAY',
 'lose.title':'LEVEL FAILED','lose.level':'Level {n}','lose.blocks':'Blocks destroyed: {k}','lose.energy':'Energy earned: +◆ {g}','lose.consolation':'includes ◆ {c} consolation reward','lose.retry':'RETRY','lose.map':'LEVEL MAP',
 'toast.multi':'MULTIBALL','toast.power':'POWER','toast.explosion':'EXPLOSION','toast.bonus':'BONUS ENERGY','toast.daily':'Daily reward: +◆ {r}',
 'hud.power':'POWER x2',
 'a11y.speed':'Game speed','a11y.menu':'Menu'
},
ru:{
 title:'Brick Breaker: Crystal Worlds',
 logo1:'BRICK BREAKER',logo2:'CRYSTAL WORLDS',
 'menu.continue':'ПРОДОЛЖИТЬ','menu.levels':'УРОВНИ','menu.upgrades':'УЛУЧШЕНИЯ','menu.worlds':'МИРЫ','menu.settings':'НАСТРОЙКИ','menu.menu':'МЕНЮ',
 back:'НАЗАД',play:'ИГРАТЬ',on:'ВКЛ',off:'ВЫКЛ',
 'levels.title':'Уровни',
 'worlds.title':'Миры','worlds.progress':'Пройдено: {c}/20','worlds.locked':'Пройдите уровень {n}, чтобы открыть',
 'world.0':'Изумрудный лес','world.1':'Ледяные кристаллы','world.2':'Космическая туманность','world.3':'Золотые руины','world.4':'Измерение пустоты',
 'upgrades.title':'Улучшения','up.level':'Ур. {l}','up.max':'МАКС',
 'up.0.name':'Урон шара','up.0.desc':'+1 к урону за удар',
 'up.1.name':'Стартовые шары','up.1.desc':'+1 шар в каждом выстреле',
 'up.2.name':'Шанс бонуса','up.2.desc':'Бонусные блоки чаще дают усиления',
 'up.3.name':'Награда энергии','up.3.desc':'+10% энергии за уровень',
 'up.4.name':'Сила особых шаров','up.4.desc':'Более мощные взрывы',
 'settings.title':'Настройки','set.language':'Язык','set.music':'Музыка','set.musicVol':'Громкость музыки','set.sfx':'Звуковые эффекты','set.sfxVol':'Громкость эффектов',
 'win.title':'Уровень {n} пройден!','win.newWorld':'Открыт новый мир: {w}','win.next':'СЛЕДУЮЩИЙ УРОВЕНЬ','win.allDone':'Вы восстановили все миры!','win.replay':'ЗАНОВО',
 'lose.title':'УРОВЕНЬ НЕ ПРОЙДЕН','lose.level':'Уровень {n}','lose.blocks':'Разрушено блоков: {k}','lose.energy':'Получено энергии: +◆ {g}','lose.consolation':'включая ◆ {c} утешительной награды','lose.retry':'ЕЩЁ РАЗ','lose.map':'КАРТА УРОВНЕЙ',
 'toast.multi':'МУЛЬТИШАР','toast.power':'СИЛА','toast.explosion':'ВЗРЫВ','toast.bonus':'БОНУС ЭНЕРГИИ','toast.daily':'Ежедневная награда: +◆ {r}',
 'hud.power':'СИЛА x2',
 'a11y.speed':'Скорость игры','a11y.menu':'Меню'
}};
let LANG='en';
try{const l=localStorage.getItem(LANG_KEY);if(l&&translations[l])LANG=l}catch(e){}
function t(key,p){let s=translations[LANG]&&translations[LANG][key];if(s==null)s=translations.en[key];if(s==null)return key;
 return p?s.replace(/\{(\w+)\}/g,(m,n)=>n in p?p[n]:m):s}
const wn=i=>t('world.'+i);
function applyLang(){document.documentElement.lang=LANG;document.title=t('title');
 const f=document.getElementById('ff'),p=document.getElementById('pb');
 if(f)f.title=f.ariaLabel=t('a11y.speed');if(p)p.title=p.ariaLabel=t('a11y.menu')}
function setLang(l){if(!translations[l])return;LANG=l;try{localStorage.setItem(LANG_KEY,l)}catch(e){}applyLang()}
