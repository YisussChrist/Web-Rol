const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/ficha360-editor.js'), 'utf8');
const original = {key:'personaje hijo familia',name:'Personaje',isChild:true,image:'',universes:new Set(['dragonball']),dragon:{race:'Sin clasificar',basePower:0,status:'Activo',transformations:[{name:'Forma',power:123}],seals:[]}};
function load(published={},local={}) {
  const context={window:{FICHA360_DATA:{version:1,characters:published}},localStorage:{getItem:()=>JSON.stringify({version:1,characters:local})}};
  vm.runInNewContext(source,context);
  return context.window.Ficha360Editor;
}
const edit=load({[original.key]:{race:'Saiyajin',age:20}},{[original.key]:{name:'Nombre nuevo',race:'Humano',age:0,description:'Texto <b>literal</b>',transformations:['Forma','Nueva forma']}});
const view=edit.effective(original);
assert.equal(view.key,original.key);
assert.equal(view.name,'Nombre nuevo');
assert.equal(view.dragon.race,'Humano');
assert.equal(view.details.age,0);
assert.equal(view.isChild,true);
assert.equal(view.dragon.transformations[0].power,123);
assert.equal(view.dragon.transformations[1].name,'Nueva forma');
assert.equal(original.dragon.race,'Sin clasificar');
assert.equal(edit.effective({...original,key:'otro'}).name,'Personaje','No mezcla homónimos con claves distintas');
const cleared=load({}, {[original.key]:{race:'',basePower:'',isChild:false}});
assert.equal(cleared.effective(original).dragon.race,'');
assert.equal(cleared.effective(original).dragon.basePower,'');
assert.equal(cleared.effective(original).isChild,false);
const inherited=load({[original.key]:{race:'Editado'}},{[original.key]:{race:null}});
assert.equal(inherited.effective({...original,dragon:{...original.dragon,race:'Original actualizado'}}).dragon.race,'Original actualizado');
assert(cleared.completion(original).pending.includes('Raza o especie'));
assert(cleared.completion(original).pending.includes('Poder base'));
assert(!load().completion(original).pending.includes('Poder base'),'El cero cuenta como dato');
for(const patch of [{age:-1},{age:'20'},{image:'javascript:alert(1)'},{image:'//external.test/x'},{isChild:'sí'},{name:''},{unknown:'x'},{techniques:[{}]}])assert.throws(()=>edit.validate({version:1,characters:{x:patch}}));
const valid={version:1,characters:{[original.key]:{race:'Humano',isChild:true,basePower:1000}}};
const roundtrip=edit.validate(JSON.parse(JSON.stringify(valid)));
assert.equal(roundtrip[original.key].race,'Humano');
assert.throws(()=>edit.validate({version:2,characters:{}}));
console.log('OK: prioridad, recarga, homónimos, campos vacíos, cero, integridad de fuentes y validación de copias.');

// Exercise the actual import/export callbacks without writing a user's browser data.
async function transferTests() {
  const elements=new Map(),downloads=[];
  function element(){return {listeners:{},append(){},remove(){},setAttribute(){},querySelector(){return element();},addEventListener(type,handler){this.listeners[type]=handler;},click(){if(this.download)downloads.push(this.download);}};}
  const document={body:element(),createElement:element,getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);}};
  let stored=null,blob,failWrite=false,changes=0;
  const context={document,Blob,URL:{createObjectURL(value){blob=value;return 'blob:test';},revokeObjectURL(){}},setTimeout(){},localStorage:{getItem(){return null;},setItem(key,value){if(failWrite)throw new Error('full');stored=JSON.parse(value);}},window:{FICHA360_DATA:{version:1,characters:{}},confirm(){return true;}}};
  vm.runInNewContext(source,context);const api=context.window.Ficha360Editor;api.init([original],()=>changes++);
  const file=document.getElementById('import360File');
  const importData=async data=>{file.files=[{size:200,text:async()=>JSON.stringify(data)}];await file.listeners.change();};
  await importData({version:1,characters:{[original.key]:{race:'Humano',age:32}}});
  assert.equal(api.effective(original).dragon.race,'Humano');assert.equal(changes,1);assert.equal(stored.characters[original.key].age,32);
  failWrite=true;
  await importData({version:1,characters:{[original.key]:{race:'Otro'}}});
  assert.equal(api.effective(original).dragon.race,'Humano','Un fallo de escritura no debe aplicar cambios');
  failWrite=false;
  await importData({version:1,characters:{[original.key]:{age:-2}}});
  assert.equal(api.values(original).age,32,'Una copia inválida no debe alterar datos');
  document.getElementById('export360').listeners.click();
  assert.equal(downloads.at(-1),'ficha360-copia.json');
  assert.equal(JSON.parse(await blob.text()).characters[original.key].race,'Humano');
  document.getElementById('publish360').listeners.click();
  const exported={window:{}};vm.runInNewContext(await blob.text(),exported);
  assert.equal(exported.window.FICHA360_DATA.characters[original.key].age,32);
  const reloaded=load(exported.window.FICHA360_DATA.characters);
  assert.equal(reloaded.effective(original).dragon.race,'Humano');
  console.log('OK: importación y exportación reales, recarga del archivo publicado y guardado fallido sin pérdida.');
}
transferTests().catch(error=>{console.error(error);process.exitCode=1;});
