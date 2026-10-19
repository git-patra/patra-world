import {createWorld} from './world.js';
import {stations} from './data.js';
import {mountPenalty} from './components/PenaltyGame.jsx';
const $=(selector)=>document.querySelector(selector);
const dialog=$('#project-dialog'),content=$('#dialog-content');
const visited=new Set();
let nearby=null,world,lastTrigger=null,cleanupDemo=null;
function disposeDemo(){cleanupDemo?.();cleanupDemo=null;}
let motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;
const placeMarkup=(station,i)=>`<button class="place-row" data-project="${station.id}" style="--place-color:${station.color}"><span class="place-number">0${i+1}</span><span class="place-icon">${station.icon}</span><span class="place-copy"><strong>${station.label}</strong><small>${station.short}</small></span><span class="place-arrow">↗</span></button>`;
$('#places').innerHTML=stations.map(placeMarkup).join('');
function hideWelcome(){$('#welcome-note').classList.add('dismissed');}
function updateMotion(){
 $('#motion-button').innerHTML=`<span>✦</span> Motion ${motion?'on':'off'}`;
 $('#motion-button').setAttribute('aria-pressed',String(motion));
 document.body.classList.toggle('reduced-motion',!motion);
 world?.setMotion(motion);
}
function notify(message){$('#travel-status').textContent=message;}
world=createWorld($('#world'),{
 stations,
 onNear(id){
  nearby=id;const station=stations.find(s=>s.id===id);
  $('#current-location').textContent=station?station.name:'The village paths';
  $('#interact-button').disabled=!station;
  $('#interact-button span').textContent=station?`Explore ${station.name}`:'Walk to a place';
 },
 onSelect(id){openProject(id);},
 onMove({x,y,walking}){
  $('#coordinates').textContent=`${String(Math.round(x)).padStart(2,'0')} : ${String(Math.round(y)).padStart(2,'0')}`;
  $('#world').dataset.walking=String(walking);
  $('#world').dataset.position=`${x.toFixed(2)},${y.toFixed(2)}`;
  if(walking)hideWelcome();
 }
});
updateMotion();
function renderVisual(id){
 if(id==='arcade')return `<div id="penalty-root"></div>`;
 if(id==='chat')return `<div class="case-demo chat-demo"><div class="demo-top"><span><i class="online"></i> SIGNAL STATION</span><span>LOCAL PREVIEW</span></div><div class="chat-messages" id="chat-messages" role="log" aria-label="Demo conversation"><p class="chat-bubble">Hey explorer! Found your way here? 👋</p><p class="chat-bubble">I build the services that help conversations move in real time.</p></div><form id="chat-form"><input aria-label="Demo message" placeholder="Say hello…" maxlength="200" autocomplete="off" required /><button aria-label="Send demo message">↑</button></form></div>`;
 if(id==='fintech')return `<div class="case-demo finance-demo"><div class="demo-top"><span>CARD VAULT</span><span>ILLUSTRATIVE</span></div><div class="virtual-card"><span>PAPER<span class="fine"> / VIRTUAL</span></span><span class="chip">▦</span><strong>•••• &nbsp; •••• &nbsp; •••• &nbsp; 2048</strong><div><span>ANUGRAH PATRA</span><span>BUSINESS</span></div></div><div class="integration-logos"><span><img src="assets/bri-logo.webp" alt="BRI" /></span><span><img src="assets/ayoconnect.svg" alt="Ayoconnect" /></span><span><img src="assets/cimb.svg" alt="CIMB" /></span></div></div>`;
 if(id==='coffee')return `<div class="case-demo invoice-demo"><div class="demo-top"><span>COFFEE HOUSE</span><span>SAMPLE INVOICE</span></div><div class="invoice-paper"><div><span class="coffee-mark">☕</span><span class="paid">APPROVED</span></div><h3>Everything in order.</h3><span class="invoice-ref">INV / CONCEPT / 001</span><div class="invoice-line"><span>Operations supplies</span><b>Rp 2.400.000</b></div><div class="invoice-line"><span>Service adjustment</span><b>Rp 150.000</b></div><div class="invoice-line total"><span>Total</span><b>Rp 2.550.000</b></div><div class="approval-flow"><span>Submitted</span><i>→</i><span>Reviewed</span><i>→</i><span>Approved ✓</span></div></div></div>`;
 if(id==='erp')return `<div class="case-demo erp-demo"><div class="demo-top"><span>OPERATIONS HUB</span><span>SAMPLE DATA</span></div><div class="erp-title"><strong>A clearer picture.</strong><span>This week ↘</span></div><div class="metric-row"><div><small>ORDERS</small><strong>128</strong></div><div><small>WORKFLOWS</small><strong>06</strong></div><div><small>IN SYNC</small><strong>100<span>%</span></strong></div></div><div class="bar-chart" aria-label="Illustrative daily activity"><i style="--bar:36%"></i><i style="--bar:59%"></i><i style="--bar:48%"></i><i style="--bar:72%"></i><i style="--bar:63%"></i><i style="--bar:91%"></i><i style="--bar:78%"></i></div><div class="chart-labels"><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></div><div class="erp-modules"><span>Inventory</span><span>Purchasing</span><span>Reporting</span></div></div>`;
 if(id==='pos')return `<div class="case-demo pos-demo"><div class="demo-top"><span>OREN POS</span><span>ACTUAL PRODUCT</span></div><div class="pos-tag">A good day starts<br>with a good system<span>.</span></div><img src="assets/oren-pos-640.webp" alt="Oren POS dashboard showing product and business management tools" /></div>`;
 return `<div class="case-demo food-demo"><div class="demo-top"><span>JAJANEUN</span><span>BEYOND THE KEYBOARD</span></div><h3>A little extra <em>flavour.</em></h3><div class="food-grid"><a href="https://www.instagram.com/jajaneun.chilioil/reel/DXWdNDqEzQj/" target="_blank" rel="noopener noreferrer"><img src="assets/jajaneun-01-320.webp" alt="Jajaneun food post — view on Instagram" /></a><a href="https://www.instagram.com/jajaneun.chilioil/reel/DXRaU24E1s-/" target="_blank" rel="noopener noreferrer"><img src="assets/jajaneun-02-320.webp" alt="Jajaneun chili oil post — view on Instagram" /></a><a href="https://www.instagram.com/jajaneun.chilioil/p/DWn9I0eE8MZ/" target="_blank" rel="noopener noreferrer"><img src="assets/jajaneun-03-320.webp" alt="Jajaneun product post — view on Instagram" /></a></div><span class="food-handle">@jajaneun.chilioil ↗</span></div>`;
}
function showDialog(){
 lastTrigger=document.activeElement;
 world.setPaused(true);
 dialog.showModal();
 $('#close-dialog').focus();
}
function openProject(id){
 const station=stations.find(s=>s.id===id);if(!station)return;
 visited.add(id);hideWelcome();
 $('#visited-count').textContent=`${visited.size} / 7`;
 document.querySelector(`[data-project="${id}"]`)?.classList.add('visited');
 disposeDemo();
 dialog.classList.toggle('game-dialog',id==='arcade');
 content.innerHTML=`<div class="case-header" style="--case-color:${station.color}"><div class="case-eyebrow"><span>${station.icon}</span>${station.label}<span class="visit-tag">${station.category}</span></div><h2 id="dialog-title">${station.title.replace('\n',id==='arcade'?' ':'<br>')}</h2><div class="case-role"><strong>${station.role}</strong><span>${station.company}</span><time>${station.period}</time></div><p>${station.context}</p></div><div class="case-layout ${id==='arcade'?'game-layout':''}">${renderVisual(id)}${id==='arcade'?'':`<div class="case-details"><h3>The work behind this place</h3><p class="case-takeaway">${station.takeaway}</p><div class="story-tools">${station.stack.map(t=>`<span>${t}</span>`).join('')}</div><p class="sample-note">${station.note}</p>${station.link?`<a class="case-link" href="${station.link}" target="_blank" rel="noopener noreferrer">${station.linkText}<span>↗</span></a>`:''}</div>`}</div><section class="contribution-section" aria-labelledby="contribution-title"><div class="section-kicker" id="contribution-title">MY CONTRIBUTIONS <span>${station.company}</span></div><div class="contribution-grid">${station.contributions.map(([heading,body],i)=>`<article><span>0${i+1}</span><h3>${heading}</h3><p>${body}</p></article>`).join('')}</div></section><div class="project-flow" aria-label="Illustrative work flow">${station.flow.map((step,i)=>`<span><b>0${i+1}</b>${step}</span>`).join('<i>→</i>')}</div>${id==='arcade'?`<p class="sample-note">${station.note}</p>`:''}<div class="case-footer"><button class="walk-button" id="walk-to-place">Walk to ${station.name} →</button><span>${visited.size} of 7 work stories explored</span><button id="back-to-world">Close case ↗</button></div>`;
 notify(`Exploring ${station.name}. ${visited.size} of 7 places visited.`);
 if(!dialog.open)showDialog();
 else {dialog.scrollTop=0;$('#close-dialog').focus();}
 $('#back-to-world').onclick=()=>dialog.close();
 $('#walk-to-place').onclick=()=>{dialog.close();requestAnimationFrame(()=>{$('#home').scrollIntoView({behavior:'instant'});world.setPaused(false);world.travelTo(id);notify(`Walking to ${station.name}.`);});};
 if(id==='arcade')cleanupDemo=mountPenalty($('#penalty-root'));
 if(id==='chat')setupChat();
}
function setupChat(){
 $('#chat-form').onsubmit=e=>{e.preventDefault();const input=e.target.querySelector('input'),value=input.value.trim();if(!value)return;
  const log=$('#chat-messages');
  const add=(text,own=false)=>{const p=document.createElement('p');p.className=`chat-bubble${own?' own':''}`;p.textContent=text;log.append(p);};
  add(value,true);add('Nice to meet you! This is a local preview. For a real conversation, find Patra on LinkedIn.');input.value='';
  while(log.children.length>6)log.firstElementChild.remove();log.scrollTop=log.scrollHeight;
 };
}
document.addEventListener('click',event=>{const button=event.target.closest('[data-project]');if(button)openProject(button.dataset.project);});
$('#list-button').onclick=()=>{
 disposeDemo();dialog.classList.remove('game-dialog');
 content.innerHTML=`<div class="case-header"><div class="eyebrow">THE VILLAGE DIRECTORY</div><h2 id="dialog-title">Explore my work experience.</h2><p>These buildings represent professional contributions, products, and my own business. Open a case to read what I worked on, where, and how.</p></div><div class="directory-list">${stations.map(placeMarkup).join('')}</div>`;
 showDialog();
};
$('#close-dialog').onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{disposeDemo();syncWorldPause();lastTrigger?.focus?.({preventScroll:true});});
$('#dismiss-note').onclick=hideWelcome;
$('#interact-button').onclick=()=>world.interact();
$('#reset-button').onclick=()=>{world.reset();$('#current-location').textContent='The village plaza';notify('Back at the village plaza.');};
$('.brand').onclick=e=>{e.preventDefault();$('#home').scrollIntoView({behavior:'instant'});world.reset();$('#current-location').textContent='The village plaza';};
$('#motion-button').onclick=()=>{motion=!motion;updateMotion();};
const media=matchMedia('(prefers-reduced-motion: reduce)');
media.addEventListener('change',e=>{motion=!e.matches;updateMotion();});
const directions={w:[0,-1],a:[-1,0],s:[0,1],d:[1,0],ArrowUp:[0,-1],ArrowLeft:[-1,0],ArrowDown:[0,1],ArrowRight:[1,0]};
document.addEventListener('keydown',event=>{
 if(!worldVisible||dialog.open||event.ctrlKey||event.metaKey||event.altKey||event.target.closest('input,textarea,select'))return;
 const key=event.key.length===1?event.key.toLowerCase():event.key;
 if(directions[key]){event.preventDefault();world.move(...directions[key]);hideWelcome();}
 else if(key==='e'){event.preventDefault();world.interact();}
});
let holdTimer;
function stopHold(){clearInterval(holdTimer);holdTimer=null;}
document.querySelectorAll('[data-move]').forEach(button=>{
 const direction=button.dataset.move.split(',').map(Number);
 button.addEventListener('pointerdown',event=>{event.preventDefault();stopHold();world.move(...direction);hideWelcome();holdTimer=setInterval(()=>world.move(...direction),170);});
 button.addEventListener('click',event=>{if(event.detail===0){world.move(...direction);hideWelcome();}});
});
window.addEventListener('pointerup',stopHold);window.addEventListener('pointercancel',stopHold);window.addEventListener('blur',stopHold);
window.addEventListener('pagehide',event=>{stopHold();if(!event.persisted){disposeDemo();world.destroy();}});

let worldVisible=true;
function syncWorldPause(){world.setPaused(dialog.open||!worldVisible||document.hidden);}
const visibilityObserver=new IntersectionObserver(([entry])=>{worldVisible=entry.isIntersecting;syncWorldPause();},{threshold:0.1});
visibilityObserver.observe($('#world'));
document.addEventListener('visibilitychange',()=>{stopHold();syncWorldPause();});
function revealLinkedCase(){const id=location.hash.slice(1);if(id.startsWith('case-')){const target=document.getElementById(id);if(target?.tagName==='DETAILS')target.open=true;}}
window.addEventListener('hashchange',revealLinkedCase);revealLinkedCase();

document.addEventListener('click',event=>{const anchor=event.target.closest('a[href^="#case-"]');if(anchor){const story=document.getElementById(anchor.getAttribute('href').slice(1));if(story?.tagName==='DETAILS')story.open=true;}});
