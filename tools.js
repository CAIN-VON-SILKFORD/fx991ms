/* fx-991MS tools: CALC, SOLVE, constants, metric conversion */
(()=>{
const f=v=>fmt(v),VARS='ABCDEFXY'.split('');
const norm=t=>t.replace(/\s+/g,'').replace(/sqrt\(/gi,'√(').replace(/cbrt\(/gi,'∛(').replace(/(?<![A-Za-z])pi(?![A-Za-z])/gi,'π').replace(/(?<![A-Za-z])ans(?![A-Za-z])/gi,'Ans').replace(/(?<![A-Za-z])x(?![A-Za-z(])/g,'X').replace(/(?<![A-Za-z])y(?![A-Za-z(])/g,'Y').replace(/\*/g,'×').replace(/\//g,'÷').replace(/-/g,'−');
const val=s=>{s=String(s).trim();if(!s)return 0;return/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(s)?parseFloat(s):calc(norm(s))};
const setVars=v=>{for(const k in v)if(String(v[k]).trim())st.mem[k]=val(v[k])};
function evalExpr(t,v){setVars(v);const r=calc(norm(t));st.ans=st.lastv=r;return r}
function solveEq(t,v,g){
  setVars(v);const i=t.indexOf('=');if(i<1||i===t.length-1)throw 0;
  const l=norm(t.slice(0,i)),r=norm(t.slice(i+1));
  const F=x=>{st.mem.X=x;return calc(l)-calc(r)},sc=()=>1+Math.abs(calc(l))+Math.abs(calc(r));
  const good=x=>{try{return Math.abs(F(x))<=1e-9*sc()}catch(e){return false}};
  let x=g;
  try{for(let k=0;k<100;k++){const y=F(x);if(!isFinite(y))throw 0;if(Math.abs(y)<=1e-12*sc())break;
    const h=1e-6*Math.max(1,Math.abs(x)),d=(F(x+h)-F(x-h))/(2*h);if(!d||!isFinite(d))throw 0;
    const nx=x-y/d;if(Math.abs(nx-x)<1e-14*(1+Math.abs(x))){x=nx;break}x=nx}}catch(e){}
  if(!isFinite(x)||Math.abs(x)>1e9||!good(x)){
    const pts=[];for(let a=g-1000;a<=g+1000;a+=.5){try{const y=F(a);if(isFinite(y))pts.push([a,y])}catch(e){}}
    let bp=null;
    for(let k=1;k<pts.length;k++){const p=pts[k-1],q=pts[k];if(q[0]-p[0]<=.5&&p[1]*q[1]<=0){const d=Math.abs((p[0]+q[0])/2-g);if(!bp||d<bp[0])bp=[d,p[0],q[0],p[1]]}}
    if(!bp)throw 0;
    let lo=bp[1],hi=bp[2],fl=bp[3];
    for(let k=0;k<200;k++){const m=(lo+hi)/2,fm=F(m);if(fm===0){lo=hi=m;break}if(fl*fm<0)hi=m;else{lo=m;fl=fm}}
    x=(lo+hi)/2;if(!good(x))throw 0;
  }
  st.mem.X=x;return x;
}
const CS=[['c','speed of light',299792458,'m/s'],['h','Planck constant',6.62607015e-34,'J·s'],['e','elementary charge',1.602176634e-19,'C'],['k','Boltzmann constant',1.380649e-23,'J/K'],['NA','Avogadro constant',6.02214076e23,'1/mol'],['R','gas constant',8.314462618,'J/(mol·K)'],['G','gravitational constant',6.6743e-11,'m³/(kg·s²)'],['g','standard gravity',9.80665,'m/s²'],['me','electron mass',9.1093837015e-31,'kg'],['mp','proton mass',1.67262192369e-27,'kg'],['mn','neutron mass',1.67492749804e-27,'kg'],['ε0','vacuum permittivity',8.8541878128e-12,'F/m'],['μ0','vacuum permeability',1.25663706212e-6,'N/A²'],['F','Faraday constant',96485.33212,'C/mol'],['a0','Bohr radius',5.29177210903e-11,'m'],['u','atomic mass unit',1.6605390666e-27,'kg'],['σ','Stefan–Boltzmann',5.670374419e-8,'W/(m²·K⁴)'],['R∞','Rydberg constant',10973731.56816,'1/m'],['μB','Bohr magneton',9.2740100783e-24,'J/T'],['Vm','molar volume (ideal gas, 0 °C, 1 atm)',0.022413969545,'m³/mol'],['atm','standard atmosphere',101325,'Pa']];
const P=(a,b,k)=>[a,b,x=>x*k,x=>x/k];
const CV=[P('in','cm',2.54),P('ft','m',0.3048),P('yd','m',0.9144),P('mile','km',1.609344),P('acre','m²',4046.8564224),P('gal (US)','L',3.785411784),P('oz','g',28.349523125),P('lb','kg',0.45359237),P('atm','Pa',101325),P('mmHg','Pa',133.322387415),P('hp','W',745.69987158227),P('cal','J',4.184),P('kgf','N',9.80665),P('knot','km/h',1.852),P('km/h','m/s',1/3.6),P('eV','J',1.602176634e-19),P('light-year','m',9460730472580800),P('°','rad',Math.PI/180),['°C','°F',x=>x*9/5+32,x=>(x-32)*5/9]];
const CVO=[];CV.forEach(([a,b,fw,bw])=>{CVO.push([a+' → '+b,fw,b]);CVO.push([b+' → '+a,bw,a])});
globalThis.fxTools={evalExpr,solveEq,CS,CVO,val};
/* ---- panel UI (reuses the styles from modes.js) ---- */
const dlg=document.createElement('dialog');dlg.className='fxd';document.body.append(dlg);
const $d=id=>dlg.querySelector('#'+id),fld=(id,l,v)=>'<div><label>'+l+'</label><input id="'+id+'" value="'+(v||'')+'" autocomplete="off"></div>';
function shell(title,body,fn,mount){
  dlg.innerHTML='<h2>'+title+'</h2>'+body+'<button id="r">Calculate</button> <button class="x" id="c">Close</button><pre id="o" role="status"></pre>';
  $d('c').onclick=()=>dlg.close();
  $d('r').onclick=()=>{let t;try{t=fn()}catch(e){t='Math ERROR'}$d('o').textContent=t};
  if(mount)mount();
  if(!dlg.open)dlg.showModal();
}
const vf=ks=>'<div class="g">'+ks.map(k=>fld('v'+k,k,String(st.mem[k]))).join('')+'</div>',rv=ks=>Object.fromEntries(ks.map(k=>[k,$d('v'+k).value]));
const AF=['A','B','C','D','E','F'];
const put=v=>{ins(String(v).replace('e','ᴇ'));dlg.close();draw()};
const tools=[
 ['CALC',()=>shell('CALC','<label>Expression (uses A–F, X, Y, M)</label><input id="e" value="'+st.t.join('')+'" autocomplete="off">'+vf(VARS),()=>f(evalExpr($d('e').value,rv(VARS))))],
 ['SOLVE',()=>shell('SOLVE','<label>Equation in X, for example X^2=9</label><input id="e" autocomplete="off">'+fld('g','Starting guess for X','1')+vf(AF),()=>'X = '+f(solveEq($d('e').value,rv(AF),val($d('g').value))))],
 ['CONST',()=>shell('CONST','<label>Constant</label><select id="s">'+CS.map((c,i)=>'<option value="'+i+'">'+c[0]+' – '+c[1]+'</option>').join('')+'</select><button id="i">Insert into expression</button>',()=>{const c=CS[+$d('s').value];return c[0]+' = '+f(c[2])+' '+c[3]},()=>{$d('i').onclick=()=>put(CS[+$d('s').value][2])})],
 ['CONV',()=>shell('CONV','<label>Conversion</label><select id="s">'+CVO.map((o,i)=>'<option value="'+i+'">'+o[0]+'</option>').join('')+'</select>'+fld('n','Value','1')+'<button id="i">Insert result</button>',()=>{const o=CVO[+$d('s').value];return f(o[1](val($d('n').value)))+' '+o[2]},()=>{$d('i').onclick=()=>{try{put(CVO[+$d('s').value][1](val($d('n').value)))}catch(e){$d('o').textContent='Math ERROR'}}})]
];
const row=document.createElement('div');row.className='pad';row.style.cssText='grid-template-columns:repeat(4,1fr);gap:4px 7px';
tools.forEach(([l,fn])=>{const d=document.createElement('div');d.className='k';const b=document.createElement('button');b.type='button';b.textContent=l;b.onclick=()=>fn();d.append(b);row.append(d)});
host.insertBefore(row,host.children[6]);
const hint=document.querySelector('.hint');
if(hint)hint.append(' CALC, SOLVE, CONST and CONV also open panels. CONST and CONV can insert a value into your expression.');
})();
