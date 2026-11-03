/* ============ FORGE v0.5 world layer: real-time lighting, time of day, terrain generators ============ */
var LIGHT={hour:14,bright:1,ambient:'#5a6a8a',fog:0.15,fogColor:'#3a4560'};
try{var _lw=localStorage.getItem('forge_light_v1');if(_lw){var _lo=JSON.parse(_lw);for(var _lk in _lo)LIGHT[_lk]=_lo[_lk];}}catch(e){}
function saveLight(){try{localStorage.setItem('forge_light_v1',JSON.stringify(LIGHT));}catch(e){}}
function daylight(){var t=(LIGHT.hour-6)/12*Math.PI;return Math.sin(t);}
function applySun(){var t=(LIGHT.hour-6)/12*Math.PI;var e=Math.sin(t);if(e<0.08)e=0.08;
 LDIR=norm([Math.cos(t)*0.6+0.3,e,0.45]);}
var _forge_render=render;
render=function(){applySun();_forge_render();atmosphere();};
function atmosphere(){var d=daylight();
 if(d<0.5){ctx.fillStyle='rgba(8,12,38,'+((0.5-Math.max(d,0))*0.9).toFixed(3)+')';ctx.fillRect(0,0,W,H);}
 if(d>0&&d<0.35){ctx.fillStyle='rgba(255,120,50,'+(0.14*(1-d/0.35)).toFixed(3)+')';ctx.fillRect(0,0,W,H);}
 if(LIGHT.fog>0){var g=ctx.createLinearGradient(0,H*0.55,0,H);g.addColorStop(0,'rgba(58,69,96,0)');g.addColorStop(1,'rgba(58,69,96,'+(LIGHT.fog*0.85).toFixed(3)+')');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}}
var _forge_shade=shade;
shade=function(p,nv){var s=_forge_shade(p,nv);if(LIGHT.bright===1)return s;
 var m=s.match(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/);if(!m)return s;var f=LIGHT.bright;
 return 'rgba('+Math.min(255,Math.round(+m[1]*f))+','+Math.min(255,Math.round(+m[2]*f))+','+Math.min(255,Math.round(+m[3]*f))+','+m[4]+')';};
