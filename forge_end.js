/* ================= PROPERTIES ================= */
function buildProps(){var el=document.getElementById('props');el.innerHTML='';
 var p=SEL?DOC.nodes[SEL]:null;
 if(!p){el.innerHTML='<div style="padding:10px;color:#6a6a7a">Nothing selected</div>';document.getElementById('st-sel').textContent='Nothing selected';return;}
 document.getElementById('st-sel').textContent=p.name+' ('+p.cls+')';
 function row(k,inner){var tr=document.createElement('tr');var a=document.createElement('td');a.className='k';a.textContent=k;var b=document.createElement('td');if(typeof inner==='string'){b.innerHTML=inner;}else{b.appendChild(inner);}tr.appendChild(a);tr.appendChild(b);el.appendChild(tr);return tr;}
 function txt(key,label){var i=document.createElement('input');i.type='text';i.value=p[key];i.onchange=function(){pushUndo();p[key]=i.value;buildTree();render();saveLocal();};row(label,i);}
 function vec(key,label){var d=document.createElement('div');d.className='xyz';
  ['0','1','2'].forEach(function(idx){var i=document.createElement('input');i.type='number';i.step='0.5';i.value=(+p[key][idx]).toFixed(1);
   i.onchange=function(){pushUndo();p[key][idx]=+i.value;render();saveLocal();};d.appendChild(i);});row(label,d);}
 function tri(lbl,fn){var s=document.createElement('select');s.innerHTML=fn();s.value=p[lbl];s.onchange=function(){pushUndo();p[lbl]=s.value;render();saveLocal();};row(lbl,s);}
 function chk(key,label){var i=document.createElement('input');i.type='checkbox';i.checked=p[key];i.onchange=function(){pushUndo();p[key]=i.checked;saveLocal();};row(label,i);}
 function num(key,label,min,max,step){var i=document.createElement('input');i.type='number';i.min=min;i.max=max;i.step=step;i.value=p[key];i.onchange=function(){pushUndo();p[key]=+i.value;render();saveLocal();};row(label,i);}
 if(p.cls==='Script'){var ta=document.createElement('textarea');ta.style.cssText='width:100%;height:220px;font:12px Consolas,monospace;background:#14141b;color:#d5e8ff;border:1px solid #3a3a46;padding:6px;user-select:text';ta.value=p.code;
  ta.onchange=function(){pushUndo();p.code=ta.value;saveLocal();};
  var sect=document.createElement('div');sect.className='sect';sect.textContent='Script — Source';el.appendChild(sect);
  var tr=document.createElement('tr');tr.innerHTML='<td colspan=2></td>';tr.firstChild.appendChild(ta);el.appendChild(tr);
  txt('name','Name');return;}
 txt('name','Name');
 if(p.cls==='Folder'||p.cls==='Model')return;
 var sh=document.createElement('div');sh.className='sect';sh.textContent='Appearance';el.appendChild(sh);
 var ci=document.createElement('input');ci.type='color';ci.value=p.color;ci.onchange=function(){pushUndo();p.color=ci.value;render();buildTree();saveLocal();};row('Color',ci);
 tri('mat',function(){return MATS.map(function(x){return'<option>'+x+'</option>';}).join('');});
 num('trans','Transparency',0,1,0.05);
 if(p.shape==='Sphere'||p.shape==='Cylinder'||p.shape==='Wedge')
  row('Shape','<span style="color:#6a6a7a">'+p.shape+' (fixed)</span>');
 var sd=document.createElement('div');sd.className='sect';sd.textContent='Data';el.appendChild(sd);
 vec('pos','Position');vec('size','Size');vec('rot','Rotation');
 chk('anch','Anchored');chk('coll','CanCollide');}
function updStatus(){var n=0;for(var k in DOC.nodes)if(DOC.nodes[k].cls!=='Script')n++;
 document.getElementById('st-count').textContent='Parts: '+n;}
/* ================= MENUS/RIBBON ================= */
var MENUS=[{label:'File',items:[['New Place','Ctrl+N',function(){newDoc();refreshAll();saveLocal();}],['Save','Ctrl+S',function(){saveLocal();out('Saved locally','sys');}],null,['Export .rbxlx','',exportRbxlx],null,['Close Tab','',function(){out('This is your replica — the tab is the app','warn');}]]},
 {label:'Home',hidden:true},
 {label:'Model',hidden:true},
 {label:'Test',items:[['Play','F5',startPlay],['Stop','Shift+F5',stopPlay],null,['Clear Output','',function(){document.getElementById('output').innerHTML='';}]]},
 {label:'View',items:[['Snap to Grid','G',function(){SNAP=!SNAP;out('Snap '+(SNAP?'on':'off'),'sys');}]]},
 {label:'Help',items:[['Command Help','',function(){runCmd('help');}]]}];
