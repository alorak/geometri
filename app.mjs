// Geometry is expressed in mathematical coordinates; the display is a projection.
export const ROOT_TWO = Math.SQRT2;
export const HALF_PI = Math.PI / 2;
const DEG = Math.PI / 180;

export function unitSegment(center=[0,0], angleDeg=0) {
  const radians=angleDeg*DEG;
  const dx=Math.cos(radians)/2,dy=Math.sin(radians)/2;
  return [[center[0]-dx,center[1]-dy],[center[0]+dx,center[1]+dy]];
}

// Endpoint drag rotates around the opposite endpoint; body drag translates both.
export function dragUnitSegment(vertices, handle, position, startPosition) {
  const a=[...vertices[0]],b=[...vertices[1]];
  if(handle==='body'){
    if(!startPosition)return [a,b];
    let dx=position[0]-startPosition[0],dy=position[1]-startPosition[1];
    const xMin=Math.min(a[0],b[0]),xMax=Math.max(a[0],b[0]);
    const yMin=Math.min(a[1],b[1]),yMax=Math.max(a[1],b[1]);
    dx=Math.max(-1.44-xMin,Math.min(1.44-xMax,dx));
    dy=Math.max(-.57-yMin,Math.min(.79-yMax,dy));
    return [[a[0]+dx,a[1]+dy],[b[0]+dx,b[1]+dy]];
  }
  if(handle!=='a'&&handle!=='b')return [a,b];
  const fixed=handle==='a'?b:a;
  const dx=position[0]-fixed[0],dy=position[1]-fixed[1];
  const distance=Math.hypot(dx,dy);
  if(distance<1e-8)return [a,b];
  const moved=[fixed[0]+dx/distance,fixed[1]+dy/distance];
  return handle==='a'?[moved,b]:[a,moved];
}

