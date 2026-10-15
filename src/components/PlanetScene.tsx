"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const destinations = ["/", "/about", "/projects", "/experience", "/contact"];
const names = ["Earth", "Mars", "Jupiter", "Saturn", "Uranus"];
const vertex = `attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;
const fragment = `precision highp float;
uniform vec2 resolution;
uniform float time,previousPlanet,planet,progress,spin,pixelRatio;
uniform sampler2D earthMap,marsMap,jupiterMap,saturnMap,uranusMap;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
float fbm(vec2 p){float n=0.,a=.5;for(int i=0;i<5;i++){n+=a*noise(p);p=mat2(.8,.6,-.6,.8)*p*2.03+4.7;a*=.5;}return n;}
vec3 space(vec2 uv){
 float band=exp(-pow((uv.y-uv.x*.45-.22+(fbm(uv*3.)-.5)*.2)*5.,2.));
 float dust=fbm(uv*7.+12.);
 vec3 c=vec3(.004,.006,.005)+vec3(.033,.042,.032)*band*pow(dust,2.);
 for(int i=0;i<3;i++){
  float scale=55.+float(i)*63.;vec2 p=uv*scale,id=floor(p),f=fract(p)-.5;
  vec2 offset=vec2(hash(id+7.),hash(id+19.))-.5;float d=length(f-offset*.7);
  float bright=pow(hash(id+43.),8.);float width=mix(.035,.08,bright);
  float light=exp(-d*d/(width*width))*step(.955-band*.04,hash(id+float(i)*72.));
  vec3 tint=mix(vec3(.72,.82,1.),vec3(1.,.88,.69),hash(id+91.));
  c+=tint*light*(.17+bright*1.9)/(1.+float(i)*.5);
 }return c;
}
vec3 mapColor(sampler2D map,vec2 uv){
 float wrapped=fract(uv.x);
 float seam=1.-smoothstep(0.,.025,min(wrapped,1.-wrapped));
 uv.x=wrapped;
 vec3 color=texture2D(map,uv).rgb;
 // A restrained detail pass compensates for magnifying the large, cropped globe.
 vec2 texel=vec2(1./1774.,1./887.);
 vec3 neighbors=texture2D(map,vec2(fract(uv.x+texel.x),uv.y)).rgb
  +texture2D(map,vec2(fract(uv.x-texel.x),uv.y)).rgb
  +texture2D(map,uv+vec2(0.,texel.y)).rgb
  +texture2D(map,uv-vec2(0.,texel.y)).rgb;
 color=clamp(color+(color-neighbors*.25)*.45,0.,1.);
 return mix(color,texture2D(map,vec2(1.-uv.x,uv.y)).rgb,seam*.5);
}
vec3 surface(vec3 n,float kind){
 float longitude=atan(n.x,n.z)+spin;
 float latitude=asin(clamp(n.y,-1.,1.));
 // Continuous longitude + repeat wrapping keeps the map attached to the sphere.
 vec2 uv=vec2(longitude/6.283185+.52,.5-latitude/3.141593);
 if(kind<.5)return mapColor(earthMap,uv);
 if(kind<1.5)return mapColor(marsMap,uv);
 if(kind<2.5)return mapColor(jupiterMap,uv);
 if(kind<3.5)return mapColor(saturnMap,uv);
 return mapColor(uranusMap,uv);
}
vec3 scene(vec2 uv,vec3 bg,float kind,float travel){
 float mobile=1.-step(700.,resolution.x/pixelRatio);
 float home=1.-step(.5,kind);
 float radius=mix(.43,.48,home)*resolution.x/resolution.y;
 vec2 center=vec2(mix(1.035,1.,home)*resolution.x/resolution.y,.5);
 // Screen coordinates use height as the unit; mobile planets sit above the copy.
 radius=mix(radius,.56*resolution.x/resolution.y,mobile);
 center.y=mix(.5,1.-210.*pixelRatio/resolution.y,mobile);
 center.x+=travel;
 vec2 p=(uv-center)/radius;
 float ca=cos(-.18),sa=sin(-.18);p=mat2(ca,-sa,sa,ca)*p;
 float flatten=kind>1.5?.92:1.;vec2 sphere=vec2(p.x,p.y/flatten);
 float d=length(sphere),z=sqrt(max(0.,1.-d*d));
 vec3 light=normalize(vec3(-.65,.35,.8));
 vec3 n=vec3(sphere,z);
 vec3 c=bg;
 float rings=step(2.5,kind)*(1.-step(3.5,kind));
 float iceRings=step(3.5,kind);
 float planeZ=-(-p.x*.30+p.y*.88)/.42;
 float ringRadius=length(vec3(p,planeZ));
 float ringMask=smoothstep(1.22,1.26,ringRadius)*(1.-smoothstep(2.1,2.14,ringRadius));
 ringMask*=smoothstep(.006,.018,abs(ringRadius-1.72));
 // Ring density stays fixed radially; only fine particles orbit.
 float grain=.25+.45*noise(vec2(ringRadius*180.,4.))+.18*sin(ringRadius*910.);
 float ringAlpha=ringMask*(.3+grain*.55)*rings;
 ringAlpha+=exp(-pow((ringRadius-1.62)/.009,2.))*.22*iceRings;
 float behind=step(planeZ,z)*step(d,1.);
 vec3 ringColor=mix(vec3(.28,.26,.21),vec3(.78,.73,.61),grain);
 vec3 ringPoint=vec3(p,planeZ);float b=dot(ringPoint,light);
 float blocked=step(b,0.)*step(0.,b*b-dot(ringPoint,ringPoint)+1.);
 ringColor*=1.-blocked*.78;
 c=mix(c,ringColor,ringAlpha*(1.-behind));
 if(d<1.){
  float diffuse=max(0.,dot(n,light));
  vec3 albedo=surface(n,kind);
  vec3 lit=albedo*(.035+diffuse*1.08);
  float rim=pow(1.-z,3.)*smoothstep(-.05,.5,dot(n,light));
  vec3 atmosphere=kind<.5?vec3(.10,.39,.76):(kind>3.5?vec3(.31,.62,.67):vec3(.30,.24,.16));
  lit+=atmosphere*rim*.65;
  c=mix(c,lit,1.-smoothstep(.996,1.,d));
  if(planeZ>z)c=mix(c,ringColor,ringAlpha);
 }
 float halo=exp(-max(d-1.,0.)*100.)*step(1.,d);
 vec3 glow=kind<.5?vec3(.04,.18,.35):(kind>3.5?vec3(.07,.16,.16):vec3(.11,.09,.05));
 c+=glow*halo*.4;
 return c;
}
void main(){
 vec2 uv=gl_FragCoord.xy/resolution.y;
 vec3 bg=space(uv-vec2(.5));
 float t=progress*progress*(3.-2.*progress);
 vec3 c;
 if(progress>.999){c=scene(uv,bg,planet,0.);}
 else{vec3 old=scene(uv,bg,previousPlanet,-t*.18);vec3 next=scene(uv,bg,planet,(1.-t)*.28);c=mix(old,next,t);}
 // Quiet space behind the content keeps long pages readable.
 if(planet>.5){float veil=1.-smoothstep(.50,.69,gl_FragCoord.x/resolution.x);c=mix(c,c*.12,veil*.95);}
 c=pow(max(c,vec3(0.)),vec3(.87));
 gl_FragColor=vec4(c,1.);
}`;

export default function PlanetScene(){
 const path=usePathname(),index=Math.max(0,destinations.indexOf(path));
 const canvas=useRef<HTMLCanvasElement>(null),destination=useRef(index),wake=useRef(()=>{});
 useEffect(()=>{destination.current=index;wake.current();},[index]);
 useEffect(()=>{
  const element=canvas.current;if(!element)return;
  const gl=element.getContext("webgl",{alpha:false,antialias:false,powerPreference:"low-power"});
  if(!gl)return;
  const shaders:WebGLShader[]=[];
  function compile(type:number,source:string){const shader=gl!.createShader(type)!;gl!.shaderSource(shader,source);gl!.compileShader(shader);if(!gl!.getShaderParameter(shader,gl!.COMPILE_STATUS)){console.error(gl!.getShaderInfoLog(shader));gl!.deleteShader(shader);return null;}shaders.push(shader);return shader;}
  const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment),program=gl.createProgram();
  if(!vs||!fs||!program){shaders.forEach(s=>gl.deleteShader(s));return;}
  gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));return;}
  gl.useProgram(program);
  const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const pos=gl.getAttribLocation(program,"position");gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
  const mapNames=["earth","mars","jupiter","saturn","uranus"];
  const u=Object.fromEntries(["resolution","time","previousPlanet","planet","progress","spin","pixelRatio",...mapNames.map(name=>`${name}Map`)].map(name=>[name,gl.getUniformLocation(program,name)]));
  const textures:WebGLTexture[]=[],images:HTMLImageElement[]=[];
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  let frame=0,last=0,time=0,rotation=0,ratio=1,active=destination.current,previous=active,progress=1,disposed=false,ready=false;
  const loads=mapNames.map((name,unit)=>new Promise<void>((resolve)=>{
   const texture=gl.createTexture()!;textures.push(texture);
   gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([70,85,80,255]));
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.uniform1i(u[`${name}Map`],unit);
   const image=new Image();images.push(image);image.decoding="async";
   image.onload=()=>{
    if(disposed){resolve();return;}
    // Upload the lossless source at its native size: no intermediate resize or mip blur.
    gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    resolve();
   };
   image.onerror=()=>{console.error(`Could not load the ${name} surface map.`);resolve();};
   image.src=`/planets/${name}.png`;
  }));
  Promise.all(loads).then(()=>{if(!disposed){ready=true;element.classList.add("is-ready");draw();}});
  function paint(now:number){
   const delta=last?Math.min(100,now-last):0;last=now;
   // Finish a transition before starting the latest request, avoiding abrupt swaps.
   if(destination.current!==active&&(progress===1||motion.matches)){previous=active;active=destination.current;progress=motion.matches?1:0;}
   progress=motion.matches?1:Math.min(1,progress+delta/1100);
   if(!motion.matches){time+=delta*.001;rotation+=delta*.000008;}
   if(ready){gl!.uniform2f(u.resolution,element!.width,element!.height);gl!.uniform1f(u.pixelRatio,ratio);gl!.uniform1f(u.time,time);gl!.uniform1f(u.spin,rotation);gl!.uniform1f(u.previousPlanet,previous);gl!.uniform1f(u.planet,active);gl!.uniform1f(u.progress,progress);gl!.drawArrays(gl!.TRIANGLES,0,6);}
   frame=0;if(!document.hidden&&!disposed&&ready&&!motion.matches)frame=requestAnimationFrame(paint);
  }
  function draw(){if(!frame&&!disposed)frame=requestAnimationFrame(paint);}
  wake.current=draw;
  function resize(){const rect=element!.getBoundingClientRect();ratio=Math.min(devicePixelRatio,2);element!.width=Math.round(rect.width*ratio);element!.height=Math.round(rect.height*ratio);gl!.viewport(0,0,element!.width,element!.height);draw();}
  function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{last=0;draw();}}
  const observer=new ResizeObserver(resize);observer.observe(element);
  document.addEventListener("visibilitychange",visibility);motion.addEventListener("change",draw);
  return()=>{disposed=true;wake.current=()=>{};cancelAnimationFrame(frame);observer.disconnect();element.classList.remove("is-ready");images.forEach(image=>{image.onload=null;image.onerror=null;});document.removeEventListener("visibilitychange",visibility);motion.removeEventListener("change",draw);textures.forEach(texture=>gl.deleteTexture(texture));gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));};
 },[]);
 return <div className="planet-scene" data-planet={names[index].toLowerCase()}><div className="planet-fallback" aria-hidden="true"/><canvas ref={canvas} role="img" aria-label={`${names[index]} slowly rotating in space.`}/>{index>0&&<svg key={index} className="orbital-connector" viewBox="0 0 400 140" fill="none" aria-hidden="true"><path d="M0 30C130 30 160 95 300 95"/><circle cx="300" cy="95" r="3"/></svg>}<span className="planet-caption" aria-hidden="true"><span className="orbit-dot"/>{String(index+1).padStart(2,"0")} / {names[index]}</span></div>;
}



