"use strict";var Feedback=(()=>{var D=Object.defineProperty,ge=Object.defineProperties,fe=Object.getOwnPropertyDescriptor,me=Object.getOwnPropertyDescriptors,be=Object.getOwnPropertyNames,se=Object.getOwnPropertySymbols;var le=Object.prototype.hasOwnProperty,ve=Object.prototype.propertyIsEnumerable;var ae=(n,e,t)=>e in n?D(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t,c=(n,e)=>{for(var t in e||(e={}))le.call(e,t)&&ae(n,t,e[t]);if(se)for(var t of se(e))ve.call(e,t)&&ae(n,t,e[t]);return n},y=(n,e)=>ge(n,me(e));var xe=(n,e)=>{for(var t in e)D(n,t,{get:e[t],enumerable:!0})},ye=(n,e,t,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of be(e))!le.call(n,s)&&s!==t&&D(n,s,{get:()=>e[s],enumerable:!(r=fe(e,s))||r.enumerable});return n};var Te=n=>ye(D({},"__esModule",{value:!0}),n);var je={};xe(je,{destroy:()=>Re,hide:()=>te,init:()=>ze,isVisible:()=>ue,on:()=>Be,setTheme:()=>Pe,show:()=>we,toggle:()=>Fe});function ke(n){var e;if(n===null)return"null";if(n===void 0)return"undefined";if(typeof n=="string")return n.slice(0,2048);if(typeof n=="number"||typeof n=="boolean")return String(n);if(n instanceof Error)return(e=n.stack)!=null?e:n.message;if(typeof Element!="undefined"&&n instanceof Element)return`<${n.tagName.toLowerCase()}>`;if(typeof n=="function")return"[Function]";if(Array.isArray(n))return"["+n.slice(0,20).map(t=>ke(t)).join(",")+"]";if(typeof n=="object"){let t=new Set;try{return JSON.stringify(n,(r,s)=>{if(typeof s=="object"&&s!==null){if(t.has(s))return"[circular]";t.add(s)}return s})}catch(r){return"[unserializable]"}}return String(n)}function de(n){return n.map(e=>ke(e)).join(" ").slice(0,2048)}function ce(n){return n.replace(/("(?:authorization|password|secret|api[_-]?key|token|set-cookie)":\s*)"([^"]*)"/gi,(e,t)=>`${t}"[redacted]"`).replace(/\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi,"Bearer [redacted]")}var z=class z{constructor(e){this.config=e;this.logs=[];this.errors=[];this.originals={};this.errorHandler=null;this.rejectionHandler=null}install(){if(Object.keys(this.originals).length>0)return;let e=["log","info","warn","error","debug"];for(let t of e)this.originals[t]=console[t].bind(console),console[t]=(...r)=>{this.originals[t](...r),this.push({t:Date.now(),level:t,msg:this.serialize(r)})};this.errorHandler=t=>{var r;this.errors.length>=z.MAX_ERRORS||this.errors.push({message:t.message,filename:t.filename,lineno:t.lineno,stack:(r=t.error)==null?void 0:r.stack})},this.rejectionHandler=t=>{if(this.errors.length>=z.MAX_ERRORS)return;let r=t.reason;this.errors.push({message:r instanceof Error?r.message:String(r!=null?r:"Unhandled rejection"),stack:r instanceof Error?r.stack:void 0})},window.addEventListener("error",this.errorHandler),window.addEventListener("unhandledrejection",this.rejectionHandler)}restore(){for(let[e,t]of Object.entries(this.originals))console[e]=t;this.errorHandler&&window.removeEventListener("error",this.errorHandler),this.rejectionHandler&&window.removeEventListener("unhandledrejection",this.rejectionHandler),this.originals={},this.errorHandler=null,this.rejectionHandler=null}getLogs(){return[...this.logs]}getErrors(){return[...this.errors]}clear(){this.logs=[],this.errors=[]}push(e){this.logs.length>=this.config.max&&this.logs.shift(),this.logs.push(e),this.enforceBytesCap()}enforceBytesCap(){let e=typeof TextEncoder!="undefined"?new TextEncoder:null,t=this.logs.reduce((r,s)=>r+(e?e.encode(s.msg).byteLength:s.msg.length),0);for(;t>this.config.maxBytes&&this.logs.length>0;){let r=this.logs.shift();t-=e?e.encode(r.msg).byteLength:r.msg.length}}serialize(e){let t=de(e);return this.config.redact?ce(t):t}};z.MAX_ERRORS=50;var _=z;var U=n=>n.replace(/[{};'"\\<>]/g,"");function W(n){let e=n==null?void 0:n.mode;return e==="dark"||e==="auto"?e:"light"}function V(n={},e={}){return y(c(c({},n),e),{light:c(c({},n.light),e.light),dark:c(c({},n.dark),e.dark)})}var Ee=`
  --kkw-accent: #18181b;
  --kkw-accent-text: #ffffff;
  --kkw-bg: #ffffff;
  --kkw-field-bg: #ffffff;
  --kkw-text: #18181b;
  --kkw-muted: #71717a;
  --kkw-border: #e4e4e7;
  --kkw-success: #15803d;
  --kkw-error: #dc2626;
  --kkw-star: #f59e0b;
  --kkw-shadow: 0 8px 30px rgba(0,0,0,0.12);
  color-scheme: light;`,Me=`
  --kkw-accent: #f4f4f5;
  --kkw-accent-text: #18181b;
  --kkw-bg: #18181b;
  --kkw-field-bg: #27272a;
  --kkw-text: #f4f4f5;
  --kkw-muted: #a1a1aa;
  --kkw-border: #3f3f46;
  --kkw-success: #4ade80;
  --kkw-error: #f87171;
  --kkw-star: #fbbf24;
  --kkw-shadow: 0 8px 30px rgba(0,0,0,0.5);
  color-scheme: dark;`,pe={background:"--kkw-bg",fieldBackground:"--kkw-field-bg",text:"--kkw-text",mutedText:"--kkw-muted",border:"--kkw-border",accent:"--kkw-accent",accentText:"--kkw-accent-text"};function he(n){return n?Object.keys(pe).filter(e=>typeof n[e]=="string"&&n[e]).map(e=>`${pe[e]}: ${U(n[e])};`).join(" "):""}function Z(n){var B,E,F,R,f,b,P,S;let e=(B=n.theme)!=null?B:{},t=(F=(E=e.accentText)!=null?E:e.text)!=null?F:e.accent?"#ffffff":void 0,r=[e.accent?`--kkw-accent: ${U(e.accent)};`:"",t?`--kkw-accent-text: ${U(t)};`:""].join(" "),s=Number.isFinite(e.radius)?Math.max(0,Math.min(Number(e.radius),32)):8,g=U((R=e.fontFamily)!=null?R:"system-ui, -apple-system, sans-serif"),p=(f=n.position)!=null?f:"bottom-right",a=(b=n.offset)!=null?b:{},d=p.includes("bottom")?"bottom":"top",l=p.includes("right")?"right":"left",M=(P=d==="bottom"?a.bottom:a.top)!=null?P:24,L=(S=l==="right"?a.right:a.left)!=null?S:24,T=Math.min(24,Math.round(s*2.5)),H=Math.min(24,s*2),$=C=>Math.min(4,C),v=`border-${d}-${l}-radius`,A=`${Ee} ${r} ${he(e.light)}`,x=`${Me} ${r} ${he(e.dark)}`;return`
    :where(.kkw-root) {
      --kkw-radius: ${s}px;
      --kkw-radius-sm: ${Math.round(s/2)}px;
      --kkw-font: ${g};
      /* Soft tints of the accent (header band, icon circles, chosen type). Older browsers
         without color-mix() fall back to the plain field background. */
      --kkw-tint: var(--kkw-field-bg);
      --kkw-tint-strong: var(--kkw-border);
      ${A}
    }
    @supports (background: color-mix(in srgb, red 50%, blue)) {
      :where(.kkw-root) {
        --kkw-tint: color-mix(in srgb, var(--kkw-accent) 8%, var(--kkw-bg));
        --kkw-tint-strong: color-mix(in srgb, var(--kkw-accent) 16%, var(--kkw-bg));
      }
    }
    :where(.kkw-root[data-kkw-mode="dark"]) { ${x} }
    @media (prefers-color-scheme: dark) {
      :where(.kkw-root[data-kkw-mode="auto"]) { ${x} }
    }

    .kkw-root, .kkw-root * { box-sizing: border-box; }
    .kkw-root .kkw-hidden { display: none !important; }

    .kkw-btn {
      position: fixed; z-index: 2147483000;
      ${d}: ${M}px; ${l}: ${L}px;
      display: inline-flex; align-items: center; gap: 8px;
      background: var(--kkw-accent); color: var(--kkw-accent-text);
      border: none; cursor: pointer; margin: 0;
      font: 600 13px/1.2 var(--kkw-font);
      padding: 10px 16px 10px 13px;
      border-radius: ${T}px; ${v}: ${$(T)}px;
      box-shadow: var(--kkw-shadow);
    }
    .kkw-btn-icon { width: 16px; height: 16px; flex-shrink: 0; }
    .kkw-panel {
      position: fixed; z-index: 2147483001;
      ${d}: ${M+52}px; ${l}: ${L}px;
      width: 340px; max-width: calc(100vw - 32px);
      max-height: calc(100vh - ${M+68}px); overflow-y: auto;
      background: var(--kkw-bg); color: var(--kkw-text);
      border: 1px solid var(--kkw-border);
      border-radius: ${H}px; ${v}: ${$(H)}px;
      box-shadow: var(--kkw-shadow);
      padding: 20px; font: 13px/1.4 var(--kkw-font); text-align: left;
    }
    .kkw-title { display: block; font-size: 15px; font-weight: 600; color: var(--kkw-text); }
    .kkw-sub { margin: 4px 0 14px; color: var(--kkw-muted); font-size: 13px; }

    /* Tinted header band at the top of the first two steps (edge to edge). */
    .kkw-band { margin: -20px -20px 16px; padding: 18px 20px 14px; background: var(--kkw-tint); }
    .kkw-band .kkw-sub { margin-bottom: 0; }

    /* Step 1: the four choices */
    .kkw-types { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .kkw-type {
      display: flex; flex-direction: column; align-items: flex-start; gap: 2px;
      margin: 0; padding: 12px; cursor: pointer; text-align: left;
      font: 13px/1.3 var(--kkw-font);
      color: var(--kkw-text); background: var(--kkw-field-bg);
      border: 1px solid var(--kkw-border); border-radius: var(--kkw-radius);
      transition: border-color 120ms ease, background-color 120ms ease, transform 120ms ease;
    }
    .kkw-type:hover { border-color: var(--kkw-accent); background: var(--kkw-tint); }
    .kkw-type:active { transform: scale(0.98); }
    .kkw-type strong { font-weight: 600; }
    .kkw-type-icon {
      width: 32px; height: 32px; padding: 7px; margin-bottom: 6px;
      color: var(--kkw-accent); background: var(--kkw-tint-strong); border-radius: 999px;
      transition: background-color 120ms ease, color 120ms ease;
    }
    .kkw-hint { font-size: 11px; color: var(--kkw-muted); }
    /* The type chosen last time (seen after going back). */
    .kkw-type[aria-pressed="true"] { border-color: var(--kkw-accent); background: var(--kkw-tint); box-shadow: inset 0 0 0 1px var(--kkw-accent); }
    .kkw-type[aria-pressed="true"] .kkw-type-icon { background: var(--kkw-accent); color: var(--kkw-accent-text); }

    /* Step 2: the form */
    .kkw-head { display: flex; align-items: center; gap: 4px; }
    .kkw-head.kkw-band { padding: 12px 20px 12px 12px; }
    .kkw-back {
      margin: 0; padding: 2px 8px 4px; cursor: pointer;
      font: 500 20px/1 var(--kkw-font); color: var(--kkw-muted);
      background: none; border: none; border-radius: var(--kkw-radius-sm);
    }
    .kkw-back:hover { color: var(--kkw-text); background: var(--kkw-tint-strong); }
    .kkw-rating { border: 0; margin: 0 0 12px; padding: 0; min-width: 0; }
    .kkw-rating legend { padding: 0; }
    .kkw-stars { display: inline-flex; flex-direction: row-reverse; gap: 2px; }
    .kkw-star-input { position: absolute; opacity: 0; width: 1px; height: 1px; margin: 0; pointer-events: none; }
    .kkw-star { display: inline-flex; padding: 2px; cursor: pointer; color: var(--kkw-border); border-radius: var(--kkw-radius-sm); }
    .kkw-star-icon { width: 26px; height: 26px; fill: transparent; transition: fill 100ms ease, color 100ms ease, transform 100ms ease; }
    /* Chosen rating: that star and the ones to its left (DOM order is 5\u21921, shown reversed). */
    .kkw-star-input:checked ~ .kkw-star { color: var(--kkw-star); }
    .kkw-star-input:checked ~ .kkw-star .kkw-star-icon { fill: var(--kkw-star); }
    /* While hovering, preview the hovered star instead of the chosen one. */
    .kkw-stars:hover .kkw-star { color: var(--kkw-border); }
    .kkw-stars:hover .kkw-star .kkw-star-icon { fill: transparent; }
    .kkw-stars:hover .kkw-star:hover, .kkw-stars:hover .kkw-star:hover ~ .kkw-star { color: var(--kkw-star); }
    .kkw-stars:hover .kkw-star:hover .kkw-star-icon, .kkw-stars:hover .kkw-star:hover ~ .kkw-star .kkw-star-icon { fill: var(--kkw-star); }
    .kkw-star:hover .kkw-star-icon { transform: scale(1.12); }
    .kkw-star-input:focus-visible + .kkw-star { outline: 2px solid var(--kkw-accent); outline-offset: 1px; }
    .kkw-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
    .kkw-label { display: block; margin: 0 0 4px; font-size: 11px; color: var(--kkw-muted); }
    .kkw-textarea, .kkw-input {
      display: block; width: 100%; margin: 0 0 12px; padding: 8px 10px;
      font: 13px/1.4 var(--kkw-font);
      color: var(--kkw-text); background: var(--kkw-field-bg);
      border: 1px solid var(--kkw-border); border-radius: var(--kkw-radius-sm);
    }
    .kkw-textarea { min-height: 96px; resize: vertical; }
    .kkw-textarea::placeholder, .kkw-input::placeholder { color: var(--kkw-muted); opacity: 1; }
    .kkw-textarea:focus, .kkw-input:focus { outline: none; border-color: var(--kkw-accent); }
    .kkw-consent {
      display: flex; gap: 8px; align-items: flex-start; margin: 0 0 12px; cursor: pointer;
      font-size: 12px; color: var(--kkw-text);
    }
    .kkw-consent input { flex-shrink: 0; width: 15px; height: 15px; margin: 1px 0 0; accent-color: var(--kkw-accent); cursor: pointer; }
    .kkw-consent small { display: block; margin-top: 2px; font-size: 11px; color: var(--kkw-muted); }
    .kkw-note { margin: -8px 0 12px; font-size: 11px; color: var(--kkw-muted); }
    .kkw-submit {
      display: block; width: 100%; margin: 8px 0 0; padding: 9px; cursor: pointer;
      font: 600 13px/1.2 var(--kkw-font);
      background: var(--kkw-accent); color: var(--kkw-accent-text);
      border: none; border-radius: var(--kkw-radius-sm);
    }
    .kkw-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .kkw-msg { font-size: 12px; margin-top: 8px; min-height: 0; }
    .kkw-msg.kkw-ok { color: var(--kkw-success); }
    .kkw-msg.kkw-err { color: var(--kkw-error); }
    .kkw-privacy { font-size: 11px; color: var(--kkw-muted); margin: 10px 0 0; }
    .kkw-privacy a { color: var(--kkw-accent); }

    /* Step 3: thank you */
    .kkw-done { text-align: center; padding: 8px 0 2px; }
    .kkw-done .kkw-sub { margin-bottom: 4px; }
    .kkw-done-icon { display: block; width: 40px; height: 40px; margin: 0 auto 10px; color: var(--kkw-success); }
    .kkw-link-btn {
      margin: 6px 0 0; padding: 6px 8px; cursor: pointer;
      font: 600 13px/1.2 var(--kkw-font); color: var(--kkw-accent);
      background: none; border: none; border-radius: var(--kkw-radius-sm);
    }

    /* "Powered by Kudos Kit" (branding: false hides it) */
    .kkw-brand {
      display: flex; align-items: center; justify-content: center; gap: 5px;
      margin: 14px 0 -6px; padding: 4px; border-radius: var(--kkw-radius-sm);
      font: 11px/1.2 var(--kkw-font); color: var(--kkw-muted); text-decoration: none;
    }
    .kkw-brand:hover { color: var(--kkw-text); }
    .kkw-brand-mark { width: 12px; height: 12px; opacity: 0.7; }

    .kkw-btn:focus-visible, .kkw-type:focus-visible, .kkw-back:focus-visible,
    .kkw-submit:focus-visible, .kkw-link-btn:focus-visible, .kkw-consent input:focus-visible,
    .kkw-brand:focus-visible {
      outline: 2px solid var(--kkw-accent); outline-offset: 2px;
    }
    @media (prefers-reduced-motion: reduce) { .kkw-type, .kkw-type-icon, .kkw-star-icon { transition: none; } }
  `}var q={bug:{label:"Bug",hint:"Something isn\u2019t working",title:"Report a bug",field:"What went wrong?",placeholder:"What did you do, what did you expect, and what happened instead?",thanks:"We\u2019ll look into it.",icon:'<path d="M8 6.5V5a4 4 0 0 1 8 0v1.5"/><rect x="6" y="6.5" width="12" height="13" rx="6"/><path d="M12 10v9.5M6 12H2.5M21.5 12H18M6.5 17l-3 2M17.5 17l3 2M6.5 8 4 6M17.5 8 20 6"/>'},idea:{label:"Idea",hint:"A suggestion",title:"Share an idea",field:"Your idea",placeholder:"What would make this better for you?",thanks:"Ideas like this shape what we build next.",icon:'<path d="M9 18h6M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 0 0-4 11.6c.6.5 1 1.3 1 2.1v.3h6v-.3c0-.8.4-1.6 1-2.1a6.5 6.5 0 0 0-4-11.6z"/>'},praise:{label:"Praise",hint:"Something you like",title:"Send praise",field:"What do you like?",placeholder:"Tell us what works well for you.",thanks:"That made our day.",icon:'<path d="M12 20.5s-8.5-4.9-8.5-11A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.5 2.9c0 6.1-8.5 11-8.5 11z"/>'},other:{label:"Other",hint:"Anything else",title:"Send feedback",field:"Message",placeholder:"What\u2019s on your mind?",thanks:"We read every message.",icon:'<path d="M4 5.5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1z"/><path d="M8 10.5h8M8 13.5h5"/>'}},Le='<path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/>',Se='<svg class="kkw-brand-mark" viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path fill="currentColor" d="M32 6a24 24 0 1 1-12.6 44.4L8 56l4.6-11.6A24 24 0 0 1 32 6z"/></svg>',Ce="https://kudoskit.io",X=(n,e)=>`<svg class="${e}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${n}</svg>`;function i(n,e,t){let r=document.createElement(n);return e&&(r.className=e),t!==void 0&&(r.textContent=t),r}var He=0,j=n=>`kkw-${n}-${++He}`,Y=class{constructor(e){this.config=e;this.container=null;this.button=null;this.panel=null;this.styleEl=null;this.visible=!1;this.step="choose";this.kind=null;this.views={};this.refs={}}mount(){this.styleEl=document.createElement("style"),this.styleEl.textContent=Z(this.config),document.head.appendChild(this.styleEl),this.button=i("button","kkw-btn"),this.button.type="button",this.button.innerHTML=X(Le,"kkw-btn-icon"),this.button.appendChild(i("span",void 0,"Feedback")),this.button.setAttribute("aria-haspopup","dialog"),this.button.onclick=()=>this.togglePanel(),this.panel=this.buildPanel(),this.container=i("div","kkw-root"),this.container.dataset.kkwMode=W(this.config.theme),this.container.appendChild(this.button),this.container.appendChild(this.panel),document.body.appendChild(this.container),this.panel.style.display="none"}buildPanel(){let e=i("div","kkw-panel");return e.setAttribute("role","dialog"),e.setAttribute("aria-label","Send feedback"),e.addEventListener("keydown",t=>{var r;t.key==="Escape"&&(t.stopPropagation(),this.hidePanel(),(r=this.button)==null||r.focus())}),this.views.choose=this.buildChooseStep(),this.views.write=this.buildWriteStep(),this.views.done=this.buildDoneStep(),e.append(this.views.choose,this.views.write,this.views.done),this.config.branding!==!1&&e.appendChild(this.buildBranding()),this.showStep("choose"),e}buildChooseStep(){let e=i("div","kkw-step"),t=j("choose-title"),r=i("div","kkw-band"),s=i("strong","kkw-title","Send feedback");s.id=t;let g=i("p","kkw-sub","What would you like to share?");r.append(s,g);let p=i("div","kkw-types");p.setAttribute("role","group"),p.setAttribute("aria-labelledby",t);for(let a of Object.keys(q)){let d=q[a],l=i("button","kkw-type");l.type="button",l.dataset.type=a,l.innerHTML=X(d.icon,"kkw-type-icon"),l.append(i("strong",void 0,d.label),i("span","kkw-hint",d.hint)),l.onclick=()=>this.choose(a),p.appendChild(l)}return e.append(r,p),e}buildWriteStep(){var re;let e=i("div","kkw-step"),t=i("div","kkw-head kkw-band"),r=i("button","kkw-back","\u2039");r.type="button",r.setAttribute("aria-label","Back: choose another type"),r.title="Choose another type",r.onclick=()=>this.goBack();let s=i("strong","kkw-title");t.append(r,s);let g=i("fieldset","kkw-rating"),p=i("legend","kkw-label",`How would you rate ${((re=this.config.appName)==null?void 0:re.trim())||"your experience"}? (optional)`),a=i("div","kkw-stars"),d=j("rating"),l=[];for(let k=5;k>=1;k--){let h=i("input","kkw-star-input");h.type="radio",h.name=d,h.value=String(k),h.id=`${d}-${k}`;let u=i("label","kkw-star");u.htmlFor=h.id,u.title=`${k} of 5`,u.innerHTML=X('<path d="M12 2.8l2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17.1 6.4 20l1.1-6.2-4.6-4.4 6.3-.9z"/>',"kkw-star-icon"),u.appendChild(i("span","kkw-sr",`${k} star${k===1?"":"s"}`)),u.addEventListener("mousedown",()=>{u.dataset.wasChecked=String(h.checked)}),u.addEventListener("click",I=>{u.dataset.wasChecked==="true"&&(I.preventDefault(),h.checked=!1),delete u.dataset.wasChecked}),a.append(h,u),l.push(h)}a.addEventListener("keydown",k=>{var ie,oe;let h=k.key==="ArrowRight"||k.key==="ArrowUp"?1:k.key==="ArrowLeft"||k.key==="ArrowDown"?-1:0;if(!h)return;k.preventDefault();let u=Number((oe=(ie=l.find(J=>J.checked))==null?void 0:ie.value)!=null?oe:0),I=l.find(J=>Number(J.value)===Math.min(5,Math.max(1,u+h)));I&&(I.checked=!0,I.focus())}),g.append(p,a);let M=j("message"),L=i("label","kkw-label");L.htmlFor=M;let T=i("textarea","kkw-textarea");T.id=M,T.maxLength=5e3,T.required=!0;let H=j("email"),$=i("label","kkw-label","Email (optional)");$.htmlFor=H;let v=i("input","kkw-input");v.id=H,v.type="email",v.autocomplete="email",v.placeholder="you@example.com";let A=i("label","kkw-consent"),x=i("input");x.type="checkbox";let B=i("span",void 0,"You may show my message publicly as a testimonial.");B.appendChild(i("small",void 0,"Optional. You can withdraw this at any time.")),A.append(x,B);let E=i("div","kkw-hidden"),F=j("name"),R=i("label","kkw-label","Name to show (optional)");R.htmlFor=F;let f=i("input","kkw-input");f.id=F,f.type="text",f.maxLength=80,f.autocomplete="name",f.placeholder="e.g. Maria, illustrator",E.append(R,f,i("p","kkw-note","Leave empty to appear as Anonymous.")),x.onchange=()=>{E.classList.toggle("kkw-hidden",!x.checked),x.checked&&f.focus()};let b=i("input","kkw-hp");b.type="text",b.style.display="none",b.tabIndex=-1,b.autocomplete="off",b.setAttribute("aria-hidden","true");let P=i("div","kkw-turnstile"),S=i("button","kkw-submit","Send");S.type="button";let C=i("div","kkw-msg");C.setAttribute("role","status"),C.setAttribute("aria-live","polite");let K=i("p","kkw-privacy"),ne=document.createTextNode("");if(K.appendChild(ne),this.config.privacyUrl){let k=i("a",void 0,"Privacy policy");k.href=this.config.privacyUrl,k.target="_blank",k.rel="noopener noreferrer",K.append(k,document.createTextNode("."))}return e.append(t,g,L,T,$,v,A,E,b,P,S,C,K),this.refs=y(c({},this.refs),{title:s,ratingBox:g,ratingInputs:l,fieldLabel:L,textarea:T,email:v,consentBox:A,consent:x,nameBox:E,name:f,hp:b,turnstile:P,submit:S,msg:C,privacy:K,privacyText:ne}),e}buildDoneStep(){let e=i("div","kkw-step kkw-done");e.innerHTML=X('<circle cx="12" cy="12" r="9.5"/><path d="m7.5 12.5 3 3 6-6.5"/>',"kkw-done-icon");let t=i("strong","kkw-title","Thanks for your feedback!"),r=i("p","kkw-sub"),s=i("button","kkw-link-btn","Send more feedback");return s.type="button",s.onclick=()=>this.reset(),e.append(t,r,s),this.refs=y(c({},this.refs),{doneText:r}),e}buildBranding(){let e=i("a","kkw-brand");return e.href=Ce,e.target="_blank",e.rel="noopener noreferrer",e.innerHTML=Se,e.appendChild(document.createTextNode("Powered by Kudos Kit")),e}showStep(e){this.step=e;for(let[t,r]of Object.entries(this.views))r.classList.toggle("kkw-hidden",t!==e)}markChosen(e){var t;(t=this.panel)==null||t.querySelectorAll(".kkw-type").forEach(r=>{r.setAttribute("aria-pressed",String(r.dataset.type===e))})}choose(e){this.kind=e,this.markChosen(e);let t=q[e],r=this.refs;r.title.textContent=t.title,r.fieldLabel.textContent=`${t.field} *`,r.textarea.placeholder=t.placeholder,r.ratingBox.classList.toggle("kkw-hidden",e==="bug"),r.consentBox.classList.toggle("kkw-hidden",e!=="praise"),r.nameBox.classList.toggle("kkw-hidden",!(e==="praise"&&r.consent.checked)),r.privacyText.textContent=e==="bug"?"Bug reports include technical diagnostics (console logs). ":"",r.privacy.classList.toggle("kkw-hidden",e!=="bug"&&!this.config.privacyUrl),this.showMessage(""),this.showStep("write"),r.textarea.focus()}goBack(){var e,t;this.showMessage(""),this.showStep("choose"),(t=(e=this.panel)==null?void 0:e.querySelector(`.kkw-type[data-type="${this.kind}"]`))==null||t.focus()}showDone(){var e,t;this.refs.doneText.textContent=this.kind?q[this.kind].thanks:"",this.showStep("done"),(t=(e=this.panel)==null?void 0:e.querySelector(".kkw-link-btn"))==null||t.focus()}reset(){var t,r;let e=this.refs;e.textarea.value="",e.email.value="",e.consent.checked=!1,e.ratingInputs.forEach(s=>{s.checked=!1}),e.name.value="",e.nameBox.classList.add("kkw-hidden"),e.hp.value="",this.kind=null,this.markChosen(null),this.showMessage(""),this.setSubmitState(!1),this.showStep("choose"),(r=(t=this.panel)==null?void 0:t.querySelector(".kkw-type"))==null||r.focus()}getSelectedType(){return this.kind}getMessage(){return this.refs.textarea.value.trim()}getEmail(){return this.refs.email.value.trim()}getHoneypot(){return this.refs.hp.value}getRating(){if(this.kind==="bug")return null;let e=this.refs.ratingInputs.find(t=>t.checked);return e?Number(e.value):null}getTestimonial(){let e=this.kind==="praise"&&this.refs.consent.checked;return{ok:e,name:e?this.refs.name.value.trim():""}}setSubmitState(e){this.refs.submit.disabled=e,this.refs.submit.textContent=e?"Sending\u2026":"Send"}showMessage(e,t=!1){let r=this.refs.msg;r.textContent=e,r.classList.toggle("kkw-err",t&&e!==""),r.classList.toggle("kkw-ok",!t&&e!=="")}getTurnstileContainer(){var e;return(e=this.refs.turnstile)!=null?e:null}getSubmitButton(){var e;return(e=this.refs.submit)!=null?e:null}togglePanel(){this.visible?this.hidePanel():this.showPanel()}showPanel(){var e;this.panel&&!this.visible&&(this.panel.style.display="block",this.visible=!0,(e=this.button)==null||e.setAttribute("aria-expanded","true"))}hidePanel(){var e;this.panel&&this.visible&&(this.panel.style.display="none",this.visible=!1,(e=this.button)==null||e.setAttribute("aria-expanded","false"),this.step==="done"&&this.reset())}setTheme(e){this.config=y(c({},this.config),{theme:V(this.config.theme,e)}),this.styleEl&&(this.styleEl.textContent=Z(this.config)),this.container&&(this.container.dataset.kkwMode=W(this.config.theme))}getThemeMode(){return W(this.config.theme)}isVisible(){return this.visible}showButton(){this.button&&(this.button.style.display="")}hideButton(){this.button&&(this.button.style.display="none")}destroy(){var e,t;(e=this.container)==null||e.remove(),this.container=null,this.button=null,this.panel=null,(t=this.styleEl)==null||t.remove(),this.styleEl=null,this.visible=!1,this.step="choose",this.kind=null}};var $e=(()=>{var e;let n=(e=document.currentScript)==null?void 0:e.src;try{return n?new URL(n).origin:null}catch(t){return null}})();function Ae(n){var t;let e=(t=n.apiUrl)!=null?t:$e;return e?e.replace(/\/+$/,"")+"/v1/feedback":null}var N=null,o=null,w=null,m=null,O={},G=null;function Be(n,e){var t;((t=O[n])!=null?t:O[n]=[]).push(e)}function ee(n,e){var t;(t=O[n])==null||t.forEach(r=>r(e))}function ue(){var n;return(n=o==null?void 0:o.isVisible())!=null?n:!1}function we(){o&&(o.showButton(),o.showPanel(),ee("visibilitychange",!0))}function te(){o&&(o.hideButton(),o.hidePanel(),ee("visibilitychange",!1))}function Fe(){ue()?te():we()}function Q(){var n;if(G!==null){try{(n=window.turnstile)==null||n.remove(G)}catch(e){}G=null}}function Re(){Q(),o==null||o.destroy(),o=null,w==null||w.restore(),w=null,m=null,O={},N=null}function Pe(n){!o||!m||(m=y(c({},m),{theme:V(m.theme,n)}),o.setTheme(n))}async function Ie(){var p;if(!o||!m||!N)return;let n=o.getSelectedType();if(!n)return;let e=o.getMessage();if(!e){o.showMessage("Please enter a message.",!0);return}o.setSubmitState(!0),o.showMessage("");let t="";try{t=await new Promise((a,d)=>{let l=o.getTurnstileContainer();if(!l)return d(new Error("No Turnstile container"));if(!window.turnstile)return d(new Error("Turnstile not loaded"));Q(),G=window.turnstile.render(l,{sitekey:m.turnstileSiteKey,theme:o.getThemeMode(),callback:a,"error-callback":d})})}catch(a){let d=a.message==="Turnstile not loaded"?"Please wait a moment and try again.":"CAPTCHA failed. Please try again.";o.showMessage(d,!0),o.setSubmitState(!1);return}let r=o.getTestimonial(),s=o.getRating(),g=y(c(c({project:m.project,type:n,message:e,email:o.getEmail()||void 0,user:m.user,context:{url:location.href,referrer:document.referrer,userAgent:navigator.userAgent,viewport:{w:window.innerWidth,h:window.innerHeight},language:navigator.language,build:window.__APP_VERSION__,ts:new Date().toISOString()}},s?{rating:s}:{}),r.ok?{testimonialOk:!0,testimonialName:r.name||void 0}:{}),{hp:o.getHoneypot(),turnstileToken:t});w&&((p=m.console)!=null&&p.sendOn.includes(n))&&(g.console=w.getLogs(),g.errors=w.getErrors());try{let a=await fetch(N,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(g)});if(!a.ok)throw new Error(`${a.status}`);Q(),w==null||w.clear(),o.setSubmitState(!1),o.showDone(),ee("submit",{type:n})}catch(a){o.showMessage("Failed to send. Please try again.",!0),o.setSubmitState(!1)}}function ze(n){var e,t;if(!o){if(N=Ae(n),!N){console.warn("[kkw] Could not determine the API URL. Pass apiUrl to Feedback.init().");return}if(m=n,(e=n.console)!=null&&e.enabled&&(w=new _({max:n.console.max,maxBytes:n.console.maxBytes,redact:n.console.redact}),w.install()),o=new Y(n),o.mount(),(t=o.getSubmitButton())==null||t.addEventListener("click",Ie),n.startHidden&&te(),!window.turnstile&&!document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')){let r=document.createElement("script");r.src="https://challenges.cloudflare.com/turnstile/v0/api.js",r.async=!0,document.head.appendChild(r)}}}return Te(je);})();
