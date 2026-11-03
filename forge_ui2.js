"use strict";
/* ============ FORGE v0.9 ui studio + animation studio + version history ============
   Real Luau GUI scripts with live layout previews, a keyframe tween studio with
   in-viewport preview and real TweenService export, and local version snapshots. */
function uiLuau(lines){return lines.join('\n');}
var UI_TPLS=['Main Menu','Health HUD','Coins HUD','Shop Menu','Settings Menu','Teleport Menu'];
var UI_KEY={'main menu':'Main Menu','health hud':'Health HUD','coins hud':'Coins HUD','shop menu':'Shop Menu','settings menu':'Settings Menu','teleport menu':'Teleport Menu'};
var UI_HEAD=[
'local Players = game:GetService("Players")',
'local player = Players.LocalPlayer',
'local gui = Instance.new("ScreenGui")',
'gui.ResetOnSpawn = false',
'gui.Parent = player:WaitForChild("PlayerGui")'];
var UI_TPL_CODE={
'Main Menu':uiLuau(UI_HEAD.concat([
'local frame = Instance.new("Frame")',
'frame.Size = UDim2.new(0.4, 0, 0.5, 0)',
'frame.Position = UDim2.new(0.3, 0, 0.25, 0)',
'frame.BackgroundColor3 = Color3.fromRGB(30, 30, 40)',
'frame.BorderSizePixel = 0',
'frame.Parent = gui',
'local title = Instance.new("TextLabel")',
'title.Size = UDim2.new(1, 0, 0.3, 0)',
'title.BackgroundTransparency = 1',
'title.Text = "GAME TITLE"',
'title.TextScaled = true',
'title.TextColor3 = Color3.fromRGB(255, 255, 255)',
'title.Parent = frame',
'local playBtn = Instance.new("TextButton")',
'playBtn.Size = UDim2.new(0.6, 0, 0.2, 0)',
'playBtn.Position = UDim2.new(0.2, 0, 0.45, 0)',
'playBtn.Text = "Play"',
'playBtn.TextScaled = true',
'playBtn.Parent = frame',
'playBtn.MouseButton1Click:Connect(function()',
'\tframe.Visible = false',
'end)',
'local setBtn = Instance.new("TextButton")',
'setBtn.Size = UDim2.new(0.6, 0, 0.15, 0)',
'setBtn.Position = UDim2.new(0.2, 0, 0.72, 0)',
'setBtn.Text = "Settings"',
'setBtn.TextScaled = true',
'setBtn.Parent = frame',
'setBtn.MouseButton1Click:Connect(function()',
'\ttitle.Text = title.Text == "GAME TITLE" and "SETTINGS" or "GAME TITLE"',
'end)'])),
'Health HUD':uiLuau(UI_HEAD.concat([
'local barBack = Instance.new("Frame")',
'barBack.Size = UDim2.new(0.3, 0, 0.04, 0)',
'barBack.Position = UDim2.new(0.35, 0, 0.9, 0)',
'barBack.BackgroundColor3 = Color3.fromRGB(60, 60, 60)',
'barBack.BorderSizePixel = 0',
'barBack.Parent = gui',
'local barFill = Instance.new("Frame")',
'barFill.Size = UDim2.new(1, 0, 1, 0)',
'barFill.BackgroundColor3 = Color3.fromRGB(60, 200, 80)',
'barFill.BorderSizePixel = 0',
'barFill.Parent = barBack',
'local char = player.Character or player.CharacterAdded:Wait()',
'local hum = char:WaitForChild("Humanoid")',
'local function upd()',
'\tbarFill.Size = UDim2.new(math.clamp(hum.Health / hum.MaxHealth, 0, 1), 0, 1, 0)',
'end',
'hum.HealthChanged:Connect(upd)',
'upd()'])),
'Coins HUD':uiLuau(UI_HEAD.concat([
'local frame = Instance.new("Frame")',
'frame.Size = UDim2.new(0.16, 0, 0.06, 0)',
'frame.Position = UDim2.new(0.02, 0, 0.02, 0)',
'frame.BackgroundColor3 = Color3.fromRGB(40, 40, 55)',
'frame.BorderSizePixel = 0',
'frame.Parent = gui',
'local label = Instance.new("TextLabel")',
'label.Size = UDim2.new(1, 0, 1, 0)',
'label.BackgroundTransparency = 1',
'label.Text = "$ 0"',
'label.TextScaled = true',
'label.TextColor3 = Color3.fromRGB(255, 215, 0)',
'label.Parent = frame',
'local stats = player:WaitForChild("leaderstats")',
'local coins = stats:WaitForChild("Coins")',
'local function upd()',
'\tlabel.Text = "$ " .. coins.Value',
'end',
'coins.Changed:Connect(upd)',
'upd()'])),
'Shop Menu':uiLuau(UI_HEAD.concat([
'local frame = Instance.new("Frame")',
'frame.Size = UDim2.new(0.3, 0, 0.5, 0)',
'frame.Position = UDim2.new(0.35, 0, 0.25, 0)',
'frame.BackgroundColor3 = Color3.fromRGB(35, 35, 50)',
'frame.BorderSizePixel = 0',
'frame.Parent = gui',
'local title = Instance.new("TextLabel")',
'title.Size = UDim2.new(1, 0, 0.15, 0)',
'title.BackgroundTransparency = 1',
'title.Text = "SHOP"',
'title.TextScaled = true',
'title.TextColor3 = Color3.fromRGB(255, 255, 255)',
'title.Parent = frame',
'local items = {{"Speed Boost", 10}, {"Jump Boost", 15}, {"Extra Life", 25}}',
'for i, item in ipairs(items) do',
'\tlocal row = Instance.new("TextButton")',
'\trow.Size = UDim2.new(0.9, 0, 0.18, 0)',
'\trow.Position = UDim2.new(0.05, 0, 0.2 + (i - 1) * 0.24, 0)',
'\trow.Text = item[1] .. "  -  $" .. item[2]',
'\trow.TextScaled = true',
'\trow.Parent = frame',
'\trow.MouseButton1Click:Connect(function()',
'\t\tlocal coins = player.leaderstats and player.leaderstats:FindFirstChild("Coins")',
'\t\tif coins and coins.Value >= item[2] then',
'\t\t\tcoins.Value = coins.Value - item[2]',
'\t\t\tprint("Bought " .. item[1])',
'\t\telse',
'\t\t\tprint("Not enough Coins for " .. item[1])',
'\t\tend',
'\tend)',
'end'])),
'Settings Menu':uiLuau(UI_HEAD.concat([
'local frame = Instance.new("Frame")',
'frame.Size = UDim2.new(0.28, 0, 0.4, 0)',
'frame.Position = UDim2.new(0.36, 0, 0.3, 0)',
'frame.BackgroundColor3 = Color3.fromRGB(35, 35, 50)',
'frame.BorderSizePixel = 0',
'frame.Parent = gui',
'local title = Instance.new("TextLabel")',
'title.Size = UDim2.new(1, 0, 0.18, 0)',
'title.BackgroundTransparency = 1',
'title.Text = "SETTINGS"',
'title.TextScaled = true',
'title.TextColor3 = Color3.fromRGB(255, 255, 255)',
'title.Parent = frame',
'local opts = {"Music", "Shadows", "Tips"}',
'for i, name in ipairs(opts) do',
'\tlocal btn = Instance.new("TextButton")',
'\tbtn.Size = UDim2.new(0.9, 0, 0.2, 0)',
'\tbtn.Position = UDim2.new(0.05, 0, 0.25 + (i - 1) * 0.24, 0)',
'\tbtn.Text = name .. ": On"',
'\tbtn.TextScaled = true',
'\tbtn.Parent = frame',
'\tbtn.MouseButton1Click:Connect(function()',
'\t\tlocal on = player:GetAttribute(name)',
'\t\tplayer:SetAttribute(name, not on)',
'\t\tbtn.Text = name .. ": " .. (not on and "On" or "Off")',
'\tend)',
'end'])),
'Teleport Menu':uiLuau(UI_HEAD.concat([
'local frame = Instance.new("Frame")',
'frame.Size = UDim2.new(0.16, 0, 0.5, 0)',
'frame.Position = UDim2.new(0.82, 0, 0.25, 0)',
'frame.BackgroundColor3 = Color3.fromRGB(35, 35, 50)',
'frame.BorderSizePixel = 0',
'frame.Parent = gui',
'local title = Instance.new("TextLabel")',
'title.Size = UDim2.new(1, 0, 0.14, 0)',
'title.BackgroundTransparency = 1',
'title.Text = "TELEPORT"',
'title.TextScaled = true',
'title.TextColor3 = Color3.fromRGB(255, 255, 255)',
'title.Parent = frame',
'for i = 1, 4 do',
'\tlocal btn = Instance.new("TextButton")',
'\tbtn.Size = UDim2.new(0.9, 0, 0.16, 0)',
'\tbtn.Position = UDim2.new(0.05, 0, 0.18 + (i - 1) * 0.2, 0)',
'\tbtn.Text = "Spot " .. i',
'\tbtn.TextScaled = true',
'\tbtn.Parent = frame',
'\tbtn.MouseButton1Click:Connect(function()',
'\t\tlocal target = workspace:FindFirstChild("Teleport" .. i)',
'\t\tlocal char = player.Character',
'\t\tif target and char and char:FindFirstChild("HumanoidRootPart") then',
'\t\t\tchar.HumanoidRootPart.CFrame = target.CFrame + Vector3.new(0, 4, 0)',
'\t\tend',
'\tend)',
'end']))};
function uiPreview(name){
 var o=document.getElementById('overlay');o.classList.add('show');
 var rows='';
 function cell(txt,style){rows+='<div style="'+style+'">'+txt+'</div>';}
 if(name==='Main Menu'){cell('GAME TITLE','text-align:center;font-size:20px;color:#fff;padding:10px');cell('Play','margin:8px 30%;background:#00a2ff;color:#fff;padding:8px;text-align:center;border-radius:4px');cell('Settings','margin:8px 30%;background:#3a3a55;color:#fff;padding:8px;text-align:center;border-radius:4px');}
 else if(name==='Health HUD'){rows+='<div style="background:#3c3c3c;border-radius:3px"><div style="width:82%;height:16px;background:#3cc850;border-radius:3px"></div></div><div style="color:#bbb;padding-top:4px">health bar, bottom center, live-bound to Humanoid.Health</div>';}
 else if(name==='Coins HUD'){cell('$ 0','background:#282837;color:#ffd700;padding:8px 14px;display:inline-block;border-radius:3px');rows+='<div style="color:#bbb;padding-top:4px">top-left, live-bound to leaderstats.Coins</div>';}
 else if(name==='Shop Menu'){cell('SHOP','text-align:center;color:#fff;font-size:16px;padding:8px');cell('Speed Boost  -  $10','margin:6px 10%;background:#2b3a55;color:#fff;padding:8px;text-align:center;border-radius:3px');cell('Jump Boost  -  $15','margin:6px 10%;background:#2b3a55;color:#fff;padding:8px;text-align:center;border-radius:3px');cell('Extra Life  -  $25','margin:6px 10%;background:#2b3a55;color:#fff;padding:8px;text-align:center;border-radius:3px');}
 else if(name==='Settings Menu'){cell('SETTINGS','text-align:center;color:#fff;font-size:16px;padding:8px');cell('Music: On','margin:6px 10%;background:#2b3a55;color:#fff;padding:8px;text-align:center;border-radius:3px');cell('Shadows: On','margin:6px 10%;background:#2b3a55;color:#fff;padding:8px;text-align:center;border-radius:3px');cell('Tips: On','margin:6px 10%;background:#2b3a55;color:#fff;padding:8px;text-align:center;border-radius:3px');}
 else{cell('TELEPORT','text-align:center;color:#fff;font-size:14px;padding:6px');cell('Spot 1','margin:6px 10%;background:#2b3a55;color:#fff;padding:7px;text-align:center;border-radius:3px');cell('Spot 2','margin:6px 10%;background:#2b3a55;color:#fff;padding:7px;text-align:center;border-radius:3px');cell('Spot 3','margin:6px 10%;background:#2b3a55;color:#fff;padding:7px;text-align:center;border-radius:3px');cell('Spot 4','margin:6px 10%;background:#2b3a55;color:#fff;padding:7px;text-align:center;border-radius:3px');}
 o.innerHTML='<div id="modal" style="background:#26262f;border:1px solid #4a4a5c;border-radius:6px;min-width:420px;box-shadow:0 10px 40px #000">'+
  '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #3a3a46"><b>UI Studio: '+name+' preview</b><button onclick="document.getElementById(\'overlay\').classList.remove(\'show\')">Close</button></div>'+ 
  '<div style="padding:14px;background:#3a3a4a;margin:12px;border-radius:4px;min-height:180px">'+rows+'</div>'+ 
  '<div style="padding:0 12px 10px;color:#9a9aa8;font-size:11px">Preview shows the layout. The real thing is the Luau LocalScript now in StarterGui: it builds this exact ScreenGui in Roblox.</div></div>';
}
function uiBuild(name){
 var code=UI_TPL_CODE[name];if(!code){out('UI Studio: unknown template '+name,'err');return null;}
 pushUndo();var p=script({name:'UI'+name.replace(/ /g,''),parent:'StarterGui',code:code});
 refreshAll();saveLocal();
 out('UI Studio: '+name+' LocalScript added to StarterGui ('+code.split('\n').length+' lines of real Luau)','sys');
 return p;}
