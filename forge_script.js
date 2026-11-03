"use strict";
/* ============ FORGE v0.4 script editor upgrade: syntax colors, tabs, find & replace, auto-indent ============ */
function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
var HLRE=/(--\[\[[\s\S]*?\]\])|(--[^\n]*)|("(?:[^"\\\n]|\\.)*")|('(?:[^'\\\n]|\\.)*')|(\b\d+(?:\.\d+)?\b)|(\b(?:and|break|do|else|elseif|end|false|for|function|if|in|local|nil|not|or|repeat|return|then|true|until|while)\b)|(\b(?:game|workspace|script|Instance|Vector3|Vector2|CFrame|Color3|UDim|UDim2|print|warn|error|wait|task|pairs|ipairs|tostring|tonumber|math|table|string|os|tick)\b)/g;
function hlLua(code){var out='',m,last=0;HLRE.lastIndex=0;
 while((m=HLRE.exec(code))){out+=escHtml(code.slice(last,m.index));
  var cls=(m[1]||m[2])?'c':(m[3]||m[4])?'s':m[5]?'n':m[6]?'k':'g';
  out+='<span class="hl-'+cls+'">'+escHtml(m[0])+'</span>';last=m.index+m[0].length;}
 out+=escHtml(code.slice(last));
 return out+'\n';}
var FTABS=[],FTAB=-1,feEl=null,feDirty=false;
function fcur(){return FTAB>=0&&FTABS[FTAB]&&DOC.nodes[FTABS[FTAB]]?DOC.nodes[FTABS[FTAB]]:null;}
function ensureEditor(){if(feEl)return;
 feEl=document.createElement('div');feEl.id='fe';
 feEl.innerHTML='<div class="fe-frame"><div class="fe-head"><div id="fe-tabs" style="display:flex;gap:4px;flex-wrap:wrap;flex:1"></div><button id="fe-new">+ Script</button><button id="fe-run" class="blue">Run</button><button id="fe-close">Close</button></div>'+
 '<div id="fe-findbar" class="hidden"><input id="fe-q" placeholder="find"><input id="fe-r" placeholder="replace with"><button id="fe-next">Next</button><button id="fe-all">Replace all</button><button id="fe-fx">x</button></div>'+
 '<div class="fe-body"><div id="fe-gut" class="fe-gut">1</div><div class="fe-wrap"><pre id="fe-hl" class="fe-hl"></pre><textarea id="fe-ta" class="fe-ta" spellcheck="false" autocapitalize="off" autocomplete="off"></textarea></div></div>'+
 '<div class="fe-foot"><span id="fe-pos">Ln 1, Col 1</span><span id="fe-msg">Lua-style sandbox. print() goes to Output. Ctrl+F find, Ctrl+S save, Ctrl+Enter run.</span></div></div>';
 document.body.appendChild(feEl);
 var ta=document.getElementById('fe-ta');
 ta.addEventListener('input',function(){var p=fcur();if(!p)return;
  if(!feDirty){pushUndo();feDirty=true;}
  p.code=ta.value;paint();markSave();try{localStorage.setItem('forge_doc_v2',JSON.stringify(DOC));}catch(e){}});
 ta.addEventListener('scroll',function(){var hl=document.getElementById('fe-hl'),g=document.getElementById('fe-gut');
  hl.scrollTop=ta.scrollTop;hl.scrollLeft=ta.scrollLeft;g.scrollTop=ta.scrollTop;});
 ta.addEventListener('keyup',pos);ta.addEventListener('click',pos);
 ta.addEventListener('keydown',function(e){
  if(e.key==='Tab'){e.preventDefault();feIns('  ');}
  else if(e.key==='Enter'&&!e.ctrlKey&&!e.metaKey){e.preventDefault();
   var v=ta.value,i=ta.selectionStart;var ls=v.lastIndexOf('\n',i-1)+1;var line=v.slice(ls,i);
   var ind=(line.match(/^\s*/)||[''])[0];
   var extra=/(\bthen|\bdo|\bfunction[^\n]*\)|\brepeat|\{|\belse)\s*$/.test(line.trim())?'  ':'';
   feIns('\n'+ind+extra);}
  else if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();var p2=fcur();if(p2)runScript(ta.value);}
  else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='f'){e.preventDefault();document.getElementById('fe-findbar').classList.remove('hidden');document.getElementById('fe-q').focus();}
  else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveFe();}
  else if(e.key==='Escape'){closeFe();}});
 document.getElementById('fe-close').onclick=closeFe;
 document.getElementById('fe-new').onclick=function(){pushUndo();var s=script({});buildTree();openTab(s.id);};
 document.getElementById('fe-run').onclick=function(){var p=fcur();if(p)runScript(document.getElementById('fe-ta').value);};
 document.getElementById('fe-fx').onclick=function(){document.getElementById('fe-findbar').classList.add('hidden');document.getElementById('fe-ta').focus();};
 document.getElementById('fe-next').onclick=findNext;
 document.getElementById('fe-all').onclick=replaceAll;}
