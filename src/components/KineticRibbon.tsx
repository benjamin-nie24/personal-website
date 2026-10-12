"use client";

import { useEffect, useRef } from "react";
type V = [number, number, number];
const cross = (a: V, b: V): V => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const unit = (a: V): V => { const d=Math.hypot(...a)||1; return a.map(v=>v/d) as V; };
function curve(t: number): V { return [(2+.7*Math.cos(3*t))*Math.cos(2*t),(2+.7*Math.cos(3*t))*Math.sin(2*t),.95*Math.sin(3*t)]; }

export default function KineticRibbon() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element=canvas.current;
    const context=element?.getContext("2d",{alpha:true});
    if (!element || !context) return;
    const motion=window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame=0, width=0, height=0, yaw=.45, pitch=.95, targetYaw=.45, targetPitch=.95, idle=0, pulse=0, last=0, visible=true, dragging=false;
    const geometry = Array.from({length:420},(_,i)=>{
      const t=i/420*Math.PI*2, p=curve(t), next=curve(t+.001);
      const tangent=unit(next.map((v,j)=>v-p[j]) as V);
      const normal=unit(cross(tangent,unit(p)));
      return {p,normal};
    });
    function rotate(p: V): V {
      const a=yaw+idle, b=pitch;
      const x=p[0]*Math.cos(a)+p[2]*Math.sin(a),z=-p[0]*Math.sin(a)+p[2]*Math.cos(a);
      return [x,p[1]*Math.cos(b)-z*Math.sin(b),p[1]*Math.sin(b)+z*Math.cos(b)];
    }
    function paint(time: number) {
      if(!context || !element) return;
      const delta=Math.min(32,time-last||16); last=time;
      if(!motion.matches){ idle+=delta*.000055; yaw+=(targetYaw-yaw)*.065; pitch+=(targetPitch-pitch)*.065; pulse*=.96; }
      context.clearRect(0,0,width,height);
      const scale=Math.min(width*.155,height*.14);
      const project=(p:V):[number,number]=>{const f=8/(8-p[2]);return [width/2+p[0]*scale*f,height/2+p[1]*scale*f];};
      const faces:{points:V[];depth:number;shade:number;edge:boolean}[]=[];
      for(let i=0;i<geometry.length;i++){
        const a=geometry[i],b=geometry[(i+1)%geometry.length];
        for(let lane=0;lane<8;lane++){
          const u=(lane/8-.5)*.65, v=((lane+1)/8-.5)*.65;
          const vertex=(g:typeof a,n:number):V=>rotate(g.p.map((value,j)=>value*(1+pulse*.035)+g.normal[j]*n) as V);
          const points=[vertex(a,u),vertex(b,u),vertex(b,v),vertex(a,v)];
          const n=unit(cross(points[1].map((x,j)=>x-points[0][j]) as V,points[3].map((x,j)=>x-points[0][j]) as V));
          const shade=.38+Math.abs(n[0]*-.35+n[1]*-.5+n[2]*.78)*.62;
          faces.push({points,depth:points.reduce((sum,p)=>sum+p[2],0)/4,shade,edge:lane===0||lane===7});
        }
      }
      faces.sort((a,b)=>a.depth-b.depth);
      for(const face of faces){
        context.beginPath();face.points.forEach((p,i)=>{const [x,y]=project(p);if(i)context.lineTo(x,y);else context.moveTo(x,y);});context.closePath();
        const light=face.shade, sheen=face.edge?10:0;
        context.fillStyle=`rgb(${Math.round(135*light+sheen)},${Math.round(160*light+sheen)},${Math.round(113*light+sheen)})`;
        context.fill();context.strokeStyle=context.fillStyle;context.lineWidth=.6;context.stroke();
      }
      if(visible && !motion.matches) frame=requestAnimationFrame(paint);
    }
    function redraw(){cancelAnimationFrame(frame);last=0;frame=requestAnimationFrame(paint);}
    function resize(){const rect=element!.getBoundingClientRect();width=rect.width;height=rect.height;const ratio=Math.min(devicePixelRatio,2);element!.width=width*ratio;element!.height=height*ratio;context!.setTransform(ratio,0,0,ratio,0,0);redraw();}
    function move(event: PointerEvent){if(motion.matches)return;const r=element!.getBoundingClientRect();targetYaw=.45+(event.clientX-r.left-width/2)/width*(dragging?3:1.2);targetPitch=.95+(event.clientY-r.top-height/2)/height*(dragging?1.6:.7);}
    function leave(){dragging=false;targetYaw=.45;targetPitch=.95;}
    function down(event:PointerEvent){dragging=true;element!.setPointerCapture(event.pointerId);if(!motion.matches)pulse=1.3;}
    function up(){dragging=false;}
    function key(event:KeyboardEvent){if(motion.matches)return;if(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," "].includes(event.key)){event.preventDefault();if(event.key==="ArrowLeft")targetYaw-=.3;if(event.key==="ArrowRight")targetYaw+=.3;if(event.key==="ArrowUp")targetPitch-=.3;if(event.key==="ArrowDown")targetPitch+=.3;if(event.key===" ")pulse=1.3;}}
    function visibility(){visible=!document.hidden;if(visible)redraw();else cancelAnimationFrame(frame);}
    const observer=new ResizeObserver(resize);observer.observe(element);
    element.addEventListener("pointermove",move);element.addEventListener("pointerleave",leave);element.addEventListener("pointerdown",down);element.addEventListener("pointerup",up);element.addEventListener("pointercancel",leave);element.addEventListener("keydown",key);document.addEventListener("visibilitychange",visibility);motion.addEventListener("change",redraw);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();element.removeEventListener("pointermove",move);element.removeEventListener("pointerleave",leave);element.removeEventListener("pointerdown",down);element.removeEventListener("pointerup",up);element.removeEventListener("pointercancel",leave);element.removeEventListener("keydown",key);document.removeEventListener("visibilitychange",visibility);motion.removeEventListener("change",redraw);};
  },[]);
  return <canvas ref={canvas} className="kinetic-canvas" role="img" tabIndex={0} aria-label="A floating sage ribbon knot. Move your pointer or drag to turn it; arrow keys rotate it and space gently expands it. Decorative artwork." />;
}

