"use strict";
/* ============ FORGE v1.1 export upgrades + collaboration ============
   Real .rbxlx export that now carries shape, color, material and transparency,
   sorts scripts and GUI screens into the right services, and a collaboration
   layer: project file export, import, and a true merge that adds a teammate's
   place into yours without touching your nodes. */
function hexToRGB(h){h=h.replace('#','');return[parseInt(h.substr(0,2),16),parseInt(h.substr(2,2),16),parseInt(h.substr(4,2),16)];}
var MATNUM={'Plastic':256,'SmoothPlastic':272,'Metal':1088,'Wood':512,'Slate':800,'Concrete':816,'Brick':848,'Neon':288,'Glass':1568,'ForceField':1584};
var SHAPENUM={'Sphere':0,'Block':1,'Cylinder':2};
function escX(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
exportRbxlx=function(){
 var i=1;
 function refs(n){return 'RBX'+(i++);}
 var wsParts='',sss='',sgui='';
 function partXml(p){
  var cls=(p.cls==='SpawnLocation')?'SpawnLocation':(p.cls==='WedgePart'?'WedgePart':'Part');
  var x='<Item class="'+cls+'" referent="'+refs()+'">\n   <Properties>\n';
  x+='    <string name="Name">'+escX(p.name)+'</string>\n';
  x+='    <Vector3 name="size"><X>'+p.size[0]+'</X><Y>'+p.size[1]+'</Y><Z>'+p.size[2]+'</Z></Vector3>\n';
  x+='    <Vector3 name="CFrame"><X>'+p.pos[0]+'</X><Y>'+p.pos[1]+'</Y><Z>'+p.pos[2]+'</Z></Vector3>\n';
  var sh=SHAPENUM[p.shape];if(sh!==undefined&&cls==='Part')x+='    <token name="shape"><int>'+sh+'</int></token>\n';
  var c=hexToRGB(p.color||'#a3a3a3');
  var packed=4278190080+(c[0]<<16)+(c[1]<<8)+c[2];
  x+='    <Color3uint8 name="Color3uint8">'+packed+'</Color3uint8>\n';
  var m=MATNUM[p.mat];if(m!==undefined)x+='    <token name="Material"><int>'+m+'</int></token>\n';
  if(p.trans)x+='    <float name="Transparency">'+p.trans+'</float>\n';
  x+='    <bool name="Anchored">'+(p.anch!==false)+'</bool>\n   </Properties>\n  </Item>\n';
  return x;}
 function scriptXml(p){
  return '<Item class="Script" referent="'+refs()+'">\n   <Properties><string name="Name">'+escX(p.name)+'</string><ProtectedString name="Source"><![CDATA['+p.code+']]></ProtectedString></Properties>\n  </Item>\n';}
 for(var k in DOC.nodes){var p=DOC.nodes[k];
  if(p.cls==='Part'||p.cls==='WedgePart'||p.cls==='SpawnLocation')wsParts+=partXml(p);
  else if(p.cls==='Script'){
   if(p.parent==='StarterGui')sgui+=scriptXml(p);
   else sss+=scriptXml(p);}}
 var s='<?xml version="1.0" encoding="utf-8"?>\n<roblox version="4">\n';
 s+=' <Item class="Workspace" referent="RBX0">\n'+wsParts+' </Item>\n';
 s+=' <Item class="ServerScriptService" referent="RBXSS">\n'+sss+' </Item>\n';
 if(sgui)s+=' <Item class="StarterGui" referent="RBXSG">\n'+sgui+' </Item>\n';
 s+='</roblox>\n';
 var b=new Blob([s],{type:'application/xml'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='forge_place.rbxlx';a.click();
 var np=0;for(var q in DOC.nodes){var n=DOC.nodes[q];if(n.cls!=='Script')np++;}
 out('Exported forge_place.rbxlx ('+np+' parts, shapes + colors + materials + transparency included, scripts in ServerScriptService, GUIs in StarterGui) — opens in real Roblox Studio','sys');};
/* ---------- collaboration ---------- */
function projExport(){
 var b=new Blob([JSON.stringify(DOC)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=(DOC.name||'place')+'.forge.json';a.click();
 var pc=0;for(var k in DOC.nodes)pc++;
 out('Project file exported: '+(DOC.name||'place')+'.forge.json ('+pc+' nodes) — send it to a teammate, they import or merge it from the Collab tab','sys');}
function projFilePick(merge){
 var inp=document.createElement('input');inp.type='file';inp.accept='.json,application/json';
 inp.onchange=function(){
  var f=inp.files[0];if(!f)return;
  var r=new FileReader();
  r.onload=function(){
   var other;try{other=JSON.parse(r.result);}catch(e){out('Collab: that file is not a forge project file','err');return;}
   if(!other||!other.nodes){out('Collab: that file has no place in it','err');return;}
   pushUndo();
   if(!merge){
    DOC=other;DOC.nextId=other.nextId||1000;SEL=null;refreshAll();saveLocal();
    out('Collab: place loaded from '+f.name+' ('+Object.keys(other.nodes).length+' nodes). undo brings your old place back','sys');
    return;}
   var added=0,renamed=0;
   var names={};for(var k in DOC.nodes)names[DOC.nodes[k].name]=(names[DOC.nodes[k].name]||0)+1;
   for(var k2 in other.nodes){
    var src=other.nodes[k2];
    if(src.cls==='Folder')continue;
    var nm=src.name;
    if(names[nm]){names[nm]++;nm=nm+' '+names[nm];renamed++;}
    else names[nm]=1;
    var p={id:uid(),name:nm,cls:src.cls,parent:src.parent==='ws'?'ws':src.parent,shape:src.shape,pos:src.pos,rot:src.rot,size:src.size,color:src.color,mat:src.mat,trans:src.trans,anch:src.anch,coll:src.coll};
    if(src.cls==='Script'){p.code=src.code;}
    DOC.nodes[p.id]=p;added++;}
   refreshAll();saveLocal();
   out('Collab: merged '+f.name+' — '+added+' nodes added'+(renamed?', '+renamed+' renamed to avoid clashes':'')+'. your nodes untouched, undo reverts','sys');};
  r.readAsText(f);};
 inp.click();}
TABS.push(['Collab',[['icon-export','Export Project File',function(){projExport();}],['icon-open','Import (Replace)',function(){projFilePick(false);}],['icon-merge','Merge Teammate File',function(){projFilePick(true);}],['icon-help','Collab Guide',function(){out('Collab: two builders each Export a Project File, send it to each other (text it over), then Merge Teammate File adds their build into your place with fresh ids, renaming clashes. Import (Replace) loads a file as the whole place. This works without any server, the file is the sync','sys');}]]]);
buildTabs();
var _runCmd7=runCmd;
runCmd=function(s){if(!s)return _runCmd7(s);var t=s.trim();var lt=t.toLowerCase();
 if(lt==='export project'||lt==='export place file'){projExport();return;}
 if(lt==='collab help'){out('Collab: export project / merge a teammates file from the Collab tab. merge keeps your nodes and adds theirs','sys');return;}
 _runCmd7(s);};
out('FORGE v1.1 export + collab loaded — real .rbxlx now carries shapes, colors, materials, transparency and puts scripts in ServerScriptService and GUIs in StarterGui; Collab tab exports, imports and merges teammate project files','sys');
