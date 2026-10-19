import React,{useEffect,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Button} from './ui/button';
import {ZONES,initialRound,shoot,finishShot} from '../penalty.js';
let sessionBest=0;
const names=['Top left','Top right','Bottom left','Bottom right'];
const targets=[{x:29,y:31},{x:71,y:31},{x:29,y:55},{x:71,y:55}];
function Keeper(){return <svg viewBox="0 0 90 145" aria-hidden="true">
 <g className="keeper-legs"><path d="M31 87 28 126 17 136 34 139 43 102 50 126 53 138 70 138 60 126 59 87" fill="#242e4b"/><path d="m16 134 19 0-1 7H12zm37 1 18-1 7 7H53" fill="#e4d4bb"/></g>
 <path d="M29 40 30 93 61 93 61 40Z" fill="#eab762"/>
 <g className="keeper-ready-arms"><path d="M29 42 13 65 5 80 15 85 31 62M61 42 77 62 86 78 75 84 59 62" fill="#eab762"/><path d="m4 78 11 5-5 9-9-4zm71 2 11-4 3 11-10 5" fill="#fff2da"/></g>
 <path d="M37 33v12q9 9 17 0V32" fill="#c49376"/><ellipse cx="46" cy="26" rx="14" ry="17" fill="#dcb38b"/><path d="M32 23Q28 5 48 7q16 0 12 18l-8-12q-8 7-20 10" fill="#49343b"/>
 <g className="keeper-reaching-arms"><path d="M30 48 19 30 34 12M61 48 70 30 54 12" fill="none" stroke="#eab762" strokeWidth="12" strokeLinecap="round"/><path d="m34 15 7-9m13 9-7-9" stroke="#fff2da" strokeWidth="11" strokeLinecap="round"/></g>
 <text x="46" y="77" textAnchor="middle" fontSize="24" fontWeight="700" fill="#654936">1</text>
 </svg>}
