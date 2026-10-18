// Geometry is expressed in mathematical coordinates; the display is a projection.
export const ROOT_TWO = Math.SQRT2;
export const HALF_PI = Math.PI / 2;
const DEG = Math.PI / 180;

export function geometryAt(kind, progress) {
  const t = Math.max(0, Math.min(1, Number(progress) || 0));
  if (kind === 'segment') {
    return {kind, t, vertices:[[-0.5,0],[-0.5+t,0]], length:t};
  }
  if (kind === 'right' || kind === 'equilateral') {
    const maxAngle = kind === 'right' ? 90 : 60;
    const angle = maxAngle * t;
    const a = angle * DEG;
    return {kind, t, vertices:[[0,0],[1,0],[Math.cos(a),Math.sin(a)]],
      angle, closingSide:2*Math.sin(a/2)};
  }
  if (kind === 'root2') {
    const height = Math.sqrt(2 - t*t/4);
    const apexAngle = 2 * Math.asin(t/(2*ROOT_TWO)) / DEG;
    return {kind,t,vertices:[[-t/2,0],[t/2,0],[0,height]],
      base:t,equalSide:ROOT_TWO,apexAngle,baseAngle:(180-apexAngle)/2};
  }
  if (kind === 'square') {
    return {kind,t,vertices:[[0,0],[1,0],[1,t],[0,t]],
      area:t,diagonal:Math.hypot(1,t)};
  }
  if (kind === 'quarter') {
    const angle=90*t;
    const theta=angle*DEG;
    const arc=theta;
    const chord=2*Math.sin(theta/2);
    const points=[[0,0],[1,0]];
    const subdivisions=Math.max(2,Math.ceil(40*t));
    for(let i=1;i<=subdivisions;i++){
      const a=theta*i/subdivisions;
      points.push([Math.cos(a),Math.sin(a)]);
    }
    return {kind,t,vertices:points,angle,theta,arc,chord,end:[Math.cos(theta),Math.sin(theta)]};
  }
  throw new Error('Bilinmeyen şekil: '+kind);
}

const fmt = new Intl.NumberFormat('tr-TR',{minimumFractionDigits:2,maximumFractionDigits:2});
const fmt3 = new Intl.NumberFormat('tr-TR',{minimumFractionDigits:3,maximumFractionDigits:3});
const closeTo = (a,b) => Math.abs(a-b) < 0.0001;
function f(n){return Number(n).toFixed(2);}
function point(x,y){return {x,y};}
function translate(p,dx,dy){return point(p.x+dx,p.y+dy);}
function midpoint(a,b){return point((a.x+b.x)/2,(a.y+b.y)/2);}
function svgLine(a,b,color,width=3,dash=''){
  return '<line x1="'+f(a.x)+'" y1="'+f(a.y)+'" x2="'+f(b.x)+'" y2="'+f(b.y)+'" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
}
function svgPath(pts,fill,stroke,width=2,opacity=1){
  const d=pts.map((p,i)=>(i?'L':'M')+f(p.x)+' '+f(p.y)).join(' ')+' Z';
  return '<path d="'+d+'" fill="'+fill+'" fill-opacity="'+opacity+'" stroke="'+stroke+'" stroke-width="'+width+'" stroke-linejoin="round"/>';
}
function polyline(pts,stroke,width=3,dash=''){
  const d=pts.map((p,i)=>(i?'L':'M')+f(p.x)+' '+f(p.y)).join(' ');
  return '<path d="'+d+'" fill="none" stroke="'+stroke+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
}
function textAt(txt,p,dx=0,dy=0,cls='geometry-value',anchor='middle'){
  return '<text x="'+f(p.x+dx)+'" y="'+f(p.y+dy)+'" text-anchor="'+anchor+'" class="'+cls+'">'+txt+'</text>';
}
function dot(p){return '<circle cx="'+f(p.x)+'" cy="'+f(p.y)+'" r="5.6" class="geometry-point"/>';}
function angleCurve(project,ox,oy,start,end,r=0.27){
  const pts=[];
  for(let i=0;i<=14;i++){const a=start+(end-start)*i/14;pts.push(project(ox+Math.cos(a)*r,oy+Math.sin(a)*r));}
  return polyline(pts,'#ec9b50',2.5);
}
function projection(kind,mode){
  const cfg={
    segment:[320,198,172],right:[245,255,158],equilateral:[245,250,158],
    root2:[320,274,143],square:[235,263,160],quarter:[312,194,119]
  }[kind];
  const [ox,oy,scale]=cfg;
  if(mode==='3d'){
    return (x,y,z=0)=>point(ox+scale*(.89*x-.43*y),oy-scale*(.35*x+.72*y+.9*z));
  }
  return (x,y)=>point(ox+scale*x,oy-scale*y);
}
function grid(kind){
  return '<defs><pattern id="g-'+kind+'" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0 H0 V28" fill="none" stroke="#eef1f8" stroke-width="1"/></pattern></defs>'+
    '<rect width="640" height="330" fill="#fcfdff"/><rect width="640" height="330" fill="url(#g-'+kind+')" opacity=".8"/>';
}
function extrudedPolygon(vertices,project,face='#dfe3ff',height=.18){
  if(vertices.length<3)return '';
  const back=vertices.map(([x,y])=>project(x,y,0));
  const top=vertices.map(([x,y])=>project(x,y,height));
  let out='';
  for(let i=0;i<vertices.length;i++){
    const j=(i+1)%vertices.length;
    out+=svgPath([back[i],back[j],top[j],top[i]],i%2?'#a8b2f1':'#bec6fc','#8997e2',1.2,.82);
  }
  out+=svgPath(top,face,'#5865d8',3,.93);
  return out;
}
function projectionPoints(vertices,p,z=0){return vertices.map(v=>p(v[0],v[1],z));}