function buildMenubar(){var mb=document.getElementById('menubar');mb.innerHTML='';
 MENUS.forEach(function(mn){if(mn.hidden)return;var d=document.createElement('div');d.className='mi';d.textContent=mn.label;
  d.onclick=function(e){e.stopPropagation();toggleMenu(d,mn);};d.onmouseenter=function(){if(mb.querySelector('.dropdown')){closeMenus();toggleMenu(d,mn);}};
  mb.appendChild(d);});}
function closeMenus(){document.querySelectorAll('.dropdown').forEach(function(x){x.remove();});
 document.querySelectorAll('#menubar .mi.open').forEach(function(x){x.classList.remove('open');});}
function toggleMenu(anchor,mn){if(anchor.classList.contains('open')){closeMenus();return;}closeMenus();
 anchor.classList.add('open');var dd=document.createElement('div');dd.className='dropdown';dd.style.left=anchor.offsetLeft+'px';
 mn.items.forEach(function(it){if(!it){var sp=document.createElement('div');sp.className='sep';dd.appendChild(sp);return;}
  var d=document.createElement('div');d.className='it';d.innerHTML='<span>'+it[0]+'</span><span class="sc">'+it[1]+'</span>';
  d.onclick=function(){closeMenus();it[2]();};dd.appendChild(d);});
 document.getElementById('menubar').appendChild(dd);
 var r=dd.getBoundingClientRect();if(r.right>window.innerWidth)dd.style.left=(window.innerWidth-r.width-4)+'px';}
document.addEventListener('click',function(e){if(!e.target.closest('#menubar'))closeMenus();if(!e.target.closest('#ctx'))document.getElementById('ctx').style.display='none';});
var TABS=[['Home',[['icon-select','Select',()=>{setTool('Select');}],['icon-move','Move',()=>{setTool('Move');}],['icon-scale','Scale',()=>{setTool('Scale');}],['icon-rot','Rotate',()=>{setTool('Rotate');}],null,['icon-insert','Insert Part',()=>{insertObj('Part');}],['icon-sphere','Sphere',()=>{insertObj('Part');}],['icon-wedge','Wedge',()=>{insertObj('WedgePart');}],['icon-script','Script',()=>{insertObj('Script');}],['icon-spawn','Spawn',()=>{insertObj('SpawnLocation');}],null,['icon-play','Play',startPlay],['icon-stop','Stop',stopPlay],null,['icon-tb','Toolbox',()=>{document.getElementById('toolbox').classList.toggle('hidden');}]]],
 ['Model',[['icon-dup','Duplicate',dupSel],['icon-del','Delete',delSel],null,['icon-group','Group',groupSel],['icon-ungroup','Ungroup',ungroupSel],null,['icon-copy','Copy',copySel],['icon-paste','Paste',pasteClip],null,['icon-undo','Undo',doUndo],['icon-redo','Redo',doRedo]]],
 ['Parts',[['icon-part','Part',()=>{insertObj('Part');}],['icon-ball','Ball',()=>{var q=insertObj('Part');}],['icon-cyl','Cylinder',()=>{insertObj('Part');}],null,['icon-color','Random Colors',randColors],['icon-flat','Flatten All',flatten],['icon-anchor','Anchor All',anchorAll]]],
 ['Test',[['icon-play2','Play',startPlay],['icon-stop2','Stop',stopPlay],null,['icon-out','Clear Output',()=>{document.getElementById('output').innerHTML='';}]]],
 ['Scripts',[['icon-newscript','New Script',()=>{insertObj('Script');}],['icon-open','Open Selected',openScriptEditor]]]];
function buildTabs(){var tc=document.getElementById('tabs');var rb=document.getElementById('ribbonbtns');tc.innerHTML='';rb.innerHTML='';
 TABS.forEach(function(t,i){var d=document.createElement('div');d.className='tab'+(i===0?' active':'');d.textContent=t[0];
  d.onclick=function(){tc.querySelectorAll('.tab').forEach(function(x){x.classList.remove('active');});d.classList.add('active');buildRibbon(i);};
  tc.appendChild(d);});
 buildRibbon(0);}
