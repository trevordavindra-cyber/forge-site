"use strict";
/* ============ FORGE safe layer: repair a damaged saved place before it loads ============ */
(function(){
try{
 var s=localStorage.getItem('forge_doc_v2');
 if(s){
  var d=JSON.parse(s);
  var N=d&&d.nodes||{};
  var fixed=0;
  for(var k in N){
   var n=N[k];
   if(!n||typeof n!=='object')continue;
   if(!n.rot){n.rot=[0,0,0];fixed++;}
   if(!n.pos)n.pos=[0,4,0];
   if(!n.size)n.size=[4,1,2];
   if(!n.name)n.name='Part';
   if(!n.cls)n.cls='Part';
   if(!n.shape)n.shape='Block';
   if(!n.parent)n.parent='ws';
   if(!n.color)n.color='#a3a3a3';
   if(!n.mat)n.mat='Plastic';
   if(!n.trans)n.trans=0;
   if(n.anch===undefined)n.anch=true;
   if(n.coll===undefined)n.coll=true;
  }
  localStorage.setItem('forge_doc_v2',JSON.stringify(d));
 }
}catch(e){}
})();