'use strict';
/* ===== Config & worlds ===== */
const W=360,H=640,COLS=9,BW=40,BH=30,TOP=78,LY=590,R=6,SP=6.8,SUB=3,DL=574,SHOW_AD=true;
const WORLDS=[
{n:'Emerald Forest',c:['#10b981','#6ee7b7'],bg:['#021a14','#064e3b']},
{n:'Frozen Crystals',c:['#38bdf8','#bae6fd'],bg:['#03122a','#0c4a6e']},
{n:'Cosmic Nebula',c:['#c084fc','#f0abfc'],bg:['#12042a','#4c1d95']},
{n:'Golden Ruins',c:['#fbbf24','#fde68a'],bg:['#1c1203','#78350f']},
{n:'Void Dimension',c:['#f43f5e','#fda4af'],bg:['#08040f','#4c0519']}];
const UPS=[['Ball Damage','+1 damage per hit',40],['Starting Balls','+1 ball each shot',60],['Bonus Chance','More bonus bricks drop power-ups',50],['Energy Reward','+10% energy per level',45],['Special Ball Power','Stronger explosions',55]];
const UMAX=10,upCost=i=>Math.round(UPS[i][2]*Math.pow(1.55,S.up[i]));
/* ===== Storage ===== */
const KEY='cw_save_v1',def=()=>({done:0,en:0,up:[0,0,0,0,0],sfx:1,mus:1,vol:.6,mv:.6,sv:.6,daily:''});
let S=def();
try{const o=JSON.parse(localStorage.getItem(KEY));if(o&&typeof o.done==='number'&&Array.isArray(o.up)&&o.up.length==5){if(typeof o.mv!="number")o.mv=typeof o.vol=="number"?o.vol:.6;if(typeof o.sv!="number")o.sv=typeof o.vol=="number"?o.vol:.6;S=Object.assign(def(),o)}}catch(e){}
S.done=Math.max(0,Math.min(100,S.done|0));S.mv=Math.max(0,Math.min(1,+S.mv||0));S.sv=Math.max(0,Math.min(1,+S.sv||0));S.en=Math.max(0,S.en|0);S.up=S.up.map(v=>Math.max(0,Math.min(UMAX,v|0)));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
/* ===== Audio: SFX + new soft ambient music ===== */
let AC=null,MG=null,mt=null;
function initAudio(){if(AC){if(AC.state=='suspended')AC.resume();return}
 try{AC=new(window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.gain.value=0;
 const hp=AC.createBiquadFilter(),lp=AC.createBiquadFilter(),dl=AC.createDelay(2),fb=AC.createGain(),wet=AC.createGain();
 hp.type='highpass';hp.frequency.value=150;lp.type='lowpass';lp.frequency.value=1800;dl.delayTime.value=.5;fb.gain.value=.35;wet.gain.value=.35;
 MG.connect(hp);hp.connect(lp);lp.connect(AC.destination);lp.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(AC.destination);
 setMusicVol();startMusic()}catch(e){}}
function setMusicVol(){if(MG)MG.gain.setTargetAtTime(S.mus?S.mv*.6:0,AC.currentTime,S.mus?2.5:.4)}
function tone(f,d,ty,v){if(!AC||!S.sfx)return;const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=ty||'sine';o.frequency.value=f;g.gain.setValueAtTime(v*S.sv,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+d)}
const CH=[[220,261.6,329.6,392],[174.6,220,261.6,349.2],[196,246.9,293.7,392],[220,261.6,329.6,440]];
function voice(f,t,a,d,v){const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f;o.detune.value=(Math.random()-.5)*10;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(MG);o.start(t);o.stop(t+d+.1)}
function startMusic(){clearInterval(mt);let nx=AC.currentTime+.3,bar=0,last=0;
 mt=setInterval(()=>{if(!AC||!S.mus||document.hidden){nx=Math.max(nx,AC.currentTime+.3);return}
  while(nx<AC.currentTime+3){const c=CH[bar++%4];c.forEach((f,i)=>voice(f,nx+i*.15,2.5,9,.05));
   const n=2+(Math.random()*3|0);for(let j=0;j<n;j++){let f=c[Math.random()*4|0]*2;if(f==last)f/=2;last=f;voice(f,nx+1+j*(4.5/n)+Math.random()*.6,.03,3,.045)}
   nx+=6}},1000)}
const sHit=n=>tone(300+n*40,.06,'triangle',.15),sBreak=()=>tone(620+Math.random()*200,.12,'square',.1),sBonus=()=>{tone(660,.1,'sine',.25);setTimeout(()=>tone(990,.15,'sine',.25),80)},sWin=()=>[523,659,784,1047].forEach((f,i)=>setTimeout(()=>tone(f,.25,'sine',.3),i*120));
/* ===== Levels (50, generated from 10 shapes, seeded) ===== */
function rng(s){return()=>(s=s*16807%2147483647)/2147483647}
const SHAPES=[(x,y)=>1,(x,y)=>(x+y)%2==0,(x,y)=>Math.abs(x-4)<=y,(x,y,n)=>Math.abs(x-4)+Math.abs(y-n/2+.5)<=Math.max(3,n/2),(x,y,n)=>x%8==0||y==0||y==n-1,(x,y)=>x%2==0,(x,y)=>(x+y)%4<2,(x,y,n)=>Math.abs(x-4)<=n-1-y,(x,y,n)=>x==y%9||x==8-y%9||y==0,null];
function buildOld(i){
 const w=i/10|0,r=rng(i*977+13),n=i<3?3+i:Math.min(5+(i/6|0),11),bs=[];
 const sh=i<3?0:i<8?[1,2,5,3,6][i-3]:(i*7+w*3)%10,f=SHAPES[sh]||null,half=[];
 for(let y=0;y<n;y++)for(let x=0;x<5;x++)half[y*9+x]=r()<.62;
 for(let y=0;y<Math.min(n,9);y++)for(let x=0;x<COLS;x++){
  const on=f?f(x,y,n):half[y*9+Math.min(x,8-x)];if(!on)continue;
  let hp=1+(i/9|0)+(r()<.15*w?1:0),t='n';if(i<5)hp=1+(i>2?1:0);
  const q=r();
  if(i>=5&&q<.10)t='c';else if(i>=8&&q<.17)t='b';else if(i>=12&&q<.22)t='e';else if(i>=15&&q<.26&&y>0&&y<n-1&&x%2)t='m';
  if(t=='m')hp=9;hp=Math.min(hp,14);bs.push({x:x*BW,y:TOP+y*BH,hp,mx:hp,t})}
 return bs}
const SH2=[(x,y,n)=>Math.abs(x-4)>=Math.abs(y-(n-1)/2)*1.3,x=>x%3!=1,(x,y,n)=>x==y||x==8-y||y==0||y==n-1,(x,y,n)=>{const d=Math.abs(x-4)+Math.abs(y-(n-1)/2);return d>=2&&d<=4},(x,y)=>(x+y)%5<3,(x,y)=>(x>=y&&x<=8-y)||y>4,(x,y)=>((x>>1)+y)%2==0,x=>x!=4,(x,y)=>(x+y*2)%4!=0,(x,y)=>y==0||x%2==0,(x,y,n)=>x%8==0||y==0||y==n-1||x==4||y==(n>>1),null];
function buildNew(i){const r=rng(i*7919+101),d=(i-50)/49,n=Math.min(7+(d*2.2|0),9),f=SH2[(i*5+3)%12],half=[],bs=[];
 for(let y=0;y<n;y++)for(let x=0;x<5;x++)half[y*9+x]=r()<.72;
 for(let y=0;y<n;y++)for(let x=0;x<COLS;x++){const on=f?f(x,y,n):half[y*9+Math.min(x,8-x)];if(!on||(i%3==0&&r()<.12))continue;
  let hp=Math.min(14,Math.round(2+d*8+r()*3)+(i>=95?2:0)),t='n';const q=r();
  if(q<.07)t='c';else if(q<.14)t='b';else if(q<.22)t='e';else if(q<.26+d*.08)t='m';
  if(t=='m')hp=Math.min(14,hp+3);bs.push({x:x*BW,y:TOP+y*BH,hp,mx:hp,t})}
 return bs}
const buildLevel=i=>i<50?buildOld(i):buildNew(i);
/* ===== State ===== */
const cv=document.getElementById('c'),cx=cv.getContext('2d'),ui=document.getElementById('ui'),pb=document.getElementById('pb');
let k=1,mode='menu',lv=0,bricks=[],balls=[],queue=0,phase='aim',lx=W/2,nlx=null,dir=null,aim=null,pw=1,fc=0,shotT=0,parts=[],stars=[],earned=0,nb=0,own=5,land=[],grp=[],kills=0,ff=false,st=0;
for(let i=0;i<70;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*1.6+.4,p:Math.random()*6});
const adEl=document.getElementById('ad'),ffb=document.getElementById('ff');adEl.classList.toggle('off',!SHOW_AD);
function fit(){const d=Math.min(devicePixelRatio||1,2),ah=SHOW_AD?adEl.offsetHeight:0,cs=getComputedStyle(document.body),pv=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom),ph=parseFloat(cs.paddingLeft)+parseFloat(cs.paddingRight),s=Math.max(.2,Math.min((innerWidth-ph)/W,(innerHeight-pv-ah)/H));document.documentElement.style.setProperty('--adh',ah+'px');k=s*d;cv.style.width=W*s+'px';cv.style.height=H*s+'px';cv.width=W*k;cv.height=H*k}
addEventListener('resize',fit);fit();
const wIdx=()=>mode=='play'?lv/20|0:Math.min(S.done/20|0,4),wd=()=>WORLDS[wIdx()];
function toast(t){const e=document.getElementById('toast');e.innerHTML=t;e.style.opacity=1;setTimeout(()=>e.style.opacity=0,2600)}
function boom(x,y,c,n){for(let i=0;i<n&&parts.length<160;i++){const a=Math.random()*6.28,s=Math.random()*3+1;parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1,c})}}
/* ===== Screens ===== */
function scr(h){ui.innerHTML=h;ui.style.display=h?'flex':'none';if(h){pb.hidden=true;ffb.hidden=true}}
function showFF(){ffb.hidden=mode!='play';ffb.textContent=ff?'⏩ x2':'▶ x1';ffb.style.borderColor=ff?'#fbbf24':''}
function toggleFF(){if(mode!='play')return;ff=!ff;showFF()}
function menu(){mode='menu';pb.hidden=true;scr(`<div class=logo>${t('logo1')}<small>${t('logo2')}</small></div><div class=en>◆ ${S.en}</div>
<button onclick="cont()">${t('menu.continue')}</button><button onclick="levels()">${t('menu.levels')}</button><button onclick="upgrades()">${t('menu.upgrades')}</button><button onclick="worlds()">${t('menu.worlds')}</button><button onclick="settings()">${t('menu.settings')}</button>`)}
function cont(){initAudio();play(Math.min(S.done,49))}
function levels(){initAudio();let h=`<h2>${t('levels.title')}</h2>`;
 for(let w=0;w<5;w++){const W_=WORLDS[w];h+=`<div style="color:${W_.c[1]}">${wn(w)}</div><div class=grid style="--a:${W_.c[0]};--b:${W_.bg[1]}">`;
  for(let j=0;j<20;j++){const i=w*20+j,st=i<S.done?'done':i==S.done?'':'lock';h+=`<button class="${st}" ${i>S.done?'disabled':''} onclick="play(${i})">${i+1}</button>`}h+='</div>'}
 scr(h+`<button onclick="menu()">${t('back')}</button>`)}
