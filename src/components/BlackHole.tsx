"use client";

import { useEffect, useRef } from "react";

const vertexSource = `attribute vec2 position;
void main(){gl_Position=vec4(position,0.,1.);}`;
const fragmentSource = `precision highp float;
uniform vec2 resolution;
uniform float time,angle,tilt,pulse;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float n=0.,a=.5;for(int i=0;i<4;i++){n+=a*noise(p);p=mat2(.8,.6,-.6,.8)*p*2.03+4.7;a*=.5;}return n;}
float galacticBand(vec2 uv){
 float bend=fbm(uv*2.1+8.)-.5;
 return exp(-pow((uv.y-uv.x*.48-.28+bend*.24)*4.8,2.));
}
vec3 stars(vec2 uv){
 vec3 c=vec3(0.);
 float density=galacticBand(uv);
 for(int i=0;i<3;i++){
  float layer=float(i),scale=48.+layer*58.;
  vec2 p=uv*scale,id=floor(p),f=fract(p)-.5;
  float seed=hash(id+layer*72.);
  vec2 offset=vec2(hash(id+7.),hash(id+19.))-.5;
  float d=length(f-offset*.7);
  // Independent brightness and position avoid uniformly glowing dots.
  float magnitude=hash(id+vec2(43.,layer*29.));
  float bright=pow(magnitude,9.);
  float width=mix(.045,.085,bright)/(1.+layer*.25);
  float light=exp(-d*d/(width*width));
  float visible=step(1.-(.045+density*.075)/(1.+layer*.25),seed);
  float temperature=hash(id+vec2(91.,13.));
  vec3 tint=mix(vec3(.68,.78,1.),vec3(1.,.86,.67),temperature);
  tint=mix(vec3(.91,.94,.9),tint,.5);
  c+=tint*light*visible*(.24+bright*3.6)/(1.+layer*.35);
  c+=tint*exp(-d*24.)*visible*pow(bright,4.)*.08;
 }
 return c;
}
vec3 emission(float r,float a,float speed){
 // Advect the texture around the disk; inner material orbits faster.
 float orbit=a-time*.3*speed*pow(.23/max(r,.16),1.5);
 vec2 flow=vec2(cos(orbit),sin(orbit));
 float bands=fbm(flow*5.+vec2(r*55.,r*23.));
 float filaments=pow(.5+.5*sin(r*330.+bands*12.),3.);
 float turbulence=fbm(flow*13.+vec2(r*110.,r*47.));
 float streams=pow(.5+.5*sin(orbit*5.+r*28.+bands*2.),5.);
 float texture=.15+bands*.6+filaments*.4+turbulence*.3+streams*.95;
 return mix(vec3(.62,.69,.43),vec3(1.,.94,.75),clamp(texture*.7,0.,1.))*texture;
}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*resolution)/min(resolution.x,resolution.y);
 float size=resolution.x<600.?.80:1.03;uv/=size;
 float d=length(uv),core=.135;
 vec2 warped=uv+normalize(uv+vec2(.00001))*core*core/max(d,.04)*.22;
 // Uneven distant starlight, broken up by dark interstellar dust lanes.
 float haze=galacticBand(warped);
 vec2 clouds=warped*vec2(4.,7.)+vec2(7.,2.);
 float cloud=fbm(clouds+fbm(clouds*1.7)*2.);
 float dust=smoothstep(.38,.68,fbm(clouds*2.3+15.));
 float fine=fbm(clouds*5.);
 float scattered=haze*pow(cloud,2.)*(1.-dust*.88);
 vec3 bg=vec3(.006,.008,.007);
 bg+=mix(vec3(.085,.10,.12),vec3(.145,.145,.115),cloud)*scattered;
 bg+=vec3(.045,.054,.038)*haze*pow(fine,4.);
 bg+=stars(warped);
 bg*=1.-smoothstep(.65,1.6,length(uv))*.35;
 float ca=cos(angle),sa=sin(angle);vec2 p=mat2(ca,-sa,sa,ca)*uv;
 float radius=length(p),theta=atan(p.y,p.x);
 vec3 light=vec3(0.);
 // The lensed far side of the disk forms an elevated, textured arc.
 float lensR=length(vec2(p.x,p.y*1.07));
 float lensT=(lensR-core)/.098;
 float lensMask=smoothstep(0.,.018,lensR-core)* (1.-smoothstep(.19,.245,lensR))*smoothstep(-.025,.045,p.y);
 float lensFall=exp(-max(lensT,0.)*1.6);
 light+=emission(lensR*1.8,theta,1.1)*lensMask*lensFall*1.45;
 // A dimmer secondary image wraps below the shadow.
 float lower=smoothstep(core*.97,core*1.03,radius)*(1.-smoothstep(core*1.08,core*1.22,radius))*(1.-smoothstep(-.06,.005,p.y));
 light+=emission(radius*3.,theta,.7)*lower*.6;
 vec2 disk=vec2(p.x,(p.y+.004)/tilt);float dr=length(disk),da=atan(disk.y,disk.x);
 float inner=.158,outer=.59;
 float diskMask=smoothstep(inner,inner+.017,dr)*(1.-smoothstep(outer*.72,outer,dr));
 float heat=pow(inner/max(dr,inner),1.65);
 float doppler=.75+.45*smoothstep(-.35,.35,-p.x);
 vec3 diskLight=emission(dr,da,1.6)*diskMask*heat*doppler*1.8;
 float shadow=1.-smoothstep(core-.002,core+.002,radius);
 light*=1.-shadow;
 bg=mix(bg,vec3(.001,.002,.001),shadow);
 // Foreground disk crosses the lower half; its upper half is occulted.
 float foreground=1.-smoothstep(-.018,.012,p.y);
 light+=diskLight*mix(1.-shadow,1.,foreground);
 float photon=exp(-pow((radius-core)/.0028,2.));
 float glow=exp(-abs(radius-core)*48.)*.13+exp(-abs(p.y)*38.)*exp(-abs(p.x)*3.2)*.12;
 light+=vec3(.89,.96,.72)*(photon*.75+glow)*(1.-shadow*.85);
 float ripple=exp(-pow((dr-(.65-pulse*.17))/.002,2.))*pulse*.13;
 light+=vec3(.54,.72,.40)*ripple;
 vec3 bloom=vec3(.71,.78,.50)*exp(-abs(p.y)*15.)*exp(-abs(p.x)*4.)*.09;
 vec3 color=bg+light+bloom*(1.-shadow);
 color=vec3(1.)-exp(-color*1.25);
 color=pow(color,vec3(.82));
 color+= (hash(gl_FragCoord.xy)-.5)*.006;
 gl_FragColor=vec4(color,1.);
}`;