var _buildProps=buildProps;
function lightPanel(el){
  function lrow(k,inner){var tr=document.createElement('tr');var a=document.createElement('td');a.className='k';a.textContent=k;var b=document.createElement('td');b.appendChild(inner);tr.appendChild(a);tr.appendChild(b);el.appendChild(tr);return tr;}
  var s1=document.createElement('div');s1.className='sect';s1.textContent='Time of Day';el.appendChild(s1);
  var hr=document.createElement('input');hr.type='range';hr.min='0';hr.max='24';hr.step='0.5';hr.value=LIGHT.hour;hr.style.width='100%';
  var hl=document.createElement('div');hl.style.cssText='color:#8fd4ff;font-size:10px;padding:0 6px 2px';hl.textContent=Math.floor(LIGHT.hour)+':00';
  hr.oninput=function(){hl.textContent=Math.floor(+hr.value)+':00';};
  hr.onchange=function(){LIGHT.hour=+hr.value;saveLight();render();};lrow('Clock',hr);el.appendChild(hl);
  var s2=document.createElement('div');s2.className='sect';s2.textContent='Light';el.appendChild(s2);
  var br=document.createElement('input');br.type='range';br.min='0.4';br.max='1.8';br.step='0.05';br.value=LIGHT.bright;br.style.width='100%';
  br.onchange=function(){LIGHT.bright=+br.value;saveLight();render();};lrow('Brightness',br);
  var am=document.createElement('input');am.type='color';am.value=LIGHT.ambient;am.style.width='100%';am.style.height='22px';
  am.onchange=function(){LIGHT.ambient=am.value;saveLight();render();};lrow('Ambient',am);
  var s3=document.createElement('div');s3.className='sect';s3.textContent='Atmosphere';el.appendChild(s3);
  var fg=document.createElement('input');fg.type='range';fg.min='0';fg.max='0.9';fg.step='0.05';fg.value=LIGHT.fog;fg.style.width='100%';
  fg.onchange=function(){LIGHT.fog=+fg.value;saveLight();render();};lrow('Fog',fg);
  var note=document.createElement('div');note.style.cssText='padding:8px 6px;color:#6a6a7a;font-size:10px';note.textContent='Preview lighting in this viewport. Clock, brightness and fog apply live.';el.appendChild(note;}
buildProps=function(){var p=SEL?DOC.nodes[SEL]:null;var el=document.getElementById('props');
 if((p&&p.cls==='Lighting')||(SEL==='Lighting')){document.getElementById('st-sel').textContent='Lighting (Lighting)';lightPanel(el);return;}
 if(!p&&SEL&&typeof SERVICES!=='undefined'&&SERVICES.indexOf(SEL)>=0){el.innerHTML='<div style="padding:10px;color:#6a6a7a">'+SEL+' ('+SEL+') — no editable properties</div>';document.getElementById('st-sel').textContent=SEL+' ('+SEL+')';return;}
 if(p&&!p.pos&&p.cls!=='Script'){el.innerHTML='<div style="padding:10px;color:#6a6a7a">'+esc(p.name)+' ('+p.cls+') — no editable properties</div>';
  document.getElementById('st-sel').textContent=p.name+' ('+p.cls+')';return;}
 _buildProps();};
var TERRAIN_IDS=[];
function terrainPart(o){var p=part(o);TERRAIN_IDS.push(p.id);return p;}
var GRASSC=['#3f7d3a','#4a8a3e','#55924a','#457f3b'];
function genGrass(){pushUndo();var n=0;
 for(var x=-4;x<4;x++)for(var z=-4;z<4;z++){terrainPart({name:'Grass'+(n++),parent:'ws',size:[8,0.3,8],pos:[x*8,0.2,z*8],color:GRASSC[(x+z+8)%4],mat:'Plastic'});}
 refreshAll();saveLocal();out('Grass field placed: 64 tiles','sys');}
function genIsland(){pushUndo();var n=0;
 for(var x=-6;x<=6;x++)for(var z=-6;z<=6;z++){var r=Math.hypot(x,z);var h=Math.floor(6*Math.exp(-r*r/30));
  if(h<1)continue;var c=h>=4?'#4a8a3e':(h>=2?'#6ab04c':'#d9b26a');
  terrainPart({name:'Island'+(n++),parent:'ws',size:[7.8,h,7.8],pos:[x*8,h/2-0.5,z*8],color:c,mat:'Plastic'});}
 refreshAll();saveLocal();out('Island generated: '+n+' blocks','sys');}
function genHills(){pushUndo();var n=0;
 var spots=[[-24,-24],[0,-24],[24,-24],[-24,24],[0,24],[24,24]];
 for(var i=0;i<spots.length;i++){var h=4+(i%3)*2;
  terrainPart({name:'Hill'+(n++),parent:'ws',size:[12,h,12],pos:[spots[i][0],h/2-0.5,spots[i][1]],color:'#6b7f56',mat:'Slate'});}
 refreshAll();saveLocal();out('Hills generated: '+n,'sys');}
function genTrees(){pushUndo();var n=0;
 var spots=[[-30,-10],[-18,14],[-6,-28],[10,22],[24,-6],[34,18],[-38,26],[18,36]];
 for(var i=0;i<spots.length;i++){var x=spots[i][0],z=spots[i][1];
  terrainPart({name:'Trunk'+(n),parent:'ws',size:[1.4,5,1.4],pos:[x,2.5,z],color:'#6b4a2b',mat:'Wood'});
  terrainPart({name:'Leaves'+(n),parent:'ws',size:[5,5,5],pos:[x,6.6,z],color:'#2f7a33',mat:'Plastic'});n++;}
 refreshAll();saveLocal();out('Trees planted: '+n,'sys');}
function clearTerrain(){pushUndo();var n=0;
 for(var k in DOC.nodes){var p=DOC.nodes[k];
  if(TERRAIN_IDS.indexOf(k)>=0||/^(Grass|Island|Hill|Trunk|Leaves)/.test(p.name)){delete DOC.nodes[k];n++;}}
 TERRAIN_IDS=[];refreshAll();saveLocal();out('Terrain cleared: '+n+' objects removed','sys');}
function setTime(h){LIGHT.hour=h;saveLight();render();var hh=Math.floor(h);var mm=Math.round((h-hh)*60);out('Time set to '+hh+':'+(mm<10?'0':'')+mm,'sys');}
TABS.push(['World',[['icon-part','Grass Field',genGrass],['icon-flat','Island',genIsland],['icon-ball','Hills',genHills],['icon-anchor','Trees',genTrees],null,['icon-out','Clear Terrain',clearTerrain],null,['icon-play2','Dawn',function(){setTime(6.5);}],['icon-play','Noon',function(){setTime(12);}],['icon-stop','Dusk',function(){setTime(18.5);}],['icon-stop2','Night',function(){setTime(22);}]]]);
buildTabs();
var _runCmd=runCmd;
runCmd=function(s){if(!s)return _runCmd(s);var t=s.trim().toLowerCase();
 if(t==='island'){genIsland();return;}
 if(t==='hills'){genHills();return;}
 if(t==='grass'){genGrass();return;}
 if(t==='trees'){genTrees();return;}
 if(t==='clear terrain'||t==='clearterrain'){clearTerrain();return;}
 if(t==='dawn'){setTime(6.5);return;}if(t==='noon'){setTime(12);return;}
 if(t==='dusk'){setTime(18.5);return;}if(t==='night'){setTime(22);return;}
 var m=t.match(/^time (\d{1,2})(?::(\d{2}))?$/);
 if(m){setTime(+m[1]+(+m[2]||0)/60);return;}
 _runCmd(s);};
out('FORGE v0.5 world layer loaded — time of day + lighting (select Lighting in Explorer) and terrain: World tab, or commands island / hills / grass / trees / night','sys');
render();