function worlds(){let h=`<h2>${t('worlds.title')}</h2>`;
 WORLDS.forEach((w,i)=>{const open=S.done>=i*20,c=Math.max(0,Math.min(20,S.done-i*20));
  h+=`<div class=row style="border-color:${w.c[0]}"><div><b style="color:${w.c[1]}">${wn(i)}</b><small>${open?t('worlds.progress',{c}):t('worlds.locked',{n:i*20})}</small></div><button class=sm ${open?'':'disabled'} onclick="play(${Math.min(i*20+c,i*20+19)})">${t('play')}</button></div>`});
 scr(h+`<button onclick="menu()">${t('back')}</button>`)}
function upgrades(){let h=`<h2>${t('upgrades.title')}</h2><div class=en>◆ ${S.en}</div>`;
 UPS.forEach((u,i)=>{const l=S.up[i],mx=l>=UMAX;h+=`<div class=row><div><b>${t('up.'+i+'.name')}</b><small>${t('up.'+i+'.desc')}</small><small>${t('up.level',{l})}${mx?' '+t('up.max'):' → '+(l+1)}</small></div><button class=sm ${mx||S.en<upCost(i)?'disabled':''} onclick="buy(${i})">${mx?t('up.max'):'◆ '+upCost(i)}</button></div>`});
 scr(h+`<button onclick="menu()">${t('back')}</button>`)}
