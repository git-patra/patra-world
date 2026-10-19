import test from 'node:test';
import assert from 'node:assert/strict';
import {ZONES,initialRound,shoot,finishShot} from '../src/penalty.js';
test('exactly four fixed corner zones and all 16 shot/keeper combinations resolve correctly',()=>{
 assert.equal(ZONES.length,4);assert.ok(Object.isFrozen(ZONES));
 for(let shot=0;shot<4;shot++)for(let keeper=0;keeper<4;keeper++){
  const result=finishShot(shoot(initialRound(),shot,keeper));
  assert.equal(result.goals,shot===keeper?0:1);
  assert.equal(result.phase,shot===keeper?'saved':'aiming');
 }
});
test('five consecutive goals wins and blocks further shots until a fresh round',()=>{
 let state=initialRound();
 for(let i=0;i<5;i++)state=finishShot(shoot(state,0,3));
 assert.equal(state.phase,'won');assert.equal(state.goals,5);
 assert.equal(shoot(state,2,2),state);
 assert.deepEqual(initialRound(),{phase:'aiming',goals:0,shot:null,keeper:null,history:[]});
});
test('a saved shot ends the streak without erasing previous goals in that round',()=>{
 let state=finishShot(shoot(initialRound(),0,1));
 state=finishShot(shoot(state,2,2));
 assert.equal(state.phase,'saved');assert.equal(state.goals,1);
 assert.deepEqual(state.history,['goal','saved']);assert.equal(shoot(state,0,1),state);
});
test('locks shots in flight and rejects positions outside the fixed zones',()=>{
 const initial=initialRound();const flying=shoot(initial,0,1);
 assert.equal(flying.phase,'flying');assert.equal(shoot(flying,3,2),flying);
 for(const invalid of [-1,4,1.2,NaN,undefined]){
  assert.equal(shoot(initial,invalid,1),initial);assert.equal(shoot(initial,1,invalid),initial);
 }
 assert.equal(finishShot(initial),initial);
});