function buildRibbon(i){var rb=document.getElementById('ribbonbtns');rb.innerHTML='';
 TABS[i][1].forEach(function(b){if(!b){var s=document.createElement('div');s.className='rsep';rb.appendChild(s);return;}
  var d=document.createElement('div');d.className='rbtn'+(b[1]===TOOL?' on':'');d.innerHTML='<div class="ic">'+icoGlyph(b[0])+'</div><div class="lb">'+b[1]+'</div>';
  d.onclick=b[2];rb.appendChild(d);});}
function icoGlyph(k){return{ 'icon-select':'⬉','icon-move':'✥','icon-scale':'⤡','icon-rot':'⟳','icon-insert':'▢','icon-sphere':'●','icon-wedge':'◺','icon-script':'≡','icon-spawn':'⚑','icon-play':'▶','icon-stop':'■','icon-tb':'▦','icon-dup':'⧉','icon-del':'✖','icon-group':'⊟','icon-ungroup':'⊞','icon-copy':'⧉','icon-paste':'📋','icon-undo':'↶','icon-redo':'↷','icon-part':'▢','icon-ball':'●','icon-cyl':'▁','icon-color':'🎨','icon-flat':'▭','icon-anchor':'⚓','icon-play2':'▶','icon-stop2':'■','icon-out':'⌫','icon-newscript':'≡','icon-open':'⧉','icon-help':'?' }[k]||'•';}
function setTool(t){TOOL=t;document.getElementById('st-tool').textContent='Tool: '+t;
 document.querySelectorAll('#ribbonbtns .rbtn').forEach(function(x){x.classList.toggle('on',x.querySelector('.lb').textContent===t);});
 cv.style.cursor=t==='Select'?'default':'crosshair';render();}
/* ================= CONTEXT MENU ================= */
function showCtx(x,y,id){var c=document.getElementById('ctx');c.innerHTML='';
 var items=[['Duplicate',dupSel],['Copy',copySel],['Paste',pasteClip],null,['Rename…',function(){openRename();}],['Delete',delSel],null,['Open Script',openScriptEditor],['Insert Part Here',function(){insertObj('Part');}],null,['Play Test',startPlay],['Stop Test',stopPlay]];
 items.forEach(function(it){if(!it){var s=document.createElement('div');s.className='sep';c.appendChild(s);return;}
  var d=document.createElement('div');d.className='it';d.textContent=it[0];d.onclick=function(){c.style.display='none';it[1]();};c.appendChild(d);});
 placeCtx(c,x,y);}
function showSvcCtx(x,y,svc){var c=document.getElementById('ctx');c.innerHTML='';
 [['Insert Part',function(){insertObj('Part');}],['Insert Script',function(){insertObj('Script');}],['Insert Folder',function(){insertObj('Folder');}]].forEach(function(it){
  var d=document.createElement('div');d.className='it';d.textContent=it[0];d.onclick=function(){c.style.display='none';it[1]();};c.appendChild(d);});
 placeCtx(c,x,y);}
function placeCtx(c,x,y){c.style.display='block';c.style.left=x+'px';c.style.top=y+'px';
 var r=c.getBoundingClientRect();if(r.right>window.innerWidth)c.style.left=(window.innerWidth-r.width-4)+'px';if(r.bottom>window.innerHeight)c.style.top=(window.innerHeight-r.height-4)+'px';}
function openRename(){var p=SEL?DOC.nodes[SEL]:null;if(!p)return;var nn=prompt('New name for '+p.name, p.name);if(nn&&nn!==p.name){pushUndo();p.name=nn;buildTree();buildProps();saveLocal();}}
/* ================= MODALS ================= */
function overlay(){var o=document.getElementById('overlay');o.classList.toggle('show');return document.getElementById('modal');}
function openScriptEditor(){var p=SEL?DOC.nodes[SEL]:null;if(!p||p.cls!=='Script'){out('Select a Script first','warn');return;}
 var m=overlay();m.innerHTML='<div class="mh"><span>'+esc(p.name)+'.lua</span><span style="margin-left:auto"></span><button class="blue" id="m-run">Run</button><button id="m-close">Close</button></div><div style="padding:8px"><textarea id="m-code" spellcheck="false"></textarea></div><div class="mb"><span style="color:#8a8a99;margin-right:auto;font-size:11px">Lua-style. print(), local, if, while, functions run in the Forge sandbox.</span><button id="m-save" class="blue">Save</button></div>';
 m.querySelector('#m-code').value=p.code;
 m.querySelector('#m-run').onclick=function(){p.code=m.querySelector('#m-code').value;runScript(p.code);};
 m.querySelector('#m-save').onclick=function(){pushUndo();p.code=m.querySelector('#m-code').value;saveLocal();out('Script saved','sys');overlay();buildProps();};
 m.querySelector('#m-close').onclick=overlay;
 m.querySelector('#m-code').focus();}
