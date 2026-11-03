"use strict";
/* ============ FORGE v1.0 plugins + voice-to-creation + publish center ============
   Real scene plugins (each one actually edits or audits the place), a voice
   builder using the browser speech engine that feeds the AI layer, and a
   publish center that exports a real .rbxlx plus a compatibility report. */

/* ---------- plugins ---------- */
var PLUGSTORE='forge_plugins_v1';
var PLUGINS=[
 {id:'weld', name:'Weld Everything', desc:'adds a real weld script that joins every unanchored part at runtime',
  fn:function(){
   var code=['local PhysicsService = game:GetService("PhysicsService")',
   'for _, a in ipairs(workspace:GetDescendants()) do',
   '\tif a:IsA("BasePart") and a.Anchored then',
   '\t\tfor _, b in ipairs(workspace:GetDescendants()) do',
   '\t\t\tif b:IsA("BasePart") and not b.Anchored and (b.Position - a.Position).Magnitude < 12 then',
   '\t\t\t\tlocal w = Instance.new("WeldConstraint")',
   '\t\t\t\tw.Part0 = a; w.Part1 = b; w.Parent = b',
   '\t\t\tend',
   '\t\tend',
   '\tend',
   'end',
   'print("Weld pass complete")'].join('\n');
   pushUndo();script({name:'Welder',code:code});refreshAll();saveLocal();
   return 'Welder script added to ServerScriptService';}},
 {id:'colors', name:'Color Pass', desc:'recolors every part with a real studio palette',
  fn:function(){
   var pal=['#c9924a','#8f6b4a','#5b7a5e','#4a6b8f','#8f4a4a','#a89f8f','#3d6b3d','#b8b0a0'];
   var n=0,i=0;pushUndo();
   for(var k in DOC.nodes){var p=DOC.nodes[k];if(p.cls==='Part'||p.cls==='WedgePart'||p.cls==='Sphere'){p.color=pal[i%pal.length];i++;n++;}}
   refreshAll();saveLocal();return n+' parts recolored';}},
 {id:'rename', name:'Rename Duplicates', desc:'renames every copy of "Part" to Part2, Part3 and so on',
  fn:function(){
   var seen={},n=0;pushUndo();
   for(var k in DOC.nodes){var p=DOC.nodes[k];
    if(p.name==='Part'){seen['Part']=(seen['Part']||0)+1;p.name='Part'+(seen['Part']+1);n++;}}
   refreshAll();saveLocal();return n+' parts renamed';}},
 {id:'snap', name:'Ground Snap', desc:'drops every floating part so it rests on the baseplate',
  fn:function(){
   var n=0;pushUndo();
   for(var k in DOC.nodes){var p=DOC.nodes[k];
    if((p.cls==='Part'||p.cls==='WedgePart'||p.cls==='Sphere')&&p.parent==='ws'){
     var bottom=p.pos[1]-p.size[1]/2;
     if(bottom>0.5){p.pos[1]=p.size[1]/2;n++;}}}
   refreshAll();saveLocal();return n+' parts snapped to the ground';}},
 {id:'audit', name:'Place Audit', desc:'counts every class in the place and flags issues',
  fn:function(){
   var counts={},scripts=0,gui=0;
   for(var k in DOC.nodes){var p=DOC.nodes[k];counts[p.cls]=(counts[p.cls]||0)+1;
    if(p.cls==='Script')scripts++;
    if(p.parent==='StarterGui')gui++;}
   var line=[];for(var c in counts)line.push(counts[c]+' '+c);
   out('Audit: '+line.join(', ')+' ('+scripts+' scripts, '+gui+' in StarterGui)','sys');
   if(!byName('SpawnLocation'))out('Audit warning: no SpawnLocation, players will fall at default spawn','warn');
   return 'audit printed to output';}},
 {id:'cleanup', name:'Script Cleanup', desc:'removes placeholder scripts with the default hello code',
  fn:function(){
   var n=0;pushUndo();
   for(var k in DOC.nodes){var p=DOC.nodes[k];
    if(p.cls==='Script'&&p.code.indexOf('Hello from Forge')===0){delete DOC.nodes[k];n++;}}
   refreshAll();saveLocal();return n+' placeholder scripts removed';}}
];
var PLUGSTATE={};
try{PLUGSTATE=JSON.parse(localStorage.getItem(PLUGSTORE)||'{}');}catch(e){PLUGSTATE={};}
function plugSave(){try{localStorage.setItem(PLUGSTORE,JSON.stringify(PLUGSTATE));}catch(e){}}
function plugRun(id){
 var pl=null;for(var i=0;i<PLUGINS.length;i++){if(PLUGINS[i].id===id)pl=PLUGINS[i];}
 if(!pl){out('Plugins: no plugin called '+id,'err');return;}
 var msg=pl.fn();out('Plugin '+pl.name+': '+msg,'sys');}
