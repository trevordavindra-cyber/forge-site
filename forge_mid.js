/* ================= PICK/DRAG ================= */
function pip(pt,poly){var inside=false;for(var i=0,j=poly.length-1;i<poly.length;j=i++){
 var xi=poly[i].x,yi=poly[i].y,xj=poly[j].x,yj=poly[j].y;
 if(((yi>pt.y)!==(yj>pt.y))&&(pt.x<(xj-xi)*(pt.y-yi)/(yj-yi)+xi))inside=!inside;}return inside;}
function pick(mx,my){var cam=camVecs();var best=null,bestD=1e9;
 for(var i=0;i<ITEMS.length;i++){var it=ITEMS[i];
  if(it.kind==='face'){if(pip({x:mx,y:my},it.pts)&&it.d<bestD){best=it.p;bestD=it.d;}}
  else{var c0=project(it.p.pos,cam);var r=Math.max(it.p.size[0],it.p.size[1],it.p.size[2])/2*CAMZ;
   if(Math.hypot(mx-c0.x,my-c0.y)<=r&&it.d<bestD){best=it.p;bestD=it.d;}}}
 return best;}
function select(id){SEL=id;buildTree();buildProps();updStatus();}
function mousePos(e){var r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
cv.addEventListener('mousedown',function(e){var m=mousePos(e);
 if(e.button===2)return;
 if(e.button===1||e.button===2||e.altKey){DRAG={mode:'orbit',lx:m.x,ly:m.y};return;}
 if(e.button===0){
  if(TOOL==='Select'||TOOL==='Move'){var g=hitGizmo(m.x,m.y);
   if(g&&SEL&&DOC.nodes[SEL]){pushUndo();DRAG={mode:'axis',ax:g,lx:m.x,ly:m.y};return;}
   var h=hitHandle(m.x,m.y);
   if(h&&DOC.nodes[SEL]){pushUndo();DRAG={mode:'scale',ax:h.ax,sgn:h.sgn,lx:m.x,ly:m.y};return;}
   var p=pick(m.x,m.y);
   if(p){if(SEL!==p.id){pushUndo();select(p.id);}
    if(TOOL==='Move'){pushUndo();DRAG={mode:'plane',lx:m.x,ly:m.y};}
    else DRAG=null;}
   else{select(null);DRAG={mode:'orbit',lx:m.x,ly:m.y};}
   return;}
  if(TOOL==='Scale'){var h2=hitHandle(m.x,m.y);var p2=pick(m.x,m.y);
   if(h2&&p2&&SEL===p2.id){pushUndo();DRAG={mode:'scale',ax:h2.ax,sgn:h2.sgn,lx:m.x,ly:m.y};}
   else if(p2){select(p2.id);}
   return;}
  if(TOOL==='Rotate'){var p3=pick(m.x,m.y);if(p3){if(SEL!==p3.id){pushUndo();select(p3.id);}pushUndo();DRAG={mode:'rot',lx:m.x,ly:m.y};}return;}
 }});
cv.addEventListener('mousemove',function(e){if(!DRAG)return;var m=mousePos(e);
 var cam=camVecs();var p=SEL?DOC.nodes[SEL]:null;
 if(DRAG.mode==='orbit'){CAM.yaw+=(m.x-DRAG.lx)*0.008;CAM.pitch-=(m.y-DRAG.ly)*0.008;CAM.pitch=Math.max(-1.45,Math.min(1.45,CAM.pitch));DRAG.lx=m.x;DRAG.ly=m.y;render();return;}
 if(!p)return;
 if(DRAG.mode==='axis'){var AX=[[1,0,0],[0,1,0],[0,0,1]][DRAG.ax];
  var sd={x:dot(AX,cam.right)*CAMZ,y:-dot(AX,cam.up)*CAMZ};
  var dx=m.x-DRAG.lx,dy=m.y-DRAG.ly;var L=sd.x*sd.x+sd.y*sd.y||1;var t=(dx*sd.x+dy*sd.y)/L;
  if(SNAP){var before=p.pos[DRAG.ax];var moved=AX[DRAG.ax]*t/CAMZ;p.pos[DRAG.ax]=before+moved;
   p.pos[DRAG.ax]=Math.round(p.pos[DRAG.ax]);}else{p.pos[DRAG.ax]+=AX[DRAG.ax]*t/CAMZ;}
  DRAG.lx=m.x;DRAG.ly=m.y;buildProps();render();}
 else if(DRAG.mode==='plane'){var dx2=m.x-DRAG.lx,dy2=m.y-DRAG.ly;
  var mv=[cam.right[0]*dx2/CAMZ+cam.up[0]*(-dy2/CAMZ),cam.right[1]*dx2/CAMZ+cam.up[1]*(-dy2/CAMZ),cam.right[2]*dx2/CAMZ+cam.up[2]*(-dy2/CAMZ)];
  if(SNAP){var np=[p.pos[0]+mv[0],p.pos[1]+mv[1],p.pos[2]+mv[2]];p.pos=[Math.round(np[0]),Math.round(np[1]),Math.round(np[2])];}
  else p.pos=[p.pos[0]+mv[0],p.pos[1]+mv[1],p.pos[2]+mv[2]];
  DRAG.lx=m.x;DRAG.ly=m.y;buildProps();render();}
 else if(DRAG.mode==='scale'){var AX2=[[1,0,0],[0,1,0],[0,0,1]][DRAG.ax];
  var R=m3(p.rot[0],p.rot[1],p.rot[2]);var wax=mulv(R,AX2);
  var sd2={x:dot(wax,cam.right)*CAMZ,y:-dot(wax,cam.up)*CAMZ};
  var dx3=m.x-DRAG.lx,dy3=m.y-DRAG.ly;var L2=sd2.x*sd2.x+sd2.y*sd2.y||1;var t2=(dx3*sd2.x+dy3*sd2.y)/L2;
  p.size[DRAG.ax]=Math.max(0.2,p.size[DRAG.ax]+DRAG.sgn*t2/CAMZ);
  DRAG.lx=m.x;DRAG.ly=m.y;buildProps();render();}
 else if(DRAG.mode==='rot'){var dy4=(m.x-DRAG.lx)*0.5;p.rot[1]+=dy4;DRAG.lx=m.x;DRAG.ly=m.y;buildProps();render();}});
window.addEventListener('mouseup',function(){if(DRAG){DRAG=null;buildTree();saveLocal();}});
cv.addEventListener('wheel',function(e){e.preventDefault();CAM.dist*=e.deltaY>0?1.1:0.9;CAM.dist=Math.max(8,Math.min(600,CAM.dist));render();},{passive:false});
cv.addEventListener('contextmenu',function(e){e.preventDefault();var m=mousePos(e);var p=pick(m.x,m.y);if(p)select(p.id);showCtx(e.clientX,e.clientY,p?p.id:null);});
function hitGizmo(x,y){for(var i=0;i<GIZ.length;i++){var g=GIZ[i];
 var dx=x-g.x1,dy=y-g.y1,dx2=g.x2-g.x1,dy2=g.y2-g.y1;var L=dx2*dx2+dy2*dy2||1;
 var t=(dx*dx2+dy*dy2)/L;if(t<0.15||t>1.35)continue;var px=g.x1+dx2*t,py=g.y1+dy2*t;
 if(Math.hypot(x-px,y-py)<7)return g.ax;}return null;}
function hitHandle(x,y){for(var i=0;i<HANDLES.length;i++){var h=HANDLES[i];if(Math.abs(x-h.x)<8&&Math.abs(y-h.y)<8)return h;}return null;}
/* ================= OUTPUT/CMD ================= */
function out(t,cls){var o=document.getElementById('output');var d=document.createElement('div');d.className='ln'+(cls?' '+cls:'');d.textContent=t;o.appendChild(d);o.scrollTop=o.scrollHeight;
 while(o.children.length>400)o.removeChild(o.firstChild);}
var CMDHIST=[],CHI=-1;
function runCmd(s){s=s.trim();if(!s)return;CMDHIST.push(s);CHI=CMDHIST.length;
 out('> '+s,'sys');
 var m;
 if(s==='help'){out('commands: new part|sphere|cylinder|wedge|script|folder · select NAME · set position x y z · set size x y z · set color #hex · set material NAME · set anchored true|false · set transparency N · rotate x y z · delete · duplicate · undo · redo · play · stop · clear','sys');return;}
 if(m=s.match(/^new (part|sphere|cylinder|wedge|script|folder)$/i)){var t=m[1].toLowerCase();
  if(t==='script'){pushUndo();var sc=script({});select(sc.id);}
  else if(t==='folder'){pushUndo();var fo={id:uid(),name:'Folder',cls:'Folder',parent:'ws'};DOC.nodes[fo.id]=fo;select(fo.id);}
  else{pushUndo();var pr=part({shape:t.charAt(0).toUpperCase()+t.slice(1),cls:t==='part'?'Part':'Part',size:t==='sphere'?[4,4,4]:t==='cylinder'?[4,4,4]:t==='wedge'?[4,4,4]:[4,1,2],name:t.charAt(0).toUpperCase()+t.slice(1)});select(pr.id);}
  buildTree();render();saveLocal();return;}
 if(m=s.match(/^select (.+)$/i)){var n2=byName(m[1]);if(n2){select(n2.id);out('Selected '+n2.name,'sys');}else out("Name '"+m[1]+"' not found",'err');return;}
 if(m=s.match(/^set (position|size) (-?[\d.]+) (-?[\d.]+) (-?[\d.]+)$/i)){var p3=SEL?DOC.nodes[SEL]:null;if(!p3||p3.cls==='Script'){out('Select a part first','err');return;}
  pushUndo();if(m[1].toLowerCase()==='position')p3.pos=[+m[2],+m[3],+m[4]];else p3.size=[+m[2],+m[3],+m[4]];
  buildProps();render();saveLocal();return;}
 if(m=s.match(/^set (color|colour) (#[0-9a-f]{3,8})$/i)){var p4=SEL?DOC.nodes[SEL]:null;if(!p4||p4.cls==='Script'){out('Select a part first','err');return;}
  pushUndo();p4.color=m[2];buildProps();render();saveLocal();return;}
 if(m=s.match(/^set material (\w+)$/i)){var p5=DOC.nodes[SEL];if(!p5||p5.cls==='Script'){out('Select a part first','err');return;}
  var mm=MATS.find(function(x){return x.toLowerCase()===m[1].toLowerCase();});if(!mm){out('Unknown material','err');return;}
  pushUndo();p5.mat=mm;buildProps();render();saveLocal();return;}
 if(m=s.match(/^set (anchored|cancollide|transparency) (-?[\w.]+)$/i)){var p6=DOC.nodes[SEL];if(!p6||p6.cls==='Script'){out('Select a part first','err');return;}
  pushUndo();var k=m[1].toLowerCase();var v=m[2].toLowerCase();
  if(k==='transparency')p6.trans=Math.max(0,Math.min(1,parseFloat(v)||0));else p6[k==='anchored'?'anch':'coll']=(v==='true'||v==='1');
  buildProps();render();saveLocal();return;}
 if(m=s.match(/^rotate (-?[\d.]+) (-?[\d.]+) (-?[\d.]+)$/i)){var p7=DOC.nodes[SEL];if(!p7||p7.cls==='Script'){out('Select a part first','err');return;}
  pushUndo();p7.rot=[p7.rot[0]+ +m[1],p7.rot[1]+ +m[2],p7.rot[2]+ +m[3]];buildProps();render();saveLocal();return;}
 if(s==='delete'||s==='del'){delSel();return;}
 if(s==='duplicate'||s==='dup'){dupSel();return;}
 if(s==='undo'){doUndo();return;}if(s==='redo'){doRedo();return;}
 if(s==='play'){startPlay();return;}if(s==='stop'){stopPlay();return;}
 if(s==='clear'){document.getElementById('output').innerHTML='';return;}
 out('Unknown command. Type help','err');}
/* ================= ACTIONS ================= */
function delSel(){if(!SEL||!DOC.nodes[SEL])return;pushUndo();var nm=DOC.nodes[SEL].name;
 function rm(id){var ch=children(id);ch.forEach(function(c){rm(c.id);});delete DOC.nodes[id];}
 rm(SEL);SEL=null;buildTree();buildProps();render();saveLocal();out('Deleted '+nm,'sys');}
function dupSel(){if(!SEL||!DOC.nodes[SEL])return;pushUndo();var src=DOC.nodes[SEL];
 var copy=JSON.parse(JSON.stringify(src));copy.id=uid();copy.name=src.name+' (copy)';DOC.nodes[copy.id]=copy;select(copy.id);buildTree();render();saveLocal();}
function copySel(){if(!SEL||!DOC.nodes[SEL])return;CLIP=JSON.parse(JSON.stringify(DOC.nodes[SEL]));out('Copied '+CLIP.name,'sys');}
function pasteClip(){if(!CLIP)return;pushUndo();var c=JSON.parse(JSON.stringify(CLIP));c.id=uid();c.name=CLIP.name;c.pos=[c.pos[0]+2,c.pos[1],c.pos[2]];DOC.nodes[c.id]=c;select(c.id);buildTree();render();saveLocal();}
function insertObj(cls){pushUndo();
 if(cls==='Script'){var s2=script({});select(s2.id);}
 else if(cls==='Folder'){var f2={id:uid(),name:'Folder',cls:'Folder',parent:'ws'};DOC.nodes[f2.id]=f2;select(f2.id);}
 else if(cls==='SpawnLocation'){var p2=part({name:'SpawnLocation',cls:'SpawnLocation',size:[6,1,6],pos:[0,1,0],color:'#4a4a4a'});select(p2.id);}
 else{var sh=cls==='Part'?'Block':cls.replace('Part','');
  var p3=part({name:cls,cls:cls,shape:sh,size:sh==='Block'?[4,1,2]:[4,4,4],pos:[0,4,0]});select(p3.id);}
 buildTree();render();saveLocal();}
function groupSel(){if(!SEL||!DOC.nodes[SEL])return;pushUndo();var src=DOC.nodes[SEL];
 var g={id:uid(),name:'Model',cls:'Model',parent:src.parent};DOC.nodes[g.id]=g;src.parent=g.id;select(g.id);buildTree();saveLocal();}
function ungroupSel(){var p=SEL?DOC.nodes[SEL]:null;if(!p||p.cls!=='Model')return;pushUndo();
 children(p.id).forEach(function(c){c.parent=p.parent;});var pid=p.id;SEL=children(pid)[0]?children(pid)[0].id:null;delete DOC.nodes[pid];buildTree();buildProps();render();saveLocal();}
function anchorAll(){pushUndo();for(var k in DOC.nodes){var p=DOC.nodes[k];if(p.cls==='Part'||p.cls==='SpawnLocation')p.anch=true;}buildProps();saveLocal();out('Anchored everything','sys');}
function randColors(){pushUndo();var cols=['#e74c3c','#3498db','#2ecc71','#f1c40f','#9b59b6','#e67e22','#1abc9c','#fd79a8'];
 for(var k in DOC.nodes){var p=DOC.nodes[k];if(p.cls!=='Script')p.color=cols[Math.floor(Math.random()*cols.length)];}buildProps();render();saveLocal();}
function flatten(){pushUndo();for(var k in DOC.nodes){var p=DOC.nodes[k];if(p.rot)p.rot=[0,0,0];}buildProps();render();saveLocal();}
/* ================= PLAY ================= */
function startPlay(){if(PLAY)return;PLAYSNAP=snap();out('Play test started','warn');var last=null;
 PLAY=setInterval(function(){var now=Date.now();if(last===null)last=now;var dt=Math.min(0.05,(now-last)/1000);last=now;
  for(var k in DOC.nodes){var p=DOC.nodes[k];if(p.cls==='Script')continue;if(p.anch)continue;
   p.vy=(p.vy||0)-60*dt;p.pos[1]+=p.vy*dt;
   var bottom=p.pos[1]-p.size[1]/2;
   if(bottom<=0){p.pos[1]=p.size[1]/2;if(p.vy<-4){p.vy=-p.vy*0.25;out(p.name+' landed','sys');}else p.vy=0;}}
  render();},33);}
function stopPlay(){if(!PLAY)return;clearInterval(PLAY);PLAY=null;DOC=JSON.parse(PLAYSNAP);SEL=null;refreshAll();out('Play test stopped','warn');}
/* ================= TREE ================= */
var OPEN={'ws':true};
function iconFor(p){var c={Part:'#9aa0a6',WedgePart:'#7aa2c9',Folder:'#c9a227',Script:'#7d5fff',SpawnLocation:'#4a4a4a',Model:'#3fa66a'}[p.cls]||'#9aa0a6';
 if(p.cls==='Part'||p.cls==='WedgePart'||p.cls==='SpawnLocation')c=p.color;
 return c;}
function buildTree(){var t=document.getElementById('tree');t.innerHTML='';
 function rec(pid,depth){children(pid).forEach(function(p){var d=document.createElement('div');d.className='node'+(SEL===p.id?' sel':'');
  var kids=children(p.id).length>0;
  d.style.paddingLeft=(8+depth*14)+'px';
  d.innerHTML='<span class="arrow">'+(kids?(OPEN[p.id]?'▼':'▶'):'')+'</span><span class="ic" style="background:'+iconFor(p)+'"></span><span>'+esc(p.name)+'</span>';
  if(kids)d.querySelector('.arrow').onclick=function(ev){ev.stopPropagation();OPEN[p.id]=!OPEN[p.id];buildTree();};
  d.onclick=function(){select(p.id);};
  d.ondblclick=function(ev){ev.stopPropagation();renameInline(d,p);};
  d.oncontextmenu=function(ev){ev.preventDefault();select(p.id);showCtx(ev.clientX,ev.clientY,p.id);};
  t.appendChild(d);
  if(kids&&OPEN[p.id])rec(p.id,depth+1);});}
 ['ws'].concat(SERVICES).forEach(function(s){
  var d=document.createElement('div');d.className='node'+((SEL===s)?' sel':'');
  var lbl=s==='ws'?'Workspace':s;
  d.innerHTML='<span class="arrow">▼</span><span class="ic" style="background:'+(s==='ws'?'#3fa66a':'#6a6a7a')+'"></span><span>'+lbl+'</span>';
  d.onclick=function(){select(s);};d.oncontextmenu=function(ev){ev.preventDefault();showSvcCtx(ev.clientX,ev.clientY,s);};
  t.appendChild(d);
  if(s==='ws'||s==='ServerScriptService')rec(s,1);});
}
function renameInline(el,p){var spans=el.querySelectorAll('span');var span=spans[spans.length-1];var inp=document.createElement('input');inp.value=p.name;
 span.style.display='none';el.appendChild(inp);inp.focus();inp.select();
 inp.onkeydown=function(e){if(e.key==='Enter'){fin();}if(e.key==='Escape'){cancel();}};
 inp.onblur=fin;
 function fin(){if(!inp.parentNode)return;pushUndo();p.name=inp.value||p.name;inp.remove();span.style.display='';buildTree();buildProps();saveLocal();}
 function cancel(){if(!inp.parentNode)return;inp.remove();span.style.display='';}}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;');}