function runScript(code){var logs=[];
 var sandboxPrint=function(x){logs.push(String(x));};
 try{var fn=new Function('print','ws','doc','sel','part','local_var_helper','"use strict";'+luaish(code)+'\n//# sourceURL=forge-script');
  fn(sandboxPrint,WSAPI,DOC,SEL?DOC.nodes[SEL]:null,WSAPI.createPart);
  logs.forEach(function(l){out(l);});
  if(!logs.length)out('Script ran','sys');
 }catch(e){logs.forEach(function(l){out(l);});out('Script error: '+e.message,'err');}
 refreshAll();saveLocal();}
function luaish(s){return s
 .replace(/\blocal\s+/g,'var ')
 .replace(/\belseif\s*\(([^)]*)\)\s*then/g,'else if($1){')
 .replace(/\bif\s*\(([^)]*)\)\s*then/g,'if($1){')
 .replace(/\bfor\s+(\w+)\s*=\s*([^,]+),\s*([^,]+)\s+do/g,'for(var $1=$2;$1<=$3;$1++){')
 .replace(/\bfor\s+(\w+)\s+in\s+pairs\(([^)]*)\)\s+do/g,'for(var $1 in $2){')
 .replace(/\bwhile\s+([^\{]+?)\s+do/g,'while($1){')
 .replace(/\bfunction\s+(\w+)\s*\(([^)]*)\)/g,'function $1($2){')
 .replace(/\bend\b/g,'}')
 .replace(/\bthen\b/g,'{')
 .replace(/\bdo\b/g,'{')
 .replace(/\belseif/g,'else if')
 .replace(/~=/g,'!==')
 .replace(/\bnil\b/g,'null')
 .replace(/\.\.\./g,'+');}
var WSAPI={createPart:function(o){o=o||{};return part({name:o.name||'Part',size:o.size||[4,1,2],pos:o.pos||[0,4,0],color:o.color||'#a3a3a3',mat:o.mat||'Plastic',shape:o.shape||'Block'});},
 get:function(n){return byName(n);},parts:function(){var a=[];for(var k in DOC.nodes)if(DOC.nodes[k].cls==='Part')a.push(DOC.nodes[k]);return a;},
 destroy:function(n){var p=byName(n);if(p)delete DOC.nodes[p.id];}};
