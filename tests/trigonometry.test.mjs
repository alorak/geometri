import test from 'node:test';
import assert from 'node:assert/strict';
import {trigAt,radianAt,radiansInPi,triangleAt,expressionAt,SPECIAL_ANGLES,renderRadian,renderTriangle,renderGraph,renderSpecialCircle,renderExpression} from '../trigonometri.mjs';

const approx=(actual,expected,eps=1e-10)=>assert.ok(Math.abs(actual-expected)<eps,actual+' ≠ '+expected);

test('derece ile radyan ve yay/yarıçap ilişkisi',()=>{
  approx(radianAt(1,180).radians,Math.PI);
  approx(radianAt(1,180).arcLength,Math.PI);
  approx(radianAt(2,90).arcLength,Math.PI);
  approx(radianAt(.5,90).arcLength,Math.PI/4);
  for(const r of [.5,1,1.5,2]){
    for(const deg of [0,30,90,180,270,360]){
      const g=radianAt(r,deg);
      approx(g.arcLength/g.radius,g.radians);
      approx(g.radians,deg*Math.PI/180);
    }
  }
});

test('dik üçgende karşı ve komşu kenarların açıya göre oranı',()=>{
  for(const deg of [1,15,30,45,60,75,89]){
    const g=triangleAt(deg);
    approx(g.opposite,Math.sin(deg*Math.PI/180));
    approx(g.adjacent,Math.cos(deg*Math.PI/180));
    approx(g.opposite**2+g.adjacent**2,1);
    assert.equal(g.hypotenuse,1);
  }
  approx(triangleAt(30).opposite,.5);
  approx(triangleAt(60).adjacent,.5);
  assert.equal(triangleAt(0).angle,1);
  assert.equal(triangleAt(90).angle,89);
});

test('sin ve cos grafiği birim çember koordinatlarıyla aynıdır',()=>{
  for(let deg=0;deg<=360;deg+=5){
    const g=trigAt(deg);
    approx(g.sin**2+g.cos**2,1);
    approx(g.referenceAngle,Math.atan2(Math.abs(g.sin),Math.abs(g.cos))*180/Math.PI);
  }
  assert.equal(trigAt(0).sin,0);
  assert.equal(trigAt(90).cos,0);
  assert.equal(trigAt(180).sin,0);
  assert.equal(trigAt(270).cos,0);
  assert.equal(trigAt(360).sin,0);
  assert.equal(trigAt(270).sin,-1);
});

test('toplam, fark ve çarpımın trigonometrik özdeşlikleri',()=>{
  for(let deg=0;deg<=360;deg+=5){
    for(const operator of ['sum','difference','product']){
      const g=expressionAt(operator,deg);
      approx(g.value,g.equivalent);
    }
  }
  approx(expressionAt('sum',45).value,Math.SQRT2);
  approx(expressionAt('difference',135).value,Math.SQRT2);
  approx(expressionAt('product',45).value,.5);
  approx(expressionAt('product',135).value,-.5);
});

test('özel açı tablosunda tanımsız paydalar belirtilir',()=>{
  assert.equal(SPECIAL_ANGLES.length,17);
  const row=angle=>SPECIAL_ANGLES.find(value=>value.angle===angle);
  assert.equal(row(30).sin,'1/2');
  assert.equal(row(45).cos,'√2/2');
  assert.equal(row(60).tan,'√3');
  assert.equal(row(90).tan,'Tanımsız');
  assert.equal(row(270).tan,'Tanımsız');
  assert.equal(row(0).cot,'Tanımsız');
  assert.equal(row(180).cot,'Tanımsız');
  assert.equal(row(270).cot,'0');
  assert.equal(row(120).cos,'−1/2');
  assert.equal(row(225).tan,'1');
  assert.equal(row(330).cot,'−√3');
});

