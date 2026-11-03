"use strict";
/* ============ FORGE v1.4 fit layer: auto-compact chrome for small screens ============ */
(function(){
function addCss(css){var st=document.createElement('style');st.id='forge_fit2_style';st.textContent=css;document.head.appendChild(st);}
addCss([
'body.compact #app{grid-template-rows:26px 20px 58px minmax(0,1fr) clamp(70px,20vh,110px) 16px!important}',
'body.compact #titlebar{padding:0 6px;gap:6px}',
'body.compact #titlebar .logo{width:16px;height:16px;font-size:10px;flex:none}',
'body.compact #titlebar .t{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;max-width:52vw}',
'body.compact #titlebar .win{display:none}',
'body.compact #menubar{padding:0 2px}',
'body.compact #menubar .mi{font-size:11px;padding:2px 7px}',
'body.compact #tabs{overflow-x:auto;padding-left:2px;scrollbar-width:none}',
'body.compact #tabs::-webkit-scrollbar{display:none}',
'body.compact #tabs .tab{flex:none;font-size:11px;padding:3px 8px;white-space:nowrap}',
'body.compact #ribbonbtns{overflow-x:auto;scrollbar-width:none}',
'body.compact #ribbonbtns::-webkit-scrollbar{display:none}',
'body.compact #ribbonbtns .rb{flex:none}',
'body.compact #output{font-size:10px}',
'body.compact #f-theme{top:0!important;bottom:auto!important;right:6px!important;padding:4px 10px!important}',
'body.compact #explorer,body.compact #propspanel{max-width:78vw}'
].join('\n'));
function applyFit(){
  var w=window.innerWidth||document.documentElement.clientWidth||980;
  var h=window.innerHeight||document.documentElement.clientHeight||640;
  var compact=(w<500)||(h<640);
  var b=document.body;
  var cur=b.classList.contains('compact');
  if(compact!==cur){
    b.classList.toggle('compact',compact);
    if(b.dataset.fitUser==='1')b.classList.toggle('compact',true);
  }
}
window.addEventListener('resize',applyFit);
window.addEventListener('orientationchange',function(){setTimeout(applyFit,120);});
applyFit();
})();