TABS.push(['UI',UI_TPLS.map(function(n){return ['icon-gui',n,function(){var p=uiBuild(n);if(p)uiPreview(n);}];})]);
TABS.push(['Anim',[['icon-key','Add Keyframe',function(){animAddKey();}],['icon-play','Play Preview',function(){animPlay();}],['icon-stop','Stop Preview',function(){animStop();}],null,['icon-trash','Clear Keys',function(){animClear();}],['icon-export','Export Tween Script',function(){animExport();}],['icon-help','Anim Help',function(){out('Anim Studio: select a part, Add Keyframe after each pose you set (each key = 0.5s later), Play Preview to watch it move in the viewport, Export writes a real TweenService script into ServerScriptService','sys');}]]]);
buildTabs();
var ANIM={sel:null,keys:[],playing:false};
function animAddKey(){
 if(!SEL){out('Anim Studio: select a part first, pose it, then Add Keyframe','err');return;}
 var p=DOC.nodes[SEL];if(!p||p.cls==='Script'||p.cls==='Folder'){out('Anim Studio: pick a part, not a script or folder','err');return;}
 if(ANIM.sel!==SEL){ANIM.sel=SEL;ANIM.keys=[];}
 var lastT=ANIM.keys.length?ANIM.keys[ANIM.keys.length-1].t:0;
 ANIM.keys.push({t:ANIM.keys.length?lastT+0.5:0,pos:p.pos.slice(),rot:p.rot.slice()});
 out('Anim Studio: keyframe '+ANIM.keys.length+' saved for '+p.name+' at t='+(ANIM.keys.length?lastT+0.5:0).toFixed(1)+'s','sys');
 saveLocal();}