function buy(i){const c=upCost(i);if(S.up[i]>=UMAX||S.en<c)return;S.en-=c;S.up[i]++;save();sBonus();upgrades()}
function settings(){scr(`<h2>${t('settings.title')}</h2>
<div class=row><span>${t('set.language')}</span><div class=lang>${LANGS.map(([c,n])=>`<button class="sm${c==LANG?' on':''}" onclick="setLang('${c}');settings()">${n}</button>`).join('')}</div></div>
<button onclick="S.mus^=1;save();setMusicVol();settings()">${t('set.music')}: ${S.mus?t('on'):t('off')}</button>
<div class=row><span>${t('set.musicVol')}</span><input type=range min=0 max=100 value=${Math.round(S.mv*100)} oninput="S.mv=this.value/100;setMusicVol()" onchange="save()"></div>
<button onclick="S.sfx^=1;save();settings()">${t('set.sfx')}: ${S.sfx?t('on'):t('off')}</button>
<div class=row><span>${t('set.sfxVol')}</span><input type=range min=0 max=100 value=${Math.round(S.sv*100)} oninput="S.sv=this.value/100" onchange="save();tone(660,.1,'sine',.3)"></div>
<button onclick="menu()">${t('back')}</button>`)}
/* ===== Gameplay ===== */
function play(i){initAudio();mode='play';lv=i;bricks=buildLevel(i).map(b=>(b.dy=0,b));balls=[];queue=0;phase='aim';lx=W/2;pw=1;parts=[];earned=0;kills=0;own=nBalls();land=[];grp=Array.from({length:own},()=>({x:lx}));ff=false;scr('');pb.hidden=false;showFF()}
const need=()=>bricks.length>0;
const nBalls=()=>5+S.up[1]+(lv/10|0),dmg=()=>1+S.up[0];
function aimDir(px,py){let a=Math.atan2(py-LY,px-lx);if(py>=LY-10)return null;a=Math.max(-Math.PI+.2,Math.min(-.2,a));return{x:Math.cos(a),y:Math.sin(a)}}
function fire(){if(!aim)return;dir=aim;aim=null;phase='fire';queue=own;nlx=null;shotT=0;st=0;land=[];grp=[];pw=1}
function trace(){let x=lx,y=LY,d=aim,pts=[[x,y]],bounces=0;
 for(let s=0;s<260;s++){x+=d.x*4;y+=d.y*4;if(x<R||x>W-R){d={x:-d.x,y:d.y};x=Math.max(R,Math.min(W-R,x));bounces++;pts.push([x,y])}
  if(y<R+TOP-30){d={x:d.x,y:-d.y};y=R+TOP-30;bounces++;pts.push([x,y])}
  if(bricks.some(b=>x>b.x-R&&x<b.x+BW+R&&y>b.y-R&&y<b.y+BH+R)||bounces>2||y>LY+2)break}
 pts.push([x,y]);return pts}
