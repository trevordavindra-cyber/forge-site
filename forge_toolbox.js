"use strict";
/* ============ FORGE v0.8 toolbox + testing center layer ============
   Real prefab kits (built from real parts) and a real test center:
   structural Luau lint, game doctor audit, and a live FPS profiler. */
var TBKITS=['Crate','Barrel','Lamp Post','Fence','Big Tree','Rock','Bench','Arch','Obby Kit','Maze Kit'];
function tbKit(t){
 pushUndo();var n=0;
 function P(o){part(o);n++;}
 if(t==='Crate'){P({name:'Crate',size:[2,2,2],pos:[8,1,8],color:'#a0522d',mat:'Wood'});}
 else if(t==='Barrel'){P({name:'Barrel',shape:'Cylinder',size:[1.4,2,2],pos:[10,1,8],color:'#8b3a2f',mat:'Wood'});}
 else if(t==='Lamp Post'){P({name:'LampPole',size:[0.4,6,0.4],pos:[-10,3,10],color:'#3a3a46',mat:'Metal'});P({name:'LampHead',size:[1.4,0.4,1.4],pos:[-10,6.2,10],color:'#f1c40f',mat:'Neon'});}
 else if(t==='Fence'){for(var i=0;i<5;i++)P({name:'FencePost'+(i+1),size:[0.4,3,0.4],pos:[-8+i*4,1.5,30],color:'#8a7a66',mat:'Wood'});P({name:'FenceRailA',size:[16.4,0.3,0.3],pos:[0,2.2,30],color:'#8a7a66',mat:'Wood'});P({name:'FenceRailB',size:[16.4,0.3,0.3],pos:[0,1,30],color:'#8a7a66',mat:'Wood'});}
 else if(t==='Big Tree'){P({name:'BigTrunk',size:[1.4,6,1.4],pos:[-14,3,-20],color:'#6b4a2f',mat:'Wood'});P({name:'BigLeavesA',shape:'Ball',size:[6,5,6],pos:[-14,7.5,-20],color:'#2e8b57',mat:'Grass'});P({name:'BigLeavesB',shape:'Ball',size:[4,3.5,4],pos:[-16.5,9,-19],color:'#3aa06a',mat:'Grass'});P({name:'BigLeavesC',shape:'Ball',size:[4,3.5,4],pos:[-11.5,9,-21],color:'#3aa06a',mat:'Grass'});}
 else if(t==='Rock'){P({name:'RockA',shape:'Ball',size:[4,3,4],pos:[18,0.6,-8],color:'#7f8c8d',mat:'Slate'});P({name:'RockB',shape:'Ball',size:[2.4,2,2.4],pos:[20.4,0.4,-9.5],color:'#95a1a1',mat:'Slate'});}
 else if(t==='Bench'){P({name:'BenchSeat',size:[6,0.4,2],pos:[16,1.2,16],color:'#a0522d',mat:'Wood'});P({name:'BenchBack',size:[6,1.4,0.3],pos:[16,2,17],color:'#a0522d',mat:'Wood'});for(var i2=0;i2<2;i2++)P({name:'BenchLeg'+(i2+1),size:[0.4,1,2],pos:[13.5+i2*5,0.5,16],color:'#5a4632',mat:'Metal'});}
 else if(t==='Arch'){P({name:'ArchPillarL',size:[2,8,2],pos:[20,4,-20],color:'#9aa2ab',mat:'Concrete'});P({name:'ArchPillarR',size:[2,8,2],pos:[30,4,-20],color:'#9aa2ab',mat:'Concrete'});P({name:'ArchTop',size:[12,1.4,2.4],pos:[25,8.7,-20],color:'#8d949c',mat:'Concrete'});}
 else if(t==='Obby Kit'){var cols=['#e74c3c','#3498db','#f1c40f','#2ecc71','#9b59b6','#e67e22','#1abc9c','#fd79a8'];for(var i3=0;i3<8;i3++)P({name:'Obby'+(i3+1),size:[4,0.6,4],pos:[i3*7,1.5+i3*1.5,40],color:cols[i3],mat:'Plastic'});}
 else if(t==='Maze Kit'){var walls=[[-2,0,10,1],[2,4,1,9],[-8,6,9,1],[-8,-2,1,9],[4,-4,10,1],[8,2,1,7],[-4,-6,7,1],[0,6,1,3],[-12,0,1,8],[8,6,7,1],[12,-2,1,9],[-2,-10,14,1]];for(var i4=0;i4<walls.length;i4++){var w=walls[i4];P({name:'MazeWall'+(i4+1),size:[w[2],3,w[3]],pos:[w[0]+10,1.5,w[1]*2-10],color:'#2e8b57',mat:'Grass'});}}
 refreshAll();saveLocal();out('Toolbox: '+t+' built, '+n+' part'+(n===1?'':'s'),'sys');
}
var _buildToolbox0=buildToolbox;
buildToolbox=function(){_buildToolbox0();var c=document.getElementById('toolboxitems');
 for(var i=0;i<TBKITS.length;i++){(function(t){var d=document.createElement('div');d.className='ti';d.textContent=t;d.onclick=function(){tbKit(t);};c.appendChild(d);})(TBKITS[i]);}};
