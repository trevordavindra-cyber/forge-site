"use strict";
/* ============ FORGE v0.3 mobile layer: touch controls, themes, cone, drawers ============ */
var _origShapeVerts=shapeVerts,_origShapeFaces=shapeFaces,_origRunCmd=runCmd;
shapeVerts=function(p){
 if(p.shape!=='Cone')return _origShapeVerts(p);
 var N=12,R=m3(p.rot[0],p.rot[1],p.rot[2]),vts=[],r=p.size[0]/2,h=p.size[1]/2,z=p.size[2]/2;
 for(var i=0;i<N;i++){var a=i/N*2*Math.PI;vts.push([r*Math.cos(a),-h,z*Math.sin(a)]);}
 vts.push([0,h,0]);
 return vts.map(function(v){var w=mulv(R,v);return[p.pos[0]+w[0],p.pos[1]+w[1],p.pos[2]+w[2]];});};
shapeFaces=function(p){
 if(p.shape!=='Cone')return _origShapeFaces(p);
 var N=12,fs=[];
 for(var i=0;i<N;i++)fs.push([i,(i+1)%N,N]);
 var b=[];for(i=0;i<N;i++)b.push(i);fs.push(b);
 return fs;};
runCmd=function(s){var m;
 if(m=(s||'').match(/^new cone$/i)){pushUndo();var p=part({name:'Cone',shape:'Cone',size:[4,4,4],pos:[0,4,0],color:'#b0722d'});select(p.id);buildTree();render();saveLocal();return;}
 return _origRunCmd(s);};
/* ---------- themes ---------- */
var THEMES={blue:{a:'#00a2ff',d:'#0d3a55'},purple:{a:'#a55bff',d:'#31184d'},neutral:{a:'#c9c9d4',d:'#3f3f4e'}};
var THEME='blue';try{THEME=localStorage.getItem('forge_theme')||'blue';}catch(e){}
function applyTheme(){var t=THEMES[THEME]||THEMES.blue;
 var st=document.getElementById('forge_theme_style');if(!st){st=document.createElement('style');st.id='forge_theme_style';document.head.appendChild(st);}
 st.textContent=[
 '#titlebar .logo{background:'+t.a+'}',
 '#tabs .tab.active{border-bottom:2px solid '+t.a+'}',
 '.rbtn.on{background:'+t.d+';border-color:'+t.a+'}',
 '.tree .node.sel{background:'+t.d+';outline:1px solid '+t.a+'}',
 '.dropdown .it:hover{background:'+t.a+';color:#fff}',
 '.dropdown .it:hover .sc{color:#fff}',
 '#toolbox h4{color:'+t.a+'}',
 '#toolbox .ti:hover{background:'+t.d+'}',
 '#cmdbar .pfx{color:'+t.a+'}',
 '#ctx .it:hover{background:'+t.a+';color:#fff}',
 'button.blue{background:'+t.d+';border-color:'+t.a+'}',
 'button.blue:hover{background:'+t.a+'}',
 '#props .sect{color:'+t.a+'}',
 '.fbtn{border-color:'+t.a+'}'
 ].join('\n');}
function cycleTheme(){THEME=THEME==='blue'?'purple':THEME==='purple'?'neutral':'blue';
 try{localStorage.setItem('forge_theme',THEME);}catch(e){}
 applyTheme();out('Theme: '+THEME,'sys');}
