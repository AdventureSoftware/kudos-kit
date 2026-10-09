"use strict";var Feedback=(()=>{var C=Object.defineProperty,K=Object.defineProperties,Z=Object.getOwnPropertyDescriptor,Q=Object.getOwnPropertyDescriptors,Y=Object.getOwnPropertyNames,z=Object.getOwnPropertySymbols;var _=Object.prototype.hasOwnProperty,ee=Object.prototype.propertyIsEnumerable;var I=(n,e,t)=>e in n?C(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t,k=(n,e)=>{for(var t in e||(e={}))_.call(e,t)&&I(n,t,e[t]);if(z)for(var t of z(e))ee.call(e,t)&&I(n,t,e[t]);return n},b=(n,e)=>K(n,Q(e));var te=(n,e)=>{for(var t in e)C(n,t,{get:e[t],enumerable:!0})},ne=(n,e,t,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of Y(e))!_.call(n,i)&&i!==t&&C(n,i,{get:()=>e[i],enumerable:!(r=Z(e,i))||r.enumerable});return n};var re=n=>ne(C({},"__esModule",{value:!0}),n);var pe={};te(pe,{destroy:()=>de,hide:()=>F,init:()=>he,isVisible:()=>G,on:()=>le,setTheme:()=>ke,show:()=>J,toggle:()=>ce});function q(n){var e;if(n===null)return"null";if(n===void 0)return"undefined";if(typeof n=="string")return n.slice(0,2048);if(typeof n=="number"||typeof n=="boolean")return String(n);if(n instanceof Error)return(e=n.stack)!=null?e:n.message;if(typeof Element!="undefined"&&n instanceof Element)return`<${n.tagName.toLowerCase()}>`;if(typeof n=="function")return"[Function]";if(Array.isArray(n))return"["+n.slice(0,20).map(t=>q(t)).join(",")+"]";if(typeof n=="object"){let t=new Set;try{return JSON.stringify(n,(r,i)=>{if(typeof i=="object"&&i!==null){if(t.has(i))return"[circular]";t.add(i)}return i})}catch(r){return"[unserializable]"}}return String(n)}function U(n){return n.map(e=>q(e)).join(" ").slice(0,2048)}function D(n){return n.replace(/("(?:authorization|password|secret|api[_-]?key|token|set-cookie)":\s*)"([^"]*)"/gi,(e,t)=>`${t}"[redacted]"`).replace(/\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi,"Bearer [redacted]")}var v=class v{constructor(e){this.config=e;this.logs=[];this.errors=[];this.originals={};this.errorHandler=null;this.rejectionHandler=null}install(){if(Object.keys(this.originals).length>0)return;let e=["log","info","warn","error","debug"];for(let t of e)this.originals[t]=console[t].bind(console),console[t]=(...r)=>{this.originals[t](...r),this.push({t:Date.now(),level:t,msg:this.serialize(r)})};this.errorHandler=t=>{var r;this.errors.length>=v.MAX_ERRORS||this.errors.push({message:t.message,filename:t.filename,lineno:t.lineno,stack:(r=t.error)==null?void 0:r.stack})},this.rejectionHandler=t=>{if(this.errors.length>=v.MAX_ERRORS)return;let r=t.reason;this.errors.push({message:r instanceof Error?r.message:String(r!=null?r:"Unhandled rejection"),stack:r instanceof Error?r.stack:void 0})},window.addEventListener("error",this.errorHandler),window.addEventListener("unhandledrejection",this.rejectionHandler)}restore(){for(let[e,t]of Object.entries(this.originals))console[e]=t;this.errorHandler&&window.removeEventListener("error",this.errorHandler),this.rejectionHandler&&window.removeEventListener("unhandledrejection",this.rejectionHandler),this.originals={},this.errorHandler=null,this.rejectionHandler=null}getLogs(){return[...this.logs]}getErrors(){return[...this.errors]}clear(){this.logs=[],this.errors=[]}push(e){this.logs.length>=this.config.max&&this.logs.shift(),this.logs.push(e),this.enforceBytesCap()}enforceBytesCap(){let e=typeof TextEncoder!="undefined"?new TextEncoder:null,t=this.logs.reduce((r,i)=>r+(e?e.encode(i.msg).byteLength:i.msg.length),0);for(;t>this.config.maxBytes&&this.logs.length>0;){let r=this.logs.shift();t-=e?e.encode(r.msg).byteLength:r.msg.length}}serialize(e){let t=U(e);return this.config.redact?D(t):t}};v.MAX_ERRORS=50;var T=v;var S=n=>n.replace(/[{};'"\\<>]/g,"");function L(n){let e=n==null?void 0:n.mode;return e==="dark"||e==="auto"?e:"light"}function M(n={},e={}){return b(k(k({},n),e),{light:k(k({},n.light),e.light),dark:k(k({},n.dark),e.dark)})}var oe=`
  --kkw-accent: #18181b;
  --kkw-accent-text: #ffffff;
  --kkw-bg: #ffffff;
  --kkw-field-bg: #ffffff;
  --kkw-text: #18181b;
  --kkw-muted: #71717a;
  --kkw-border: #e4e4e7;
  --kkw-success: #15803d;
  --kkw-error: #dc2626;
  --kkw-shadow: 0 8px 30px rgba(0,0,0,0.12);
  color-scheme: light;`,ie=`
  --kkw-accent: #f4f4f5;
  --kkw-accent-text: #18181b;
  --kkw-bg: #18181b;
  --kkw-field-bg: #27272a;
  --kkw-text: #f4f4f5;
  --kkw-muted: #a1a1aa;
  --kkw-border: #3f3f46;
  --kkw-success: #4ade80;
  --kkw-error: #f87171;
  --kkw-shadow: 0 8px 30px rgba(0,0,0,0.5);
  color-scheme: dark;`,V={background:"--kkw-bg",fieldBackground:"--kkw-field-bg",text:"--kkw-text",mutedText:"--kkw-muted",border:"--kkw-border",accent:"--kkw-accent",accentText:"--kkw-accent-text"};function W(n){return n?Object.keys(V).filter(e=>typeof n[e]=="string"&&n[e]).map(e=>`${V[e]}: ${S(n[e])};`).join(" "):""}function $(n){var w,m,N,R,j,B,A,O;let e=(w=n.theme)!=null?w:{},t=(N=(m=e.accentText)!=null?m:e.text)!=null?N:e.accent?"#ffffff":void 0,r=[e.accent?`--kkw-accent: ${S(e.accent)};`:"",t?`--kkw-accent-text: ${S(t)};`:""].join(" "),i=Number.isFinite(e.radius)?Math.max(0,Math.min(Number(e.radius),32)):8,s=S((R=e.fontFamily)!=null?R:"system-ui, -apple-system, sans-serif"),l=(j=n.position)!=null?j:"bottom-right",c=(B=n.offset)!=null?B:{},h=l.includes("bottom")?"bottom":"top",g=l.includes("right")?"right":"left",f=(A=h==="bottom"?c.bottom:c.top)!=null?A:24,y=(O=g==="right"?c.right:c.left)!=null?O:24,p=`${oe} ${r} ${W(e.light)}`,a=`${ie} ${r} ${W(e.dark)}`;return`
    :where(.kkw-root) {
      --kkw-radius: ${i}px;
      --kkw-radius-sm: ${Math.round(i/2)}px;
      --kkw-font: ${s};
      ${p}
    }
    :where(.kkw-root[data-kkw-mode="dark"]) { ${a} }
    @media (prefers-color-scheme: dark) {
      :where(.kkw-root[data-kkw-mode="auto"]) { ${a} }
    }

    .kkw-root, .kkw-root * { box-sizing: border-box; }

    .kkw-btn {
      position: fixed; z-index: 2147483000;
      ${h}: ${f}px; ${g}: ${y}px;
      background: var(--kkw-accent); color: var(--kkw-accent-text);
      border: none; cursor: pointer; margin: 0;
      font: 600 13px/1.2 var(--kkw-font);
      padding: 10px 16px; border-radius: var(--kkw-radius);
      box-shadow: var(--kkw-shadow);
    }
    .kkw-panel {
      position: fixed; z-index: 2147483001;
      ${h}: ${f+48}px; ${g}: ${y}px;
      width: 320px; max-width: calc(100vw - 32px);
      background: var(--kkw-bg); color: var(--kkw-text);
      border: 1px solid var(--kkw-border); border-radius: var(--kkw-radius);
      box-shadow: var(--kkw-shadow);
      padding: 20px; font: 13px/1.4 var(--kkw-font); text-align: left;
    }
    .kkw-title { display: block; font-size: 15px; font-weight: 600; color: var(--kkw-text); }
    .kkw-chips { display: flex; gap: 6px; margin: 12px 0; }
    .kkw-chip {
      padding: 5px 12px; margin: 0; cursor: pointer;
      font: 500 12px/1.2 var(--kkw-font);
      color: var(--kkw-text); background: var(--kkw-field-bg);
      border: 1px solid var(--kkw-border); border-radius: var(--kkw-radius-sm);
    }
    .kkw-chip.active { background: var(--kkw-accent); color: var(--kkw-accent-text); border-color: var(--kkw-accent); }
    .kkw-label { display: block; margin: 0 0 4px; font-size: 11px; color: var(--kkw-muted); }
    .kkw-textarea, .kkw-input {
      display: block; width: 100%; margin: 0 0 12px; padding: 8px 10px;
      font: 13px/1.4 var(--kkw-font);
      color: var(--kkw-text); background: var(--kkw-field-bg);
      border: 1px solid var(--kkw-border); border-radius: var(--kkw-radius-sm);
    }
    .kkw-textarea { min-height: 88px; resize: vertical; }
    .kkw-textarea::placeholder, .kkw-input::placeholder { color: var(--kkw-muted); opacity: 1; }
    .kkw-textarea:focus, .kkw-input:focus { outline: none; border-color: var(--kkw-accent); }
    .kkw-submit {
      display: block; width: 100%; margin: 8px 0 0; padding: 9px; cursor: pointer;
      font: 600 13px/1.2 var(--kkw-font);
      background: var(--kkw-accent); color: var(--kkw-accent-text);
      border: none; border-radius: var(--kkw-radius-sm);
    }
    .kkw-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .kkw-btn:focus-visible, .kkw-chip:focus-visible, .kkw-submit:focus-visible {
      outline: 2px solid var(--kkw-accent); outline-offset: 2px;
    }
    .kkw-msg { font-size: 12px; margin-top: 8px; min-height: 0; }
    .kkw-msg.kkw-ok { color: var(--kkw-success); }
    .kkw-msg.kkw-err { color: var(--kkw-error); }
    .kkw-privacy { font-size: 11px; color: var(--kkw-muted); margin: 10px 0 0; }
    .kkw-privacy a { color: var(--kkw-accent); }
  `}var H=class{constructor(e){this.config=e;this.container=null;this.button=null;this.panel=null;this.styleEl=null;this.visible=!1}mount(){this.styleEl=document.createElement("style"),this.styleEl.textContent=$(this.config),document.head.appendChild(this.styleEl),this.button=document.createElement("button"),this.button.type="button",this.button.className="kkw-btn",this.button.textContent="Feedback",this.button.onclick=()=>this.togglePanel(),this.panel=this.buildPanel(),this.container=document.createElement("div"),this.container.className="kkw-root",this.container.dataset.kkwMode=L(this.config.theme),this.container.appendChild(this.button),this.container.appendChild(this.panel),document.body.appendChild(this.container),this.panel.style.display="none"}buildPanel(){let e=document.createElement("div");e.className="kkw-panel";let t=document.createElement("strong");t.className="kkw-title",t.textContent="Send feedback",e.appendChild(t);let r=document.createElement("div");r.className="kkw-chips";for(let[a,w]of[["bug","Bug"],["idea","Idea"],["other","Other"]]){let m=document.createElement("button");m.type="button",m.className="kkw-chip"+(a==="bug"?" active":""),m.dataset.type=a,m.textContent=w,r.appendChild(m)}e.appendChild(r);let i=document.createElement("span");i.className="kkw-label",i.textContent="Message *",e.appendChild(i);let s=document.createElement("textarea");s.className="kkw-textarea",s.placeholder="What happened?",s.maxLength=5e3,e.appendChild(s);let l=document.createElement("span");l.className="kkw-label",l.textContent="Email (optional)",e.appendChild(l);let c=document.createElement("input");c.className="kkw-input",c.type="email",c.placeholder="you@example.com",e.appendChild(c);let h=document.createElement("input");h.className="kkw-hp",h.type="text",h.style.display="none",h.tabIndex=-1,h.autocomplete="off",e.appendChild(h);let g=document.createElement("div");g.id="kkw-turnstile",e.appendChild(g);let f=document.createElement("button");f.type="button",f.className="kkw-submit",f.textContent="Submit",e.appendChild(f);let y=document.createElement("div");y.className="kkw-msg",e.appendChild(y);let p=document.createElement("p");if(p.className="kkw-privacy",p.textContent="Bug reports include technical diagnostics (console logs).",this.config.privacyUrl){p.appendChild(document.createTextNode(" "));let a=document.createElement("a");a.href=this.config.privacyUrl,a.target="_blank",a.rel="noopener noreferrer",a.textContent="Privacy policy",p.appendChild(a),p.appendChild(document.createTextNode("."))}return e.appendChild(p),e.querySelectorAll(".kkw-chip").forEach(a=>{a.onclick=()=>{e.querySelectorAll(".kkw-chip").forEach(w=>w.classList.remove("active")),a.classList.add("active")}}),e}getSelectedType(){var e,t,r;return(r=(t=(e=this.panel)==null?void 0:e.querySelector(".kkw-chip.active"))==null?void 0:t.dataset.type)!=null?r:"bug"}getMessage(){var e,t,r;return((r=(t=(e=this.panel)==null?void 0:e.querySelector(".kkw-textarea"))==null?void 0:t.value)!=null?r:"").trim()}getEmail(){var e,t,r;return((r=(t=(e=this.panel)==null?void 0:e.querySelector(".kkw-input"))==null?void 0:t.value)!=null?r:"").trim()}getHoneypot(){var e,t,r;return(r=(t=(e=this.panel)==null?void 0:e.querySelector(".kkw-hp"))==null?void 0:t.value)!=null?r:""}setSubmitState(e){var r;let t=(r=this.panel)==null?void 0:r.querySelector(".kkw-submit");t&&(t.disabled=e,t.textContent=e?"Sending\u2026":"Submit")}showMessage(e,t=!1){var i;let r=(i=this.panel)==null?void 0:i.querySelector(".kkw-msg");r&&(r.textContent=e,r.classList.toggle("kkw-err",t),r.classList.toggle("kkw-ok",!t))}getTurnstileContainer(){var e,t;return(t=(e=this.panel)==null?void 0:e.querySelector("#kkw-turnstile"))!=null?t:null}getSubmitButton(){var e,t;return(t=(e=this.panel)==null?void 0:e.querySelector(".kkw-submit"))!=null?t:null}togglePanel(){this.visible?this.hidePanel():this.showPanel()}showPanel(){this.panel&&!this.visible&&(this.panel.style.display="block",this.visible=!0)}hidePanel(){this.panel&&this.visible&&(this.panel.style.display="none",this.visible=!1)}setTheme(e){this.config=b(k({},this.config),{theme:M(this.config.theme,e)}),this.styleEl&&(this.styleEl.textContent=$(this.config)),this.container&&(this.container.dataset.kkwMode=L(this.config.theme))}getThemeMode(){return L(this.config.theme)}isVisible(){return this.visible}showButton(){this.button&&(this.button.style.display="")}hideButton(){this.button&&(this.button.style.display="none")}destroy(){var e,t;(e=this.container)==null||e.remove(),this.container=null,this.button=null,this.panel=null,(t=this.styleEl)==null||t.remove(),this.styleEl=null,this.visible=!1}};var se=(()=>{var e;let n=(e=document.currentScript)==null?void 0:e.src;try{return n?new URL(n).origin:null}catch(t){return null}})();function ae(n){var t;let e=(t=n.apiUrl)!=null?t:se;return e?e.replace(/\/+$/,"")+"/v1/feedback":null}var E=null,o=null,d=null,u=null,x={},P=null;function le(n,e){var t;((t=x[n])!=null?t:x[n]=[]).push(e)}function X(n,e){var t;(t=x[n])==null||t.forEach(r=>r(e))}function G(){var n;return(n=o==null?void 0:o.isVisible())!=null?n:!1}function J(){o&&(o.showButton(),o.showPanel(),X("visibilitychange",!0))}function F(){o&&(o.hideButton(),o.hidePanel(),X("visibilitychange",!1))}function ce(){G()?F():J()}function de(){o==null||o.destroy(),o=null,d==null||d.restore(),d=null,u=null,x={},E=null}function ke(n){!o||!u||(u=b(k({},u),{theme:M(u.theme,n)}),o.setTheme(n))}async function ue(){if(!o||!u||!E)return;let n=o.getMessage();if(!n){o.showMessage("Please enter a message.",!0);return}o.setSubmitState(!0);let e="";try{e=await new Promise((s,l)=>{let c=o.getTurnstileContainer();if(!c)return l(new Error("No Turnstile container"));if(!window.turnstile)return l(new Error("Turnstile not loaded"));P!==null&&(window.turnstile.remove(P),P=null),P=window.turnstile.render(c,{sitekey:u.turnstileSiteKey,theme:o.getThemeMode(),callback:s,"error-callback":l})})}catch(s){let l=s.message==="Turnstile not loaded"?"Please wait a moment and try again.":"CAPTCHA failed. Please try again.";o.showMessage(l,!0),o.setSubmitState(!1);return}let t=o.getSelectedType(),r={project:u.project,type:t,message:n,email:o.getEmail()||void 0,user:u.user,context:{url:location.href,referrer:document.referrer,userAgent:navigator.userAgent,viewport:{w:window.innerWidth,h:window.innerHeight},language:navigator.language,build:window.__APP_VERSION__,ts:new Date().toISOString()},hp:o.getHoneypot(),turnstileToken:e},i=u.console;d&&(i!=null&&i.sendOn.includes(t))&&(r.console=d.getLogs(),r.errors=d.getErrors());try{let s=await fetch(E,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)});if(!s.ok)throw new Error(`${s.status}`);o.showMessage("Thanks for your feedback!"),o.setSubmitState(!1),d==null||d.clear()}catch(s){o.showMessage("Failed to send. Please try again.",!0),o.setSubmitState(!1)}}function he(n){var e,t;if(!o){if(E=ae(n),!E){console.warn("[kkw] Could not determine the API URL. Pass apiUrl to Feedback.init().");return}if(u=n,(e=n.console)!=null&&e.enabled&&(d=new T({max:n.console.max,maxBytes:n.console.maxBytes,redact:n.console.redact}),d.install()),o=new H(n),o.mount(),(t=o.getSubmitButton())==null||t.addEventListener("click",ue),n.startHidden&&F(),!window.turnstile){let r=document.createElement("script");r.src="https://challenges.cloudflare.com/turnstile/v0/api.js",r.async=!0,document.head.appendChild(r)}}}return re(pe);})();