function animClear(){ANIM.keys=[];ANIM.sel=null;ANIM.playing=false;out('Anim Studio: keyframes cleared','sys');}
function animStop(){if(!ANIM.playing){out('Anim Studio: not playing','warn');return;}ANIM.playing=false;out('Anim Studio: preview stopped','sys');}
function animPlay(){
 if(ANIM.keys.length<2){out('Anim Studio: need at least 2 keyframes (pose, add, pose again, add)','warn');return;}
 var p=DOC.nodes[ANIM.sel];if(!p){out('Anim Studio: the animated part is gone, clear keys and re-select','err');return;}
 var dur=ANIM.keys[ANIM.keys.length-1].t;if(dur<=0)dur=1;
 ANIM.playing=true;out('Anim Studio: preview playing '+ANIM.keys.length+' keyframes over '+dur.toFixed(1)+'s (looping)','sys');
 var t0=performance.now();
 function lerp(a,b,f){return a+(b-a)*f;}
 function pose(t){
  for(var i=0;i<ANIM.keys.length-1;i++){
   var a=ANIM.keys[i],b=ANIM.keys[i+1];
   if(t>=a.t&&t<=b.t){var f=(b.t-a.t)?(t-a.t)/(b.t-a.t):1;
    p.pos=[lerp(a.pos[0],b.pos[0],f),lerp(a.pos[1],b.pos[1],f),lerp(a.pos[2],b.pos[2],f)];
    p.rot=[lerp(a.rot[0],b.rot[0],f),lerp(a.rot[1],b.rot[1],f),lerp(a.rot[2],b.rot[2],f)];
    return;}}
  var last=ANIM.keys[ANIM.keys.length-1];p.pos=last.pos.slice();p.rot=last.rot.slice();}
 function step(){if(!ANIM.playing){refreshAll();return;}
  var t=((performance.now()-t0)/1000)%dur;pose(t);render();
  requestAnimationFrame(step);}
 requestAnimationFrame(step);}
