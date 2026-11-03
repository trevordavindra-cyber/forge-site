/* ============ FORGE v0.6 build layer: procedural structure generators ============ */
var BUILD_IDS=[];
function bPart(o){var p=part(o);BUILD_IDS.push(p.id);return p;}
function genHouse(x,z,w,d){
 x=x||0;z=z||0;w=w||16;d=d||12;var n=0;
 bPart({name:'HouseFloor'+(n++),parent:'ws',size:[w+2,0.5,d+2],pos:[x,0.25,z],color:'#8a7a66',mat:'Wood'});
 var h=6,t=0.5;
 bPart({name:'HouseWallS'+(n++),parent:'ws',size:[w,h,t],pos:[x,h/2+0.5,z+d/2],color:'#c9b8a3',mat:'Concrete'});
 bPart({name:'HouseWallN'+(n++),parent:'ws',size:[w,h,t],pos:[x,h/2+0.5,z-d/2],color:'#c9b8a3',mat:'Concrete'});
 bPart({name:'HouseWallW'+(n++),parent:'ws',size:[t,h,d],pos:[x-w/2,h/2+0.5,z],color:'#c9b8a3',mat:'Concrete'});
 bPart({name:'HouseWallE'+(n++),parent:'ws',size:[t,h,d/2-1.5],pos:[x+w/2,h/2+0.5,z-d/4-0.75],color:'#c9b8a3',mat:'Concrete'});
 bPart({name:'HouseWallE2'+(n++),parent:'ws',size:[t,2.5,d/2-1.5],pos:[x+w/2,h+0.5-1.25,z+d/4+0.75],color:'#c9b8a3',mat:'Concrete'});
 bPart({name:'HouseDoorTop'+(n++),parent:'ws',size:[t,1,3],pos:[x+w/2,h+0.5+2.5,z+d/4+0.75],color:'#c9b8a3',mat:'Concrete'});
 var rl=Math.hypot(w,2),ra=Math.atan2(2,w)*180/Math.PI;
 bPart({name:'HouseRoofA'+(n++),parent:'ws',cls:'WedgePart',shape:'Wedge',size:[rl,0.4,d+2],rot:[0,0,-ra],pos:[x,h+1+1,z],color:'#8b3a2f',mat:'Slate'});
 bPart({name:'HouseRoofB'+(n++),parent:'ws',cls:'WedgePart',shape:'Wedge',size:[rl,0.4,d+2],rot:[0,0,ra],pos:[x,h+1+1,z],color:'#8b3a2f',mat:'Slate'});
 refreshAll();saveLocal();out('House generated: '+(n-1)+' parts','sys');}
function genTower(x,z,floors){
 x=x||0;z=z||0;floors=floors||4;var n=0,fh=4,r=5;
 for(var i=0;i<floors;i++){
  bPart({name:'TowerWallA'+(n++),parent:'ws',size:[r*2,0.6,r*2],pos:[x,i*fh+fh+0.3,z],color:'#9aa2ab',mat:'Concrete'});
  bPart({name:'TowerBody'+(n++),parent:'ws',size:[r*1.6,fh,r*1.6],pos:[x,i*fh+fh/2+0.5,z],color:'#b8bec6',mat:'Concrete'});}
 bPart({name:'TowerRoof'+(n++),parent:'ws',cls:'WedgePart',shape:'Wedge',size:[r*1.8,2.5,r*1.8],rot:[0,45,0],pos:[x,floors*fh+0.8+1.25,z],color:'#5b4a6e',mat:'Slate'});
 refreshAll();saveLocal();out('Tower generated: '+n+' parts, '+floors+' floors','sys');}
