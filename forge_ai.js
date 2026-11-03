"use strict";
/* ============ FORGE v0.7 AI layer: local generation engine ============
   Deterministic offline engine: parses a prompt and builds REAL systems
   (real Luau scripts + real parts). Not a cloud model, no API keys. */
var AICOUNT=0;
function aiScript(name,code,note){
 pushUndo();
 var s=script({name:name,code:code});
 refreshAll();saveLocal();
 out('AI: '+name+' added to ServerScriptService'+(note?' ('+note+')':''),'sys');
 if(typeof select==='function'){select(s.id);}
 return s;
}
function aiPart(o){var p=part(o);AICOUNT++;return p;}
var LIB=[
 {label:'Leaderboard',re:/leaderboard|leaderstats|\bcoins?\b|money|points|score/i,fn:function(){
  aiScript('AiLeaderboard',
  'local Players = game:GetService("Players")\n\nPlayers.PlayerAdded:Connect(function(player)\n\tlocal leaderstats = Instance.new("Folder")\n\tleaderstats.Name = "leaderstats"\n\tleaderstats.Parent = player\n\n\tlocal coins = Instance.new("IntValue")\n\tcoins.Name = "Coins"\n\tcoins.Value = 0\n\tcoins.Parent = leaderstats\nend)',
  'leaderstats with Coins');}},
 {label:'Coin Pickup',re:/coin|collect|pickup|pick up|currency/i,fn:function(){
  for(var i=0;i<10;i++){var a=i/10*Math.PI*2;
   aiPart({name:'AiCoin'+(i+1),shape:'Cylinder',size:[0.5,2,2],pos:[Math.cos(a)*7,2,26+Math.sin(a)*7],color:'#f1c40f',mat:'Metal'});}
  aiScript('AiCoinPickup',
  'local Players = game:GetService("Players")\n\nlocal function setupCoin(coin)\n\tcoin.Touched:Connect(function(hit)\n\t\tlocal player = Players:GetPlayerFromCharacter(hit.Parent)\n\t\tif not player then return end\n\t\tif coin.Transparency > 0.5 then return end\n\t\tlocal stats = player:FindFirstChild("leaderstats")\n\t\tif stats and stats:FindFirstChild("Coins") then\n\t\t\tstats.Coins.Value = stats.Coins.Value + 1\n\t\tend\n\t\tcoin.Transparency = 1\n\t\tcoin.CanCollide = false\n\t\ttask.delay(5, function()\n\t\t\tcoin.Transparency = 0\n\t\t\tcoin.CanCollide = true\n\t\tend)\n\tend)\nend\n\nfor _, child in ipairs(workspace:GetChildren()) do\n\tif child.Name:sub(1, 6) == "AiCoin" then\n\t\tsetupCoin(child)\n\tend\nend)',
  '10 coins + pickup script');}},
 {label:'Kill Brick',re:/kill|lava|damage|death|die\b/i,fn:function(){
  aiPart({name:'KillBrick',size:[8,1,8],pos:[14,0.5,14],color:'#c0392b',mat:'Neon'});
  aiScript('AiKillBrick',
  'local brick = workspace:WaitForChild("KillBrick")\n\nbrick.Touched:Connect(function(hit)\n\tlocal humanoid = hit.Parent and hit.Parent:FindFirstChildOfClass("Humanoid")\n\tif humanoid then\n\t\thumanoid.Health = 0\n\tend\nend)',
  'red kill brick');}},
 {label:'Teleporter',re:/teleport|portal|warp|pad pair/i,fn:function(){
  aiPart({name:'TelepadA',size:[6,0.5,6],pos:[10,0.5,-14],color:'#19b5c9',mat:'Neon'});
  aiPart({name:'TelepadB',size:[6,0.5,6],pos:[-30,0.5,-14],color:'#19b5c9',mat:'Neon'});
  aiScript('AiTeleporter',
  'local Players = game:GetService("Players")\nlocal padA = workspace:WaitForChild("TelepadA")\nlocal padB = workspace:WaitForChild("TelepadB")\nlocal debounce = {}\n\nlocal function teleport(fromPad, toPad, hit)\n\tlocal player = Players:GetPlayerFromCharacter(hit.Parent)\n\tif not player then return end\n\tif debounce[player.UserId] then return end\n\tdebounce[player.UserId] = true\n\tlocal root = hit.Parent:FindFirstChild("HumanoidRootPart")\n\tif root then\n\t\troot.CFrame = toPad.CFrame + Vector3.new(0, 4, 0)\n\tend\n\ttask.delay(1, function() debounce[player.UserId] = nil end)\nend\n\npadA.Touched:Connect(function(hit) teleport(padA, padB, hit) end)\npadB.Touched:Connect(function(hit) teleport(padB, padA, hit) end)',
  'two linked pads');}},
 {label:'Checkpoints',re:/checkpoint|stage|respawn|levels?/i,fn:function(){
  var cols=['#2ecc71','#3498db','#9b59b6'];
  for(var i=1;i<=3;i++){aiPart({name:'Checkpoint'+i,size:[6,0.5,6],pos:[-24,0.5,6+i*8],color:cols[i-1],mat:'Neon'});}
  aiScript('AiCheckpoints',
  'local Players = game:GetService("Players")\n\nlocal CHECKPOINTS = {}\nfor i = 1, 3 do\n\tlocal p = workspace:FindFirstChild("Checkpoint" .. i)\n\tif p then CHECKPOINTS[i] = p end\nend\n\nPlayers.PlayerAdded:Connect(function(player)\n\tlocal leaderstats = Instance.new("Folder")\n\tleaderstats.Name = "leaderstats"\n\tleaderstats.Parent = player\n\tlocal stage = Instance.new("IntValue")\n\tstage.Name = "Stage"\n\tstage.Value = 1\n\tstage.Parent = leaderstats\nend)\n\nfor i, p in pairs(CHECKPOINTS) do\n\tp.Touched:Connect(function(hit)\n\t\tlocal player = Players:GetPlayerFromCharacter(hit.Parent)\n\t\tif player then\n\t\t\tlocal stats = player:FindFirstChild("leaderstats")\n\t\t\tlocal stage = stats and stats:FindFirstChild("Stage")\n\t\t\tif stage and i > stage.Value then\n\t\t\t\tstage.Value = i\n\t\t\tend\n\t\tend\n\tend)\nend\n\nPlayers.PlayerAdded:Connect(function(player)\n\tplayer.CharacterAdded:Connect(function(character)\n\t\ttask.wait(0.2)\n\t\tlocal stats = player:FindFirstChild("leaderstats")\n\t\tlocal stage = stats and stats:FindFirstChild("Stage")\n\t\tif stage and CHECKPOINTS[stage.Value] then\n\t\t\tlocal root = character:FindFirstChild("HumanoidRootPart")\n\t\t\tif root then\n\t\t\t\troot.CFrame = CHECKPOINTS[stage.Value].CFrame + Vector3.new(0, 4, 0)\n\t\t\tend\n\t\tend\n\tend)\nend)',
  '3 pads + respawn at stage');}},
 {label:'Day Cycle',re:/day.?cycle|day.?night|cycle|sun/i,fn:function(){
  aiScript('AiDayCycle',
  'local Lighting = game:GetService("Lighting")\nlocal SECONDS_PER_DAY = 120\n\nwhile true do\n\tLighting.ClockTime = (Lighting.ClockTime + 24 / (SECONDS_PER_DAY * 10)) % 24\n\ttask.wait(SECONDS_PER_DAY / 240)\nend)',
  '120 second day');}},
 {label:'Speed Pad',re:/speed|sprint|fast|boost/i,fn:function(){
  aiPart({name:'SpeedPad',size:[6,0.5,6],pos:[10,0.5,-6],color:'#f39c12',mat:'Neon'});
  aiScript('AiSpeedPad',
  'local pad = workspace:WaitForChild("SpeedPad")\nlocal debounce = {}\n\npad.Touched:Connect(function(hit)\n\tlocal humanoid = hit.Parent and hit.Parent:FindFirstChildOfClass("Humanoid")\n\tif not humanoid then return end\n\tif debounce[hit.Parent] then return end\n\tdebounce[hit.Parent] = true\n\tlocal original = humanoid.WalkSpeed\n\thumanoid.WalkSpeed = 32\n\ttask.delay(5, function()\n\t\tif humanoid.Parent then humanoid.WalkSpeed = original end\n\t\tdebounce[hit.Parent] = nil\n\tend)\nend)',
  'yellow boost pad');}},
 {label:'Heal Pad',re:/heal|health|regen|medic/i,fn:function(){
  aiPart({name:'HealPad',size:[6,0.5,6],pos:[16,0.5,-6],color:'#2ecc71',mat:'Neon'});
  aiScript('AiHealPad',
  'local pad = workspace:WaitForChild("HealPad")\nlocal debounce = {}\n\npad.Touched:Connect(function(hit)\n\tlocal humanoid = hit.Parent and hit.Parent:FindFirstChildOfClass("Humanoid")\n\tif not humanoid then return end\n\tif debounce[hit.Parent] then return end\n\tdebounce[hit.Parent] = true\n\thumanoid.Health = humanoid.MaxHealth\n\ttask.delay(2, function() debounce[hit.Parent] = nil end)\nend)',
  'green heal pad');}},
 {label:'Auto Door',re:/door|gate|entrance/i,fn:function(){
  aiPart({name:'AiDoor',size:[6,7,0.6],pos:[-8,3.5,18],color:'#7d5fff',mat:'Metal'});
  aiScript('AiDoor',
  'local door = workspace:WaitForChild("AiDoor")\nlocal TweenService = game:GetService("TweenService")\nlocal closedCFrame = door.CFrame\nlocal debounce = false\n\ndoor.Touched:Connect(function(hit)\n\tif debounce then return end\n\tlocal humanoid = hit.Parent and hit.Parent:FindFirstChildOfClass("Humanoid")\n\tif not humanoid then return end\n\tdebounce = true\n\tTweenService:Create(door, TweenInfo.new(0.6), {CFrame = closedCFrame + Vector3.new(0, 7, 0)}):Play()\n\ttask.wait(2)\n\tTweenService:Create(door, TweenInfo.new(0.6), {CFrame = closedCFrame}):Play()\n\ttask.wait(0.8)\n\tdebounce = false\nend)',
  'opens on touch');}},
 {label:'Message GUI',re:/message|popup|welcome|gui|sign/i,fn:function(){
  aiPart({name:'MessageBrick',size:[6,3,1],pos:[-14,1.5,10],color:'#e67e22',mat:'Neon'});
  aiScript('AiMessageGui',
  'local Players = game:GetService("Players")\nlocal brick = workspace:WaitForChild("MessageBrick")\nlocal debounce = {}\n\nbrick.Touched:Connect(function(hit)\n\tlocal player = Players:GetPlayerFromCharacter(hit.Parent)\n\tif not player then return end\n\tif debounce[player] then return end\n\tdebounce[player] = true\n\tlocal gui = Instance.new("ScreenGui")\n\tgui.Name = "AiMessage"\n\tgui.Parent = player:WaitForChild("PlayerGui")\n\tlocal label = Instance.new("TextLabel")\n\tlabel.Size = UDim2.new(0.6, 0, 0.12, 0)\n\tlabel.Position = UDim2.new(0.2, 0, 0.4, 0)\n\tlabel.BackgroundColor3 = Color3.fromRGB(20, 20, 30)\n\tlabel.TextColor3 = Color3.new(1, 1, 1)\n\tlabel.TextScaled = true\n\tlabel.Text = "Welcome to the game!"\n\tlabel.Parent = gui\n\ttask.delay(3, function()\n\t\tgui:Destroy()\n\t\tdebounce[player] = nil\n\tend)\nend)',
  'welcome popup');}},
 {label:'Shop GUI',re:/shop|store|buy|purchase/i,fn:function(){
  aiScript('AiShop',
  'local Players = game:GetService("Players")\n\nPlayers.PlayerAdded:Connect(function(player)\n\tlocal gui = Instance.new("ScreenGui")\n\tgui.Name = "AiShop"\n\tgui.Parent = player:WaitForChild("PlayerGui")\n\tlocal button = Instance.new("TextButton")\n\tbutton.Size = UDim2.new(0, 180, 0, 44)\n\tbutton.Position = UDim2.new(0, 12, 0, 200)\n\tbutton.BackgroundColor3 = Color3.fromRGB(40, 120, 200)\n\tbutton.TextColor3 = Color3.new(1, 1, 1)\n\tbutton.TextScaled = true\n\tbutton.Text = "Buy Speed Coil (25 Coins)"\n\tbutton.Parent = gui\n\tbutton.MouseButton1Click:Connect(function()\n\t\tlocal stats = player:FindFirstChild("leaderstats")\n\t\tif stats and stats:FindFirstChild("Coins") and stats.Coins.Value >= 25 then\n\t\t\tstats.Coins.Value = stats.Coins.Value - 25\n\t\t\tlocal humanoid = player.Character and player.Character:FindFirstChildOfClass("Humanoid")\n\t\t\tif humanoid then\n\t\t\t\thumanoid.WalkSpeed = 28\n\t\t\tend\n\t\tend\n\tend)\nend)',
  'spend Coins on speed');}},
 {label:'Explosion Brick',re:/explo|bomb|blast|mine/i,fn:function(){
  aiPart({name:'ExplosionBrick',size:[4,1,4],pos:[-14,0.5,-10],color:'#7a1010',mat:'Neon'});
  aiScript('AiExplosion',
  'local brick = workspace:WaitForChild("ExplosionBrick")\nlocal debounce = false\n\nbrick.Touched:Connect(function(hit)\n\tif debounce then return end\n\tlocal humanoid = hit.Parent and hit.Parent:FindFirstChildOfClass("Humanoid")\n\tif not humanoid then return end\n\tdebounce = true\n\tlocal explosion = Instance.new("Explosion")\n\texplosion.Position = brick.Position\n\texplosion.BlastRadius = 8\n\texplosion.Parent = workspace\n\ttask.wait(3)\n\tdebounce = false\nend)',
  'blows up on touch');}}
];
function aiRun(raw){
 var s=(raw||'').trim();
 if(!s||/^help$/i.test(s)){aiHelp();return;}
 var low=s.toLowerCase();var done=0;
 var world=[
  [/island/,function(){runCmd('island');}],
  [/hill/,function(){runCmd('hills');}],
  [/tree|forest|jungle/,function(){runCmd('trees');}],
  [/grass|field|lawn/,function(){runCmd('grass');}],
  [/\bhouse\b|home|cabin/,function(){runCmd('house');}],
  [/tower/,function(){runCmd('tower');}],
  [/city|town|urban/,function(){runCmd('city');}],
  [/castle|fort/,function(){runCmd('castle');}],
  [/night|midnight|dark/,function(){runCmd('night');}],
  [/dawn|sunrise/,function(){runCmd('dawn');}],
  [/dusk|sunset|evening/,function(){runCmd('dusk');}],
  [/noon|morning|bright/,function(){runCmd('noon');}]];
 for(var i=0;i<world.length;i++){if(world[i][0].test(low)){world[i][1]();done++;}}
 for(var j=0;j<LIB.length;j++){if(LIB[j].re.test(low)){LIB[j].fn();done++;}}
 if(done===0){
  out('AI: no system matched yet. I build: leaderboard, coin pickup, kill brick, teleporter, checkpoints, day cycle, speed pad, heal pad, door, message GUI, shop GUI, explosion, plus island / hills / trees / house / tower / city / castle and any time of day. Try: ai castle at night with leaderboard and kill brick','err');
  return;}
 out('AI prompt done: '+done+' system'+(done===1?'':'s')+' built from "'+s+'"','sys');
}
function aiHelp(){
 out('AI Assist builds real systems from plain prompts (offline pattern engine, real Luau output, no cloud). Systems: leaderboard, coin pickup, kill brick, teleporter, checkpoints, day cycle, speed pad, heal pad, door, message GUI, shop GUI, explosion brick. World: island, hills, trees, grass, house, tower, city, castle, dawn/noon/dusk/night. Example: ai island with trees, a house, a leaderboard and night','sys');
}
var _runCmd3=runCmd;
runCmd=function(s){if(!s)return _runCmd3(s);
 if(/^ai$/i.test(s.trim())){aiHelp();return;}
 var m=s.match(/^ai\s+(.+)/i);
 if(m){aiRun(m[1]);return;}
 _runCmd3(s);};
var AI_BTNS=[],AI_ICONS=['icon-script','icon-sphere','icon-del','icon-copy','icon-spawn','icon-play2','icon-insert','icon-play','icon-out','icon-help','icon-tb','icon-ball'];
for(var _ai=0;_ai<LIB.length;_ai++){(function(k){AI_BTNS.push([AI_ICONS[k%AI_ICONS.length],LIB[k].label,function(){LIB[k].fn();}]);})(_ai);}
AI_BTNS.push(null);AI_BTNS.push(['icon-help','AI Help',function(){aiHelp();}]);
TABS.push(['AI',AI_BTNS]);
buildTabs();
out('FORGE v0.7 AI layer loaded — AI Assist: new AI tab builds real systems from prompts, or type ai <prompt> / ai help','sys');