test('simülasyonların SVG çıktıları sonlu ve çizilebilir',()=>{
  for(const angle of [0,1,30,45,60,90,135,180,270,360]){
    const illustrations=[
      renderRadian(1.5,angle),
      renderGraph('sin',angle),renderGraph('cos',angle),
      renderSpecialCircle(angle),
      renderExpression('sum',angle),renderExpression('difference',angle),
      renderExpression('product',angle)
    ];
    for(const svg of illustrations){
      assert.ok(svg.includes('<line')||svg.includes('<polyline'));
      assert.ok(!svg.includes('NaN'));
      assert.ok(!svg.includes('Infinity'));
    }
  }
  for(const angle of [1,30,45,60,89]){
    assert.ok(renderTriangle(angle,'sin').includes('karşı'));
    assert.ok(renderTriangle(angle,'cos').includes('komşu'));
  }
});

test('açının π cinsinden gösterimi sadeleştirilir',()=>{
  const known=[
    [0,'0'],[1,'π/180'],[30,'π/6'],[45,'π/4'],[60,'π/3'],
    [90,'π/2'],[120,'2π/3'],[135,'3π/4'],[180,'π'],
    [225,'5π/4'],[270,'3π/2'],[360,'2π']
  ];
  for(const [degree,expected] of known)assert.equal(radiansInPi(degree),expected);
});

test('açı yazıları şeklin içinde kalır; yalnızca ilgili kenar etiketlenir',()=>{
  for(const degree of [1,30,45,60,84,89]){
    const sine=renderTriangle(degree,'sin');
    const cosine=renderTriangle(degree,'cos');
    assert.ok(sine.includes(degree+'°'));
    assert.ok(cosine.includes(degree+'°'));
    assert.ok(sine.includes('karşı'));
    assert.ok(!sine.includes('komşu'));
    assert.ok(cosine.includes('komşu'));
    assert.ok(!cosine.includes('karşı'));
    assert.ok(sine.includes('stroke="#e39a5b"'));
    const label=sine.match(/<rect x="([-\d.]+)" y="([-\d.]+)" width="58" height="24"/);
    assert.ok(label,'açı etiketi bulunamadı');
    const x=Number(label[1]),y=Number(label[2]);
    assert.ok(x>=0&&x+58<=480);
    assert.ok(y>=0&&y+24<=260);
  }
  for(const degree of [0,30,90,180,270,360]){
    const svg=renderRadian(1,degree);
    assert.ok(svg.includes(degree+'°'),'çemberde açı değeri görünmeli');
    assert.ok(svg.includes('stroke="#7380d6"')||degree===0);
  }
});

test('yay uzunluğu doğrudan turuncu yayda ve yarıçap tek ondalıkla görünür',()=>{
  const three=value=>new Intl.NumberFormat('tr-TR',{minimumFractionDigits:3,maximumFractionDigits:3}).format(value);
  const one=value=>new Intl.NumberFormat('tr-TR',{minimumFractionDigits:1,maximumFractionDigits:1}).format(value);
  for(const [radius,angle] of [[.5,0],[.5,30],[.9,93],[1,90],[1.4,120],[2,180],[2,270],[2,360]]){
    const g=radianAt(radius,angle),svg=renderRadian(radius,angle);
    assert.ok(svg.includes('r = '+one(g.radius)+' birim'));
    assert.ok(svg.includes('s = '+three(g.arcLength)+' birim'));
    assert.ok(svg.includes(angle+'°'));
    assert.ok(!svg.includes('YAY UZUNLUĞU'));
    assert.ok(!svg.includes('r = 1 → s = θ (sayıca)'));
    assert.ok(!svg.includes('s = '+three(g.radians)+' r'));
    const label=svg.match(/<rect x="([0-9.-]+)" y="([0-9.-]+)" width="138" height="30"/);
    assert.ok(label,'turuncu yay etiketi bulunamadı');
    const x=Number(label[1]),y=Number(label[2]);
    assert.ok(x>=0&&x+138<=640,'yay etiketi yatay sınırlar içinde');
    assert.ok(y>=0&&y+30<=300,'yay etiketi düşey sınırlar içinde');
  }
});
