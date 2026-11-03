"use strict";
/* ================= STATE ================= */
var DOC=null, SEL=null, MULTI=[], CLIP=null, TOOL='Select', PLAY=null, PLAYSNAP=null;
var UNDOS=[], REDOS=[], DRAG=null, SNAP=false, DIRTY=false;
var CAM={yaw:-0.6,pitch:0.5,dist:60};
var SERVICES=['Players','Lighting','ReplicatedStorage','ServerScriptService','StarterGui'];
var MATS=['Plastic','SmoothPlastic','Metal','Wood','Slate','Concrete','Brick','Neon','Glass','ForceField'];
var SHAPES=['Block','Sphere','Cylinder','Wedge'];
function uid(){DOC.nextId=(DOC.nextId||1)+0; var n=DOC.nextId++; return 'n'+n;}
function part(o){var p={id:uid(),name:o.name||'Part',cls:o.cls||'Part',parent:o.parent||'ws',shape:o.shape||'Block',pos:o.pos||[0,4,0],rot:o.rot||[0,0,0],size:o.size||[4,1,2],color:o.color||'#a3a3a3',mat:o.mat||'Plastic',trans:o.trans||0,anch:o.anch===undefined?true:o.anch,coll:o.coll===undefined?true:o.coll};DOC.nodes[p.id]=p;return p;}
function script(o){var p={id:uid(),name:o.name||'Script',cls:'Script',parent:o.parent||'ServerScriptService',code:o.code||'print("Hello from Forge!")'};DOC.nodes[p.id]=p;return p;}
function children(pid){var a=[];for(var k in DOC.nodes){if(DOC.nodes[k].parent===pid)a.push(DOC.nodes[k]);}a.sort(function(x,y){return x.name<y.name?-1:1;});return a;}
function byName(n){for(var k in DOC.nodes){if(DOC.nodes[k].name===n)return DOC.nodes[k];}return null;}
function getNode(id){return DOC.nodes[id]||null;}
function newDoc(){DOC={name:'Place1',nextId:1,nodes:{}};
  part({name:'Baseplate',parent:'ws',size:[64,1,64],pos:[0,-0.5,0],color:'#6b6b6b',mat:'Plastic'});
  part({name:'Part',parent:'ws',size:[4,1,2],pos:[0,4,0],color:'#a3a3a3'});
  part({name:'Ramp',parent:'ws',cls:'WedgePart',shape:'Wedge',size:[6,4,8],pos:[10,2,-4],color:'#7aa2c9'});
  script({});
  SEL=null;}
