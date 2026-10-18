import test from 'node:test';
import assert from 'node:assert/strict';
import {geometryAt,readingFor,renderShape,unitSegment,resizeSegment,dragSegment,classifyShape,ROOT_TWO,HALF_PI} from '../app.mjs';

const approx=(actual,expected,eps=1e-10)=>assert.ok(Math.abs(actual-expected)<eps,actual+' ≠ '+expected);
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);

test('doğru parçası uzunluğu sıfırdan 2,5 birime kadar değişir',()=>{
  for(const length of [0,.12,.35,1,1.75,2.5]){
    const g=geometryAt('segment',length);
    approx(distance(...g.vertices),length);
    approx(g.length,length);
  }
  approx(geometryAt('segment',3).length,2.5);
  approx(geometryAt('segment',-3).length,0);
  const rotated=unitSegment([0,0],90);
  const resized=resizeSegment(rotated,2.25);
  approx(distance(...resized),2.25);
  approx(resized[0][0],0);
});

test('A veya B hareket edince uzunluk değişir, gövde taşınınca korunur',()=>{
  const original=unitSegment([0,0],0);
  const movedA=dragSegment(original,'a',[-1,1]);
  approx(distance(...movedA),Math.hypot(1.5,1));
  assert.deepEqual(movedA[1],original[1]);
  const movedB=dragSegment(original,'b',[1,1]);
  approx(distance(...movedB),Math.hypot(1.5,1));
  assert.deepEqual(movedB[0],original[0]);
  const translated=dragSegment(movedA,'body',[.7,.4],[.1,.1]);
  approx(distance(...translated),distance(...movedA));
  approx(translated[0][0]-movedA[0][0],translated[1][0]-movedA[1][0]);
  approx(translated[0][1]-movedA[0][1],translated[1][1]-movedA[1][1]);
  assert.deepEqual(dragSegment(original,'a',original[1]),[original[1],original[1]]);
  const doubled=resizeSegment(original,2);
  approx(distance(...doubled),2);
  approx((doubled[0][0]+doubled[1][0])/2,0);
});

test('ikizkenar dik üçgen ve Pisagor',()=>{
  const g=geometryAt('right',1);
  approx(g.angle,90);
  approx(distance(g.vertices[0],g.vertices[1]),1);
  approx(distance(g.vertices[0],g.vertices[2]),1);
  approx(distance(g.vertices[1],g.vertices[2]),ROOT_TWO);
  approx(g.closingSide,ROOT_TWO);
  const mid=geometryAt('right',.5);
  approx(mid.angle,45);
  approx(mid.closingSide,Math.sqrt(2-2*Math.cos(Math.PI/4)));
});

test('eşkenar üçgenin bütün kenarları 1 ve bütün açıları 60°',()=>{
  const g=geometryAt('equilateral',1);
  approx(g.angle,60);
  approx(distance(g.vertices[0],g.vertices[1]),1);
  approx(distance(g.vertices[1],g.vertices[2]),1);
  approx(distance(g.vertices[2],g.vertices[0]),1);
  approx(geometryAt('equilateral',.5).angle,30);
});

test('√2 yan kenarlı ikizkenar üçgenin tabanı 1',()=>{
  for(const t of [.15,.5,.75,1,1.5,2,2.82]){
    const g=geometryAt('root2',t);
    approx(distance(g.vertices[0],g.vertices[2]),ROOT_TWO);
    approx(distance(g.vertices[1],g.vertices[2]),ROOT_TWO);
    approx(distance(g.vertices[0],g.vertices[1]),t);
    approx(g.apexAngle+2*g.baseAngle,180);
  }
  approx(geometryAt('root2',1).apexAngle,2*Math.asin(1/(2*ROOT_TWO))*180/Math.PI);
  approx(geometryAt('root2',2).apexAngle,90);
  assert.ok(geometryAt('root2',2.82).baseAngle<geometryAt('root2',1).baseAngle);
  approx(geometryAt('root2',2.82).base,2.82);
});