function feIns(t){var ta=document.getElementById('fe-ta');var s=ta.selectionStart,e2=ta.selectionEnd;
 ta.setRangeText(t,s,e2,'end');ta.dispatchEvent(new Event('input'));}
function pos(){var ta=document.getElementById('fe-ta');var v=ta.value.slice(0,ta.selectionStart);
 var ln=v.split('\n');document.getElementById('fe-pos').textContent='Ln '+ln.length+', Col '+(ln[ln.length-1].length+1);}
function paint(){var ta=document.getElementById('fe-ta'),hl=document.getElementById('fe-hl'),g=document.getElementById('fe-gut');
 hl.innerHTML=hlLua(ta.value);
 var n=ta.value.split('\n').length,gs='';for(var i=1;i<=n;i++)gs+=i+'\n';
 g.textContent=gs;}
function openTab(id){ensureEditor();
 var ix=FTABS.indexOf(id);if(ix<0){FTABS.push(id);ix=FTABS.length-1;}
 FTAB=ix;feDirty=false;feEl.classList.add('show');renderTabs();
 var p=fcur();var ta=document.getElementById('fe-ta');ta.value=p?p.code:'';
 paint();pos();setTimeout(function(){ta.focus();},60);}
function closeFe(){var ta=document.getElementById('fe-ta'),p=fcur();if(p&&ta)saveFe();
 if(feEl)feEl.classList.remove('show');buildProps();}
function saveFe(){var ta=document.getElementById('fe-ta'),p=fcur();if(!p||!ta)return;
 if(p.code!==ta.value){if(!feDirty){pushUndo();feDirty=true;}p.code=ta.value;}
 markSave();try{localStorage.setItem('forge_doc_v2',JSON.stringify(DOC));}catch(e){}
 document.getElementById('fe-msg').textContent='Saved '+p.name;}
function renderTabs(){var c=document.getElementById('fe-tabs');if(!c)return;c.innerHTML='';
 FTABS.forEach(function(id,ix){var p=DOC.nodes[id];if(!p)return;
  var d=document.createElement('div');d.className='fe-tab'+(ix===FTAB?' on':'');
  d.innerHTML='<span>'+esc(p.name)+'</span><span class="x">x</span>';
  d.onclick=function(){if(ix!==FTAB){saveFe();FTAB=ix;feDirty=false;var ta=document.getElementById('fe-ta');ta.value=DOC.nodes[id].code;paint();pos();renderTabs();}};
  d.querySelector('.x').onclick=function(ev){ev.stopPropagation();closeTab(ix);};
  c.appendChild(d);});}
function closeTab(ix){saveFe();FTABS.splice(ix,1);
 if(FTAB>=FTABS.length)FTAB=FTABS.length-1;
 if(FTAB<0){closeFe();return;}
 feDirty=false;var ta=document.getElementById('fe-ta');var p=fcur();ta.value=p?p.code:'';paint();renderTabs();}
function findNext(){var ta=document.getElementById('fe-ta'),q=document.getElementById('fe-q').value;
 if(!q)return;var ix=ta.value.indexOf(q,ta.selectionEnd);if(ix<0)ix=ta.value.indexOf(q,0);
 if(ix>=0){ta.focus();ta.setSelectionRange(ix,ix+q.length);pos();document.getElementById('fe-msg').textContent='Found at '+(ta.value.slice(0,ix).split('\n').length);}
 else document.getElementById('fe-msg').textContent='Not found: '+q;}