function hit(b,d){if(!bricks.includes(b))return;b.hp-=d;b.fl=1;
 if(b.hp>0){sHit(Math.min(b.hp,8));return}kill(b)}
function blast(x,y,rad,d){boom(x,y,'#fff',14);tone(110,.25,'sawtooth',.25);bricks.slice().forEach(o=>{if(Math.hypot(o.x+BW/2-x,o.y+BH/2-y)<rad)hit(o,d)})}
function kill(b){kills++;bricks=bricks.filter(o=>o!==b);const c=wd().c,cxp=b.x+BW/2,cyp=b.y+BH/2;boom(cxp,cyp,c[b.t=='c'?1:0],10);sBreak();
 if(b.t=='c'){earned+=3;boom(cxp,cyp,'#67e8f9',8)}
 if(b.t=='e')blast(cxp,cyp,BW*1.6,3+S.up[4]);
 if(b.t=='b'&&Math.random()<.6+S.up[2]*.04){sBonus();const r=Math.random();
  if(r<.35){for(let i=0;i<3;i++)balls.push({x:cxp,y:cyp,vx:(Math.random()-.5)*SP,vy:SP*(i?-.8:.8),h:0,t:[]});own+=3;toast(t('toast.multi'))}
  else if(r<.6){pw=2;toast(t('toast.power'))}else if(r<.85){blast(cxp,cyp,BW*2.2,4+S.up[4]);toast(t('toast.explosion'))}else{earned+=10;toast(t('toast.bonus'))}}
 earned+=1;if(!need())win()}
