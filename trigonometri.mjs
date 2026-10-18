// Temel trigonometri: hesaplamalar, SVG çizimleri ve etkileşimler.
// Matematik fonksiyonları DOM'dan bağımsızdır ve test edilebilir.
const DEG=Math.PI/180;
const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number.isFinite(Number(value))?Number(value):min));
const clean=value=>Math.abs(value)<1e-12?0:Math.abs(value-1)<1e-12?1:Math.abs(value+1)<1e-12?-1:value;
const f=value=>Number(value).toFixed(2);
const tr=new Intl.NumberFormat('tr-TR',{minimumFractionDigits:3,maximumFractionDigits:3});
const fmt=value=>tr.format(clean(value));
const trOneDecimal=new Intl.NumberFormat('tr-TR',{minimumFractionDigits:1,maximumFractionDigits:1});
const fmtOneDecimal=value=>trOneDecimal.format(clean(value));

export function trigAt(angleDeg){
  const angle=clamp(angleDeg,0,360),radians=angle*DEG;
  const sin=clean(Math.sin(radians)),cos=clean(Math.cos(radians));
  const referenceAngle=Math.atan2(Math.abs(sin),Math.abs(cos))/DEG;
  return {angle,radians,sin,cos,referenceAngle,
    tan:cos===0?null:clean(sin/cos),
    cot:sin===0?null:clean(cos/sin)};
}

export function radianAt(radius,angleDeg){
  const r=clamp(radius,.5,2),degree=clamp(angleDeg,0,360),radians=degree*DEG;
  const arcLength=r*radians;
  return {radius:r,degree,radians,arcLength,arcRadiusRatio:arcLength/r};
}

// Radyanı π katsayısı olarak göster: 90° = π/2, 270° = 3π/2.
export function radiansInPi(angleDeg){
  const angle=clamp(angleDeg,0,360);
  if(angle===0)return '0';
  if(!Number.isInteger(angle))return String(angle)+'π/180';
  const gcd=(a,b)=>b?gcd(b,a%b):a;
  const divisor=gcd(angle,180),numerator=angle/divisor,denominator=180/divisor;
  const part=(numerator===1?'':String(numerator))+'π';
  return denominator===1?part:part+'/'+denominator;
}

export function triangleAt(angleDeg){
  // Uç konumlarda üçgen doğrusal hale geldiği için 1°–89° arasında tutulur.
  const angle=clamp(angleDeg,1,89),t=trigAt(angle);
  return {angle,opposite:t.sin,adjacent:t.cos,hypotenuse:1};
}

export function expressionAt(operator,angleDeg){
  const t=trigAt(angleDeg);
  const value=operator==='sum'?t.sin+t.cos:operator==='difference'?t.sin-t.cos:operator==='product'?t.sin*t.cos:NaN;
  if(!Number.isFinite(value))throw new Error('Bilinmeyen işlem: '+operator);
  const equivalent=operator==='sum'?Math.SQRT2*Math.sin((t.angle+45)*DEG):
    operator==='difference'?Math.SQRT2*Math.sin((t.angle-45)*DEG):
    .5*Math.sin(2*t.radians);
  return {...t,value:clean(value),equivalent:clean(equivalent)};
}

export const SPECIAL_ANGLES=[
  {angle:0,  sin:'0',   cos:'1',     tan:'0',    cot:'Tanımsız'},
  {angle:30, sin:'1/2', cos:'√3/2',  tan:'√3/3', cot:'√3'},
  {angle:45, sin:'√2/2',cos:'√2/2', tan:'1',    cot:'1'},
  {angle:60, sin:'√3/2',cos:'1/2',   tan:'√3',   cot:'√3/3'},
  {angle:90, sin:'1',   cos:'0',     tan:'Tanımsız',cot:'0'},
  {angle:180,sin:'0',   cos:'−1',    tan:'0',    cot:'Tanımsız'},
  {angle:270,sin:'−1',  cos:'0',     tan:'Tanımsız',cot:'0'},
  {angle:360,sin:'0',   cos:'1',     tan:'0',    cot:'Tanımsız'}
];

const line=(x1,y1,x2,y2,color='#d6dced',width=2,dash='')=>
  '<line x1="'+f(x1)+'" y1="'+f(y1)+'" x2="'+f(x2)+'" y2="'+f(y2)+'" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>';
