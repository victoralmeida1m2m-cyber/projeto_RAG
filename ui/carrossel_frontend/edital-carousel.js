/* Edital Fácil — componente independente, sem dependências externas. */
(() => {
  'use strict';
  if (customElements.get('edital-carousel')) return;
  const css = `
    :host{display:block;--ef-accent:#152f43;--ef-bg:#fff;--ef-text:#142635;color:var(--ef-text);font-family:system-ui,sans-serif}
    *{box-sizing:border-box}button{font:inherit;cursor:pointer}button:disabled{cursor:default;opacity:.45}
    .panel{background:var(--ef-bg);border:1px solid #dae1e5;border-radius:28px;padding:32px 0 28px;overflow:hidden}
    header,.info,.controls{padding:0 24px;text-align:center}.eyebrow{font:12px ui-monospace,monospace;letter-spacing:.15em;color:#526879;text-transform:uppercase}
    h2{font-size:clamp(27px,4vw,48px);font-weight:500;letter-spacing:-.04em;margin:12px 0 8px;line-height:1.15}
    .hint,.sub,.empty{color:#526879;font-size:14px;line-height:1.6;margin:0}.visual{position:relative;margin:24px 0 18px}
    .track{display:flex;gap:20px;padding:24px max(24px,calc((100% - var(--card-width,320px))/2));overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:thin;overscroll-behavior-x:contain;touch-action:pan-x pan-y;cursor:grab}
    .track.drag{cursor:grabbing;scroll-snap-type:none;user-select:none}.card{flex:0 0 var(--card-width,320px);width:var(--card-width,320px);height:220px;border-radius:18px;scroll-snap-align:center;position:relative;background:linear-gradient(135deg,hsl(var(--hue) 70% 78%),hsl(var(--hue) 60% 38%));overflow:hidden;box-shadow:0 12px 20px #10263715}
    .card::before{content:'';position:absolute;inset:12%;border:1px solid #ffffff70;border-radius:50%;box-shadow:0 0 0 22px #ffffff12,0 0 0 44px #ffffff12}
    .card img{position:absolute;width:100%;height:100%;object-fit:cover}.card label{position:absolute;bottom:14px;left:14px;right:14px;padding:10px 12px;border-radius:10px;color:white;background:#0d243b99;backdrop-filter:blur(10px);font-size:14px;pointer-events:none;overflow-wrap:anywhere}
    canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:none}.visual.enhanced canvas{display:block}.visual.enhanced .card{opacity:0}
    .info{min-height:90px}.title{font-size:clamp(22px,3vw,32px);font-weight:500;margin:0 0 6px;overflow-wrap:anywhere}.sub{overflow-wrap:anywhere}
    .controls{display:flex;justify-content:center;align-items:center;gap:12px;flex-wrap:wrap;margin-top:16px}.arrow,.pause{border:1px solid #d4dde2;background:var(--ef-bg);color:var(--ef-text);border-radius:999px;padding:12px 16px}.action{border:1px solid rgba(199,255,77,.35);border-radius:999px;background:var(--ef-accent);color:#0b0c10;padding:14px 28px;font-weight:800;letter-spacing:.02em;box-shadow:0 10px 24px rgba(199,255,77,.16);transition:transform .2s,filter .2s,box-shadow .2s}.action:hover{transform:translateY(-2px);filter:brightness(1.02);box-shadow:0 14px 28px rgba(199,255,77,.22)}
    button:focus-visible,.track:focus-visible{outline:3px solid #387dad;outline-offset:4px}.status{font:12px ui-monospace,monospace;color:#526879;min-width:52px;text-align:center}.empty{padding:30px;text-align:center}.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
    @media(max-width:600px){.panel{padding-top:24px;border-radius:18px}.card{height:210px}.hint{font-size:13px}.controls{gap:8px;padding:0 16px}.action{padding:13px 20px}}
    @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
  `;
  class EditalCarousel extends HTMLElement {
    static get observedAttributes() { return ['autoplay','webgl','action-label']; }
    constructor() {
      super();
      this.attachShadow({mode:'open'});
      this._items = []; this._index = 0; this._paused = false; this._hover = false;
      this._inView = true; this._raf = 0; this._timer = 0;
    }
    get items() { return this._items.map(item => ({...item})); }
    set items(value) {
      if (!Array.isArray(value)) throw new TypeError('items deve ser um array.');
      const items = value.map((item, i) => {
        if (!item || typeof item !== 'object') throw new TypeError(`Item ${i} inválido.`);
        return {...item, id:String(item.id ?? i), title:String(item.title ?? 'Edital'),
          subtitle:String(item.subtitle ?? ''), hue:Number.isFinite(Number(item.hue)) ? Number(item.hue) : 200 + i*35,
          image:typeof item.image === 'string' ? item.image : ''};
      });
      this._items = items; this._index = 0;
      if (this.isConnected && this._controller) this._renderItems();
    }
    get selectedItem() { return this._items[this._index] ? {...this._items[this._index]} : null; }
    attributeChangedCallback() {
      if (!this._controller) return;
      this._action.textContent = this.getAttribute('action-label') || 'Consultar edital';
      this._setupGL(); this._schedule();
    }
    connectedCallback() {
      // Também aceita configuração antes de o script registrar o elemento.
      if (Object.prototype.hasOwnProperty.call(this,'items')) {
        const value = this.items; delete this.items; this.items = value;
      }
      this._controller = new AbortController();
      const signal = this._controller.signal;
      this.shadowRoot.innerHTML = `<style>${css}</style><section class="panel" role="region" aria-roledescription="carrossel" aria-label="Seleção de editais">
        <header><div class="eyebrow">Edital Fácil / seus documentos</div><h2>Seu próximo passo começa aqui.</h2><p class="hint">Escolha um edital para começar sua consulta.</p></header>
        <div class="visual"><div class="track" tabindex="0" role="group" aria-label="Editais. Use as setas para navegar."></div><canvas aria-hidden="true"></canvas></div>
        <div class="info"><h3 class="title"></h3><p class="sub"></p><p class="sr" aria-live="polite" aria-atomic="true"></p></div>
        <div class="controls"><button class="arrow prev" type="button" aria-label="Edital anterior">←</button><span class="status"></span><button class="arrow next" type="button" aria-label="Próximo edital">→</button><button class="action" type="button"></button><button class="pause" type="button"></button></div>
      </section>`;
      const q = sel => this.shadowRoot.querySelector(sel);
      this._track=q('.track'); this._visual=q('.visual'); this._canvas=q('canvas');
      this._title=q('.title'); this._sub=q('.sub'); this._status=q('.status'); this._live=q('.sr');
      this._action=q('.action'); this._pause=q('.pause'); this._prev=q('.prev'); this._next=q('.next');
      this._action.textContent=this.getAttribute('action-label') || 'Consultar edital';
      const on=(el,type,fn)=>el.addEventListener(type,fn,{signal});
      on(this._prev,'click',()=>this.goTo(this._index-1));
      on(this._next,'click',()=>this.goTo(this._index+1));
      on(this._action,'click',()=>{
        if (this.selectedItem) this.dispatchEvent(new CustomEvent('edital-select',{detail:{item:this.selectedItem,index:this._index},bubbles:true,composed:true}));
      });
      on(this._pause,'click',()=>{this._paused=!this._paused;this._schedule();});
      on(this._track,'keydown',e=>{
        const keys={ArrowRight:()=>this.goTo(this._index+1),ArrowLeft:()=>this.goTo(this._index-1),Home:()=>this.goTo(0),End:()=>this.goTo(this._items.length-1)};
        if(keys[e.key]){e.preventDefault();keys[e.key]();}
      });
      on(this._track,'scroll',()=>{this._syncFromScroll();this._paint();this._schedule();});
      // O toque usa a rolagem nativa; o mouse ganha arraste sem capturar botões da aplicação.
      on(this._track,'pointerdown',e=>{
        if(e.pointerType!=='mouse'||e.button!==0||this._items.length<2)return;
        this._drag={id:e.pointerId,x:e.clientX,left:this._track.scrollLeft};
        this._track.setPointerCapture(e.pointerId);this._track.classList.add('drag');this._schedule();
      });
      on(this._track,'pointermove',e=>{if(this._drag && e.pointerId===this._drag.id)this._track.scrollLeft=this._drag.left-(e.clientX-this._drag.x);});
      const release=()=>{if(!this._drag)return;this._drag=null;this._track.classList.remove('drag');this.goTo(this._index);};
      on(this._track,'pointerup',release);on(this._track,'pointercancel',release);on(this._track,'lostpointercapture',release);
      on(this,'mouseenter',()=>{this._hover=true;this._schedule();});on(this,'mouseleave',()=>{this._hover=false;this._schedule();});
      on(this,'focusin',()=>this._schedule());on(this,'focusout',()=>queueMicrotask(()=>{if(this.isConnected)this._schedule();}));
      on(document,'visibilitychange',()=>{this._schedule();this._paint();});
      this._motion=matchMedia('(prefers-reduced-motion: reduce)');
      on(this._motion,'change',()=>{this._setupGL();this._schedule();});
      on(this._canvas,'webglcontextlost',e=>{e.preventDefault();this._visual.classList.remove('enhanced');this._gl=null;});
      on(this._canvas,'webglcontextrestored',()=>{this._setupGL();this._paint();});
      this._resize=new ResizeObserver(()=>{this._layout();this._paint();});this._resize.observe(this);
      this._intersection=new IntersectionObserver(entries=>{this._inView=entries[0].isIntersecting;this._schedule();this._paint();});this._intersection.observe(this);
      this._renderItems();
    }
    disconnectedCallback() {
      this._controller?.abort();this._controller=null;
      this._resize?.disconnect();this._intersection?.disconnect();
      clearTimeout(this._timer);cancelAnimationFrame(this._raf);this._raf=0;
      this._destroyGL(); this._drag=null;
    }
    _renderItems() {
      this._track.replaceChildren(); this._art=[];
      this._items.forEach((item,i)=>{
        const card=document.createElement('div');card.className='card';card.style.setProperty('--hue',String(item.hue));
        card.setAttribute('role','group');card.setAttribute('aria-roledescription','slide');card.setAttribute('aria-label',`${i+1} de ${this._items.length}: ${item.title}`);
        const label=document.createElement('label');label.textContent=item.title;card.append(label);
        const art=document.createElement('canvas');art.width=640;art.height=440;
        const ctx=art.getContext('2d');const gradient=ctx.createLinearGradient(0,0,640,440);
        gradient.addColorStop(0,`hsl(${item.hue} 70% 78%)`);gradient.addColorStop(1,`hsl(${item.hue+35} 65% 35%)`);
        ctx.fillStyle=gradient;ctx.fillRect(0,0,640,440);ctx.strokeStyle='#ffffff50';ctx.lineWidth=2;
        for(let k=1;k<6;k++){ctx.beginPath();ctx.arc(320,210,k*43,0,Math.PI*2);ctx.stroke();}
        this._art.push(art);
        if(item.image){
          try {
            const url=new URL(item.image,document.baseURI);
            if(!['http:','https:'].includes(url.protocol))throw new Error('Protocolo de imagem não permitido');
            const img=document.createElement('img');img.alt='';img.draggable=false;
            // CORS é necessário para o efeito WebGL; se falhar, mantém a arte gerada.
            img.crossOrigin='anonymous';img.onload=()=>{if(this._controller && this._items[i]===item){this._art[i]=img;this._paint();}};
            img.onerror=()=>img.remove();img.src=url.href;card.prepend(img);
          }catch{/* Dados inválidos não impedem a navegação. */}
        }
        this._track.append(card);
      });
      this._track.hidden=!this._items.length;this._visual.hidden=!this._items.length;
      this._action.disabled=!this._items.length;
      this._prev.disabled=this._next.disabled=this._items.length<2;
      this._track.scrollLeft=0;this._layout();this._syncText(false);this._setupGL();this._schedule();
    }
    _layout() {
      const width=Math.max(1,this.getBoundingClientRect().width);
      this._track.style.setProperty('--card-width',`${Math.min(360,Math.max(160,width-64))}px`);
      this._track.scrollLeft=this._offset(this._index);
    }
    _offset(index) {
      const card=this._track.children[index];if(!card)return 0;
      const a=card.getBoundingClientRect(),b=this._track.getBoundingClientRect();
      return this._track.scrollLeft+a.left-b.left-(this._track.clientWidth-a.width)/2;
    }
    goTo(index) {
      if(!this._items.length)return;
      const n=this._items.length;const i=((Math.round(Number(index)||0)%n)+n)%n;
      this._track.scrollTo({left:this._offset(i),behavior:this._motion.matches?'instant':'smooth'});
      this._schedule();
    }
    _syncFromScroll() {
      if(!this._items.length)return;
      const mid=this._track.getBoundingClientRect().left+this._track.clientWidth/2;
      let nearest=0,distance=Infinity;
      [...this._track.children].forEach((card,i)=>{const r=card.getBoundingClientRect(),d=Math.abs(r.left+r.width/2-mid);if(d<distance){distance=d;nearest=i;}});
      if(nearest!==this._index){this._index=nearest;this._syncText(true);}
    }
    _syncText(animate) {
      const item=this._items[this._index];
      this._title.textContent=item?.title || 'Nenhum edital disponível';
      this._sub.textContent=item?.subtitle || (item?'':'Adicione documentos para iniciar.');
      this._status.textContent=item?`${this._index+1} / ${this._items.length}`:'0 / 0';
      this._live.textContent=item?`Edital ${this._index+1} de ${this._items.length}: ${item.title}`:'Nenhum edital disponível';
      if(animate && !this._motion.matches){
        this._title.getAnimations().forEach(a=>a.cancel());
        this._title.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:350,easing:'ease-out'});
      }
      this.dispatchEvent(new CustomEvent('edital-change',{detail:{item:this.selectedItem,index:this._index},bubbles:true,composed:true}));
    }
    _schedule() {
      clearTimeout(this._timer);
      const interval=Number(this.getAttribute('autoplay'));
      this._pause.hidden=!(interval>0) || this._motion.matches || this._items.length<2;
      this._pause.textContent=this._paused?'Retomar animação':'Pausar animação';
      this._pause.setAttribute('aria-pressed',String(this._paused));
      if(interval>0 && !this._paused && !this._hover && !this._drag && !this.shadowRoot.activeElement && !this._motion.matches && !document.hidden && this._inView && this._items.length>1){
        this._timer=setTimeout(()=>this.goTo(this._index+1),Math.max(3000,interval));
      }
    }
    _destroyGL() {
      if(this._gl){this._gl.deleteTexture(this._tex);this._gl.deleteBuffer(this._buffer);this._gl.deleteProgram(this._program);}
      this._gl=null;this._visual?.classList.remove('enhanced');
    }
    _setupGL() {
      this._destroyGL();
      if(this.getAttribute('webgl')!=='true'||this._motion.matches||!this._items.length)return;
      let gl,program,buffer,tex;const shaders=[];
      try {
        gl=this._canvas.getContext('webgl',{alpha:false,antialias:false});if(!gl)return;
        const shader=(type,source)=>{const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error('Shader inválido');return s;};
        program=gl.createProgram();
        gl.attachShader(program,shader(gl.VERTEX_SHADER,'attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}'));
        gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec2 uv;uniform sampler2D tex;void main(){float e=smoothstep(.16,.5,abs(uv.x-.5));vec2 q=vec2(.5+(uv.x-.5)*(1.-.10*e),.5+(uv.y-.5)/(1.+.65*e));float o=.004*e*e;gl_FragColor=vec4(texture2D(tex,q+vec2(o,0.)).r,texture2D(tex,q).g,texture2D(tex,q-vec2(o,0.)).b,1.);}`));
        gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Programa inválido');
        gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
        const p=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);
        tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        gl.uniform1i(gl.getUniformLocation(program,'tex'),0);
        this._gl=gl;this._program=program;this._buffer=buffer;this._tex=tex;
        this._off=document.createElement('canvas');this._visual.classList.add('enhanced');this._paint();
      } catch {
        if(gl){if(tex)gl.deleteTexture(tex);if(buffer)gl.deleteBuffer(buffer);if(program)gl.deleteProgram(program);}
        this._gl=null;this._visual.classList.remove('enhanced');
      } finally {if(gl)shaders.forEach(s=>gl.deleteShader(s));}
    }
    _paint() {
      if(!this._gl||this._raf||document.hidden||!this._inView)return;
      this._raf=requestAnimationFrame(()=>{
        this._raf=0;if(!this._gl||!this.isConnected||document.hidden||!this._inView)return;
        try {
          const gl=this._gl,rect=this._visual.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
          const w=Math.max(1,Math.round(rect.width*dpr)),h=Math.max(1,Math.round(rect.height*dpr));
          if(this._canvas.width!==w||this._canvas.height!==h){this._canvas.width=this._off.width=w;this._canvas.height=this._off.height=h;}
          const ctx=this._off.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
          ctx.fillStyle=getComputedStyle(this).getPropertyValue('--ef-bg').trim()||'#fff';ctx.fillRect(0,0,rect.width,rect.height);
          [...this._track.children].forEach((card,i)=>{
            const r=card.getBoundingClientRect(),x=r.left-rect.left,y=r.top-rect.top;
            if(x+r.width<0||x>rect.width)return;
            const im=this._art[i],iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;
            const scale=Math.max(r.width/iw,r.height/ih);
            ctx.save();ctx.beginPath();ctx.roundRect(x,y,r.width,r.height,18);ctx.clip();
            ctx.drawImage(im,x+(r.width-iw*scale)/2,y+(r.height-ih*scale)/2,iw*scale,ih*scale);ctx.restore();
          });
          gl.viewport(0,0,w,h);gl.useProgram(this._program);gl.bindTexture(gl.TEXTURE_2D,this._tex);
          gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,this._off);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
        }catch{this._destroyGL();}
      });
    }
  }
  customElements.define('edital-carousel',EditalCarousel);
})();