function exportRbxlx(){var s='<?xml version="1.0" encoding="utf-8"?>\n<roblox version="4">\n <Item class="Workspace" referent="RBX0">\n';
 var i=1;
 function emitPart(p){s+='  <Item class="'+(p.cls==='WedgePart'?'WedgePart':'Part')+'" referent="RBX'+(i++)+'">\n';
  s+='   <Properties>\n';s+='    <string name="Name">'+p.name+'</string>\n';
  s+='    <Vector3 name="size"><X>'+p.size[0]+'</X><Y>'+p.size[1]+'</Y><Z>'+p.size[2]+'</Z></Vector3>\n';
  s+='    <Vector3 name="CFrame"><X>'+p.pos[0]+'</X><Y>'+p.pos[1]+'</Y><Z>'+p.pos[2]+'</Z></Vector3>\n';
  s+='    <bool name="Anchored">'+p.anch+'</bool>\n   </Properties>\n  </Item>\n';}
 for(var k in DOC.nodes){var p=DOC.nodes[k];
  if(p.cls==='Script'){s+='  <Item class="Script" referent="RBX'+(i++)+'">\n   <Properties><string name="Name">'+p.name+'</string><ProtectedString name="Source"><![CDATA['+p.code+']]></ProtectedString></Properties>\n  </Item>\n';}
  else if(p.cls==='Part'||p.cls==='WedgePart'||p.cls==='SpawnLocation')emitPart(p);}
 s+=' </Item>\n</roblox>\n';
 var b=new Blob([s],{type:'application/xml'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='forge_place.rbxlx';a.click();
 out('Exported forge_place.rbxlx — opens in real Roblox Studio','sys');}
/* ================= KEYBOARD ================= */
var KEYMAP={};
document.addEventListener('keydown',function(e){
 var tag=(e.target.tagName||'').toLowerCase();
 if(tag==='input'||tag==='textarea'||tag==='select'){
  if(e.target.id==='cmd'){if(e.key==='Enter'){runCmd(e.target.value);e.target.value='';}
   else if(e.key==='ArrowUp'){if(CHI>0){CHI--;e.target.value=CMDHIST[CHI]||'';e.preventDefault();}}
   else if(e.key==='ArrowDown'){if(CHI<CMDHIST.length-1){CHI++;e.target.value=CMDHIST[CHI];}else{CHI=CMDHIST.length;e.target.value='';}e.preventDefault();}}
  return;}
 var k=e.key.toLowerCase();
 if(e.ctrlKey||e.metaKey){
  if(k==='z'){e.preventDefault();e.shiftKey?doRedo():doUndo();}
  else if(k==='y'){e.preventDefault();doRedo();}
  else if(k==='s'){e.preventDefault();saveLocal();out('Saved','sys');}
  else if(k==='c'){e.preventDefault();copySel();}
  else if(k==='v'){e.preventDefault();pasteClip();}
  else if(k==='d'){e.preventDefault();dupSel();}
  else if(k==='g'){e.preventDefault();groupSel();}
  return;}
 if(e.key==='F5'){e.preventDefault();e.shiftKey?stopPlay():startPlay();return;}
 if(e.key==='Delete'){e.preventDefault();delSel();return;}
 if(KEYMAP[k]&&!e.repeat){KEYMAP[k]();return;}
 if(k==='1')setTool('Select');else if(k==='2')setTool('Move');else if(k==='3')setTool('Scale');else if(k==='4')setTool('Rotate');
 else if(k==='g'){SNAP=!SNAP;out('Snap '+(SNAP?'on':'off'),'sys');}
 else if(k==='f'){var p=SEL?DOC.nodes[SEL]:null;if(p){CAMT=[p.pos[0],p.pos[1],p.pos[2]];CAM.dist=Math.max(20,Math.max(p.size[0],p.size[1],p.size[2])*4);render();}}
 else if(k==='t'){document.getElementById('toolbox').classList.toggle('hidden');}});
/* ================= TOOLBOX ================= */
var TBITEMS=['Basic Part','Sphere','Cylinder','Wedge','Spawn Location','Script','Colorful Set','Ramp Stairs','Tower Kit','Bridge Kit'];
function buildToolbox(){var c=document.getElementById('toolboxitems');c.innerHTML='';
 TBITEMS.forEach(function(t){var d=document.createElement('div');d.className='ti';d.textContent=t;
  d.onclick=function(){insertObj(t==='Sphere'||t==='Cylinder'||t==='Wedge'?'Part':'Part');
   if(t==='Sphere'){var p=DOC.nodes[SEL];if(p){p.shape='Sphere';p.size=[4,4,4];p.name='Sphere';}}
   if(t==='Cylinder'){var p2=DOC.nodes[SEL];if(p2){p2.shape='Cylinder';p2.size=[4,4,4];p2.name='Cylinder';}}
   if(t==='Ramp Stairs'){for(var i2=0;i2<5;i2++)part({name:'Stair'+(i2+1),size:[4,1,2],pos:[i2*4,0.5+i2,0],color:'#8a8a99'});}
   if(t==='Tower Kit'){for(var i3=0;i3<6;i3++)part({name:'Block'+(i3+1),size:[4,2,4],pos:[-12,0.5+i3*2,8],color:i3%2?'#c0392b':'#2980b9'});}
   if(t==='Bridge Kit'){for(var i4=0;i4<8;i4++)part({name:'Plank'+(i4+1),size:[2,0.4,8],pos:[20,6,-12+i4*2],color:'#a0522d'});}
   if(t==='Colorful Set')randColors();
   buildTree();buildProps();render();saveLocal();};
  c.appendChild(d);});}
/* ================= INIT ================= */
function refreshAll(){buildTree();buildProps();updStatus();render();}
function init(){
 try{var s=localStorage.getItem('forge_doc_v2');if(s){DOC=JSON.parse(s);out('Restored your last session','sys');}else newDoc();}catch(e){newDoc();}
 buildMenubar();buildTabs();buildTree();buildProps();buildToolbox();updStatus();render();
 out('FORGE v0.2 — Roblox Studio replica','sys');out('Shortcuts: 1 select 2 move 3 scale 4 rotate · F5 play · G snap · F focus · Ctrl+Z/Y undo/redo · Ctrl+S save · double-click to rename · right-click for menu','sys');
 var cmd=document.getElementById('cmd');cmd.focus();
 setInterval(function(){if(DIRTY)saveLocal();},5000);
 window.addEventListener('resize',render);
 var ctxEl=document.getElementById('ctx');
 new ResizeObserver(render).observe(cv);}
init();