const circle=(x,y,r,fill,stroke,width=2)=>
  '<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(r)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'"/>';
const text=(x,y,label,color='#79839d',size=13,anchor='middle',weight=600)=>
  '<text x="'+f(x)+'" y="'+f(y)+'" text-anchor="'+anchor+'" fill="'+color+'" font-size="'+size+'" font-weight="'+weight+'" font-family="system-ui, sans-serif">'+label+'</text>';
const polyline=(points,color,width=3)=>'<polyline points="'+points.map(p=>f(p[0])+','+f(p[1])).join(' ')+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linejoin="round" stroke-linecap="round"/>';
const dot=(x,y,color='#5865df',r=5)=>circle(x,y,r,color,'#fff',2);
const background=(w=640,h=260)=>'<rect width="'+w+'" height="'+h+'" fill="#fcfdff"/>';
const path=(points,fill,stroke='none',width=1)=>
  '<path d="'+points.map((p,i)=>(i?'L':'M')+f(p[0])+' '+f(p[1])).join(' ')+' Z" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'"/>';

export function renderRadian(radius,angleDeg){
  const g=radianAt(radius,angleDeg);
  const cx=296,cy=149,r=56+g.radius*39;
  let out=background(640,300);
  out+=circle(cx,cy,r,'#f6f7ff','#d9def7',2);
  out+=line(cx-r-19,cy,cx+r+19,cy,'#dfe3ef',1.5);
  out+=line(cx,cy-r-13,cx,cy+r+13,'#dfe3ef',1.5);
  const pts=[];
  const steps=Math.max(1,Math.ceil(g.degree/3));
  for(let i=0;i<=steps;i++){
    const a=g.radians*i/steps;
    pts.push([cx+r*Math.cos(a),cy-r*Math.sin(a)]);
  }
  if(g.degree>0)out+=path([[cx,cy],...pts],'#dfe6ff');
  out+=polyline(pts,'#ed9d51',5);
  out+=line(cx,cy,cx+r,cy,'#4f61cd',3);
  const end=pts[pts.length-1];
  out+=line(cx,cy,end[0],end[1],'#4f61cd',3);
  const marker=[],markerSteps=Math.max(1,Math.ceil(g.degree/7));
  for(let i=0;i<=markerSteps;i++){
    const a=g.radians*i/markerSteps;
    marker.push([cx+31*Math.cos(a),cy-31*Math.sin(a)]);
  }
  if(g.degree>0)out+=polyline(marker,'#7380d6',2.5);
  out+=dot(cx,cy,'#4f61cd',4)+dot(end[0],end[1],'#ed9d51',4);
  out+=text(cx+r/2,cy+23,'r = '+fmtOneDecimal(g.radius)+' birim','#4f61cd',13,'middle',800);
  const middle=g.radians/2,tx=cx+59*Math.cos(middle),ty=cy-59*Math.sin(middle)-7;
  out+='<rect x="'+f(tx-37)+'" y="'+f(ty-16)+'" width="74" height="23" rx="8" fill="#fff" fill-opacity=".92" stroke="#dfe4fa"/>';
  out+=text(tx,ty,g.degree+'°','#5260bd',13,'middle',800);
  // Yay uzunluğu etiketi, turuncu yayın orta noktasını izler.
  const anchorX=cx+r*Math.cos(middle),anchorY=cy-r*Math.sin(middle);
  let arcLabelX=clamp(anchorX+40*Math.cos(middle),73,567);
  let arcLabelY=clamp(anchorY-40*Math.sin(middle),16,284);
  // Küçük yarıçaplarda açı etiketiyle yay etiketi çakışmasın.
  const touchingAngle=Math.abs(arcLabelX-tx)<110&&Math.abs(arcLabelY-(ty-4.5))<31;
  if(touchingAngle){
    arcLabelX=clamp(arcLabelX+70*Math.cos(middle),73,567);
    arcLabelY=clamp(arcLabelY-70*Math.sin(middle),16,284);
  }
  out+=line(anchorX,anchorY,arcLabelX,arcLabelY,'#ed9d51',1.4);
  out+='<rect x="'+f(arcLabelX-69)+'" y="'+f(arcLabelY-15)+'" width="138" height="30" rx="9" fill="#fffaf5" fill-opacity=".97" stroke="#f2c99e"/>';
  out+=text(arcLabelX,arcLabelY+5,'s = '+fmt(g.arcLength)+' birim','#c87535',14,'middle',800);
  return out;
}

