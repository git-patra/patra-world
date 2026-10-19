import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Button} from './ui/button';
import {ZONES,initialRound,shoot,finishShot} from '../penalty.js';
let sessionBest=0;
const names=['Top left','Top right','Bottom left','Bottom right'];
const targets=[{x:29,y:31},{x:71,y:31},{x:29,y:55},{x:71,y:55}];
function Keeper(){return <svg viewBox="0 0 90 145" aria-hidden="true"><ellipse cx="45" cy="139" rx="29" ry="5" fill="#10182944"/><path d="M31 87 28 126 17 136 34 139 43 102 50 126 53 138 70 138 60 126 59 87" fill="#242e4b"/><path d="M29 40 13 65 5 80 15 85 30 67 30 93 61 93 60 67 75 84 86 78 77 62 61 39" fill="#eab762"/><path d="M37 33v12q9 9 17 0V32" fill="#c49376"/><ellipse cx="46" cy="23" rx="15" ry="18" fill="#dcb38b"/><path d="M31 20Q26 1 48 4q17 0 13 19l-8-12q-9 7-22 9" fill="#49343b"/><path d="m4 78 11 5-5 9-9-4zm71 2 11-4 3 11-10 5" fill="#f6e4cf"/><path d="m16 134 19 0-1 7H12zm37 1 18-1 7 7H53" fill="#e4d4bb"/><text x="46" y="76" textAnchor="middle" fontSize="24" fontWeight="700" fill="#654936">1</text></svg>}
function Shooter(){return <svg viewBox="0 0 90 150" aria-hidden="true"><ellipse cx="46" cy="145" rx="32" ry="5" fill="#11182c55"/><path d="m28 90-3 34-9 18 13 3 14-38 7 18 12 19 13-5-16-23-1-26" fill="#283047"/><path d="M27 40 13 60 8 87l10 4 13-33 1 35 28 0 0-35 11 24 10-5-7-20-13-17" fill="#e89357"/><path d="M37 29v14q10 7 17-1V29" fill="#c49376"/><ellipse cx="45" cy="23" rx="15" ry="18" fill="#cba17c"/><path d="M30 24V13Q35-2 52 6l9 7-1 12q-10 7-30-1" fill="#302a36"/><path d="m14 140 17 1-1 6H10zm47 0 13-3 10 8-22 3" fill="#f4d6b6"/><text x="45" y="77" textAnchor="middle" fontSize="25" fontWeight="700" fill="#fff0d1">9</text></svg>}
function Ball(){return <svg viewBox="0 0 50 50" aria-hidden="true"><circle cx="25" cy="25" r="23" fill="#f5ecdf" stroke="#b9c3cb" strokeWidth="2"/><path d="m25 13 11 8-4 13H18l-4-13zM6 10l11-6-3 10-8 7zm31-5 8 8-8 5-3-8zM3 31l13 7-1 9-8-7zm34 7 10-9-3 12-9 6z" fill="#303b4d"/><path d="m25 13-1-9M14 21l-8-1m12 14-4 7m18-7 6 7m-2-20 7-6" stroke="#303b4d" strokeWidth="1.4"/></svg>}
export function PenaltyGame(){
 const [round,setRound]=useState(initialRound),[best,setBest]=useState(()=>sessionBest),[reduced,setReduced]=useState(document.body.classList.contains('reduced-motion'));
 const stateRef=useRef(round),timer=useRef(null),restart=useRef(null);
 useEffect(()=>{
  const observer=new MutationObserver(()=>setReduced(document.body.classList.contains('reduced-motion')));
  observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  return()=>{observer.disconnect();clearTimeout(timer.current);};
 },[]);
 function kick(zone){
  const keeper=Math.floor(Math.random()*ZONES.length);
  const next=shoot(stateRef.current,zone,keeper);
  if(next===stateRef.current)return;
  stateRef.current=next;setRound(next);
  timer.current=setTimeout(()=>{
   const result=finishShot(stateRef.current);stateRef.current=result;setRound(result);sessionBest=Math.max(sessionBest,result.goals);setBest(sessionBest);
   if(result.phase==='saved'||result.phase==='won')requestAnimationFrame(()=>restart.current?.focus());
  },reduced?0:850);
 }
 function reset(){clearTimeout(timer.current);const next=initialRound();stateRef.current=next;setRound(next);}
 const finished=round.phase==='saved'||round.phase==='won';
 const target=targets[round.shot]||{x:51,y:85};
 const keeperTarget=targets[round.keeper]||{x:50,y:52};
 const message=round.phase==='flying'?'Shot in flight…':round.phase==='saved'?'Saved! The keeper read your shot.':round.phase==='won'?'Five in a row. What a finish!':round.goals?`Goal! ${round.goals} down. Choose your next shot.`:'Choose a zone. Beat the keeper.';
 return <section className={`penalty-game${reduced?' penalty-still':''}`} aria-label="Football Penalty game">
  <div className="penalty-scoreboard"><div><span>FOOTBALL PENALTY</span><strong>The five-goal challenge<span>⚽</span></strong></div><div className="penalty-best"><span>SESSION BEST</span><strong>{best}<small> / 5</small></strong></div></div>
  <p className="penalty-instructions">Click a target to shoot. A different zone from the keeper scores. A save ends the round.</p>
  <div className={`penalty-pitch ${round.phase}`} style={{'--shot-x':`${target.x}%`,'--shot-y':`${target.y}%`,'--flight-apex':`${target.y-12}%`,'--keeper-x':`${keeperTarget.x}%`,'--keeper-y':`${keeperTarget.y-17}%`,'--dive':`${round.keeper===null?0:(round.keeper%2===0?-48:48)}deg`}}>
   <div className="stadium-lights" aria-hidden="true"><i/><i/><i/><i/></div><div className="stadium-crowd" aria-hidden="true"/><div className="penalty-grass" aria-hidden="true"/><div className="penalty-box" aria-hidden="true"/>
   <div className="penalty-goal"><div className="goal-net" aria-hidden="true"/><div className="penalty-zones" role="group" aria-label="Choose one of four goal zones">{ZONES.map(zone=><Button key={zone} variant="ghost" className={`penalty-zone${round.shot===zone?' selected':''}`} aria-label={`Shoot ${names[zone].toLowerCase()}`} disabled={round.phase!=='aiming'} onClick={()=>kick(zone)}><span>0{zone+1}</span><small>{names[zone]}</small><i aria-hidden="true">+</i></Button>)}</div></div>
   <div className="penalty-keeper"><Keeper/></div><div className={`penalty-shooter${round.phase==='flying'?' kicking':''}`}><Shooter/></div><div className={`penalty-ball${round.phase==='flying'?' in-flight':round.shot!==null?' at-goal':''}`} key={`${round.history.length}-${round.phase==='flying'}`}><Ball/></div>
   <div className="fixed-zones">4 CORNER ZONES · FIXED</div>
  </div>
  <div className="penalty-feedback"><div><strong role="status" aria-live="polite">{message}</strong><span>{finished?'Start a fresh round and try again.':round.phase==='flying'?'Watch the keeper…':'First to five consecutive goals completes the challenge.'}</span></div><b>{round.goals}<small> / 5</small></b></div>
  <ol className="penalty-progress" aria-label="Round progress">{Array.from({length:5},(_,i)=><li key={i} className={round.history[i]||''} aria-label={`Shot ${i+1}: ${round.history[i]||'not taken'}`}><span>{round.history[i]==='goal'?'✓':round.history[i]==='saved'?'×':i+1}</span><small>{round.history[i]==='goal'?'GOAL':round.history[i]==='saved'?'SAVED':`GOAL ${i+1}`}</small></li>)}</ol>
  <div className="penalty-actions"><span>Just football. Play as often as you like.</span><Button ref={restart} onClick={reset} variant="outline" className="penalty-reset">{finished?'Play again':'Restart round'} ↻</Button></div>
 </section>;
}
export function mountPenalty(container){const root=createRoot(container);root.render(<PenaltyGame/>);return()=>root.unmount();}