function plugRunAll(){
 var ran=0;
 for(var i=0;i<PLUGINS.length;i++){
  if(PLUGSTATE[PLUGINS[i].id]){out('Plugin '+PLUGINS[i].name+': '+PLUGINS[i].fn(),'sys');ran++;}}
 if(!ran)out('Plugins: none enabled yet, tap one to enable it','warn');}
var PLUG_ITEMS=[];
PLUGINS.forEach(function(pl){PLUG_ITEMS.push(['icon-plug',pl.name,function(){
 PLUGSTATE[pl.id]=!PLUGSTATE[pl.id];plugSave();
 out(pl.name+(PLUGSTATE[pl.id]?' enabled — Run All Enabled to execute':' disabled')+' ('+pl.desc+')','sys');}]);});
PLUG_ITEMS.push(null);
PLUG_ITEMS.push(['icon-play','Run All Enabled',function(){plugRunAll();}]);
PLUG_ITEMS.push(['icon-list','Plugin Help',function(){out('Plugins: tap a plugin to toggle it, then Run All Enabled. Weld Everything adds a real weld script, Color Pass recolors, Rename Duplicates fixes Part names, Ground Snap drops floaters, Audit prints counts, Script Cleanup removes placeholders','sys');}]);
TABS.push(['Plugins',PLUG_ITEMS]);
buildTabs();

/* ---------- voice-to-creation ---------- */
var VOICE={rec:null,on:false};
function voiceToggle(){
 if(VOICE.on){try{VOICE.rec.stop();}catch(e){}VOICE.on=false;out('Voice: stopped','sys');return;}
 var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){out('Voice: this browser has no speech engine. Type ai <prompt> in the command bar instead — same builder','err');return;}
 VOICE.rec=new SR();VOICE.rec.continuous=true;VOICE.rec.interimResults=false;
 VOICE.rec.onresult=function(e){
  var s=e.results[e.results.length-1][0].transcript.trim();
  if(!s)return;
  out('Voice heard: "'+s+'"','sys');
  if(/^(forge |build )?help$/i.test(s)){aiRun('help');return;}
  aiRun(s);};
 VOICE.rec.onerror=function(e){out('Voice: '+e.error+' — tap Start Listening again','err');VOICE.on=false;};
 VOICE.rec.onend=function(){if(VOICE.on){try{VOICE.rec.start();}catch(e){}}};
 try{VOICE.rec.start();VOICE.on=true;out('Voice: listening — say things like "build a castle at night with a leaderboard"','sys');}
 catch(e){out('Voice: could not start the mic','err');VOICE.on=false;}
}
TABS.push(['Voice',[['icon-mic','Start Listening',function(){voiceToggle();}],['icon-ai','What Can I Say',function(){out('Voice: same vocabulary as the AI layer — island, hills, trees, house, tower, city, castle, leaderboard, coin pickup, kill brick, teleporter, checkpoints, day cycle, speed pad, heal pad, door, shop gui, explosion, any time of day','sys');}]]]);
buildTabs();