function animExport(){
 if(ANIM.keys.length<2){out('Anim Studio: need at least 2 keyframes to export','warn');return;}
 var p=DOC.nodes[ANIM.sel];if(!p){out('Anim Studio: the animated part is gone','err');return;}
 var code=['local TweenService = game:GetService("TweenService")','local part = workspace:WaitForChild("'+p.name+'")'];
 for(var i=0;i<ANIM.keys.length-1;i++){
  var a=ANIM.keys[i],b=ANIM.keys[i+1];var dt=Math.max(b.t-a.t,0.05);
  code.push('local t'+(i+1)+' = TweenService:Create(part, TweenInfo.new('+dt.toFixed(2)+', Enum.EasingStyle.Linear), {');
  code.push('\tCFrame = CFrame.new('+b.pos.map(function(v){return v.toFixed(2);}).join(', ')+') * CFrame.Angles('+b.rot.map(function(v){return '('+v.toFixed(3)+' * math.pi / 180)';}).join(', ')+')');
  code.push('})');}
 for(var j=1;j<=ANIM.keys.length-1;j++){code.push('t'+j+':Play()');code.push('t'+j+'.Completed:Wait()');}
 code.push('print("'+p.name+' animation finished")');
 pushUndo();script({name:'Anim'+p.name.replace(/ /g,''),code:code.join('\n')});
 refreshAll();saveLocal();
 out('Anim Studio: real TweenService script added to ServerScriptService ('+(ANIM.keys.length-1)+' tweens) — plays end to end during Play test','sys');}
