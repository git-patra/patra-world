export const ZONES=Object.freeze([0,1,2,3]);
export const initialRound=()=>({phase:'aiming',goals:0,shot:null,keeper:null,history:[]});
const validZone=value=>Number.isInteger(value)&&ZONES.includes(value);
export function shoot(state,shot,keeper){
 if(state.phase!=='aiming'||!validZone(shot)||!validZone(keeper))return state;
 return {...state,phase:'flying',shot,keeper};
}
export function finishShot(state){
 if(state.phase!=='flying')return state;
 const saved=state.shot===state.keeper;
 const goals=state.goals+(saved?0:1);
 return {...state,goals,phase:saved?'saved':goals===5?'won':'aiming',history:[...state.history,saved?'saved':'goal']};
}