function win(){phase='won';const base=Math.round((20+lv*3)*(1+S.up[3]*.1))+earned;S.en+=base;S.done=Math.max(S.done,lv+1);const nw=S.done%20==0&&S.done<100&&lv+1==S.done;save();sWin();
 for(let i=0;i<60;i++)boom(Math.random()*W,Math.random()*300,wd().c[i%2],1);
 setTimeout(()=>{if(mode!='play')return;scr(`<h2>${t('win.title',{n:lv+1})}</h2><div class=en>+◆ ${base}</div>${nw?`<div>${t('win.newWorld',{w:wn(S.done/20|0)})}</div>`:''}${lv<99?`<button onclick="play(${lv+1})">${t('win.next')}</button>`:`<div>${t('win.allDone')}</div>`}<button onclick="play(${lv})">${t('win.replay')}</button><button onclick="menu()">${t('menu.menu')}</button>`)},900)}
function stepBalls(){for(let q=0;q<SUB;q++)for(let i=balls.length-1;i>=0;i--){const b=balls[i];b.x+=b.vx;b.y+=b.vy;
  if(b.x<R){b.x=R;b.vx=Math.abs(b.vx)}if(b.x>W-R){b.x=W-R;b.vx=-Math.abs(b.vx)}if(b.y<TOP-30+R){b.y=TOP-30+R;b.vy=Math.abs(b.vy)}
  if(b.y>=LY&&b.vy>0){if(nlx===null)nlx=Math.max(R,Math.min(W-R,b.x));land.push({x:Math.max(R,Math.min(W-R,b.x))});balls.splice(i,1);continue}
  for(const o of bricks){const px=Math.max(o.x,Math.min(b.x,o.x+BW)),py=Math.max(o.y,Math.min(b.y,o.y+BH)),dx=b.x-px,dy=b.y-py,d2=dx*dx+dy*dy;if(d2>=R*R)continue;
   let nx,ny;if(d2>0.0001){const d=Math.sqrt(d2);nx=dx/d;ny=dy/d;b.x=px+nx*R;b.y=py+ny*R}else{ny=b.vy>0?-1:1;nx=0}
   const dot=b.vx*nx+b.vy*ny;if(dot<0){b.vx-=2*dot*nx;b.vy-=2*dot*ny}hit(o,dmg()*pw);break}}}
function endWave(){phase='aim';pw=1;if(nlx!==null)lx=nlx;const hf=(own-1)*6;lx=Math.max(R+hf,Math.min(W-R-hf,lx));
 grp=land.map(o=>({x:o.x}));while(grp.length<own)grp.push({x:lx});grp.length=own;
 bricks.forEach(b=>{b.y+=BH;b.dy-=BH});if(bricks.some(b=>b.y+BH>=DL))lose()}