export function renderTriangle(angleDeg,highlight='sin'){
  if(highlight!=='sin'&&highlight!=='cos')throw new Error('Bilinmeyen oran: '+highlight);
  const g=triangleAt(angleDeg),ax=130,ay=214,scale=164;
  const bx=ax+g.adjacent*scale,by=ay,cx=bx,cy=ay-g.opposite*scale;
  const sine=highlight==='sin';
  let out=background(480,260);
  out+=path([[ax,ay],[bx,by],[cx,cy]],'#eff2ff','#c0c8ec',1);
  out+=line(ax,ay,bx,by,sine?'#bec7df':'#15a79d',sine?2.7:6);
  out+=line(bx,by,cx,cy,sine?'#ed9253':'#bec7df',sine?6:2.7);
  out+=line(ax,ay,cx,cy,'#5865df',4.1);
  const corner=Math.min(12,Math.max(3,Math.min(g.adjacent,g.opposite)*scale*.48));
  out+=polyline([[bx-corner,by],[bx-corner,by-corner],[bx,by-corner]],'#9aa5c4',1.8);
  out+=dot(ax,ay)+dot(bx,by)+dot(cx,cy);
  const theta=g.angle*DEG,arc=[];
  for(let i=0;i<=18;i++){
    const a=theta*i/18;
    arc.push([ax+35*Math.cos(a),ay-35*Math.sin(a)]);
  }
  out+=polyline(arc,'#e39a5b',2.5);
  const mid=theta/2,tx=ax+58*Math.cos(mid),ty=ay-58*Math.sin(mid)-18;
  out+='<rect x="'+f(tx-29)+'" y="'+f(ty-17)+'" width="58" height="24" rx="8" fill="#fff" fill-opacity=".94" stroke="#f5d9c5"/>';
  out+=text(tx,ty,g.angle+'°','#d98345',14,'middle',800);
  out+=text(ax+.69*(cx-ax)-17*g.opposite,ay+.69*(cy-ay)-17*g.adjacent,'1','#5664c8',16,'middle',800);
  if(sine)out+=text(bx+39,(by+cy)/2-5,'karşı','#d98851',14);
  else out+=text((ax+bx)/2,242,'komşu','#128b85',14);
  return out;
}

export function renderGraph(kind,angleDeg){
  if(kind!=='sin'&&kind!=='cos')throw new Error('Bilinmeyen grafik: '+kind);
  const g=trigAt(angleDeg),fn=kind==='sin'?Math.sin:Math.cos;
  const x0=44,x1=388,ymid=133,amp=89,cx=524,cy=133,r=79;
  const blue=kind==='sin'?'#e89455':'#15a79d';
  const value=kind==='sin'?g.sin:g.cos;
  let out=background(660,266);
  for(const y of [-1,0,1]){
    const yy=ymid-y*amp;
    out+=line(x0,yy,x1,yy,y===0?'#8791b1':'#e4e8f2',y===0?1.8:1,y===0?'':'3 4');
    out+=text(x0-11,yy+4,String(y),'#929aaf',11,'end');
  }
  for(const a of [0,90,180,270,360]){
    const xx=x0+(x1-x0)*a/360;
    out+=line(xx,34,xx,226,'#e8ebf4',1,'3 5');
    out+=text(xx,248,a+'°','#8d96b1',11);
  }
  const curve=[];
  for(let a=0;a<=360;a+=2)
    curve.push([x0+(x1-x0)*a/360,ymid-fn(a*DEG)*amp]);
  out+=polyline(curve,blue,3.7);
  const px=x0+(x1-x0)*g.angle/360,py=ymid-value*amp;
  out+=line(px,36,px,224,'#a9b1d6',1.5,'4 5')+dot(px,py,blue,6);
  out+=text(214,18,kind==='sin'?'y = sin x':'y = cos x','#5260b8',15,'middle',800);
  out+=circle(cx,cy,r,'#f7f9ff','#cbd3eb',1.8);
  out+=line(cx-r-10,cy,cx+r+10,cy,'#cfd5e8',1.4);
  out+=line(cx,cy-r-10,cx,cy+r+10,'#cfd5e8',1.4);
  const ux=cx+r*g.cos,uy=cy-r*g.sin;
  out+=path([[cx,cy],[ux,cy],[ux,uy]],'#e5eaff');
  out+=line(cx,cy,ux,uy,'#5865df',3);
  out+=line(cx,cy,ux,cy,kind==='cos'?'#12a59a':'#aeb8d7',kind==='cos'?5:3);
  out+=line(ux,cy,ux,uy,kind==='sin'?'#e89455':'#aeb8d7',kind==='sin'?5:3);
  out+=dot(ux,uy,blue,5);
  out+=text(cx,242,'α = '+fmt(g.referenceAngle)+'° (referans)','#838ca7',11);
  out+=text(cx,20,'Birim çember','#55638e',14,'middle',780);
  return out;
}

