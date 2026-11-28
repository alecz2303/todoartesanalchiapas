import { useEffect, useRef, useState } from 'react';
import { Check, Package, Plus, Search, Trash2 } from 'lucide-react';
import { money, newItem, type Item, type Order } from './model';
import './product-fields.css';
type Product={id:number;description:string;measures:string;unit_price:number};
export default function ProductFields({draft,update,csrf,onSessionExpired}:{draft:Order;update:(patch:Partial<Order>)=>void;csrf:string;onSessionExpired:()=>void}){
 const [products,setProducts]=useState<Product[]>([]);
 const [openRowId,setOpenRowId]=useState<string|null>(null);
 const [message,setMessage]=useState('');
 const [saving,setSaving]=useState(false);
 const [ready,setReady]=useState(false);
 const lastSaved=useRef<Record<string,string>>({});
 useEffect(()=>{let active=true;fetch('/api/products.php',{credentials:'same-origin',cache:'no-store'}).then(async r=>{if(r.status===401){onSessionExpired();return null}if(!r.ok)throw new Error('Catálogo no disponible');return r.json()}).then(d=>{if(active&&d){setProducts(d.products||[]);setReady(true)}}).catch(()=>{if(active)setMessage('No se pudo cargar el catálogo de productos')});return()=>{active=false}},[csrf,onSessionExpired]);
 const matchesFor=(description:string)=>description.trim().length>=2?products.filter(p=>p.description.toLocaleLowerCase('es-MX').includes(description.trim().toLocaleLowerCase('es-MX'))).slice(0,6):[];
 const select=(item:Item,p:Product)=>{lastSaved.current[item.id]=JSON.stringify([p.id,p.description,p.measures,Number(p.unit_price)]);update({items:draft.items.map(i=>i.id===item.id?{...i,description:p.description,dimensions:p.measures,unitPrice:Number(p.unit_price),catalogId:p.id}:i)});setOpenRowId(null);setMessage('Producto encontrado: datos completados automáticamente.')};
 useEffect(()=>{if(!ready)return;
 const timers:number[]=[];
 for(const item of draft.items){
  const description=item.description.trim();
  if(description.length<2)continue;
  const measures=item.dimensions.trim();
  if(measures.length>120||!Number.isFinite(item.unitPrice)||item.unitPrice<0||item.unitPrice>=1000000)continue;
  const signature=JSON.stringify([item.catalogId??null,description,measures,item.unitPrice]);
  if(signature===lastSaved.current[item.id])continue;
  const timer=window.setTimeout(async()=>{
   setSaving(true);setMessage('Guardando producto…');
   try{
    const res=await fetch('/api/products.php',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({action:'save',id:item.catalogId||undefined,description,measures,unit_price:item.unitPrice})});
    if(res.status===401){onSessionExpired();return}
    if(!res.ok)throw new Error('No se pudo guardar el producto');
    const data=await res.json();
    lastSaved.current[item.id]=JSON.stringify([data.id,description,measures,item.unitPrice]);
    if(data.id!==item.catalogId){update({items:draft.items.map(i=>i.id===item.id?{...i,catalogId:data.id}:i)})}
    setMessage(`Producto guardado automáticamente ${new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})}.`);
    const list=await fetch('/api/products.php',{credentials:'same-origin'});
    if(list.ok){const payload=await list.json();setProducts(payload.products||[])}
   }catch{setMessage('No se guardó el producto. Revisa la conexión.')}
   finally{setSaving(false)}
  },1800);
  timers.push(timer);
 }
 return()=>{timers.forEach(t=>window.clearTimeout(t))};
 },[draft.items,ready,csrf,onSessionExpired]);
 return <section className="panel"><div className="section-title"><h2>Productos del pedido</h2></div><div className="product-list">{draft.items.map((item,index)=>{const matches=openRowId===item.id?matchesFor(item.description):[];return <div className="product-row" key={item.id}><strong>Producto {index+1}</strong><label className="tac-product-name">Descripción<span className="tac-product-input"><Search size={17}/><input value={item.description} autoComplete="off" onFocus={()=>setOpenRowId(item.id)} onBlur={()=>window.setTimeout(()=>setOpenRowId(null),160)} onChange={e=>{setOpenRowId(item.id);setMessage('');update({items:draft.items.map(i=>i.id===item.id?{...i,description:e.target.value}:i)})}} placeholder="Escribe para buscar o registrar…"/></span>{openRowId===item.id&&matches.length>0&&<div className="tac-product-suggestions" role="listbox" aria-label="Productos guardados">{matches.map(p=><button type="button" key={p.id} role="option" aria-selected={item.catalogId===p.id} onMouseDown={e=>e.preventDefault()} onClick={()=>select(item,p)}><Package size={17}/><span><strong>{p.description}</strong><small>{p.measures||'Sin medidas'} · {money(Number(p.unit_price))}</small></span><Check size={15}/></button>)}</div>}</label><label>Medidas<input value={item.dimensions} onChange={e=>update({items:draft.items.map(i=>i.id===item.id?{...i,dimensions:e.target.value}:i)})}/></label><label>Cantidad<input type="number" min="1" step="1" value={item.quantity} onChange={e=>update({items:draft.items.map(i=>i.id===item.id?{...i,quantity:Number(e.target.value)}:i)})}/></label><label>Precio unitario<input type="number" min="0" step="0.01" value={item.unitPrice===0?"":item.unitPrice} placeholder="0.00" onChange={e=>update({items:draft.items.map(i=>i.id===item.id?{...i,unitPrice:e.target.value===""?0:Number(e.target.value)}:i)})}/></label><span className="line-total">{money(item.quantity*item.unitPrice)}</span><button aria-label="Quitar producto" className="icon-button" disabled={draft.items.length===1} onClick={()=>update({items:draft.items.filter(i=>i.id!==item.id)})}><Trash2 size={18}/></button></div>})}</div><button type="button" className="outline" style={{marginTop:16}} onClick={()=>update({items:[...draft.items,newItem()]})}><Plus size={17}/> Agregar producto</button><p className="tac-product-message" aria-live="polite">{saving?'Guardando producto…':(message||'Los productos se guardan automáticamente en el catálogo cuando tienen descripción. No necesitas salir de esta pantalla.')}</p></section>;
}