test('birim kare köşegeni √2 ve iki eş dik üçgen',()=>{
  const g=geometryAt('square',1);
  approx(g.area,1);
  approx(g.diagonal,ROOT_TWO);
  for(let i=0;i<4;i++)approx(distance(g.vertices[i],g.vertices[(i+1)%4]),1);
  const [a,b,c,d]=g.vertices;
  approx(Math.abs((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))/2,.5);
  approx(Math.abs((c[0]-a[0])*(d[1]-a[1])-(c[1]-a[1])*(d[0]-a[0]))/2,.5);
});

test('çeyrek çember yay, kiriş, radyan bağıntısı',()=>{
  const g=geometryAt('quarter',1);
  approx(g.angle,90);
  approx(g.theta,HALF_PI);
  approx(g.arc,Math.PI/2);
  approx(g.chord,ROOT_TWO);
  approx(4*g.arc,2*Math.PI);
  assert.ok(g.arc>g.chord);
  approx(g.end[0],0);
  approx(g.end[1],1);
  for(const t of [.1,.3,.7]){
    const part=geometryAt('quarter',t);
    approx(part.arc,part.angle*Math.PI/180);
    approx(part.chord,2*Math.sin(part.theta/2));
    assert.ok(part.arc>part.chord);
  }
});

test('her şekil 2B SVG olarak üretilebilir',()=>{
  for(const kind of ['segment','right','equilateral','root2','square','quarter']){
    for(const mode of ['2d']){
      const svg=renderShape(kind,1,mode,true);
      assert.ok(svg.includes('<rect'));
      assert.ok(svg.includes('stroke='));
      assert.ok(!svg.includes('NaN'));
      assert.ok(!svg.includes('Infinity'));
      if(kind==='segment')assert.ok(svg.includes('data-grab="body"'));
      if(kind==='root2'&&mode==='2d')assert.ok(svg.includes('angle-label'));
    }
    assert.ok(readingFor(kind,1).length>0);
  }
  const triangle=renderShape('right',1);
  assert.ok(triangle.includes('45,00°'));
  const equilateral=renderShape('equilateral',1);
  assert.ok(equilateral.includes('60,00°'));
  const square=renderShape('square',1);
  assert.ok(square.includes('90°'));
  assert.ok(square.includes('45,00°'));
  assert.ok(!square.includes('△ 1'));
  const quarter=renderShape('quarter',1);
  assert.ok(quarter.includes('yay 1,571'));
  assert.ok(quarter.includes('kiriş 1,414'));
  assert.ok(quarter.includes('90°'));
  const half=renderShape('quarter',.5);
  assert.ok(half.includes('yay 0,785'));
  assert.ok(half.includes('kiriş 0,765'));
});

test('dört etkileşimli çizimin sınıflandırması ideal ve ara konumlarda güncellenir',()=>{
  const cases=[
    ['right','İkizkenar dik üçgen','Dik olmayan ikizkenar üçgen','Henüz üçgen oluşmadı'],
    ['equilateral','Eşkenar üçgen','İkizkenar üçgen (eşkenar değil)','Henüz üçgen oluşmadı'],
    ['square','1 birimlik kare','Bir kenarı 1 birim olan dikdörtgen','Henüz dikdörtgen oluşmadı'],
    ['quarter','1 birimlik çeyrek çember',"90°'den küçük daire dilimi",'Henüz daire dilimi oluşmadı']
  ];
  for(const [kind,complete,partial,degenerate] of cases){
    assert.deepEqual(classifyShape(kind,1),{valid:true,label:complete});
    assert.deepEqual(classifyShape(kind,.01),{valid:false,label:partial});
    assert.deepEqual(classifyShape(kind,.5),{valid:false,label:partial});
    assert.deepEqual(classifyShape(kind,.99),{valid:false,label:partial});
    assert.deepEqual(classifyShape(kind,0),{valid:false,label:degenerate});
    assert.deepEqual(classifyShape(kind,-1),{valid:false,label:degenerate});
    assert.deepEqual(classifyShape(kind,2),{valid:true,label:complete});
  }
  assert.equal(classifyShape('segment',1),null);
  assert.equal(classifyShape('root2',1),null);
});
