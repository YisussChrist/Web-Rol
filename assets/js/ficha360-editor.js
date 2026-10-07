/* Complementos por identidad estable. No modifica los archivos originales. */
(() => {
  'use strict';
  const KEY = 'rp-ficha360-edits-v1';
  const common = [
    ['name','Nombre completo'], ['alias','Alias'], ['age','Edad','number'],
    ['gender','Género'], ['race','Raza o especie'], ['status','Estado'],
    ['role','Ocupación o rol'], ['affiliation','Afiliación'], ['origin','Lugar de origen'],
    ['description','Descripción','textarea'], ['image','Imagen (ruta o enlace)'],
    ['isChild','Marcar como hijo/a','boolean']
  ];
  const specific = {
    inazuma: [['team','Equipo'],['position','Posición'],['number','Dorsal','number'],['element','Elemento'],['goals','Goles','number'],['assists','Asistencias','number'],['techniques','Técnicas','lines'],['talent','Talento','textarea'],['spirit','Espíritu guerrero'],['miximax','Miximax']],
    dragonball: [['basePower','Poder base','number'],['transformations','Transformaciones','lines'],['seals','Sellos','lines']],
    pokemon: [['title','Título'],['region','Región'],['location','Ubicación'],['style','Estilo'],['goal','Objetivo','textarea'],['pokemonTeam','Equipo Pokémon','lines'],['reserves','Reservas','lines'],['badges','Medallas','lines']]
  };
  const fields = [...common,...Object.values(specific).flat()];
  const definitions = new Map(fields.map(([id,label,type='text'])=>[id,{id,label,type}]));
  const missing = value => value === '' || value === undefined || value === null || ['sin clasificar','sin registrar','pendiente','sin confirmar','?'].includes(String(value).trim().toLowerCase());
  const clean = value => missing(value) ? '' : value;
  const text = value => String(value ?? '');
  const names = list => (list || []).map(item=>typeof item==='string'?item:item.name||item.nombre||'').filter(Boolean);
  function safeImage(value) {
    const path=text(value).trim();
    return !path || (!/[\u0000-\u001f\\]/.test(path) && !path.startsWith('//') && (!/^[a-z][a-z0-9+.-]*:/i.test(path) || /^https?:\/\//i.test(path)));
  }
  function base(record) {
    const i=record.inazuma,d=record.dragon,p=record.pokemon;
    return {
      name:record.name, alias:d?.alias||'', age:'', gender:({M:'Masculino',F:'Femenino'}[record.childData?.genero]||''),
      race:clean(d?.race)||'',status:i?.status||d?.status||p?.status||'',
      role:d?.role||i?.title||p?.title||record.relationIdentity?.role||'', affiliation:d?.affiliation||'', origin:'',
      description:p?.summary||i?.notes||d?.notes||record.childData?.descripcion||'', image:record.image||'', isChild:record.isChild,
      team:i?.team||'',position:i?.position||i?.positionGroup||'',number:i?.number??'',element:i?.element||'',goals:i?.goals??'',assists:i?.assists??'',
      techniques:names(i?.techniques),talent:i?.talent?.nombre||'',spirit:i?.spirit?.nombre||'',miximax:i?.miximax?.nombre||'',
      basePower:d?.basePower??'',transformations:names(d?.transformations),seals:names(d?.seals),
      title:p?.title||'',region:p?.region||'',location:p?.location||'',style:p?.style||'',goal:p?.goal||'',
      pokemonTeam:names(p?.team),reserves:names(p?.reserves),badges:names(p?.badges)
    };
  }
  function validate(data) {
    if (!data || data.version!==1 || !data.characters || Array.isArray(data.characters) || typeof data.characters!=='object') throw new Error('La copia no tiene el formato de Ficha 360. Importa una copia JSON descargada desde esta página.');
    const result=Object.create(null);
    for(const [key,patch] of Object.entries(data.characters)) {
      if(!key || ['__proto__','prototype','constructor'].includes(key) || !patch || Array.isArray(patch) || typeof patch!=='object') throw new Error('La copia contiene una ficha inválida.');
      const valid=Object.create(null);
      for(const [id,value] of Object.entries(patch)) {
        const field=definitions.get(id);
        if(!field) throw new Error(`Campo no reconocido: ${id}`);
        // Null is an explicit return to the live original, including over a published edit.
        if(value===null){valid[id]=null;continue;}
        if(field.type==='boolean') {if(typeof value!=='boolean')throw new Error('La marca de hijo/a debe ser sí o no.');valid[id]=value;}
        else if(field.type==='number') {if(value!=='' && (typeof value!=='number'||!Number.isFinite(value)||value<0||!Number.isSafeInteger(value)))throw new Error(`${field.label}: utiliza un entero positivo o déjalo pendiente.`);valid[id]=value;}
        else if(field.type==='lines') {if(!Array.isArray(value)||value.length>200||value.some(v=>typeof v!=='string'||v.length>500))throw new Error(`${field.label}: lista inválida.`);valid[id]=value.map(v=>v.trim()).filter(Boolean);}
        else {if(typeof value!=='string'||value.length>10000)throw new Error(`${field.label}: texto inválido.`);valid[id]=value.trim();}
        if(id==='image'&&!safeImage(valid[id]))throw new Error('La imagen debe ser una ruta local o un enlace http/https.');
        if(id==='name'&&!valid[id])throw new Error('El nombre no puede quedar vacío.');
      }
      result[key]=valid;
    }
    return result;
  }
  let saved=Object.create(null),local=Object.create(null),storageError='',records=[],onChange=()=>{};
  try { saved=validate(window.FICHA360_DATA||{version:1,characters:{}}); } catch(e){storageError=e.message;}
  try { const raw=localStorage.getItem(KEY);if(raw)local=validate(JSON.parse(raw)); } catch(e){storageError='No se pudieron leer los cambios locales. Descarga una copia de los datos disponibles antes de continuar.';}
  const overrides=key=>Object.fromEntries(Object.entries({...saved[key],...local[key]}).filter(([,value])=>value!==null));
  const values=record=>({...base(record),...overrides(record.key)});
  function completion(record) {
    const v=values(record), ids=['name','age','gender','race','status','role','origin','description'];
    if(record.inazuma)ids.push('team','position','element');
    if(record.dragon)ids.push('basePower');
    if(record.pokemon)ids.push('region','goal');
    const pending=ids.filter(id=>missing(v[id]));
    return {percent:Math.round(100*(ids.length-pending.length)/ids.length),pending:pending.map(id=>definitions.get(id).label)};
  }
  function mergeNames(original, list) {
    return list.map(name=>{const old=(original||[]).find(item=>(typeof item==='string'?item:item.name||item.nombre)===name);return typeof old==='object'?{...old}: {name};});
  }
  function effective(record) {
    const v=values(record),patch=overrides(record.key),r={...record,name:v.name,image:safeImage(v.image)?v.image:'',isChild:v.isChild,details:v};
    if(record.inazuma){r.inazuma={...record.inazuma,team:v.team,position:v.position,positionGroup:v.position,number:v.number,element:v.element,status:v.status,title:v.role,notes:v.description,goals:v.goals,assists:v.assists};
      if('techniques'in patch)r.inazuma.techniques=mergeNames(record.inazuma.techniques,v.techniques);
      for(const id of ['talent','spirit','miximax'])if(id in patch)r.inazuma[id]={...record.inazuma[id],nombre:v[id]};
    }
    if(record.dragon){r.dragon={...record.dragon,race:v.race,alias:v.alias,status:v.status,role:v.role,affiliation:v.affiliation,basePower:v.basePower,notes:v.description};if('transformations'in patch)r.dragon.transformations=mergeNames(record.dragon.transformations,v.transformations);if('seals'in patch)r.dragon.seals=v.seals;}
    if(record.pokemon){r.pokemon={...record.pokemon,title:v.title,region:v.region,location:v.location,style:v.style,goal:v.goal,status:v.status,summary:v.description};for(const [id,target] of [['pokemonTeam','team'],['reserves','reserves'],['badges','badges']])if(id in patch)r.pokemon[target]=mergeNames(record.pokemon[target],v[id]);}
    return r;
  }
  function status(message) {document.getElementById('saveStatus').textContent=message;}
  function persist(next) {
    try {localStorage.setItem(KEY,JSON.stringify({version:1,characters:next}));local=next;storageError='';return true;}
    catch(e){status('No se pudo guardar: el almacenamiento del navegador está bloqueado o lleno. El formulario sigue abierto para que puedas conservar lo escrito.');return false;}
  }
  function snapshot(publishing=false) {const all=Object.create(null);for(const key of new Set([...Object.keys(saved),...Object.keys(local)]))all[key]=publishing?overrides(key):{...saved[key],...local[key]};return {version:1,characters:all};}
  function download(filename,content,type) {const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  let dialog,form,editing=null,start='',inherit=new Set();
  const fieldNodes=new Map();
  function closeEditor() {if(JSON.stringify(readForm())!==start&&!window.confirm('Hay cambios sin guardar. ¿Quieres descartarlos?'))return;dialog.close();}
  function readForm() {
    const patch={};
    for(const [id,input] of fieldNodes){if(inherit.has(id))continue;const type=definitions.get(id).type;patch[id]=type==='boolean'?input.checked:type==='number'?(input.value===''?'':Number(input.value)):type==='lines'?input.value.split('\n').map(v=>v.trim()).filter(Boolean):input.value.trim();}
    return patch;
  }
  function open(record) {
    editing=record;inherit=new Set();fieldNodes.clear();form.replaceChildren();
    document.getElementById('editor360Title').textContent=`Editar · ${values(record).name}`;
    const data=values(record),original=base(record),groups=[['Identidad',common],...Object.entries(specific).filter(([id])=>record.universes.has(id)).map(([id,fields])=>[{inazuma:'Inazuma',dragonball:'Dragon Ball',pokemon:'Pokémon'}[id],fields])];
    for(const [title,group] of groups) {
      const section=document.createElement('fieldset'),legend=document.createElement('legend');legend.textContent=title;section.append(legend);
      for(const [id,label,type='text'] of group){const wrapper=document.createElement('div');wrapper.className=`editor-field ${['textarea','lines'].includes(type)?'full':''}`;
        const lab=document.createElement('label');lab.htmlFor=`edit360-${id}`;lab.textContent=label;
        const input=document.createElement(['textarea','lines'].includes(type)?'textarea':'input');input.id=`edit360-${id}`;input.name=id;
        if(type==='boolean'){input.type='checkbox';input.checked=data[id];}else {if(input.tagName==='INPUT')input.type=type==='number'?'number':'text';input.value=type==='lines'?data[id].join('\n'):text(data[id]);if(type==='number'){input.min='0';input.step='1';input.max=String(Number.MAX_SAFE_INTEGER);}else input.maxLength=10000;input.placeholder='Pendiente';}
        if(id==='name')input.required=true;
        input.addEventListener('input',()=>inherit.delete(id));fieldNodes.set(id,input);
        const hint=document.createElement('small');hint.textContent=type==='lines'?'Una entrada por línea. Las entradas que conservan su nombre mantienen sus detalles originales.':type==='boolean'?'La marca se muestra en el directorio y en la ficha.':`Original: ${text(original[id])||'Pendiente'}`;
        const reset=document.createElement('button');reset.type='button';reset.className='inherit-button';reset.textContent='Usar original';reset.addEventListener('click',()=>{inherit.add(id);if(type==='boolean')input.checked=original[id];else input.value=type==='lines'?original[id].join('\n'):text(original[id]);});
        wrapper.append(lab,input,hint,reset);section.append(wrapper);
      }
      form.append(section);
    }
    const error=document.createElement('p');error.id='editor360Error';error.setAttribute('role','alert');form.append(error);
    const actions=document.createElement('div');actions.className='editor-actions';const save=document.createElement('button');save.type='submit';save.textContent='Guardar cambios';const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancelar';cancel.addEventListener('click',closeEditor);actions.append(save,cancel);form.append(actions);
    start=JSON.stringify(readForm());dialog.showModal();
  }
  function init(list,changed) {
    records=list;onChange=changed;
    dialog=document.createElement('dialog');dialog.id='editor360Dialog';dialog.setAttribute('aria-labelledby','editor360Title');
    dialog.innerHTML='<header class="editor-dialog-head"><h2 id="editor360Title">Editar ficha</h2><button type="button" aria-label="Cerrar editor">×</button></header><p class="editor-help">Puedes completar o corregir los datos. Vaciar un campo lo deja pendiente; «Usar original» recupera el valor de su fuente. Estos cambios se aplican a Ficha 360 y se guardan en este navegador.</p>';
    form=document.createElement('form');dialog.append(form);document.body.append(dialog);
    dialog.querySelector('button').addEventListener('click',closeEditor);dialog.addEventListener('cancel',event=>{event.preventDefault();closeEditor();});
    form.addEventListener('submit',event=>{
      event.preventDefault();const input=readForm(),original=base(editing),before=overrides(editing.key),patch={...before};
      for(const id of fieldNodes.keys()){if(inherit.has(id))delete patch[id];else if(JSON.stringify(input[id])!==JSON.stringify(values(editing)[id]))patch[id]=input[id];}
      for(const id of Object.keys(saved[editing.key]||{}))if(!(id in patch))patch[id]=null;
      try {const valid=validate({version:1,characters:{[editing.key]:patch}});if(!persist({...local,...valid})){document.getElementById('editor360Error').textContent='No se ha podido guardar. Revisa el aviso de almacenamiento; no cierres el editor.';return;}dialog.close();status(`Cambios de ${values(editing).name} guardados en este navegador. Descarga una copia para conservarlos.`);onChange();}
      catch(e){document.getElementById('editor360Error').textContent=e.message;}
    });
    document.getElementById('export360').addEventListener('click',()=>{download('ficha360-copia.json',JSON.stringify(snapshot(),null,2),'application/json');status('Copia descargada. Puedes importarla desde Ficha 360 en otro navegador o dispositivo.');});
    document.getElementById('publish360').addEventListener('click',()=>{download('ficha360-datos.js',`/* Generado desde Ficha 360. */\nwindow.FICHA360_DATA = ${JSON.stringify(snapshot(true),null,2)};\n`,'text/javascript');status('Archivo descargado. Para compartir los cambios con todos, sustituye ficha360-datos.js en el proyecto y publica la web. La descarga no publica automáticamente.');});
    const file=document.getElementById('import360File');document.getElementById('import360').addEventListener('click',()=>file.click());
    file.addEventListener('change',async()=>{const selected=file.files[0];if(!selected)return;try {if(selected.size>5000000)throw new Error('La copia supera los 5 MB.');const incoming=validate(JSON.parse(await selected.text())),known=new Set(records.map(r=>r.key)),keys=Object.keys(incoming);if(!keys.length)throw new Error('La copia no contiene cambios.');const conflicts=keys.filter(key=>Object.keys(overrides(key)).some(id=>id in incoming[key]&&JSON.stringify(overrides(key)[id])!==JSON.stringify(incoming[key][id])));if(conflicts.length&&!window.confirm(`La copia modifica ${conflicts.length} ficha(s) con datos personalizados. ¿Quieres combinarla dando prioridad a los campos importados?`))return;const next={...local};for(const key of keys)next[key]={...local[key],...incoming[key]};if(!persist(next))return;onChange();status(`Copia importada: ${keys.filter(k=>known.has(k)).length} fichas actualizadas. ${keys.filter(k=>!known.has(k)).length} identidades no disponibles conservadas en la copia.`);}catch(e){status(`No se importó la copia. ${e.message}`);}finally{file.value='';}});
    if(storageError)status(storageError);
  }
  window.Ficha360Editor={init,effective,values,completion,open,validate,base};
})();