function lose(){phase='lost';const std=Math.round((20+lv*3)*(1+S.up[3]*.1)),comp=Math.round(std*.25),g=earned+comp;S.en+=g;save();tone(220,.4,'sine',.25);
 setTimeout(()=>{if(mode!='play'||phase!='lost')return;scr(`<h2>${t('lose.title')}</h2><div>${t('lose.level',{n:lv+1})}</div><div>${t('lose.blocks',{k:kills})}</div><div class=en>${t('lose.energy',{g})}</div><small>${t('lose.consolation',{c:comp})}</small><button onclick="play(${lv})">${t('lose.retry')}</button><button onclick="levels()">${t('lose.map')}</button><button onclick="menu()">${t('menu.menu')}</button>`)},700)}
function update(){fc++;if(mode!='play'||phase!='fire')return;
 for(let r=0;r<(ff?2:1);r++){if(phase!='fire')break;st++;shotT++;
  if(queue>0&&st%4==0){balls.push({x:lx,y:LY,vx:dir.x*SP,vy:dir.y*SP,h:0});queue--;tone(480,.05,'sine',.15)}
  stepBalls();
  for(const b of balls){const sp=Math.hypot(b.vx,b.vy)||SP;if(Math.abs(b.vy)/sp<.15){if(++b.h>45){b.vy+=(b.vy>=0?1:-1)*.5;b.h=0}}else b.h=0;
   const f=SP/sp;if(Math.abs(f-1)>.01){b.vx*=f;b.vy*=f}if(shotT>1500)b.vy=Math.abs(b.vy)+.5}
  if(queue==0&&!balls.length&&phase=='fire')endWave()}}