function drawSegment(g,project,mode){
  const [a,b]=projectionPoints(g.vertices,project,mode==='3d'?.18:0);
  let out='';
  if(mode==='3d'){
    const low=projectionPoints(g.vertices,project,0);
    out+=svgLine(low[0],low[1],'#b7c2fa',13);
    out+=svgLine(low[0],a,'#99a4e6',5);
    out+=svgLine(low[1],b,'#99a4e6',5);
  }
  out+=svgLine(a,b,'#5865dd',7);
  out+=dot(a)+dot(b);
  out+=textAt('A',a,-15,23,'geometry-label')+textAt('B',b,15,23,'geometry-label');
  out+=textAt(closeTo(g.length,1)?'1 birim':fmt.format(g.length)+' birim',midpoint(a,b),0,-22);
  return out;
}
function drawArmTriangle(g,project,mode){
  const [a,b,c]=projectionPoints(g.vertices,project,mode==='3d'?.18:0);
  const z=mode==='3d'?.18:0;
  let out='';
  if(mode==='3d')out+=extrudedPolygon(g.vertices,project);
  else out+=svgPath([a,b,c],'#eaedff','#7c87ea',2.4,.95);
  out+=svgLine(a,b,'#5865d8',4);
  out+=svgLine(a,c,'#5865d8',4);
  out+=svgLine(b,c,'#f0a454',4);
  out+=dot(a)+dot(b)+dot(c);
  out+=textAt('A',a,-14,22,'geometry-label')+textAt('B',b,11,21,'geometry-label')+textAt('C',c,-9,-12,'geometry-label');
  out+=textAt('1',midpoint(a,b),0,23);
  out+=textAt('1',midpoint(a,c),-19,-5);
  const hypLabel=closeTo(g.closingSide,g.kind==='right'?ROOT_TWO:1)?
    (g.kind==='right'?'√2':'1'):fmt.format(g.closingSide);
  out+=textAt(hypLabel,midpoint(b,c),25,-1);
  if(mode==='2d'){
    const aRad=g.angle*DEG;
    if(g.kind==='right'&&closeTo(g.angle,90)){
      out+=polyline([project(.18,0),project(.18,.18),project(0,.18)],'#ed9b4d',2.4);
      out+=textAt('90°',project(.23,.23),3,-3,'angle-label','start');
    } else {
      out+=angleCurve(project,0,0,0,aRad);
      const anchor=project(.37*Math.cos(aRad/2),.37*Math.sin(aRad/2));
      out+=textAt(fmt.format(g.angle)+'°',anchor,4,0,'angle-label','start');
    }
  }else{
    out+=textAt(fmt.format(g.angle)+'°',project(.23,.25,z),8,-10,'angle-label','start');
  }
  return out;
}
function drawRoot2(g,project,mode){
  const [a,b,c]=projectionPoints(g.vertices,project,mode==='3d'?.18:0);
  let out=mode==='3d'?extrudedPolygon(g.vertices,project,'#edf0ff'):svgPath([a,b,c],'#e9edff','#7d87e9',2.4,.93);
  out+=svgLine(a,b,'#f0a454',4)+svgLine(a,c,'#5966dd',4)+svgLine(b,c,'#5966dd',4);
  out+=dot(a)+dot(b)+dot(c);
  out+=textAt('A',a,-12,21,'geometry-label')+textAt('B',b,12,21,'geometry-label')+textAt('C',c,0,-13,'geometry-label');
  out+=textAt('√2',midpoint(a,c),-22,-1)+textAt('√2',midpoint(b,c),22,-1);
  out+=textAt(closeTo(g.base,1)?'1':fmt.format(g.base),midpoint(a,b),0,24);
  const apex=g.vertices[2];
  if(mode==='2d'){
    const v0=Math.atan2(-apex[1],-g.base/2),v1=Math.atan2(-apex[1],g.base/2);
    out+=angleCurve(project,0,apex[1],v0,v1,.31);
  }
  const label=project(0,apex[1]-.43,mode==='3d'?.18:0);
  out+=textAt(fmt.format(g.apexAngle)+'°',label,0,2,'angle-label');
  return out;
}
function drawSquare(g,project,mode){
  const [a,b,c,d]=projectionPoints(g.vertices,project,mode==='3d'?.18:0);
  let out='';
  if(mode==='3d'){
    out+=extrudedPolygon(g.vertices,project,'#e8ebff');
    out+=svgPath([a,b,c],'#dce2ff','none',0,.8)+svgPath([a,c,d],'#fff1df','none',0,.85);
  }else{
    out+=svgPath([a,b,c],'#dfe4ff','none',0,.98);
    out+=svgPath([a,c,d],'#fff0d9','none',0,.98);
  }
  out+=polyline([a,b,c,d,a],'#5865dd',3.8);
  out+=svgLine(a,c,'#f09c4d',3.5);
  out+=dot(a)+dot(b)+dot(c)+dot(d);
  out+=textAt('1',midpoint(a,b),0,23);
  out+=textAt(closeTo(g.t,1)?'1':fmt.format(g.t),midpoint(a,d),-20,-2);
  out+=textAt(closeTo(g.diagonal,ROOT_TWO)?'√2':fmt3.format(g.diagonal),midpoint(a,c),17,-11);
  if(mode==='2d'){
    out+=polyline([project(.82,0),project(.82,.18),project(1,.18)],'#8b92cf',2);
    if(g.t>.4)out+=polyline([project(0,g.t-.17),project(.17,g.t-.17),project(.17,g.t)],'#8b92cf',2);
  }
  if(g.t>.22){
    out+=textAt('△ 1',project(.75,g.t*.28,mode==='3d'?.18:0),0,0,'geometry-label');
    out+=textAt('△ 2',project(.28,g.t*.75,mode==='3d'?.18:0),0,0,'geometry-label');
  }
  return out;
}
function drawQuarter(g,project,mode,showCircle){
  const z=mode==='3d'?.18:0;
  let out='';
  if(showCircle){
    const full=[];
    for(let i=0;i<=96;i++){const angle=2*Math.PI*i/96;full.push(project(Math.cos(angle),Math.sin(angle),mode==='3d'?.05:0));}
    out+=polyline(full,'#bdc6df',2,'5 8');
  }
  if(mode==='3d'){
    out+=extrudedPolygon(g.vertices,project,'#e9efff',.18);
  }else{
    out+=svgPath(projectionPoints(g.vertices,project),'#e9edff','none',0,.93);
  }
  const origin=project(0,0,z),start=project(1,0,z),end=project(g.end[0],g.end[1],z);
  const arc=g.vertices.slice(1).map(v=>project(v[0],v[1],z));
  out+=svgLine(origin,start,'#23a69e',3);
  out+=svgLine(origin,end,'#23a69e',3);
  out+=svgLine(start,end,'#5966dd',4);
  out+=polyline(arc,'#ed9b50',4.5);
  out+=dot(origin)+dot(start)+dot(end);
  out+=textAt('O',origin,-13,20,'geometry-label');
  out+=textAt('A',start,13,17,'geometry-label');
  if(g.angle>3)out+=textAt('B',end,-11,-11,'geometry-label');
  out+=textAt('1',midpoint(origin,start),0,22);
  const a=g.theta;
  const arcLabel=project(Math.cos(a/2)*1.25,Math.sin(a/2)*1.25,z);
  out+=textAt('yay',arcLabel,13,-6,'angle-label','start');
  const chordLabel=project((1+g.end[0])/2,(g.end[1])/2,z);
  if(g.angle>12)out+=textAt('kiriş',chordLabel,15,21,'geometry-value','start');
  if(mode==='2d'){
    out+=angleCurve(project,0,0,0,a,.27);
    const angleAt=project(.42*Math.cos(a/2),.42*Math.sin(a/2));
    out+=textAt(fmt.format(g.angle)+'°',angleAt,-2,-2,'angle-label','start');
  } else {
    out+=textAt(fmt.format(g.angle)+'°',origin,23,-20,'angle-label','start');
  }
  return out;
}
export function renderShape(kind,progress,mode='2d',showCircle=false){
  const g=geometryAt(kind,progress);
  const project=projection(kind,mode);
  let content=grid(kind);
  if(kind==='segment')content+=drawSegment(g,project,mode);
  else if(kind==='right'||kind==='equilateral')content+=drawArmTriangle(g,project,mode);
  else if(kind==='root2')content+=drawRoot2(g,project,mode);
  else if(kind==='square')content+=drawSquare(g,project,mode);
  else if(kind==='quarter')content+=drawQuarter(g,project,mode,showCircle);
  return content;
}
export function readingFor(kind,progress){
  const g=geometryAt(kind,progress);
  if(kind==='segment')return fmt.format(g.length)+' birim';
  if(kind==='right'||kind==='equilateral')return fmt.format(g.angle)+'° · '+fmt3.format(g.closingSide)+' karşı kenar';
  if(kind==='root2')return fmt.format(g.base)+' birim · '+fmt.format(g.apexAngle)+'° tepe';
  if(kind==='square')return fmt.format(g.t)+' birim · '+fmt3.format(g.diagonal)+' köşegen';
  return fmt.format(g.angle)+'° · '+fmt3.format(g.arc)+' yay · '+fmt3.format(g.chord)+' kiriş';
}