/* ---------- mobile layout + floating buttons ---------- */
var mobcss=[
'.fbtn{display:none;position:fixed;z-index:90;background:rgba(43,43,56,.94);border:1px solid #4a4a5c;border-radius:22px;padding:10px 14px;color:#cfcfda;font:12px Segoe UI,Arial,sans-serif;box-shadow:0 4px 14px rgba(0,0,0,.5)}',
'#f-exp{left:10px;bottom:calc(128px + env(safe-area-inset-bottom))}',
'#f-props{right:10px;bottom:calc(128px + env(safe-area-inset-bottom))}',
'#f-cone{left:50%;transform:translateX(-50%);bottom:calc(128px + env(safe-area-inset-bottom))}',
'#f-theme{display:flex;right:10px;top:36px;padding:7px 11px}',
'@media(max-width:860px){',
' body.forge-mobile #app{grid-template-rows:26px 20px 58px minmax(0,1fr) 110px 16px!important}',
' body.forge-mobile #main{grid-template-columns:minmax(0,1fr)!important}',
' body.forge-mobile .panel{position:fixed;top:0;bottom:0;width:80vw;max-width:320px;z-index:80;transition:transform .25s ease}',
' body.forge-mobile #explorer{left:0;transform:translateX(-104%);border-right:1px solid #4a4a5c}',
' body.forge-mobile #explorer.open{transform:none}',
' body.forge-mobile #propspanel{right:0;transform:translateX(104%);border-left:1px solid #4a4a5c}',
' body.forge-mobile #propspanel.open{transform:none}',
' body.forge-mobile #dock{grid-template-rows:84px 22px}',
' body.forge-mobile #output{font-size:10px}',
' body.forge-mobile .rbtn{width:52px;height:48px}',
' body.forge-mobile .rbtn .ic{font-size:15px}',
' body.forge-mobile .fbtn{display:block}',
'}'].join('\n');
var ms=document.createElement('style');ms.id='forge_mobile_style';ms.textContent=mobcss;document.head.appendChild(ms);
function mkBtn(id,label,fn){var b=document.createElement('button');b.id=id;b.className='fbtn';b.textContent=label;b.onclick=function(e){e.preventDefault();fn();};document.body.appendChild(b);return b;}
mkBtn('f-exp','☰ Explorer',function(){document.getElementById('explorer').classList.toggle('open');});
mkBtn('f-props','Properties',function(){document.getElementById('propspanel').classList.toggle('open');});
mkBtn('f-cone','+ Cone',function(){pushUndo();var p=part({name:'Cone',shape:'Cone',size:[4,4,4],pos:[0,4,0],color:'#b0722d'});select(p.id);buildTree();render();saveLocal();});
mkBtn('f-theme','◐ theme',cycleTheme);
applyTheme();
function isMobile(){try{return window.matchMedia('(max-width:860px)').matches;}catch(e){return false;}}
if(isMobile())document.body.classList.add('forge-mobile');
window.addEventListener('resize',function(){document.body.classList.toggle('forge-mobile',isMobile());});
/* ---------- touch controls ---------- */
cv.style.touchAction='none';
try{var vm=document.createElement('meta');vm.name='viewport';vm.content='width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no';document.head.appendChild(vm);}catch(e){}
var TS={},lastTapT=0,lastTapX=0,lastTapY=0;
function tdist(ts){var dx=ts[0].clientX-ts[1].clientX,dy=ts[0].clientY-ts[1].clientY;return Math.max(20,Math.hypot(dx,dy));}
function tmid(ts){var r=cv.getBoundingClientRect();return{x:(ts[0].clientX+ts[1].clientX)/2-r.left,y:(ts[0].clientY+ts[1].clientY)/2-r.top};}
cv.addEventListener('touchstart',function(e){e.preventDefault();
 if(e.touches.length===1){var t=e.touches[0],r=cv.getBoundingClientRect();
  TS={mode:'tap',x:t.clientX-r.left,y:t.clientY-r.top,t0:Date.now(),
   lp:setTimeout(function(){if(!TS||TS.mode!=='tap')return;TS.mode='long';var p=pick(TS.x,TS.y);if(p)select(p.id);
    if(navigator.vibrate)navigator.vibrate(12);showCtx(t.clientX,t.clientY,p?p.id:null);},450)};}
 else if(e.touches.length===2){if(TS.lp)clearTimeout(TS.lp);var m=tmid(e.touches);
  TS={mode:'pinch',d0:tdist(e.touches),dist0:CAM.dist,cx:m.x,cy:m.y};}
},{passive:false});
cv.addEventListener('touchmove',function(e){e.preventDefault();
 if(!TS.mode)return;
 if(TS.mode==='tap'||TS.mode==='orbit'){TS.mode='orbit';if(TS.lp)clearTimeout(TS.lp);
  var t=e.touches[0],r=cv.getBoundingClientRect(),x=t.clientX-r.left,y=t.clientY-r.top;
  CAM.yaw+=(x-TS.x)*0.008;CAM.pitch-=(y-TS.y)*0.008;
  CAM.pitch=Math.max(-1.45,Math.min(1.45,CAM.pitch));TS.x=x;TS.y=y;render();}
 else if(TS.mode==='pinch'&&e.touches.length===2){
  CAM.dist=Math.max(8,Math.min(600,TS.dist0*TS.d0/tdist(e.touches)));
  var m2=tmid(e.touches),cam=camVecs();
  var dx=(m2.x-TS.cx)/CAMZ,dy=(m2.y-TS.cy)/CAMZ;
  CAMT[0]+=-cam.right[0]*dx+cam.up[0]*dy;
  CAMT[1]+=-cam.right[1]*dx+cam.up[1]*dy;
  CAMT[2]+=-cam.right[2]*dx+cam.up[2]*dy;
  TS.cx=m2.x;TS.cy=m2.y;render();}
},{passive:false});
cv.addEventListener('touchend',function(e){e.preventDefault();
 if(TS.lp)clearTimeout(TS.lp);
 if(TS.mode==='tap'&&Date.now()-TS.t0<320){
  var p=pick(TS.x,TS.y);
  if(p){select(p.id);if(navigator.vibrate)navigator.vibrate(8);
   if(Date.now()-lastTapT<350&&Math.abs(TS.x-lastTapX)<30&&Math.abs(TS.y-lastTapY)<30){
    CAMT=[p.pos[0],p.pos[1],p.pos[2]];CAM.dist=Math.max(18,Math.max(p.size[0],p.size[1],p.size[2])*3);render();}}
  else select(null);
  lastTapT=Date.now();lastTapX=TS.x;lastTapY=TS.y;}
 TS={};},{passive:false});
out('FORGE v0.3 mobile layer loaded — touch: 1 finger orbit · tap select · pinch zoom · 2-finger pan · long-press menu · double-tap focus','sys');