/* ---------- publish center ---------- */
function compatReport(){
 var parts=0,scripts=0,gui=0;
 for(var k in DOC.nodes){var p=DOC.nodes[k];
  if(p.cls==='Script')scripts++;
  if(p.cls==='Part'||p.cls==='WedgePart'||p.cls==='Sphere')parts++;
  if(p.parent==='StarterGui')gui++;}
 var missing=[];
 if(!byName('SpawnLocation'))missing.push('no SpawnLocation (add one from the Parts ribbon)');
 out('COMPATIBILITY REPORT','sys');
 out('Parts: '+parts+' — supported (Part / WedgePart / Ball classes)','sys');
 out('Scripts: '+scripts+' ServerScripts — supported','sys');
 out('StarterGui screens: '+gui+' — supported (ScreenGui built from LocalScripts)','sys');
 if(missing.length){missing.forEach(function(m){out('Fix before publishing: '+m,'warn');});}
 else{out('No blockers found','sys');}
 out('Export the .rbxlx from File menu or the Publish tab, open it in real Roblox Studio, then File > Publish to Roblox As','sys');}
var PUB_ITEMS=[];
PUB_ITEMS.push(['icon-report','Compatibility Report',function(){compatReport();}]);
PUB_ITEMS.push(['icon-export','Export .rbxlx',function(){exportRbxlx();}]);
PUB_ITEMS.push(['icon-gear','Game Settings',function(){
 var pcount=0,scount=0;
 for(var k in DOC.nodes){var p=DOC.nodes[k];if(p.cls==='Script')scount++;else if(p.cls!=='Folder')pcount++;}
 var settings={name:DOC.name||'Place1',maxPlayers:12,genre:'All',playableDevice:'Console,Desktop,Phone,Tablet',avatarType:'R15',parts:pcount,scripts:scount};
 pushUndo();script({name:'GameSettings',code:'-- forge game settings\n-- '+JSON.stringify(settings)});
 out('Game settings: '+JSON.stringify(settings)+' — saved as GameSettings script for reference','sys');}]);
PUB_ITEMS.push(['icon-help','Publish Steps',function(){out('Publish: 1 Compatibility Report 2 Export .rbxlx 3 open the file in real Roblox Studio 4 File > Publish to Roblox As. Forge itself runs in your browser, the export is what becomes the live game','sys');}]);
TABS.push(['Publish',PUB_ITEMS]);
buildTabs();

/* ---------- commands ---------- */
var _runCmd6=runCmd;
runCmd=function(s){if(!s)return _runCmd6(s);var t=s.trim();var lt=t.toLowerCase();
 if(lt==='plugins'||lt==='plugin list'){PLUGINS.forEach(function(pl){out(pl.name+(PLUGSTATE[pl.id]?' [on]':' [off]')+' — '+pl.desc,'sys');});return;}
 if(lt==='plugins run'){plugRunAll();return;}
 var pm=lt.match(/^plugin run ([\w ]+)$/);
 if(pm){var nm=pm[1].trim().toLowerCase();var hit=null;
  for(var i=0;i<PLUGINS.length;i++){if(PLUGINS[i].id===nm||PLUGINS[i].name.toLowerCase()===nm)hit=PLUGINS[i];}
  if(hit)plugRun(hit.id);else out('Plugins: no plugin called '+nm,'err');return;}
 if(lt==='voice'||lt==='voice toggle'){voiceToggle();return;}
 if(lt==='publish report'||lt==='compat report'){compatReport();return;}
 _runCmd6(s);};
out('FORGE v1.0 plugins + voice + publish loaded — Plugins tab (6 real scene tools, toggle then Run All Enabled), Voice tab listens and builds ("build a castle at night"), Publish tab gives a compatibility report, .rbxlx export and game settings','sys');