function Shooter(){return <svg viewBox="0 0 90 150" aria-hidden="true">
 <g className="shooter-plant-leg"><path d="m30 87-2 35-10 19 12 2 14-36 2-20" fill="#283047"/><path d="m17 138 14 2-1 7H12Z" fill="#f4d6b6"/></g>
 <g className="shooter-kick-leg"><path d="m48 87 9 1 1 29 4 23-12 2-7-28Z" fill="#35405c"/><path d="m49 137 13-1 9 7-2 5-19-2Z" fill="#fff0db"/><path d="m52 139 9-1" stroke="#e89357" strokeWidth="3"/></g>
 <g className="shooter-upper"><g className="shooter-left-arm"><path d="M29 43 14 61 9 87" fill="none" stroke="#e89357" strokeWidth="12" strokeLinecap="round"/><path d="m9 85-2 8" stroke="#cba17c" strokeWidth="10" strokeLinecap="round"/></g><g className="shooter-right-arm"><path d="M59 43 72 60 76 79" fill="none" stroke="#e89357" strokeWidth="12" strokeLinecap="round"/><path d="m76 78 3 7" stroke="#cba17c" strokeWidth="10" strokeLinecap="round"/></g>
 <path d="M28 40 32 94 60 94 61 40Z" fill="#e89357"/><path d="M37 29v14q10 7 17-1V29" fill="#c49376"/><ellipse cx="45" cy="23" rx="15" ry="18" fill="#cba17c"/><path d="M30 24V13Q35-2 52 6l9 7-1 12q-10 7-30-1" fill="#302a36"/><text x="45" y="77" textAnchor="middle" fontSize="25" fontWeight="700" fill="#fff0d1">9</text></g>
 </svg>}
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
  },reduced?0:1450);
 }
 function reset(){clearTimeout(timer.current);const next=initialRound();stateRef.current=next;setRound(next);}
 const finished=round.phase==='saved'||round.phase==='won';
 const target=targets[round.shot]||{x:51,y:85};
 const keeperTarget=targets[round.keeper]||{x:50,y:38};
 const message=round.phase==='flying'?'Shot in flight…':round.phase==='saved'?'Saved! The keeper read your shot.':round.phase==='won'?'Five in a row. What a finish!':round.goals?`Goal! ${round.goals} down. Choose your next shot.`:'Choose a zone. Beat the keeper.';
 return <section className={`penalty-game${reduced?' penalty-still':''}`} aria-label="Football Penalty game">
  <div className="penalty-scoreboard"><div><span>FOOTBALL PENALTY</span><strong>The five-goal challenge<span>⚽</span></strong></div><div className="penalty-best"><span>SESSION BEST</span><strong>{best}<small> / 5</small></strong></div></div>
  <div className="penalty-toolbar"><p className="penalty-instructions">Pick a corner. Beat the keeper. Five goals to win.</p><Button ref={restart} onClick={reset} variant="outline" className="penalty-reset">↻ {finished?'Play again':'Restart round'}</Button></div>
  <div className={`penalty-pitch ${round.phase}`} style={{'--shot-x':`${target.x}%`,'--shot-y':`${target.y}%`,'--flight-apex':`${target.y-9}%`,'--keeper-x':`${keeperTarget.x}%`,'--keeper-y':`${keeperTarget.y}%`,'--keeper-mid-x':`${(50+keeperTarget.x)/2}%`,'--keeper-apex':`${Math.min(38,keeperTarget.y)-9}%`,'--dive':`${round.keeper===null?0:(round.keeper%2===0?-58:58)}deg`}}>
   <div className="stadium-lights" aria-hidden="true"><i/><i/><i/><i/></div><div className="stadium-crowd" aria-hidden="true"/><div className="penalty-grass" aria-hidden="true"/><div className="penalty-box" aria-hidden="true"/>
   <div className="penalty-goal"><div className="goal-net" aria-hidden="true"/><div className="penalty-zones" role="group" aria-label="Choose one of four goal zones">{ZONES.map(zone=><Button key={zone} variant="ghost" className={`penalty-zone${round.shot===zone?' selected':''}`} aria-label={`Shoot ${names[zone].toLowerCase()}`} disabled={round.phase!=='aiming'} onClick={()=>kick(zone)}><span>0{zone+1}</span><small>{names[zone]}</small><i aria-hidden="true">+</i></Button>)}</div></div>
   <div className="keeper-shadow" aria-hidden="true"/><div className="penalty-keeper" key={`keeper-${round.history.length}-${round.phase}`}><Keeper/></div><div className="shooter-shadow" aria-hidden="true"/><div key={`shooter-${round.history.length}-${round.phase}`} className={`penalty-shooter${round.phase==='flying'?' kicking':''}`}><Shooter/></div><div className={`penalty-ball${round.phase==='flying'?' in-flight':round.shot!==null?' at-goal':''}`} key={`${round.history.length}-${round.phase==='flying'}`}><Ball/></div>
   <div className={`shot-impact${round.shot!==null?' visible':''}`} key={`impact-${round.history.length}-${round.phase}`} aria-hidden="true"/><div className="fixed-zones">4 CORNER ZONES · FIXED</div>
  </div>
  <div className="penalty-feedback"><div><strong role="status" aria-live="polite">{message}</strong><span>{finished?'Start a fresh round and try again.':round.phase==='flying'?'Watch the keeper…':'First to five consecutive goals completes the challenge.'}</span></div><b>{round.goals}<small> / 5</small></b></div>
  <ol className="penalty-progress" aria-label="Round progress">{Array.from({length:5},(_,i)=><li key={i} className={round.history[i]||''} aria-label={`Shot ${i+1}: ${round.history[i]||'not taken'}`}><span>{round.history[i]==='goal'?'✓':round.history[i]==='saved'?'×':i+1}</span><small>{round.history[i]==='goal'?'GOAL':round.history[i]==='saved'?'SAVED':`GOAL ${i+1}`}</small></li>)}</ol>
  <div className="penalty-actions"><span>A save ends the round. Play as often as you like.</span></div>
 </section>;
}
export function mountPenalty(container){const root=createRoot(container);root.render(<PenaltyGame/>);return()=>root.unmount();}