export default function BlackHole(){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const element=canvas.current;if(!element)return;
  const gl=element.getContext("webgl",{alpha:false,antialias:false,powerPreference:"low-power"});
  if(!gl){element.classList.add("black-hole-fallback");return;}
  const compile=(type:number,source:string)=>{const shader=gl.createShader(type);if(!shader)return null;gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){console.error(gl.getShaderInfoLog(shader));gl.deleteShader(shader);return null;}return shader;};
  const vertex=compile(gl.VERTEX_SHADER,vertexSource),fragment=compile(gl.FRAGMENT_SHADER,fragmentSource),program=gl.createProgram();
  if(!vertex||!fragment||!program){if(vertex)gl.deleteShader(vertex);if(fragment)gl.deleteShader(fragment);if(program)gl.deleteProgram(program);return;}
  gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteShader(vertex);gl.deleteShader(fragment);gl.deleteProgram(program);return;}
  gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const position=gl.getAttribLocation(program,"position");gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
  const uniforms=Object.fromEntries(["resolution","time","angle","tilt","pulse"].map(name=>[name,gl.getUniformLocation(program,name)]));
  const motion=matchMedia("(prefers-reduced-motion: reduce)");
  let frame=0,time=0,last=0,angle=-.06,targetAngle=-.06,tilt=.19,targetTilt=.19,pulse=0,dragging=false,lastX=0,lastY=0,visible=true;
  function paint(now:number){const delta=Math.min(40,now-last||16);last=now;if(!motion.matches){time+=delta*.001;angle+=(targetAngle-angle)*.07;tilt+=(targetTilt-tilt)*.07;pulse*=.96;}else{angle=targetAngle;tilt=targetTilt;pulse=0;}gl!.uniform2f(uniforms.resolution,element!.width,element!.height);gl!.uniform1f(uniforms.time,time);gl!.uniform1f(uniforms.angle,angle);gl!.uniform1f(uniforms.tilt,tilt);gl!.uniform1f(uniforms.pulse,pulse);gl!.drawArrays(gl!.TRIANGLES,0,6);frame=0;if(visible&&!motion.matches)frame=requestAnimationFrame(paint);}
  function draw(){if(!frame)frame=requestAnimationFrame(paint);}
  function resize(){const r=element!.getBoundingClientRect(),ratio=Math.min(devicePixelRatio,1.5);element!.width=r.width*ratio;element!.height=r.height*ratio;gl!.viewport(0,0,element!.width,element!.height);draw();}
  function down(e:PointerEvent){dragging=true;lastX=e.clientX;lastY=e.clientY;element!.setPointerCapture(e.pointerId);if(!motion.matches)pulse=1;draw();}
  function move(e:PointerEvent){if(!dragging)return;targetAngle+=(e.clientX-lastX)*.003;targetTilt=Math.max(.10,Math.min(.6,targetTilt+(e.clientY-lastY)*.002));lastX=e.clientX;lastY=e.clientY;draw();}
  function up(){dragging=false;}
  function key(e:KeyboardEvent){if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"," ","Home"].includes(e.key))return;e.preventDefault();if(e.key==="ArrowLeft")targetAngle-=.12;if(e.key==="ArrowRight")targetAngle+=.12;if(e.key==="ArrowUp")targetTilt=Math.max(.10,targetTilt-.05);if(e.key==="ArrowDown")targetTilt=Math.min(.6,targetTilt+.05);if(e.key===" "&&!motion.matches)pulse=1;if(e.key==="Home"){targetAngle=-.06;targetTilt=.19;}draw();}
  function visibility(){visible=!document.hidden;if(visible){last=0;draw();}else{cancelAnimationFrame(frame);frame=0;}}
  const observer=new ResizeObserver(resize);observer.observe(element);element.addEventListener("pointerdown",down);element.addEventListener("pointermove",move);element.addEventListener("pointerup",up);element.addEventListener("pointercancel",up);element.addEventListener("keydown",key);document.addEventListener("visibilitychange",visibility);motion.addEventListener("change",draw);
  return()=>{cancelAnimationFrame(frame);observer.disconnect();element.removeEventListener("pointerdown",down);element.removeEventListener("pointermove",move);element.removeEventListener("pointerup",up);element.removeEventListener("pointercancel",up);element.removeEventListener("keydown",key);document.removeEventListener("visibilitychange",visibility);motion.removeEventListener("change",draw);gl!.deleteBuffer(buffer);gl!.deleteProgram(program);gl!.deleteShader(vertex);gl!.deleteShader(fragment);};
 },[]);
 return <canvas ref={canvas} className="black-hole-canvas" tabIndex={0} role="img" aria-label="Interactive black hole with a luminous, warped accretion disk and a sage-tinted starfield. Drag or use arrow keys to tilt the view, press to ripple, and press Home to reset. Decorative artwork."/>;
}