if(typeof document!=='undefined'){
  const lessons=[...document.querySelectorAll('.lesson')];
  const viewButtons=[...document.querySelectorAll('[data-view]')];
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const frames=new Map();
  let mode='2d';

  function drawLesson(lesson){
    const kind=lesson.dataset.shape;
    const slider=lesson.querySelector('input[type=range]');
    const t=Number(slider.value)/100;
    slider.style.setProperty('--fill',slider.value+'%');
    const showCircle=!!document.getElementById('show-circle')?.checked;
    lesson.querySelector('svg').innerHTML=renderShape(kind,t,mode,showCircle);
    lesson.querySelector('output').textContent=readingFor(kind,t);
  }
  function stopAnimation(lesson){
    if(frames.has(lesson)){cancelAnimationFrame(frames.get(lesson));frames.delete(lesson);}
  }
  function play(lesson){
    stopAnimation(lesson);
    const slider=lesson.querySelector('input[type=range]');
    if(reducedMotion.matches){slider.value='100';drawLesson(lesson);return;}
    slider.value='0';drawLesson(lesson);
    const start=performance.now(),duration=1550;
    function frame(now){
      const t=Math.min(1,(now-start)/duration);
      const eased=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
      slider.value=String(Math.round(eased*100));
      drawLesson(lesson);
      if(t<1)frames.set(lesson,requestAnimationFrame(frame));
      else{slider.value='100';drawLesson(lesson);frames.delete(lesson);}
    }
    frames.set(lesson,requestAnimationFrame(frame));
  }
  lessons.forEach(lesson=>{
    lesson.querySelector('input[type=range]').addEventListener('input',()=>{stopAnimation(lesson);drawLesson(lesson);});
    lesson.querySelector('.play-button').addEventListener('click',()=>play(lesson));
    drawLesson(lesson);
  });
  const circleCheckbox=document.getElementById('show-circle');
  circleCheckbox.addEventListener('change',()=>drawLesson(document.getElementById('ceyrek-cember')));
  viewButtons.forEach(button=>button.addEventListener('click',()=>{
    mode=button.dataset.view;
    viewButtons.forEach(item=>{
      const active=item===button;
      item.classList.toggle('active',active);
      item.setAttribute('aria-pressed',String(active));
    });
    document.getElementById('view-explanation').hidden=mode!=='3d';
    lessons.forEach(drawLesson);
  }));
}