/* ===== Rendering ===== */
function rr(x,y,w,h,r){cx.beginPath();cx.roundRect?cx.roundRect(x,y,w,h,r):cx.rect(x,y,w,h)}
function draw(){const w=wd();cx.setTransform(k,0,0,k,0,0);
 const g=cx.createLinearGradient(0,0,0,H);g.addColorStop(0,w.bg[0]);g.addColorStop(1,w.bg[1]);cx.fillStyle=g;cx.fillRect(0,0,W,H);
 for(const s of stars){cx.globalAlpha=.3+.4*Math.sin(fc*.03+s.p);cx.fillStyle=w.c[1];cx.fillRect(s.x,(s.y+(mode=='menu'?fc*.15*s.s:0))%H,s.s,s.s)}
 cx.globalAlpha=1;
 if(mode=='menu'){for(let i=0;i<6;i++){const a=fc*.004*(i%2?1:-1)+i,x=W/2+Math.cos(a+i)*(90+i*18),y=H/2+Math.sin(a*1.3+i)*(160+i*14),s=14+i*4;
   cx.save();cx.translate(x,y);cx.rotate(a*2);cx.globalAlpha=.35;cx.fillStyle=w.c[i%2];cx.shadowColor=w.c[0];cx.shadowBlur=18;cx.beginPath();cx.moveTo(0,-s);cx.lineTo(s*.7,0);cx.lineTo(0,s);cx.lineTo(-s*.7,0);cx.fill();cx.restore()}return}
 cx.fillStyle='#fff';cx.font='bold 15px system-ui';cx.textAlign='left';cx.fillText(`${wn(wIdx())} · ${lv+1}`,12,28);cx.fillStyle='#67e8f9';cx.fillText('◆ '+S.en,12,48);
 if(pw>1){cx.fillStyle='#fbbf24';cx.fillText(t('hud.power'),12,66)}
 cx.strokeStyle=w.c[0]+'66';cx.beginPath();cx.moveTo(0,TOP-30);cx.lineTo(W,TOP-30);cx.moveTo(0,LY+R);cx.lineTo(W,LY+R);cx.stroke();const low=bricks.reduce((m,b)=>Math.max(m,b.y+BH),0);cx.save();cx.strokeStyle='#f43f5e';cx.globalAlpha=DL-low<=BH*2?.5+.4*Math.sin(fc*.15):.35;cx.setLineDash([8,6]);cx.beginPath();cx.moveTo(0,DL);cx.lineTo(W,DL);cx.stroke();cx.restore();
 cx.textAlign='center';cx.font='bold 13px system-ui';
 for(const b of bricks){b.dy*=.85;if(Math.abs(b.dy)<.3)b.dy=0;const by=b.y+b.dy,m=b.t=='m',c=m?'#94a3b8':b.t=='e'?'#fb923c':b.t=='c'?'#67e8f9':b.t=='b'?'#fde047':w.c[b.hp%2];
  cx.shadowColor=c;cx.shadowBlur=b.fl>0?14:5;cx.globalAlpha=b.fl>0?1:.55+.4*Math.min(1,b.hp/b.mx);if(b.fl>0)b.fl-=.1;
  cx.fillStyle=c;rr(b.x+2,by+2,BW-4,BH-4,6);cx.fill();cx.shadowBlur=0;cx.globalAlpha=1;cx.fillStyle='#0008';
  cx.fillText(b.t=='e'?'✸':b.t=='b'?'★':b.t=='c'?'◆'+b.hp:b.hp,b.x+BW/2,by+BH/2+5)}
 for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.l-=.03;cx.globalAlpha=Math.max(0,p.l);cx.fillStyle=p.c;cx.fillRect(p.x,p.y,3,3)}
 parts=parts.filter(p=>p.l>0);cx.globalAlpha=1;
 if(aim&&phase=='aim'){cx.strokeStyle='#fff9';cx.setLineDash([4,6]);cx.beginPath();trace().forEach((p,i)=>i?cx.lineTo(p[0],p[1]):cx.moveTo(p[0],p[1]));cx.stroke();cx.setLineDash([])}
 cx.shadowColor='#67e8f9';cx.shadowBlur=6;cx.fillStyle='#fff';
 for(const b of balls){cx.beginPath();cx.arc(b.x,b.y,R,0,6.3);cx.fill()}
 if(phase!='fire'){grp.forEach((g,i)=>{const t=lx+(i-(grp.length-1)/2)*12;g.x+=(t-g.x)*.2;cx.beginPath();cx.arc(g.x,LY,R,0,6.3);cx.fill()})}
 else{for(let i=0;i<queue;i++){cx.beginPath();cx.arc(lx+(i-(queue-1)/2)*12,LY,R,0,6.3);cx.fill()}for(const o of land){cx.beginPath();cx.arc(o.x,LY,R,0,6.3);cx.fill()}}
 if(phase=='aim'){cx.font='12px system-ui';cx.fillStyle='#a5b4fc';cx.fillText('x'+own,lx,LY+24)}
 cx.shadowBlur=0}
function loop(){update();draw();requestAnimationFrame(loop)}
/* ===== Input ===== */
function pos(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H]}
let down=false;
cv.addEventListener('pointerdown',e=>{if(mode!='play'||phase!='aim')return;initAudio();down=true;aim=aimDir(...pos(e))});
cv.addEventListener('pointermove',e=>{if(down&&phase=='aim')aim=aimDir(...pos(e))});
addEventListener('pointerup',()=>{if(down){down=false;fire()}});
addEventListener('pointercancel',()=>{down=false;aim=null});
addEventListener('keydown',e=>{if(mode!='play'||phase!='aim')return;const a=aim?Math.atan2(aim.y,aim.x):-Math.PI/2;
 if(e.key=='ArrowLeft'||e.key=='ArrowRight'){const n=Math.max(-Math.PI+.2,Math.min(-.2,a+(e.key=='ArrowLeft'?-.05:.05)));aim={x:Math.cos(n),y:Math.sin(n)}}
 if(e.key==' '||e.key=='Enter'){if(!aim)aim={x:0,y:-1};fire()}if(e.key=='Escape')menu()});
document.addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{if(e.key=='f'||e.key=='F')toggleFF()});
/* ===== Daily reward ===== */
const today=new Date().toISOString().slice(0,10);
if(S.daily!==today){const r=30+Math.min(S.done,50)*2;S.en+=r;S.daily=today;save();setTimeout(()=>toast(t('toast.daily',{r})),500)}
applyLang();menu();loop();