export function renderSpecialCircle(angleDeg){
  const g=trigAt(angleDeg),cx=170,cy=117,r=79;
  let out=background(340,240);
  out+=circle(cx,cy,r,'#f7f8ff','#d8ddef',2);
  out+=line(52,cy,288,cy,'#c8cfe2',1.5);
  out+=line(cx,24,cx,215,'#c8cfe2',1.5);
  const px=cx+r*g.cos,py=cy-r*g.sin;
  out+=path([[cx,cy],[px,cy],[px,py]],'#e8ecff');
  out+=line(cx,cy,px,py,'#5865df',3.2);
  out+=line(cx,cy,px,cy,'#15a79d',4);
  out+=line(px,cy,px,py,'#e89754',4);
  out+=dot(px,py,'#5865df',5);
  out+=text(302,cy+4,'x','#8b94ad',11);
  out+=text(cx+8,17,'y','#8b94ad',11);
  out+=text(cx,229,g.angle+'°','#5662c2',16);
  return out;
}

const valueBar=(label,value,y,color,scale=77)=>{
  const ox=470,w=value*scale,x=Math.min(ox,ox+w);
  return text(337,y+5,label,'#7f89a2',14,'start',700)+
    line(ox,y-16,ox,y+18,'#c7cede',1.5)+
    '<rect x="'+f(x)+'" y="'+f(y-11)+'" width="'+f(Math.max(.6,Math.abs(w)))+'" height="22" rx="5" fill="'+color+'" opacity=".9"/>'+
    text(613,y+5,fmt(value),'#59647b',12,'end',700);
};

export function renderExpression(operator,angleDeg){
  const g=expressionAt(operator,angleDeg),cx=148,cy=133,r=83;
  let out=background();
  out+=circle(cx,cy,r,'#f7f9ff','#d4daed',2);
  out+=line(37,cy,260,cy,'#cbd2e6',1.5)+line(cx,28,cx,239,'#cbd2e6',1.5);
  const px=cx+r*g.cos,py=cy-r*g.sin;
  if(operator==='product')
    out+='<rect x="'+f(Math.min(cx,px))+'" y="'+f(Math.min(cy,py))+'" width="'+f(Math.abs(px-cx))+'" height="'+f(Math.abs(py-cy))+'" fill="#c9b6ff" fill-opacity=".65" stroke="#9b85dd" stroke-width="1.2"/>';
  out+=line(cx,cy,px,py,'#5865df',3.5);
  out+=line(cx,cy,px,cy,'#15a79d',4);
  out+=line(px,cy,px,py,'#ed9855',4);
  out+=dot(px,py,'#5865df',5);
  out+=text(cx,252,'Birim çember · x = '+g.angle+'°','#8b94b0',11);
  out+=text(392,25,'İzdüşümlerin değerleri','#6f7997',13,'start',760);
  out+=valueBar('sin x',g.sin,78,'#ed9d51');
  out+=valueBar('cos x',g.cos,139,'#15a79d');
  out+=valueBar(operator==='sum'?'toplam':operator==='difference'?'fark':'çarpım',g.value,200,'#6672df');
  return out;
}