export function geometryAt(kind, progress) {
  const t = Math.max(0, Math.min(kind==='root2'?2.82:1, Number(progress) || 0));
  if (kind === 'segment') {
    return {kind,t,vertices:unitSegment([0,0],360*t),length:1,angle:360*t};
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
    root2:[320,274,143],square:[235,263,160],quarter:[312,169,138]
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
  out+=textAt('1 birim',midpoint(a,b),0,-22);
  out+='<line data-grab="body" x1="'+f(a.x)+'" y1="'+f(a.y)+'" x2="'+f(b.x)+'" y2="'+f(b.y)+'" stroke="transparent" stroke-width="24" pointer-events="stroke"/>';
  out+='<circle data-grab="a" cx="'+f(a.x)+'" cy="'+f(a.y)+'" r="17" fill="transparent" pointer-events="all"/>';
  out+='<circle data-grab="b" cx="'+f(b.x)+'" cy="'+f(b.y)+'" r="17" fill="transparent" pointer-events="all"/>';
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
  if(mode==='2d'&&g.angle>8){
    const theta=g.angle*DEG;
    const beta=(Math.PI-theta)/2;
    const vertexC=g.vertices[2];
    out+=angleCurve(project,1,0,Math.PI-beta,Math.PI,.23);
    out+=angleCurve(project,vertexC[0],vertexC[1],theta+Math.PI,theta+Math.PI+beta,.23);
    const bLabel=project(1+.39*Math.cos(Math.PI-beta/2),.39*Math.sin(Math.PI-beta/2));
    const cLabel=project(vertexC[0]+.39*Math.cos(theta+Math.PI+beta/2),vertexC[1]+.39*Math.sin(theta+Math.PI+beta/2));
    out+=textAt(fmt.format((180-g.angle)/2)+'°',bLabel,0,-1,'angle-label');
    out+=textAt(fmt.format((180-g.angle)/2)+'°',cLabel,0,-1,'angle-label');
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
    const beta=g.baseAngle*DEG;
    if(g.base>.18){
      out+=angleCurve(project,-g.base/2,0,0,beta,.31);
      out+=angleCurve(project,g.base/2,0,Math.PI-beta,Math.PI,.31);
      const leftAngle=project(-g.base/2+.47*Math.cos(beta/2),.47*Math.sin(beta/2));
      const rightAngle=project(g.base/2-.47*Math.cos(beta/2),.47*Math.sin(beta/2));
      out+=textAt(fmt.format(g.baseAngle)+'°',leftAngle,-3,-4,'angle-label','middle');
      out+=textAt(fmt.format(g.baseAngle)+'°',rightAngle,3,-4,'angle-label','middle');
    }
  }
  const label=project(0,apex[1]+(g.base>2.5?.23:-.43),mode==='3d'?.18:0);
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
  if(mode==='2d'&&g.t>.14){
    const mark=Math.min(.18,g.t*.35);
    out+=polyline([project(1-mark,0),project(1-mark,mark),project(1,mark)],'#ec9b50',2);
    out+=polyline([project(0,g.t-mark),project(mark,g.t-mark),project(mark,g.t)],'#ec9b50',2);
    const diagonalAngle=Math.atan2(g.t,1);
    out+=angleCurve(project,0,0,0,diagonalAngle,.24);
    out+=angleCurve(project,0,0,diagonalAngle,Math.PI/2,.24);
    out+=angleCurve(project,1,g.t,Math.PI,Math.PI+diagonalAngle,.24);
    out+=angleCurve(project,1,g.t,Math.PI+diagonalAngle,Math.PI*1.5,.24);
    const angleA1=project(.39*Math.cos(diagonalAngle/2),.39*Math.sin(diagonalAngle/2));
    const angleA2=project(.39*Math.cos((diagonalAngle+Math.PI/2)/2),.39*Math.sin((diagonalAngle+Math.PI/2)/2));
    const angleC1=project(1+.39*Math.cos(Math.PI+diagonalAngle/2),g.t+.39*Math.sin(Math.PI+diagonalAngle/2));
    const angleC2=project(1+.39*Math.cos((2.5*Math.PI+diagonalAngle)/2),g.t+.39*Math.sin((3*Math.PI+diagonalAngle)/2));
    out+=textAt(fmt.format(diagonalAngle/DEG)+'°',angleA1,0,-2,'angle-label');
    out+=textAt(fmt.format(90-diagonalAngle/DEG)+'°',angleA2,0,-2,'angle-label');
    out+=textAt(fmt.format(diagonalAngle/DEG)+'°',angleC1,0,5,'angle-label');
    out+=textAt(fmt.format(90-diagonalAngle/DEG)+'°',angleC2,0,5,'angle-label');
    out+=textAt('90°',project(1-mark-.12,mark+.13),0,0,'angle-label');
    out+=textAt('90°',project(mark+.12,g.t-mark-.13),0,0,'angle-label');
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
  out+=textAt('yay '+fmt3.format(g.arc),arcLabel,6,-6,'angle-label','start');
  const chordLabel=project((1+g.end[0])/2,(g.end[1])/2,z);
  if(g.angle>12)out+=textAt('kiriş '+fmt3.format(g.chord),chordLabel,10,21,'geometry-value','start');
  if(mode==='2d'){
    if(closeTo(g.angle,90)){
      out+=polyline([project(.23,0),project(.23,.23),project(0,.23)],'#ec9b50',2.5);
      out+=textAt('90°',project(.27,.29),4,-4,'angle-label','start');
    }else{
      out+=angleCurve(project,0,0,0,a,.27);
      const angleAt=project(.42*Math.cos(a/2),.42*Math.sin(a/2));
      out+=textAt(fmt.format(g.angle)+'°',angleAt,-2,-2,'angle-label','start');
    }
  } else {
    out+=textAt(fmt.format(g.angle)+'°',origin,23,-20,'angle-label','start');
  }
  return out;
}
export function renderShape(kind,progress,mode='2d',showCircle=false,segmentVertices=null){
  const g=geometryAt(kind,progress);
  if(kind==='segment'&&segmentVertices){
    g.vertices=segmentVertices.map(v=>[...v]);
    g.length=Math.hypot(g.vertices[1][0]-g.vertices[0][0],g.vertices[1][1]-g.vertices[0][1]);
  }
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
  if(kind==='segment')return Math.round(g.angle)+'° · 1 birim';
  if(kind==='right'||kind==='equilateral')return fmt.format(g.angle)+'° · diğer '+fmt.format((180-g.angle)/2)+'°';
  if(kind==='root2')return fmt.format(g.base)+' br · '+fmt.format(g.baseAngle)+'° taban';
  if(kind==='square')return fmt.format(g.t)+' birim · '+fmt3.format(g.diagonal)+' köşegen';
  return fmt.format(g.angle)+'° · '+fmt3.format(g.arc)+' yay · '+fmt3.format(g.chord)+' kiriş';
}

if(typeof document!=='undefined'){
  const lessons=[...document.querySelectorAll('.lesson')];
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const frames=new Map();
  const segmentLesson=document.getElementById('dogru-parcasi');
  const segmentSlider=document.getElementById('range-segment');
  const segmentSvg=segmentLesson.querySelector('svg');
  let segmentVertices=unitSegment([0,0],0);
  let segmentDrag=null;
  const mode='2d';

  function setSegmentAngle(degrees){
    const midpointCoords=[
      (segmentVertices[0][0]+segmentVertices[1][0])/2,
      (segmentVertices[0][1]+segmentVertices[1][1])/2
    ];
    segmentVertices=unitSegment(midpointCoords,degrees);
  }
  function drawLesson(lesson){
    const kind=lesson.dataset.shape;
    const slider=lesson.querySelector('input[type=range]');
    const raw=Number(slider.value);
    const t=kind==='segment'?raw/360:raw/100;
    slider.style.setProperty('--fill',(100*raw/Number(slider.max))+'%');
    const showCircle=!!document.getElementById('show-circle')?.checked;
    lesson.querySelector('svg').innerHTML=renderShape(kind,t,mode,showCircle,kind==='segment'?segmentVertices:null);
    lesson.querySelector('output').textContent=readingFor(kind,t);
  }
  function stopAnimation(lesson){
    if(frames.has(lesson)){cancelAnimationFrame(frames.get(lesson));frames.delete(lesson);}
  }
  function play(lesson){
    stopAnimation(lesson);
    const kind=lesson.dataset.shape;
    const slider=lesson.querySelector('input[type=range]');
    const max=Number(slider.max);
    if(reducedMotion.matches){
      slider.value=String(max);
      if(kind==='segment')setSegmentAngle(max);
      drawLesson(lesson);
      return;
    }
    slider.value='0';
    if(kind==='segment')setSegmentAngle(0);
    drawLesson(lesson);
    const start=performance.now(),duration=kind==='segment'?2300:1550;
    function frame(now){
      const t=Math.min(1,(now-start)/duration);
      const eased=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
      slider.value=String(Math.round(eased*max));
      if(kind==='segment')setSegmentAngle(Number(slider.value));
      drawLesson(lesson);
      if(t<1)frames.set(lesson,requestAnimationFrame(frame));
      else{
        slider.value=String(max);
        if(kind==='segment')setSegmentAngle(max);
        drawLesson(lesson);
        frames.delete(lesson);
      }
    }
    frames.set(lesson,requestAnimationFrame(frame));
  }
  lessons.forEach(lesson=>{
    const kind=lesson.dataset.shape;
    lesson.querySelector('input[type=range]').addEventListener('input',()=>{
      stopAnimation(lesson);
      if(kind==='segment')setSegmentAngle(Number(segmentSlider.value));
      drawLesson(lesson);
    });
    lesson.querySelector('.play-button').addEventListener('click',()=>play(lesson));
    drawLesson(lesson);
  });
  segmentLesson.querySelector('.reset-button').addEventListener('click',()=>{
    stopAnimation(segmentLesson);
    segmentDrag=null;
    segmentSvg.classList.remove('dragging');
    segmentVertices=unitSegment([0,0],0);
    segmentSlider.value='0';
    drawLesson(segmentLesson);
  });
  document.getElementById('kok-iki-ucgen').querySelector('.snap-button').addEventListener('click',()=>{
    const lesson=document.getElementById('kok-iki-ucgen');
    stopAnimation(lesson);
    lesson.querySelector('input[type=range]').value='100';
    drawLesson(lesson);
  });
  document.getElementById('show-circle').addEventListener('change',()=>{
    drawLesson(document.getElementById('ceyrek-cember'));
  });

  function eventToSegmentWorld(event){
    const matrix=segmentSvg.getScreenCTM();
    if(!matrix)return null;
    const cursor=segmentSvg.createSVGPoint();
    cursor.x=event.clientX;cursor.y=event.clientY;
    const p=cursor.matrixTransform(matrix.inverse());
    const ox=320,oy=198,scale=172;
    return [(p.x-ox)/scale,(oy-p.y)/scale];
  }
  segmentSvg.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||event.button!==0)return;
    const handle=event.target.getAttribute?.('data-grab');
    if(!handle)return;
    const start=eventToSegmentWorld(event);
    if(!start)return;
    stopAnimation(segmentLesson);
    segmentDrag={id:event.pointerId,handle,start,vertices:segmentVertices.map(v=>[...v])};
    segmentSvg.classList.add('dragging');
    segmentSvg.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  segmentSvg.addEventListener('pointermove',event=>{
    if(!segmentDrag||event.pointerId!==segmentDrag.id)return;
    const position=eventToSegmentWorld(event);
    if(!position)return;
    segmentVertices=dragUnitSegment(segmentDrag.vertices,segmentDrag.handle,position,segmentDrag.start);
    if(segmentDrag.handle!=='body'){
      const [a,b]=segmentVertices;
      const angle=(Math.atan2(b[1]-a[1],b[0]-a[0])/DEG+360)%360;
      segmentSlider.value=String(Math.round(angle));
    }
    drawLesson(segmentLesson);
    event.preventDefault();
  });
  function releaseDrag(event){
    if(!segmentDrag||event.pointerId!==segmentDrag.id)return;
    segmentDrag=null;
    segmentSvg.classList.remove('dragging');
    if(segmentSvg.hasPointerCapture(event.pointerId))segmentSvg.releasePointerCapture(event.pointerId);
  }
  segmentSvg.addEventListener('pointerup',releaseDrag);
  segmentSvg.addEventListener('pointercancel',releaseDrag);
  segmentSvg.addEventListener('lostpointercapture',()=>{segmentDrag=null;segmentSvg.classList.remove('dragging');});

}