/* ---- version history (local snapshots) ---- */
var VKEY='forge_versions_v1';
var VERS=[];
try{VERS=JSON.parse(localStorage.getItem(VKEY)||'[]');}catch(e){VERS=[];}
function verPersist(){try{localStorage.setItem(VKEY,JSON.stringify(VERS));}catch(e){}}
function verSave(){var pcount=0;for(var k in DOC.nodes){if(DOC.nodes[k].cls!=='Script'&&DOC.nodes[k].cls!=='Folder')pcount++;}
 VERS.push({name:'v'+(VERS.length+1),ts:new Date().toLocaleString(),json:JSON.stringify(DOC),parts:pcount});
 if(VERS.length>20)VERS.shift();
 verPersist();out('Version saved: '+VERS[VERS.length-1].name+' ('+pcount+' parts, '+VERS.length+' versions kept)','sys');}
function verList(){if(!VERS.length){out('Versions: none saved yet, run save version','warn');return;}
 VERS.forEach(function(v,i){out('Version '+(i+1)+': '+v.name+' — '+v.ts+' — '+v.parts+' parts','sys');});}
function verRestore(n){n=parseInt(n,10);
 if(!n||n<1||n>VERS.length){out('Versions: no version number '+n+' (1 to '+VERS.length+')','err');return;}
 pushUndo();DOC=JSON.parse(VERS[n-1].json);SEL=null;refreshAll();saveLocal();
 out('Restored version '+n+' ('+VERS[n-1].name+')','sys');}
TABS[1][1]=TABS[1][1].concat([null,['icon-save','Save Version',function(){verSave();}],['icon-list','Versions',function(){verList();}],['icon-undo','Restore Last',function(){verRestore(String(VERS.length));}]]);
buildTabs();
var _runCmd5=runCmd;
runCmd=function(s){if(!s)return _runCmd5(s);var t=s.trim();
 var lt=t.toLowerCase();
 if(UI_KEY[lt]){uiBuild(UI_KEY[lt]);return;}
 if(lt==='anim add'){animAddKey();return;}if(lt==='anim play'){animPlay();return;}
 if(lt==='anim stop'){animStop();return;}if(lt==='anim clear'){animClear();return;}
 if(lt==='anim export'){animExport();return;}if(lt==='anim help'){out('Anim Studio: select a part, pose it, anim add, pose again, anim add, then anim play / anim export','sys');return;}
 if(lt==='save version'){verSave();return;}if(lt==='versions'||lt==='version list'){verList();return;}
 var m=lt.match(/^restore (\d+)$/);if(m){verRestore(m[1]);return;}
 _runCmd5(s);};
out('FORGE v0.9 ui + anim + versions loaded — UI tab builds 6 real GUI screens (with previews), Anim tab is a keyframe tween studio (preview in viewport, real TweenService export), commands: ui main menu / anim add / save version / versions / restore 1','sys');
