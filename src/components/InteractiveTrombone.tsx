"use client";

import { useEffect, useRef, useState } from "react";
type V = [number, number, number];
type Face = { points: V[]; normal: V; silver?: boolean; dark?: boolean };
const unit = (v:V):V => {const d=Math.hypot(...v)||1;return v.map(n=>n/d) as V;};
const cross=(a:V,b:V):V=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function tube(path:V[],radius:number,silver=false):Face[]{
  const rings=path.map((p,i)=>{
    const previous=path[Math.max(0,i-1)],next=path[Math.min(path.length-1,i+1)];
    const tangent=unit(next.map((n,j)=>n-previous[j]) as V),normal=unit(cross(tangent,[0,0,1])),binormal=cross(tangent,normal);
    return Array.from({length:12},(_,j)=>p.map((n,k)=>n+radius*(normal[k]*Math.cos(j/12*Math.PI*2)+binormal[k]*Math.sin(j/12*Math.PI*2))) as V);
  });
  const faces:Face[]=[];
  for(let i=0;i<rings.length-1;i++)for(let j=0;j<12;j++){
    const points=[rings[i][j],rings[i+1][j],rings[i+1][(j+1)%12],rings[i][(j+1)%12]];
    faces.push({points,normal:unit(cross(points[1].map((n,k)=>n-points[0][k]) as V,points[3].map((n,k)=>n-points[0][k]) as V)),silver});
  }
  return faces;
}
const line=(a:V,b:V):V[]=>Array.from({length:12},(_,i)=>a.map((n,j)=>n+(b[j]-n)*i/11) as V);
function bell():Face[]{
 const faces:Face[]=[];
 for(let i=0;i<34;i++)for(let j=0;j<48;j++){
  const vertex=(s:number,t:number,inner=false):V=>{const r=.065+.52*Math.pow(s,4)-(inner?.013:0);return [-1.6+s*1.9,-.7+r*Math.cos(t),r*Math.sin(t)];};
  for(const inner of [false,true]){
   const points=[vertex(i/34,j/48*Math.PI*2,inner),vertex((i+1)/34,j/48*Math.PI*2,inner),vertex((i+1)/34,(j+1)/48*Math.PI*2,inner),vertex(i/34,(j+1)/48*Math.PI*2,inner)];
   let normal=unit(cross(points[1].map((n,k)=>n-points[0][k]) as V,points[3].map((n,k)=>n-points[0][k]) as V));if(inner)normal=normal.map(n=>-n) as V;
   faces.push({points,normal,dark:inner});
  }
 }
 const rim=Array.from({length:65},(_,i):V=>[.3,-.7+.585*Math.cos(i/64*Math.PI*2),.585*Math.sin(i/64*Math.PI*2)]);
 return [...faces,...tube(rim,.018)];
}