if(typeof document!=='undefined'){
  const cards=[...document.querySelectorAll('.trig-card[data-trig-kind]')];
  const running=new WeakMap();
  function updateCard(card){
    const kind=card.dataset.trigKind;
    const slider=card.querySelector('[data-angle]'),angle=Number(slider.value);
    slider.style.setProperty('--fill',(100*(angle-Number(slider.min))/(Number(slider.max)-Number(slider.min)))+'%');
    card.querySelector('[data-angle-output]').textContent=angle+'°';
    const svg=card.querySelector('[data-visual]');
    const main=card.querySelector('[data-main-value]');
    const detail=card.querySelector('[data-detail-value]');
    if(kind==='radian'){
      const radiusInput=card.querySelector('[data-radius]'),radius=Number(radiusInput.value);
      radiusInput.style.setProperty('--fill',(100*(radius-.5)/1.5)+'%');
      card.querySelector('[data-radius-output]').textContent=fmtOneDecimal(radius)+' br';
      const g=radianAt(radius,angle);
      svg.innerHTML=renderRadian(radius,angle);
      main.textContent='θ = '+radiansInPi(g.degree)+' ≈ '+fmt(g.radians)+' rad';
      detail.textContent='';
    }else if(kind==='sin-triangle'||kind==='cos-triangle'){
      const sine=kind==='sin-triangle',g=triangleAt(angle);
      svg.innerHTML=renderTriangle(angle,sine?'sin':'cos');
      main.textContent=(sine?'sin ':'cos ')+angle+'° = '+fmt(sine?g.opposite:g.adjacent);
      detail.textContent='';
    }else if(kind==='sin-graph'||kind==='cos-graph'){
      const sine=kind==='sin-graph',g=trigAt(angle);
      svg.innerHTML=renderGraph(sine?'sin':'cos',angle);
      main.textContent=(sine?'sin ':'cos ')+angle+'° = '+fmt(sine?g.sin:g.cos);
      detail.textContent='Referans açı: '+fmt(g.referenceAngle)+'° · '+(sine?'|karşı| / 1 = ':'|komşu| / 1 = ')+fmt(Math.abs(sine?g.sin:g.cos));
    }else{
      const g=expressionAt(kind,angle);
      svg.innerHTML=renderExpression(kind,angle);
      const label=kind==='sum'?'sin x + cos x':kind==='difference'?'sin x − cos x':'sin x × cos x';
      main.textContent=label+' = '+fmt(g.value);
      detail.textContent='sin x = '+fmt(g.sin)+' · cos x = '+fmt(g.cos);
    }
  }
  function stop(card){
    const frame=running.get(card);
    if(frame!==undefined){cancelAnimationFrame(frame);running.delete(card);}
  }
  function play(card){
    stop(card);
    const slider=card.querySelector('[data-angle]'),min=Number(slider.min),max=Number(slider.max);
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      slider.value=String(max);updateCard(card);return;
    }
    slider.value=String(min);updateCard(card);
    const start=performance.now(),duration=2100;
    function frame(now){
      const t=Math.min(1,(now-start)/duration);
      slider.value=String(Math.round(min+t*(max-min)));
      updateCard(card);
      if(t<1)running.set(card,requestAnimationFrame(frame));
      else running.delete(card);
    }
    running.set(card,requestAnimationFrame(frame));
  }
  for(const card of cards){
    const slider=card.querySelector('[data-angle]');
    slider.addEventListener('input',()=>{stop(card);updateCard(card);});
    const radius=card.querySelector('[data-radius]');
    if(radius)radius.addEventListener('input',()=>updateCard(card));
    card.querySelector('[data-play]').addEventListener('click',()=>play(card));
    updateCard(card);
  }
  const table=document.querySelector('[data-special-table]');
  if(table){
    const view=document.querySelector('[data-special-circle]');
    const readout=document.querySelector('[data-special-readout]');
    function selectAngle(angle){
      const found=SPECIAL_ANGLES.find(item=>item.angle===angle);
      if(!found)return;
      for(const row of table.querySelectorAll('tbody tr')){
        const selected=Number(row.dataset.deg)===angle;
        row.classList.toggle('is-selected',selected);
        row.querySelector('button').setAttribute('aria-pressed',selected?'true':'false');
      }
      view.innerHTML=renderSpecialCircle(angle);
      readout.textContent=angle+'° · sin = '+found.sin+' · cos = '+found.cos+
        ' · tan = '+found.tan+' · cot = '+found.cot;
    }
    table.addEventListener('click',event=>{
      const row=event.target.closest('tbody tr[data-deg]');
      if(row&&table.contains(row))selectAngle(Number(row.dataset.deg));
    });
    selectAngle(30);
  }
}
