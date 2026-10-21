const $=s=>document.querySelector(s);
const bn=n=>String(n).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
$('#year').textContent=new Date().getFullYear();
$('#menuBtn').addEventListener('click',()=>$('#nav').classList.toggle('open'));
document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>$('#nav').classList.remove('open')));
let state={coins:0,points:0,games:0,quiz:0,name:'PLAYER',avatar:'😎'};
try{const saved=JSON.parse(localStorage.getItem('emonMegaState')||'{}');state={...state,...saved}}catch(e){}
function persist(){try{localStorage.setItem('emonMegaState',JSON.stringify(state))}catch(e){};updateUI()}
function addCoins(n){state.coins+=n;persist()}
function updateUI(){ $('#coins').textContent=bn(state.coins);$('#playerCoins').textContent=bn(state.coins);$('#welcomeName').textContent='হ্যালো, '+(state.name==='PLAYER'?'প্লেয়ার':state.name)+'!';$('#playerCardName').textContent=state.name.toUpperCase();$('#playerAvatar').textContent=state.avatar;$('#level').textContent=bn(Math.floor(state.points/50)+1);$('#progressBar').style.width=(state.points%50)*2+'%';$('#quizScore').textContent='স্কোর: '+bn(state.quiz)}
$('#playerName').value=state.name==='PLAYER'?'':state.name;$('#avatar').value=state.avatar;updateUI();
$('#saveProfile').addEventListener('click',()=>{state.name=$('#playerName').value.trim().slice(0,22)||'PLAYER';state.avatar=$('#avatar').value;persist();addCoins(2);alert('প্রোফাইল সেভ হয়েছে! +২ কয়েন 🎉')});
$('#resetProgress').addEventListener('click',()=>{if(confirm('সব কয়েন ও প্রোগ্রেস রিসেট করবে?')){state={coins:0,points:0,games:0,quiz:0,name:'PLAYER',avatar:'😎'};persist();$('#playerName').value='';$('#avatar').value='😎'}});
const quizzes=[
{q:'বাংলাদেশের জাতীয় ফুল কোনটি?',a:['গোলাপ','শাপলা','জবা','সূর্যমুখী'],c:1},
{q:'এক সপ্তাহে কয় দিন?',a:['৫ দিন','৬ দিন','৭ দিন','৮ দিন'],c:2},
{q:'সূর্য কোন দিক থেকে ওঠে?',a:['উত্তর','দক্ষিণ','পশ্চিম','পূর্ব'],c:3},
{q:'বাংলাদেশের জাতীয় ফল কোনটি?',a:['আম','কাঁঠাল','লিচু','কলা'],c:1},
{q:'২ + ৫ = কত?',a:['৬','৭','৮','৯'],c:1},
{q:'পৃথিবীর প্রাকৃতিক উপগ্রহ কোনটি?',a:['মঙ্গল','চাঁদ','সূর্য','শুক্র'],c:1},
{q:'এক ঘণ্টায় কত মিনিট?',a:['৩০','৪৫','৬০','৯০'],c:2}
];let qIndex=0,qAnswered=false;
function renderQuiz(){qAnswered=false;const q=quizzes[qIndex];$('#question').textContent=q.q;$('#quizProgress').textContent='প্রশ্ন '+bn(qIndex+1)+' / '+bn(quizzes.length);$('#feedback').textContent='সঠিক উত্তর বেছে নাও!';$('#answers').innerHTML=q.a.map((a,i)=>`<button data-i="${i}">${a}</button>`).join('');$('#answers').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{if(qAnswered)return;qAnswered=true;const ok=+b.dataset.i===q.c;if(ok){b.classList.add('correct');state.quiz++;state.points+=10;addCoins(5);$('#feedback').textContent='একদম ঠিক! +৫ কয়েন 🥳'}else{b.classList.add('wrong');$('#answers').querySelectorAll('button')[q.c].classList.add('correct');$('#feedback').textContent='উত্তর: '+q.a[q.c]+'। পরেরটায় চেষ্টা করো!'}persist()}))}
$('#nextQuestion').addEventListener('click',()=>{qIndex=(qIndex+1)%quizzes.length;renderQuiz()});renderQuiz();
const modal=$('#gameModal'),body=$('#modalBody');let activeGame='',reactionTimer=null,reactionStart=0,reactionTimeout=null,memoryState={};
function openGame(type){activeGame=type;modal.classList.add('open');modal.setAttribute('aria-hidden','false');clearTimeout(reactionTimer);clearTimeout(reactionTimeout);let title='',html='';
if(type==='reaction'){title='⚡ রিঅ্যাকশন রাশ';html='<p>প্রস্তুত হলে শুরু চাপো। লাল থাকলে অপেক্ষা করো, সবুজ হলে দ্রুত চাপ!</p><button class="reaction-pad" id="reactionPad">শুরু করতে চাপো</button><p id="reactionInfo">তোমার দ্রুততা মিলিসেকেন্ডে দেখানো হবে।</p>'; }
if(type==='memory'){title='🧠 মেমোরি ম্যাচ';html='<p>একই ইমোজির জোড়া খুঁজে বের করো।</p><div class="memory-grid" id="memoryGrid"></div><p id="memoryInfo">জোড়া: ০ / ৬</p><button class="btn glass modal-action" id="resetMemory">আবার খেলো</button>'}
if(type==='dice'){title='🎲 লাকি ডাইস';html='<div class="dice-result" id="diceResult">🎲</div><p id="diceInfo">ডাইস ঘুরিয়ে ভাগ্য পরীক্ষা করো!</p><button class="btn primary modal-action" id="rollDice">ডাইস ঘোরাও</button>'}
if(type==='rps'){title='✊ পাথর-কাগজ-কাঁচি';html='<p>তোমার চাল বেছে নাও। কম্পিউটারের সঙ্গে খেলো!</p><div class="rps-buttons"><button data-rps="0">✊</button><button data-rps="1">✋</button><button data-rps="2">✌️</button></div><p id="rpsInfo">তুমি বনাম কম্পিউটার</p>'}
if(type==='guess'){title='🔢 নাম্বার হান্ট';memoryState.secret=1+Math.floor(Math.random()*20);memoryState.tries=0;html='<p>১ থেকে ২০-এর মধ্যে গোপন সংখ্যা ধরো।</p><div class="guess-row"><input id="guessInput" type="number" min="1" max="20" placeholder="১–২০"><button class="btn primary" id="guessSubmit">চেক</button></div><p id="guessInfo">সংখ্যাটা খুঁজে বের করো!</p>'}
if(type==='wheel'){title='🌀 চ্যালেঞ্জ হুইল';html='<p>একটি নিরাপদ ও মজার টাস্ক পেতে স্পিন করো!</p><div class="dice-result" id="wheelEmoji">🌀</div><p class="wheel-result" id="wheelResult">তোমার টাস্ক অপেক্ষায়...</p><button class="btn primary modal-action" id="spinWheel">স্পিন করো!</button>'}
$('#modalTitle').textContent=title;body.innerHTML=html;wireGame(type)}
function finishGame(coins=5){state.games++;state.points+=10;addCoins(coins)}
function wireGame(type){
if(type==='reaction'){const pad=$('#reactionPad'),info=$('#reactionInfo');let phase='idle';pad.onclick=()=>{if(phase==='idle'){phase='wait';pad.classList.remove('ready');pad.style.background='#bd4569';pad.textContent='অপেক্ষা করো...';info.textContent='সবুজ হওয়ার আগে চাপলে আবার শুরু করতে হবে।';reactionTimer=setTimeout(()=>{phase='ready';reactionStart=performance.now();pad.classList.add('ready');pad.textContent='এখন চাপো!';},1200+Math.random()*2800)}else if(phase==='wait'){clearTimeout(reactionTimer);phase='idle';pad.textContent='ভুল সময়! আবার শুরু করো';info.textContent='সবুজ হলে চাপবে।';}else if(phase==='ready'){const ms=Math.round(performance.now()-reactionStart);phase='idle';pad.classList.remove('ready');pad.style.background='';pad.textContent='আবার চেষ্টা';info.textContent='তোমার সময় '+ms+' ms! '+(ms<300?'দারুণ রিফ্লেক্স!':'আরও দ্রুত হও!');finishGame(ms<350?8:4)}}}
if(type==='memory'){const emojis=['🍒','🚀','🐼','💎','🎮','🌈'];function reset(){const arr=[...emojis,...emojis].sort(()=>Math.random()-.5);memoryState={arr,open:[],matched:[],lock:false};draw()}function draw(){const grid=$('#memoryGrid');grid.innerHTML=memoryState.arr.map((e,i)=>`<button data-i="${i}" class="${memoryState.matched.includes(i)?'matched':''}">${memoryState.matched.includes(i)||memoryState.open.includes(i)?e:'❔'}</button>`).join('');grid.querySelectorAll('button').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;if(memoryState.lock||memoryState.matched.includes(i)||memoryState.open.includes(i))return;memoryState.open.push(i);draw();if(memoryState.open.length===2){if(memoryState.arr[memoryState.open[0]]===memoryState.arr[memoryState.open[1]]){memoryState.matched.push(...memoryState.open);memoryState.open=[];$('#memoryInfo').textContent='জোড়া: '+bn(memoryState.matched.length/2)+' / ৬';draw();if(memoryState.matched.length===12){$('#memoryInfo').textContent='সব জোড়া পেয়েছ! +৮ কয়েন 🏆';finishGame(8)}}else{memoryState.lock=true;setTimeout(()=>{memoryState.open=[];memoryState.lock=false;draw()},700)}}})}$('#resetMemory').onclick=reset;reset()}
if(type==='dice')$('#rollDice').onclick=()=>{const n=1+Math.floor(Math.random()*6);$('#diceResult').textContent=['','⚀','⚁','⚂','⚃','⚄','⚅'][n];$('#diceInfo').textContent='তুমি পেয়েছ '+bn(n)+'! '+(n===6?'জ্যাকপট! +৮ কয়েন':'ভালো খেলেছ!');finishGame(n===6?8:3)};
if(type==='rps')body.querySelectorAll('[data-rps]').forEach(b=>b.onclick=()=>{const you=+b.dataset.rps,pc=Math.floor(Math.random()*3),icons=['✊','✋','✌️'];let result=you===pc?'ড্র!':(you-pc+3)%3===1?'তুমি জিতেছ! 🎉':'কম্পিউটার জিতেছে!';$('#rpsInfo').textContent='তুমি '+icons[you]+' বনাম '+icons[pc]+' কম্পিউটার — '+result;if(you!==pc&&(you-pc+3)%3===1)finishGame(7);else finishGame(2)});
if(type==='guess')$('#guessSubmit').onclick=()=>{const n=+$('#guessInput').value;if(!n||n<1||n>20){$('#guessInfo').textContent='১ থেকে ২০-এর মধ্যে সংখ্যা দাও।';return}memoryState.tries++;if(n===memoryState.secret){$('#guessInfo').textContent='ঠিক ধরেছ! '+bn(memoryState.tries)+' চেষ্টায়! +৭ কয়েন 🎉';finishGame(7)}else $('#guessInfo').textContent=n<memoryState.secret?'আরও বড় সংখ্যা!':'আরও ছোট সংখ্যা!'};
if(type==='wheel'){const tasks=['১০ সেকেন্ডে ৫টি প্রাণীর নাম বলো 🐼','বন্ধুকে একটি ভালো কথা বলো 💖','২০ সেকেন্ডে ১০ থেকে উল্টো গুনো 🔢','একটা মজার মুখভঙ্গি করো 😜','এক গ্লাস পানি খাও 💧','তোমার প্রিয় গেমের নাম বলো 🎮','একটি ছোট্ট জোকস বলো 😂','৩০ সেকেন্ড নাচো 💃'];$('#spinWheel').onclick=()=>{$('#wheelEmoji').textContent='🎉';$('#wheelResult').textContent=tasks[Math.floor(Math.random()*tasks.length)];finishGame(2)}}
}
document.querySelectorAll('.launch').forEach(b=>b.addEventListener('click',()=>openGame(b.dataset.game)));
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');clearTimeout(reactionTimer);clearTimeout(reactionTimeout)}
$('#closeModal').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
const dares=['তোমার সবচেয়ে মজার ডাকনাম বলো 😄','বন্ধুকে একটি প্রশংসা করো 💖','১০ সেকেন্ডে ৫টি ফলের নাম বলো 🍉','একটি সিনেমার ডায়লগ বলো 🎬','তোমার প্রিয় গান গুনগুন করো 🎵','এক পায়ে ৫ সেকেন্ড দাঁড়াও 🦩','একটি জোকস বলো 😂','পরের রাউন্ডে অন্যজনকে আগে খেলতে দাও 🎮'];
const truths=['সবচেয়ে মজার স্মৃতি কী?','তোমার প্রিয় গেম কোনটি?','কোন খাবার ছাড়া থাকতে পারবে না?','কোন সুপারপাওয়ার চাইতে?','ছোটবেলার প্রিয় কার্টুন কী?','কোন জায়গায় ঘুরতে যেতে চাও?'];
$('#truthDare').addEventListener('click',()=>{$('#truthResult').textContent=(Math.random()<.5?'💬 Truth: ':'🔥 Dare: ')+(Math.random()<.5?truths[Math.floor(Math.random()*truths.length)]:dares[Math.floor(Math.random()*dares.length)])});
$('#pickFriend').addEventListener('click',()=>{const names=$('#friendNames').value.split(',').map(x=>x.trim()).filter(Boolean);$('#friendResult').textContent=names.length?'🎉 আজকের নির্বাচিত প্লেয়ার: '+names[Math.floor(Math.random()*names.length)]:'আগে কমা দিয়ে আলাদা করে কয়েকটি নাম লেখো।'});
async function shareSite(){const data={title:'Emon Mega Universe',text:'চলো Emon Mega Universe-এ মিনি গেম খেলি, কুইজ দিই আর চ্যালেঞ্জ নিই! 🚀',url:location.href};if(navigator.share){try{await navigator.share(data);$('#shareStatus').textContent='শেয়ার মেনু খোলা হয়েছে!'}catch(e){if(e.name!=='AbortError')$('#shareStatus').textContent='লিংক কপি করে বন্ধুদের পাঠাও।'}}else{try{await navigator.clipboard.writeText(location.href);$('#shareStatus').textContent='সাইটের লিংক কপি হয়েছে!'}catch(e){$('#shareStatus').textContent='ব্রাউজারের address bar থেকে লিংক কপি করো।'}}}
$('#shareSite').addEventListener('click',shareSite);
const surprises=['আজ কাউকে একটি ভালো কথা বলো 💖','একটি নতুন গেম ট্রাই করো 🎮','বন্ধুকে মজার কুইজ পাঠাও 🧠','একটু পানি খেয়ে নাও 💧','আজকের সেরা স্মৃতির ছবি আঁকো 🎨','হাসো—তোমার হাসি দারুণ! 😄'];
function surprise(){const s=surprises[Math.floor(Math.random()*surprises.length)];$('#surpriseText').textContent=s;$('#dailyBtn').textContent='🎁 '+s;addCoins(1)}
$('#surpriseBtn')?.addEventListener('click',surprise);$('#dailyBtn').addEventListener('click',()=>{surprise();document.querySelector('.fun-section').scrollIntoView({behavior:'smooth'})});$('#surpriseAgain').addEventListener('click',surprise);
const canvas=$('#posterCanvas'),ctx=canvas.getContext('2d');
function drawPoster(){const name=$('#posterName').value.trim()||state.name||'EMON';const caption=$('#posterCaption').value.trim()||'DREAM BIG • SHINE BRIGHT';const g=ctx.createLinearGradient(0,0,900,600);g.addColorStop(0,'#20134d');g.addColorStop(.5,'#5d39ad');g.addColorStop(1,'#087f88');ctx.fillStyle=g;ctx.fillRect(0,0,900,600);for(let i=0;i<20;i++){ctx.fillStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.arc((i*137)%900,(i*79)%600,2+(i%3),0,Math.PI*2);ctx.fill()}ctx.strokeStyle='rgba(255,255,255,.28)';ctx.lineWidth=2;for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(750,120,35+i*25,0,Math.PI*2);ctx.stroke()}ctx.textAlign='center';ctx.fillStyle='#8ef8eb';ctx.font='bold 25px Arial';ctx.fillText('✦ E M O N   M E G A   U N I V E R S E ✦',450,125);ctx.fillStyle='#fff';let size=82;ctx.font='900 '+size+'px Arial';while(ctx.measureText(name).width>790&&size>30){size-=4;ctx.font='900 '+size+'px Arial'}ctx.shadowColor='#100821';ctx.shadowBlur=18;ctx.fillText(name,450,300);ctx.shadowBlur=0;ctx.fillStyle='#e5dcff';ctx.font='bold 30px Arial';let cap=caption.toUpperCase();while(ctx.measureText(cap).width>800&&parseInt(ctx.font.match(/\d+/)[0])>18){ctx.font='bold '+(parseInt(ctx.font.match(/\d+/)[0])-2)+'px Arial'}ctx.fillText(cap,450,380);ctx.fillStyle='rgba(255,255,255,.82)';ctx.font='bold 18px Arial';ctx.fillText('MAKE YOUR OWN LEGEND 🚀',450,515);ctx.strokeStyle='rgba(255,255,255,.65)';ctx.lineWidth=4;ctx.strokeRect(24,24,852,552)}
$('#makePoster').addEventListener('click',()=>{drawPoster();addCoins(1)});$('#downloadPoster').addEventListener('click',()=>{drawPoster();const a=document.createElement('a');a.download='emon-mega-universe-poster.png';a.href=canvas.toDataURL('image/png');a.click();addCoins(2)});drawPoster();

/* Welcome voice: browsers may block autoplay with sound until the visitor taps. */
(function(){
  const audio=document.getElementById('welcomeVoice');
  const btn=document.getElementById('voiceToggle');
  const hint=document.getElementById('voiceHint');
  if(!audio||!btn) return;
  audio.volume=1;
  const tryPlay=()=>audio.play().then(()=>{
    btn.textContent='🔊 ভয়েস আবার শুনুন';
    hint.textContent='ওয়েলকাম ভয়েস চালু হয়েছে।';
  }).catch(()=>{
    hint.textContent='ব্রাউজার অটো-প্লে বন্ধ রেখেছে—ভয়েস শুনতে বাটনে চাপ দাও।';
  });
  window.addEventListener('load',tryPlay,{once:true});
  btn.addEventListener('click',()=>{
    if(!audio.paused){audio.currentTime=0;}
    tryPlay();
  });
})();