buildToolbox();
/* ---- Testing center ---- */
function luauLint(code){
 var issues=[];
 if(!code||!code.trim()){issues.push('script is empty');return issues;}
 var clean=code.replace(/--\[\[[\s\S]*?\]\]/g,' ').replace(/--[^\n]*/g,' ');
 var toks=clean.match(/[A-Za-z_][A-Za-z0-9_]*|[\s\S]/g)||[];
 var depth=0,pendingDo=false;
 for(var i=0;i<toks.length;i++){var t=toks[i];
  if(t==='function'||t==='if'||t==='repeat'){depth++;}
  else if(t==='for'||t==='while'){pendingDo=true;}
  else if(t==='do'){if(pendingDo){pendingDo=false;}else{depth++;}}
  else if(t==='end'||t==='until'){depth--;}}
 if(depth>0)issues.push(depth+' unclosed block'+(depth===1?'':'s')+' (missing end)');
 if(depth<0)issues.push((-depth)+' extra end'+(depth===-1?'':'s'));
 var noStr=clean.replace(/"(?:[^"\\]|\\.)*"/g,'""').replace(/'(?:[^'\\]|\\.)*'/g,"''");
 var bal={'(':0,')':0,'{':0,'}':0,'[':0,']':0};
 for(var j=0;j<noStr.length;j++){var ch=noStr[j];if(ch in bal)bal[ch]++;}
 if(bal['(']!==bal[')'])issues.push('unbalanced parentheses ('+bal['(']+' open, '+bal[')']+' close)');
 if(bal['{']!==bal['}'])issues.push('unbalanced braces');
 if(bal['[']!==bal[']'])issues.push('unbalanced square brackets');
 var lines=code.split('\n');
 for(var l=0;l<lines.length;l++){var ln=lines[l].replace(/--.*/, '');var q=(ln.match(/"/g)||[]).length;var q2=(ln.match(/'/g)||[]).length;
  if(q%2===1)issues.push('line '+(l+1)+': unterminated double-quoted string');
  if(q2%2===1)issues.push('line '+(l+1)+": unterminated single-quoted string");}
 return issues;
}
function tcLintAll(){
 var n=0,okc=0,bad=0;
 for(var k in DOC.nodes){var p=DOC.nodes[k];if(p.cls!=='Script')continue;n++;
  var iss=luauLint(p.code||'');
  if(iss.length){bad++;out('Lint '+p.name+': '+iss.join('; '),'warn');}
  else{okc++;out('Lint '+p.name+': OK','sys');}}
 if(n===0)out('Lint: no scripts in the place yet','err');
 else out('Lint done: '+okc+' of '+n+' scripts structurally clean','sys');
}
function tcDoctor(){
 var parts=0,scripts=0,unanch=0,emptyS=0,hasSpawn=false,shapes={'Part':0,'WedgePart':0,'other':0};
 for(var k in DOC.nodes){var p=DOC.nodes[k];
  if(p.cls==='Script'){scripts++;if(!p.code||!p.code.trim())emptyS++;continue;}
  if(p.cls==='Folder')continue;
  parts++;if(!p.anch)unanch++;
  if(p.cls==='SpawnLocation')hasSpawn=true;
  if(p.cls==='Part')shapes['Part']++;else if(p.cls==='WedgePart')shapes['WedgePart']++;else shapes['other']++;}
 out('Game Doctor: '+parts+' parts, '+scripts+' scripts','sys');
 if(!hasSpawn)out('Game Doctor: no SpawnLocation in the place; players will spawn at default spawn','warn');
 if(unanch>0)out('Game Doctor: '+unanch+' unanchored part'+(unanch===1?'':'s')+' will fall or drift during Play','warn');
 if(emptyS>0)out('Game Doctor: '+emptyS+' script'+(emptyS===1?'':'s')+' with empty source','warn');
 if(unanch===0&&emptyS===0&&hasSpawn)out('Game Doctor: no issues found','sys');
}
function tcProfile(){
 out('Profiler: measuring 2 seconds of rendering...','sys');
 var frames=0,t0=performance.now();
 function tick(){frames++;var dt=performance.now()-t0;
  if(dt<2000){requestAnimationFrame(tick);}
  else{var fps=Math.round(frames/(dt/1000));out('Profiler: '+fps+' FPS average ('+(dt/frames).toFixed(1)+' ms per frame over '+frames+' frames)','sys');}}
 requestAnimationFrame(tick);}
var _runCmd4=runCmd;
runCmd=function(s){if(!s)return _runCmd4(s);var t=s.trim().toLowerCase();
 if(t==='lint'||t==='lint all'){tcLintAll();return;}
 if(t==='doctor'||t==='game doctor'){tcDoctor();return;}
 if(t==='profile'||t==='profiler'){tcProfile();return;}
 _runCmd4(s);};
TABS[3][1]=TABS[3][1].concat([null,['icon-out','Run Scripts',function(){tcLintAll();}],['icon-check','Game Doctor',function(){tcDoctor();}],['icon-play2','Profiler',function(){tcProfile();}]]);
buildTabs();
out('FORGE v0.8 toolbox + test center loaded — Toolbox adds 10 build kits (crate, lamp post, fence, obby, maze...); Test tab adds Run Scripts (Luau lint), Game Doctor, Profiler; commands lint / doctor / profile','sys');