function replaceAll(){var ta=document.getElementById('fe-ta'),q=document.getElementById('fe-q').value,r=document.getElementById('fe-r').value;
 if(!q)return;var c=ta.value.split(q).length-1;
 if(!c){document.getElementById('fe-msg').textContent='Not found: '+q;return;}
 pushUndo();feDirty=true;ta.value=ta.value.split(q).join(r);ta.dispatchEvent(new Event('input'));
 document.getElementById('fe-msg').textContent='Replaced '+c+' occurrence'+(c===1?'':'s');}
var _openScriptEditor=openScriptEditor;
openScriptEditor=function(){var p=SEL?DOC.nodes[SEL]:null;
 if(p&&p.cls==='Script'){openTab(p.id);return;}
 if(FTABS.length){feEl.classList.add('show');return;}
 out('Select a Script first','warn');};
if(typeof TABS!=='undefined'&&TABS[4]&&TABS[4][1]&&TABS[4][1][1])TABS[4][1][1][2]=openScriptEditor;
var fecss=['#fe{position:fixed;inset:0;background:#000c;display:none;align-items:center;justify-content:center;z-index:250;padding:12px}',
'#fe.show{display:flex}',
'.fe-frame{background:#1e1e26;border:1px solid #4a4a5c;border-radius:6px;display:flex;flex-direction:column;width:min(900px,94vw);height:min(620px,90vh);box-shadow:0 10px 40px #000}',
'.fe-head{display:flex;align-items:center;gap:6px;padding:6px 8px;border-bottom:1px solid #3a3a46;flex-wrap:wrap}',
'.fe-tab{display:flex;align-items:center;gap:6px;padding:4px 8px;background:#26262f;border:1px solid #3a3a46;border-radius:4px 4px 0 0;font-size:11px;cursor:default;max-width:170px;overflow:hidden}',
'.fe-tab.on{background:#0d3a55;border-color:#00a2ff;color:#fff}',
'.fe-tab .x{color:#8a8a99;padding:0 2px}',
'.fe-tab .x:hover{color:#ff7a7a}',
'.fe-body{flex:1;display:flex;min-height:0;position:relative}',
'.fe-gut{width:42px;background:#1a1a22;color:#5a5a6a;font:12px/1.45 Consolas,monospace;text-align:right;padding:8px 6px 8px 0;overflow:hidden;user-select:none;border-right:1px solid #2e2e3a;white-space:pre}',
'.fe-wrap{position:relative;flex:1;min-width:0}',
'.fe-hl,.fe-ta{position:absolute;inset:0;margin:0;padding:8px;font:12px/1.45 Consolas,monospace;white-space:pre;overflow:auto;tab-size:2}',
'.fe-hl{pointer-events:none;color:#d5e8ff;z-index:1}',
'.fe-ta{position:absolute;inset:0;background:transparent;color:transparent;caret-color:#fff;resize:none;border:none;outline:none;user-select:text;z-index:2}',
'.hl-c{color:#6f7f6f;font-style:italic}.hl-s{color:#9ad27a}.hl-n{color:#ffb86a}.hl-k{color:#7ab8ff;font-weight:600}.hl-g{color:#c58fff}',
'#fe-findbar{display:flex;gap:6px;padding:6px 8px;border-bottom:1px solid #3a3a46;align-items:center}',
'#fe-findbar input{background:#14141b;border:1px solid #3a3a46;color:#d5e8ff;padding:3px 6px;font:12px Consolas,monospace;width:150px;user-select:text}',
'.fe-foot{display:flex;gap:14px;padding:4px 10px;border-top:1px solid #3a3a46;color:#8a8a99;font-size:11px;white-space:nowrap;overflow:hidden}',
'@media(max-width:860px){.fe-frame{width:100vw;height:100vh;border-radius:0;border:none}}'].join('\n');
var fes=document.createElement('style');fes.id='forge_script_style';fes.textContent=fecss;document.head.appendChild(fes);
out('FORGE v0.4 script editor loaded — syntax colors, multiple tabs, find & replace, auto-indent, Ctrl+Enter to run','sys');
