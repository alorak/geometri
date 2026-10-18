import test from 'node:test';
import assert from 'node:assert/strict';
import {geometryAt,readingFor,renderShape,ROOT_TWO,HALF_PI} from '../app.mjs';

const approx=(actual,expected,eps=1e-10)=>assert.ok(Math.abs(actual-expected)<eps,actual+' ≠ '+expected);
const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);

test('1 birim doğru parçası',()=>{
  const g=geometryAt('segment',1);
  approx(distance(...g.vertices),1);
  approx(geometryAt('segment',.35).length,.35);
  approx(geometryAt('segment',2).length,1);
  approx(geometryAt('segment',-3).length,0);
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
  for(const t of [.15,.5,.75,1]){
    const g=geometryAt('root2',t);
    approx(distance(g.vertices[0],g.vertices[2]),ROOT_TWO);
    approx(distance(g.vertices[1],g.vertices[2]),ROOT_TWO);
    approx(distance(g.vertices[0],g.vertices[1]),t);
    approx(g.apexAngle+2*g.baseAngle,180);
  }
  approx(geometryAt('root2',1).apexAngle,2*Math.asin(1/(2*ROOT_TWO))*180/Math.PI);
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

test('her şekil 2B ve 3B SVG olarak üretilebilir',()=>{
  for(const kind of ['segment','right','equilateral','root2','square','quarter']){
    for(const mode of ['2d','3d']){
      const svg=renderShape(kind,1,mode,true);
      assert.ok(svg.includes('<rect'));
      assert.ok(svg.includes('stroke='));
      assert.ok(!svg.includes('NaN'));
      assert.ok(!svg.includes('Infinity'));
    }
    assert.ok(readingFor(kind,1).length>0);
  }
});