function genCity(){
 pushUndo();var n=0;
 for(var i=-1;i<=1;i++){bPart({name:'CityRoad'+(n++),parent:'ws',size:[64,0.2,6],pos:[0,0.1,i*20],color:'#3a3a40',mat:'Concrete'});}
 for(i=-1;i<=1;i++){bPart({name:'CityRoadX'+(n++),parent:'ws',size:[6,0.2,64],pos:[i*20,0.1,0],color:'#3a3a40',mat:'Concrete'});}
 var lots=[[-26,-26],[-8,-26],[10,-26],[-26,-8],[-8,-8],[10,-8],[-26,10],[-8,10],[10,10]];
 var cols=['#a8b2bd','#8fa0b5','#b5a898','#98b5a8'];
 for(i=0;i<lots.length;i++){var h=6+((i*7)%5)*4;
  bPart({name:'CityBld'+(n++),parent:'ws',size:[12,h,12],pos:[lots[i][0],h/2+0.2,lots[i][1]],color:cols[i%4],mat:'Concrete'});
  bPart({name:'CityBldRoof'+(n++),parent:'ws',size:[12.4,0.6,12.4],pos:[lots[i][0],h+0.5,lots[i][1]],color:'#5a5f66',mat:'Metal'});}
 refreshAll();saveLocal();out('City generated: '+(n-1)+' parts (roads, 9 buildings)','sys');}
function genCastle(){
 pushUndo();var n=0,wx=30,wz=22,wh=8;
 bPart({name:'CastleGround'+(n++),parent:'ws',size:[wx*2+8,0.5,wz*2+8],pos:[0,0.25,0],color:'#6f7a5a',mat:'Grass'});
 bPart({name:'CastleWallS'+(n++),parent:'ws',size:[wx*2,wh,2],pos:[0,wh/2+0.5,wz],color:'#8d8d99',mat:'Slate'});
 bPart({name:'CastleWallN'+(n++),parent:'ws',size:[wx*2,wh,2],pos:[0,wh/2+0.5,-wz],color:'#8d8d99',mat:'Slate'});
 bPart({name:'CastleWallW'+(n++),parent:'ws',size:[2,wh,wz*2],pos:[-wx,wh/2+0.5,0],color:'#8d8d99',mat:'Slate'});
 bPart({name:'CastleWallE1'+(n++),parent:'ws',size:[2,wh,wz-3],pos:[wx,wh/2+0.5,-wz/2-1.5],color:'#8d8d99',mat:'Slate'});
 bPart({name:'CastleWallE2'+(n++),parent:'ws',size:[2,wh,wz-3],pos:[wx,wh/2+0.5,wz/2+1.5],color:'#8d8d99',mat:'Slate'});
 var ct=[[-wx,-wz],[wx,-wz],[-wx,wz],[wx,wz]];
 for(var i=0;i<4;i++){bPart({name:'CastleTurret'+(n++),parent:'ws',size:[6,wh+4,6],pos:[ct[i][0],(wh+4)/2+0.5,ct[i][1]],color:'#7d7d89',mat:'Slate'});}
 bPart({name:'CastleKeep'+(n++),parent:'ws',size:[14,14,14],pos:[0,7.5,0],color:'#9a9aa6',mat:'Slate'});
 bPart({name:'CastleKeepRoof'+(n++),parent:'ws',cls:'WedgePart',shape:'Wedge',size:[16,4,16],rot:[0,45,0],pos:[0,16.5,0],color:'#5b4a6e',mat:'Slate'});
 refreshAll();saveLocal();out('Castle generated: '+(n-1)+' parts (walls, 4 turrets, keep)','sys');}
var _clearTerrain=clearTerrain;
clearTerrain=function(){pushUndo();var n=0;
 for(var k in DOC.nodes){var p=DOC.nodes[k];
  if(BUILD_IDS.indexOf(k)>=0||/^(Grass|Island|Hill|Trunk|Leaves|House|Tower|City|Castle)/.test(p.name)){delete DOC.nodes[k];n++;}}
 TERRAIN_IDS=[];BUILD_IDS=[];refreshAll();saveLocal();out('Terrain cleared: '+n+' objects removed','sys');};
TABS[5][1]=TABS[5][1].concat([
 ['icon-flat','House',function(){genHouse(0,20);}],
 ['icon-anchor','Tower',function(){genTower(30,0,4);}],
 ['icon-part','City',genCity],
 ['icon-ball','Castle',genCastle],
 null]);
buildTabs();
var _runCmd2=runCmd;
runCmd=function(s){if(!s)return _runCmd2(s);var t=s.trim().toLowerCase();
 if(t==='house'){genHouse(0,20);return;}
 if(t==='tower'){genTower(30,0,4);return;}
 if(t==='city'){genCity();return;}
 if(t==='castle'){genCastle();return;}
 _runCmd2(s);};
out('FORGE v0.6 build layer loaded — procedural structures: World tab adds House / Tower / City / Castle, commands house / tower / city / castle','sys');