/* undo */
function snap(){return JSON.stringify(DOC);}
function pushUndo(){UNDOS.push(snap());if(UNDOS.length>60)UNDOS.shift();REDOS.length=0;markSave();}
function doUndo(){if(!UNDOS.length){out('Nothing to undo','sys');return;}REDOS.push(snap());DOC=JSON.parse(UNDOS.pop());if(SEL&&!DOC.nodes[SEL])SEL=null;refreshAll();out('Undo','sys');}
function doRedo(){if(!REDOS.length){out('Nothing to redo','sys');return;}UNDOS.push(snap());DOC=JSON.parse(REDOS.pop());refreshAll();out('Redo','sys');}
function markSave(){DIRTY=true;document.getElementById('st-save').textContent='Unsaved';}
function saveLocal(){try{localStorage.setItem('forge_doc_v2',JSON.stringify(DOC));document.getElementById('st-save').textContent='Saved';DIRTY=false;}catch(e){}}
/* ================= MATH/RENDER ================= */
var cv,ctx,W=0,H=0,DPR=1;cv=document.getElementById('vp');ctx=cv.getContext('2d');
function norm(v){var l=Math.hypot(v[0],v[1],v[2])||1;return[v[0]/l,v[1]/l,v[2]/l];}
function cross(a,b){return[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function dot(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
function camVecs(){var cp=Math.cos(CAM.pitch),sp=Math.sin(CAM.pitch),cy=Math.cos(CAM.yaw),sy=Math.sin(CAM.yaw);
 var fwd=norm([-sy*cp,-sp,-cy*cp]);
 var right=norm(cross([0,1,0],fwd));
 var up=cross(fwd,right);
 return{fwd:fwd,right:right,up:up};}
function project(p,cam){var r=[p[0]-CAMT[0],p[1]-CAMT[1],p[2]-CAMT[2]];
 return{x:W/2+dot(r,cam.right)*CAMZ,y:H/2-dot(r,cam.up)*CAMZ,d:dot(r,cam.fwd)};}
var CAMT=[0,4,0],CAMZ=10;
function m3(rx,ry,rz){var dx=rx*Math.PI/180,dy=ry*Math.PI/180,dz=rz*Math.PI/180;
 var cx=Math.cos(dx),sx=Math.sin(dx),cy2=Math.cos(dy),sy2=Math.sin(dy),cz=Math.cos(dz),sz=Math.sin(dz);
 var Rxx=cz*cy2,Rxy=cz*sy2*sx-sz*cx,Rxz=cz*sy2*cx+sz*sx;
 var Ryx=sz*cy2,Ryy=sz*sy2*sx+cz*cx,Ryz=sz*sy2*cx-cz*sx;
 var Zx=-sy2,Zy=cy2*sx,Zz=cy2*cx;
 return[[Rxx,Rxy,Rxz],[Ryx,Ryy,Ryz],[Zx,Zy,Zz]];}
function mulv(M,v){return[dot(M[0],v),dot(M[1],v),dot(M[2],v)];}
function boxCorners(p){if(!p.rot)p.rot=[0,0,0];var h=[p.size[0]/2,p.size[1]/2,p.size[2]/2],R=m3(p.rot[0],p.rot[1],p.rot[2]),out=[];
 for(var i=0;i<8;i++){var v=[(i&1?1:-1)*h[0],(i&2?1:-1)*h[1],(i&4?1:-1)*h[2]];var w=mulv(R,v);out.push([p.pos[0]+w[0],p.pos[1]+w[1],p.pos[2]+w[2]]);}
 return out;}
var BOXFACES=[[0,1,3,2],[4,6,7,5],[0,2,6,4],[1,5,7,3],[0,4,5,1],[2,3,7,6]];
var WEDGEVERTS=function(s){var x=s[0]/2,y=s[1]/2,z=s[2]/2;
 return[[-x,-y,z],[x,-y,z],[x,-y,-z],[-x,-y,-z],[-x,y,-z],[x,y,-z]];};
var WEDGEFACES=[[0,1,2,3],[3,2,5,4],[4,5,1,0],[0,4,3],[1,2,5]];
function shapeVerts(p){if(!p.rot)p.rot=[0,0,0];var R=m3(p.rot[0],p.rot[1],p.rot[2]);
 function tf(v){var w=mulv(R,v);return[p.pos[0]+w[0],p.pos[1]+w[1],p.pos[2]+w[2]];}
 if(p.shape==='Wedge'){return WEDGEVERTS(p.size).map(tf);}
 if(p.shape==='Cylinder'){var r=p.size[0]/2,h=p.size[1]/2,N=10,vts=[];
  for(var i=0;i<N;i++){var a=i/N*2*Math.PI;vts.push(tf([r*Math.cos(a),h,r*Math.sin(a)]));}
  for(i=0;i<N;i++){a=i/N*2*Math.PI;vts.push(tf([r*Math.cos(a),-h,r*Math.sin(a)]));}
  return vts;}
 var cs=boxCorners(p);var idx=[0,1,3,2, 4,6,7,5, 0,2,6,4, 1,5,7,3, 0,4,5,1, 2,3,7,6];var f=[],seen={};
 for(i=0;i<idx.length;i++){f.push(cs[idx[i]]);}
 return f;}
function shapeFaces(p){if(p.shape==='Wedge')return WEDGEFACES;
 if(p.shape==='Cylinder'){var N=10,fs=[];for(var i=0;i<N;i++){fs.push([i,(i+1)%N,N+(i+1)%N,N+i]);}fs.push([]);for(i=N-1;i>=0;i--)fs[fs.length-1].push(i);return fs;}
 return BOXFACES;}
function faceNormal(vs){var a=[vs[1][0]-vs[0][0],vs[1][1]-vs[0][1],vs[1][2]-vs[0][2]],b=[vs[2][0]-vs[0][0],vs[2][1]-vs[0][1],vs[2][2]-vs[0][2]];
 return norm(cross(a,b));}
function hex2rgb(h){h=h.replace('#','');return[parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}
var MATBRIGHT={'Plastic':1,'SmoothPlastic':1.05,'Metal':1.25,'Wood':0.9,'Slate':0.85,'Concrete':0.95,'Brick':0.9,'Neon':2.2,'Glass':1.1,'ForceField':1.2};
var LDIR=norm([0.5,0.85,0.35]);
function shade(p,nv){var b=0.52+0.48*Math.max(0,dot(nv,LDIR));var m=MATBRIGHT[p.mat]||1;
 var c=hex2rgb(p.color);var a=1-p.trans;
 if(p.mat==='Glass')a*=0.55;if(p.mat==='ForceField')a*=0.6;
 if(p.mat==='Neon')b=1;
 var r=Math.min(255,c[0]*b*m),g=Math.min(255,c[1]*b*m),bl=Math.min(255,c[2]*b*m);
 return'rgba('+(r|0)+','+(g|0)+','+(bl|0)+','+a+')';}
var ITEMS=[];
function buildItems(cam){ITEMS.length=0;
 for(var k in DOC.nodes){var p=DOC.nodes[k];if(p.cls==='Script'||!p.shape)continue;
  if(p.shape==='Sphere'){
   var c0=project(p.pos,cam);var r=Math.max(p.size[0],p.size[1],p.size[2])/2*CAMZ;
   ITEMS.push({d:c0.d,p:p,draw:function(it,c0){return function(){ctx.save();var g=ctx.createRadialGradient(c0.x-r*0.35,c0.y-r*0.35,r*0.1,c0.x,c0.y,r);var rgb=hex2rgb(it.p.color);var br=MATBRIGHT[it.p.mat]||1;g.addColorStop(0,'rgba('+Math.min(255,rgb[0]*br+40)+','+Math.min(255,rgb[1]*br+40)+','+Math.min(255,rgb[2]*br+40)+','+(1-it.p.trans)+')');g.addColorStop(1,'rgba('+(rgb[0]*0.45|0)+','+(rgb[1]*0.45|0)+','+(rgb[2]*0.45|0)+','+(1-it.p.trans)+')');ctx.fillStyle=g;ctx.beginPath();ctx.arc(c0.x,c0.y,r,0,7);ctx.fill();ctx.restore();};}(p,c0),kind:'sphere'});
   continue;}
  var vts=shapeVerts(p),fs=shapeFaces(p);
  for(var f=0;f<fs.length;f++){var ids=fs[f];if(!ids.length)continue;
   var vs=ids.map(function(i){return vts[i];});var n=faceNormal(vs);
   var fc=[0,0,0];vs.forEach(function(v){fc[0]+=v[0]/vs.length;fc[1]+=v[1]/vs.length;fc[2]+=v[2]/vs.length;});
   var outw=[fc[0]-p.pos[0],fc[1]-p.pos[1],fc[2]-p.pos[2]];
   if(dot(n,outw)<0)n=[-n[0],-n[1],-n[2]];
   var nv=[dot(n,cam.right),dot(n,cam.up),dot(n,cam.fwd)];
   if(dot(nv,[-cam.fwd[0],-cam.fwd[1],-cam.fwd[2]])>0)continue;
   var pts=vs.map(function(v){return project(v,cam);});
   var d=0;pts.forEach(function(q){d+=q.d;});d/=pts.length;
   ITEMS.push({d:d,p:p,pts:pts,nv:nv,kind:'face'});}}
 ITEMS.sort(function(a,b){return b.d-a.d;});}
function render(){var rect=cv.getBoundingClientRect();if(W!==rect.width||H!==rect.height){W=rect.width;H=rect.height;cv.width=W*DPR;cv.height=H*DPR;}
 ctx.setTransform(DPR,0,0,DPR,0,0);
 ctx.fillStyle='#2b2b38';ctx.fillRect(0,0,W,H);
 CAMZ=1000/CAM.dist;var cam=camVecs();
 /* grid */
 ctx.lineWidth=1;
 for(var g=-32;g<=32;g+=4){var a=project([g,0,-32],cam),b=project([g,0,32],cam),c=project([-32,0,g],cam),d2=project([32,0,g],cam);
  ctx.strokeStyle=g===0?'#4a4a5e':'#26262f';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  ctx.strokeStyle=g===0?'#4a4a5e':'#26262f';ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(d2.x,d2.y);ctx.stroke();}
 buildItems(cam);
 for(var i=0;i<ITEMS.length;i++){var it=ITEMS[i];
  if(it.kind==='face'){ctx.fillStyle=shade(it.p,it.nv);ctx.beginPath();ctx.moveTo(it.pts[0].x,it.pts[0].y);for(var j=1;j<it.pts.length;j++)ctx.lineTo(it.pts[j].x,it.pts[j].y);ctx.closePath();ctx.fill();
   if(it.p.mat==='Metal'){ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.stroke();}}
  else it.draw();}
 /* selection */
 if(SEL&&DOC.nodes[SEL]){var p=DOC.nodes[SEL];
  if(p.cls!=='Script'){
   var vts=shapeVerts(p),fs=shapeFaces(p);ctx.strokeStyle='#00a2ff';ctx.lineWidth=2;
   for(var f2=0;f2<fs.length;f2++){var ids=fs[f2];if(!ids.length)continue;var pts=ids.map(function(i){return project(vts[i],cam);});
    ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(j=1;j<pts.length;j++)ctx.lineTo(pts[j].x,pts[j].y);ctx.closePath();ctx.stroke();}
   if(TOOL==='Select'||TOOL==='Move')drawGizmo(p,cam);
   if(TOOL==='Scale')drawHandles(p,cam);}}
 document.getElementById('st-cam').textContent='Cam '+Math.round(CAM.dist)+' studs';}
function drawGizmo(p,cam){var c=project(p.pos,cam);var axes=[[1,0,0,'#ff5555'],[0,1,0,'#55ff77'],[0,0,1,'#5599ff']];GIZ=[];
 for(var i=0;i<3;i++){var ax=axes[i];var tip=project([p.pos[0]+ax[0]*2.6,p.pos[1]+ax[1]*2.6,p.pos[2]+ax[2]*2.6],cam);
  ctx.strokeStyle=ax[3];ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(tip.x,tip.y);ctx.stroke();
  var ang=Math.atan2(tip.y-c.y,tip.x-c.x);ctx.fillStyle=ax[3];ctx.beginPath();
  ctx.moveTo(tip.x,tip.y);ctx.lineTo(tip.x-9*Math.cos(ang-0.4),tip.y-9*Math.sin(ang-0.4));ctx.lineTo(tip.x-9*Math.cos(ang+0.4),tip.y-9*Math.sin(ang+0.4));ctx.closePath();ctx.fill();
  GIZ.push({ax:i,x1:c.x,y1:c.y,x2:tip.x,y2:tip.y});}}
function drawHandles(p,cam){if(!p.rot)p.rot=[0,0,0];HANDLES=[];var axes=[[1,0,0,'#ff5555'],[0,1,0,'#55ff77'],[0,0,1,'#5599ff']];
 var R=m3(p.rot[0],p.rot[1],p.rot[2]);
 for(var i=0;i<3;i++){for(var s=-1;s<=1;s+=2){var v=mulv(R,[axes[i][0]*p.size[i]/2*s,axes[i][1]*p.size[i]/2*s,axes[i][2]*p.size[i]/2*s]);
  var pt=project([p.pos[0]+v[0],p.pos[1]+v[1],p.pos[2]+v[2]],cam);
  ctx.fillStyle=axes[i][3];ctx.fillRect(pt.x-4,pt.y-4,8,8);ctx.strokeStyle='#fff';ctx.strokeRect(pt.x-4,pt.y-4,8,8);
  HANDLES.push({ax:i,sgn:s,x:pt.x,y:pt.y});}}}
var GIZ=[],HANDLES=[];