export default function InteractiveTrombone(){
 const canvas=useRef<HTMLCanvasElement>(null),slideValue=useRef(0),resetView=useRef<()=>void>(()=>{});
 const [slide,setSlide]=useState(1);
 useEffect(()=>{
  const element=canvas.current,context=element?.getContext("2d");if(!element||!context)return;
  let width=0,height=0,frame=0,yaw=-.25,pitch=-.22,targetYaw=-.25,targetPitch=-.22,dragging=false,lastX=0,lastY=0,currentSlide=slideValue.current;
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  const bend=Array.from({length:33},(_,i):V=>{const t=Math.PI/2+i/32*Math.PI;return [-2.55+.475*Math.cos(t),-.225+.475*Math.sin(t),0];});
  const fixed=[...bell(),...tube([...line([-1.6,.25,0],[-2.55,.25,0]),...bend,...line([-2.55,-.7,0],[-1.6,-.7,0])],.055),...tube(line([-1.65,.25,0],[-1.65,.62,0]),.045),...tube(line([-2.02,-.3,0],[-2.02,.29,0]),.035,true),...tube(line([-2.22,-.3,0],[-2.02,-.3,0]),.045,true),...tube(line([-2.24,-.3,0],[-2.19,-.3,0]),.09,true),...tube(line([-1.3,.3,0],[2.72,.3,0]),.031,true),...tube(line([-1.3,.62,0],[2.72,.62,0]),.031,true),...tube(line([-1.25,.27,0],[-1.25,.65,0]),.045)];
  const slideBend=Array.from({length:25},(_,i):V=>{const t=-Math.PI/2+i/24*Math.PI;return [2.8+.16*Math.cos(t),.46+.16*Math.sin(t),0];});
  const moving=[...tube([...line([-1.1,.3,0],[2.8,.3,0]),...slideBend,...line([2.8,.62,0],[-1.1,.62,0])],.044),...tube(line([-.65,.27,0],[-.65,.65,0]),.045),...tube(line([2.38,.28,0],[2.38,.64,0]),.034)];
  function rotate(p:V):V {const x=p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),z=-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw);return [x,p[1]*Math.cos(pitch)-z*Math.sin(pitch),p[1]*Math.sin(pitch)+z*Math.cos(pitch)];}
  function paint(){
   if(!context)return;
   const easing=motion.matches?1:.16;yaw+=(targetYaw-yaw)*easing;pitch+=(targetPitch-pitch)*easing;currentSlide+=(slideValue.current-currentSlide)*easing;
   context.clearRect(0,0,width,height);
   const scale=Math.min(width/11,height/5),project=(p:V)=>{const f=12/(12-p[2]);return [width/2+(p[0]-.25)*scale*f,height/2+p[1]*scale*f];};
   const faces=[...fixed.map(face=>({...face,points:face.points.map(rotate),normal:rotate(face.normal)})),...moving.map(face=>({...face,points:face.points.map(p=>rotate([p[0]+currentSlide,p[1],p[2]])),normal:rotate(face.normal)}))];
   faces.sort((a,b)=>a.points.reduce((s,p)=>s+p[2],0)-b.points.reduce((s,p)=>s+p[2],0));
   for(const face of faces){const n=face.normal,dot=Math.max(0,n[0]*-.3+n[1]*-.6+n[2]*.74),spec=Math.pow(Math.max(0,n[0]*-.15+n[1]*-.3+n[2]*.94),18),light=(face.dark?.18:.32)+dot*(face.dark?.45:.64);const base=face.silver?[181,193,172]:[216,179,105];const color=base.map(v=>Math.min(255,Math.round(v*light+spec*90)));context.fillStyle=`rgb(${color.join(",")})`;context.beginPath();face.points.forEach((p,i)=>{const [x,y]=project(p);if(i)context.lineTo(x,y);else context.moveTo(x,y);});context.closePath();context.fill();context.strokeStyle=context.fillStyle;context.lineWidth=.45;context.stroke();}
   if(Math.abs(yaw-targetYaw)+Math.abs(pitch-targetPitch)+Math.abs(currentSlide-slideValue.current)>.001)frame=requestAnimationFrame(paint);else frame=0;
  }
  function draw(){if(!frame)frame=requestAnimationFrame(paint);}
  function resize(){const r=element!.getBoundingClientRect();width=r.width;height=r.height;const ratio=Math.min(devicePixelRatio,2);element!.width=width*ratio;element!.height=height*ratio;context!.setTransform(ratio,0,0,ratio,0,0);draw();}
  function down(e:PointerEvent){dragging=true;lastX=e.clientX;lastY=e.clientY;element!.setPointerCapture(e.pointerId);}
  function move(e:PointerEvent){if(!dragging)return;targetYaw+=(e.clientX-lastX)*.008;targetPitch=Math.max(-1.3,Math.min(1.3,targetPitch+(e.clientY-lastY)*.008));lastX=e.clientX;lastY=e.clientY;draw();}
  function up(){dragging=false;}
  function key(e:KeyboardEvent){if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Home"].includes(e.key))return;e.preventDefault();if(e.key==="ArrowLeft")targetYaw-=.18;if(e.key==="ArrowRight")targetYaw+=.18;if(e.key==="ArrowUp")targetPitch-=.18;if(e.key==="ArrowDown")targetPitch+=.18;if(e.key==="Home"){targetYaw=-.25;targetPitch=-.22;}draw();}
  resetView.current=()=>{targetYaw=-.25;targetPitch=-.22;draw();};
  const observer=new ResizeObserver(resize);observer.observe(element);element.addEventListener("pointerdown",down);element.addEventListener("pointermove",move);element.addEventListener("pointerup",up);element.addEventListener("pointercancel",up);element.addEventListener("keydown",key);element.addEventListener("slidechange",draw);motion.addEventListener("change",draw);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();element.removeEventListener("pointerdown",down);element.removeEventListener("pointermove",move);element.removeEventListener("pointerup",up);element.removeEventListener("pointercancel",up);element.removeEventListener("keydown",key);element.removeEventListener("slidechange",draw);motion.removeEventListener("change",draw);};
 },[]);
 function change(value:number){setSlide(value);slideValue.current=(value-1)*.3;canvas.current?.dispatchEvent(new Event("slidechange"));}
 return <div className="trombone-sculpture"><canvas ref={canvas} role="img" tabIndex={0} aria-label="Rotatable brass trombone. Drag or use arrow keys to rotate. Use the slide control below to extend its slide."/><div className="instrument-controls"><span>DRAG TO ROTATE</span><label><span>SLIDE <b>{slide}</b></span><input aria-label="Trombone slide position" type="range" min={1} max={7} step={1} value={slide} onChange={e=>change(Number(e.target.value))}/></label><button onClick={()=>{change(1);resetView.current();}}>Reset ↺</button></div></div>;
}
