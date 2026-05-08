(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const i of s.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function n(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(o){if(o.ep)return;o.ep=!0;const s=n(o);fetch(o.href,s)}})();const ne="financeHub",U={income:{},carryover:{},carryoverDismissed:[],categories:[],expenses:[],bills:[],goals:[],pots:[]};function ae(){try{const e=localStorage.getItem(ne);if(!e)return structuredClone(U);const t=JSON.parse(e);return{...U,...t}}catch{return structuredClone(U)}}function $(e){localStorage.setItem(ne,JSON.stringify(e))}function w(e,t){return e.income[t]??0}function me(e,t,n){e.income[t]=n,$(e)}function B(e,t){return e.carryover[t]??0}function oe(e,t,n){e.carryover[t]=n,$(e)}function pe(e,t){return(e.carryoverDismissed||[]).includes(t)}function be(e,t){e.carryoverDismissed||(e.carryoverDismissed=[]),e.carryoverDismissed.includes(t)||e.carryoverDismissed.push(t),$(e)}function z(e,t){return e.expenses.filter(n=>n.date&&n.date.startsWith(t))}function I(e,t){return z(e,t).reduce((n,a)=>n+(a.amount||0),0)}function D(e,t){const n=parseInt(t.split("-")[1],10);return e.bills.filter(a=>a.frequency==="annual"?a.annualMonth===n:!0).reduce((a,o)=>a+(o.amount||0),0)}function ge(e){const t=e.goals.reduce((a,o)=>a+(o.saved||0),0),n=e.pots.reduce((a,o)=>a+(o.balance||0),0);return t+n}function fe(e,t){e.expenses.push(t),$(e)}function ye(e,t){e.expenses=e.expenses.filter(n=>n.id!==t),$(e)}function _e(e,t){e.categories.push(t),$(e)}function $e(e,t,n){const a=e.categories.findIndex(o=>o.id===t);a!==-1&&(e.categories[a]={...e.categories[a],...n}),$(e)}function he(e,t){e.categories=e.categories.filter(n=>n.id!==t),e.expenses=e.expenses.filter(n=>n.categoryId!==t),$(e)}function Me(e,t){e.bills.push(t),$(e)}function we(e,t,n){const a=e.bills.findIndex(o=>o.id===t);a!==-1&&(e.bills[a]={...e.bills[a],...n}),$(e)}function Ee(e,t){e.bills=e.bills.filter(n=>n.id!==t),$(e)}function q(e,t,n){const a=`${t}-${String(n+1).padStart(2,"0")}`;if(e.manualOverride&&a in e.manualOverride)return e.manualOverride[a];const o=new Date;return o.getFullYear()===t&&o.getMonth()===n&&o.getDate()>=e.dayOfMonth}function Be(e,t,n){const a=`${t}-${String(n+1).padStart(2,"0")}`;return e.manualOverride&&a in e.manualOverride}function xe(e,t,n,a){const o=e.bills.find(l=>l.id===t);if(!o)return;o.manualOverride||(o.manualOverride={});const s=q(o,n,a),i=`${n}-${String(a+1).padStart(2,"0")}`;o.manualOverride[i]=!s,$(e)}function Se(e,t){e.goals.push(t),$(e)}function se(e,t,n){const a=e.goals.findIndex(o=>o.id===t);a!==-1&&(e.goals[a]={...e.goals[a],...n}),$(e)}function Le(e,t){e.goals=e.goals.filter(n=>n.id!==t),$(e)}function Ce(e,t){e.pots.push(t),$(e)}function ie(e,t,n){const a=e.pots.findIndex(o=>o.id===t);a!==-1&&(e.pots[a]={...e.pots[a],...n}),$(e)}function ke(e,t){e.pots=e.pots.filter(n=>n.id!==t),$(e)}function u(e){return"£"+Number(e||0).toLocaleString("en-GB",{minimumFractionDigits:2,maximumFractionDigits:2})}function A(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}function re(e,t){return`${e}-${String(t+1).padStart(2,"0")}`}function N(e){const[t,n]=e.split("-").map(Number);return{year:t,month:n-1}}function le(e,t){const{year:n,month:a}=N(e),o=new Date(n,a+t,1);return re(o.getFullYear(),o.getMonth())}function C(e){return le(e,-1)}function Ie(e){return le(e,1)}function H(e){const{year:t,month:n}=N(e);return new Date(t,n,1).toLocaleString("en-GB",{month:"long",year:"numeric"})}function Te(e){const{year:t,month:n}=N(e);return new Date(t,n,1).toLocaleString("en-GB",{month:"short"})}function O(e){const t=["th","st","nd","rd"],n=e%100;return e+(t[(n-20)%10]||t[n]||t[0])}function K(){const e=new Date;return`${e.getFullYear()}-${String(e.getMonth()+1).padStart(2,"0")}-${String(e.getDate()).padStart(2,"0")}`}function de(e){if(!e)return"";const[t,n,a]=e.split("-");return`${a}/${n}/${t}`}function J(e,t,n){return Math.min(Math.max(e,t),n)}const De=[{id:"overview",label:"Overview"},{id:"budget",label:"Budget"},{id:"bills",label:"Bills"},{id:"savings",label:"Savings"}];function Ne(e,t){return`
    <nav class="nav">
      <div class="nav__brand">Finance Hub</div>

      <div class="nav__tabs">
        ${De.map(n=>`
          <button
            class="nav__tab${n.id===t?" nav__tab--active":""}"
            data-tab="${n.id}"
          >${n.label}</button>
        `).join("")}
      </div>

      <div class="nav__month">
        <button class="nav__arrow" id="prev-month" aria-label="Previous month">&#8249;</button>
        <span class="nav__month-label">${H(e)}</span>
        <button class="nav__arrow" id="next-month" aria-label="Next month">&#8250;</button>
      </div>
    </nav>
  `}let W=null;function y(e,t="success"){const n=document.getElementById("toast-root");n&&(W&&clearTimeout(W),n.innerHTML=`<div class="toast toast--${t} toast--visible">${e}</div>`,W=setTimeout(()=>{const a=n.querySelector(".toast");a&&(a.classList.remove("toast--visible"),setTimeout(()=>{n.innerHTML=""},300))},3e3))}function X(e,t){return`
    <div class="overview-tab">
      ${Oe(e,t)}
      ${Ae(e,t)}
      <div class="overview-grid">
        ${Pe(e,t)}
        ${je(e,t)}
      </div>
      ${He(e,t)}
    </div>
  `}function Oe(e,t){const n=w(e,t),a=B(e,t),o=I(e,t),s=D(e,t),i=n+a-o-s,l=ge(e),r=a>0?`<div class="kpi-card__sub">Incl. ${u(a)} carry over</div>`:"";return`
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-card__label">Income</div>
        <div class="kpi-card__value">${u(n)}</div>
        <div class="kpi-card__sub">Base monthly</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__label">Spent</div>
        <div class="kpi-card__value" style="color:var(--red)">${u(o)}</div>
        <div class="kpi-card__sub">Categories total</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__label">Bills</div>
        <div class="kpi-card__value" style="color:var(--yellow)">${u(s)}</div>
        <div class="kpi-card__sub">This month</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__label">Remaining</div>
        <div class="kpi-card__value" style="color:${i>=0?"var(--green)":"var(--red)"}">${u(i)}</div>
        ${r}
      </div>
      <div class="kpi-card">
        <div class="kpi-card__label">Total Savings</div>
        <div class="kpi-card__value" style="color:var(--blue)">${u(l)}</div>
        <div class="kpi-card__sub">Goals + pots</div>
      </div>
    </div>
  `}function Ae(e,t){const n=w(e,t),a=B(e,t),o=n+a,s=I(e,t),i=o>0?J(s/o*100,0,100):0;return`
    <div class="card income-bar" style="margin-bottom:1.5rem">
      <div class="card__header">
        <span class="card__title">Income vs Spent</span>
        <span style="font-size:0.78rem;color:var(--muted);font-family:var(--font-mono)">${u(s)} / ${u(o)}</span>
      </div>
      <div class="income-bar__track">
        <div class="income-bar__fill" style="width:${i}%"></div>
      </div>
      <div class="income-bar__labels">
        <span style="color:var(--red)">Spent ${Math.round(i)}%</span>
        <span style="color:var(--green)">Remaining ${u(o-s)}</span>
      </div>
    </div>
  `}function Pe(e,t){const n=w(e,t)||1,a=e.categories.map(i=>{const l=z(e,t).filter(r=>r.categoryId===i.id).reduce((r,d)=>r+d.amount,0);return{cat:i,spent:l}}).sort((i,l)=>l.spent-i.spent),o=a.reduce((i,l)=>Math.max(i,l.spent),0)||1;return`
    <div class="card">
      <div class="card__header">
        <span class="card__title">Spending by Category</span>
      </div>
      <div class="category-chart">${a.length===0?`<div class="empty-state" style="padding:1rem 0">
         <div class="empty-state__icon">📂</div>
         No categories yet
       </div>`:a.map(({cat:i,spent:l})=>{const r=l/o*100,d=(l/n*100).toFixed(1);return`
          <div class="category-chart__row">
            <div class="category-chart__name">
              <span>${i.emoji||"📦"}</span>
              <span>${i.name}</span>
            </div>
            <div class="category-chart__bar-wrap">
              <div class="category-chart__bar-fill"
                   style="width:${r}%;background:${i.colour||"var(--accent)"}"></div>
            </div>
            <div class="category-chart__amount">${u(l)}</div>
            <div class="category-chart__pct">${d}%</div>
          </div>
        `}).join("")}</div>
    </div>
  `}function je(e,t){const{year:n,month:a}=N(t),o=a+1,s=new Date,i=s.getFullYear()===n&&s.getMonth()===a,r=[...e.bills.filter(c=>c.frequency==="annual"?c.annualMonth===o:!0)].sort((c,v)=>c.dayOfMonth-v.dayOfMonth).slice(0,6);if(r.length===0)return`
      <div class="card">
        <div class="card__header"><span class="card__title">Upcoming Bills</span></div>
        <div class="empty-state" style="padding:1rem 0">
          <div class="empty-state__icon">🧾</div>No bills this month
        </div>
      </div>
    `;const d=r.map(c=>{const v=q(c,n,a),p=Fe(c,n,a,i,s,v);return`
      <div class="bill-row${v?" bill-row--paid":""}">
        <div class="bill-row__left">
          <span class="colour-dot" style="background:${c.colour||"var(--accent)"}"></span>
          <div>
            <div class="bill-row__name">${c.name}</div>
            <div class="bill-row__due">${O(c.dayOfMonth)} of month</div>
          </div>
        </div>
        <div class="bill-row__right">
          ${p}
          <span class="bill-row__amount">${u(c.amount)}</span>
        </div>
      </div>
    `}).join("");return`
    <div class="card">
      <div class="card__header">
        <span class="card__title">Upcoming Bills</span>
        <span style="font-family:var(--font-mono);font-size:0.8rem;color:var(--muted)">${u(D(e,t))}</span>
      </div>
      <div class="bills-list">${d}</div>
    </div>
  `}function Fe(e,t,n,a,o,s){if(s)return`<span class="badge badge--green">${e.manualOverride&&`${t}-${String(n+1).padStart(2,"0")}`in e.manualOverride?"✓ Paid":"✓ Auto-paid"}</span>`;if(!a)return`<span class="badge badge--muted">Due ${O(e.dayOfMonth)}</span>`;const i=e.dayOfMonth-o.getDate();return i<0?'<span class="badge badge--red">Overdue</span>':i<=3?'<span class="badge badge--yellow">Due Soon</span>':`<span class="badge badge--blue">Due in ${i}d</span>`}function He(e,t){const n=[];for(let m=5;m>=0;m--){C(t);let f=t;for(let M=0;M<m;M++)f=C(f);n.push(f)}const a=n.map(m=>({mk:m,label:Te(m),spent:I(e,m),isCurrent:m===t})),o=a.reduce((m,f)=>Math.max(m,f.spent),0),s=600,i=160,l=50,r=130,d=8,c=i-20,p=s/6,g=a.map((m,f)=>{const M=p*f+p/2,L=o>0?Math.max(d,m.spent/o*r):d,T=c-L,P=`${f*.06}s`,j=m.isCurrent?"#7effd4":"#252a38",F=m.isCurrent?"":`
      <rect
        x="${M-l/2}"
        y="${T}"
        width="${l}"
        height="3"
        rx="2"
        fill="#7effd4"
        opacity="0.5"
      />
    `,ve=m.spent>0?`<text
           x="${M}"
           y="${T-5}"
           text-anchor="middle"
           font-family="DM Mono, monospace"
           font-size="11"
           fill="#e8eaf0"
         >${u(m.spent)}</text>`:"";return`
      <g class="trend-bar" style="animation-delay:${P}">
        <rect
          x="${M-l/2}"
          y="${T}"
          width="${l}"
          height="${L}"
          rx="4"
          fill="${j}"
        />
        ${F}
      </g>
      ${ve}
      <text
        x="${M}"
        y="${i-4}"
        text-anchor="middle"
        font-family="DM Mono, monospace"
        font-size="11"
        fill="#6b7290"
      >${m.label}</text>
    `}).join("");return`
    <div class="card" style="margin-top:1rem">
      <div class="card__header">
        <span class="card__title">6-Month Spending Trend</span>
      </div>
      <div class="trend-chart">
        <svg viewBox="0 0 ${s} ${i}" xmlns="http://www.w3.org/2000/svg">
          <style>
            .trend-bar {
              transform-origin: center ${c}px;
              animation: barGrow 0.5s ease backwards;
            }
            @keyframes barGrow {
              from { transform: scaleY(0); opacity: 0; }
              to   { transform: scaleY(1); opacity: 1; }
            }
          </style>
          ${g}
        </svg>
      </div>
    </div>
  `}const k=["#7effd4","#ff6b6b","#ffd166","#74b9ff","#c084fc","#fb923c","#f472b6","#34d399"];function G(e=k[0],t="colour"){return`
    <div class="colour-picker">
      ${k.map(n=>`
        <label
          class="colour-swatch${n===e?" selected":""}"
          style="background:${n}"
          title="${n}"
        >
          <input type="radio" name="${t}" value="${n}"${n===e?" checked":""} />
        </label>
      `).join("")}
    </div>
  `}function x({title:e,body:t,onSubmit:n,submitLabel:a="Save",showCancel:o=!0}){var l,r,d,c;const s=document.getElementById("modal-root");if(!s)return;const i=o||n?`
    <div class="modal__footer">
      ${o?'<button class="btn btn--secondary" id="modal-cancel">Cancel</button>':""}
      ${n?`<button class="btn btn--primary"   id="modal-submit">${a}</button>`:""}
    </div>
  `:"";s.innerHTML=`
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal__header">
          <h2 class="modal__title" id="modal-title">${e}</h2>
          <button class="modal__close" id="modal-close" aria-label="Close">&times;</button>
        </div>
        <div class="modal__body">${t}</div>
        ${i}
      </div>
    </div>
  `,s.querySelectorAll('.colour-swatch input[type="radio"]').forEach(v=>{v.addEventListener("change",()=>{s.querySelectorAll(".colour-picker .colour-swatch").forEach(p=>{var g;p.classList.toggle("selected",((g=p.querySelector("input"))==null?void 0:g.value)===v.value)})})}),(l=document.getElementById("modal-close"))==null||l.addEventListener("click",h),(r=document.getElementById("modal-cancel"))==null||r.addEventListener("click",h),(d=document.getElementById("modal-overlay"))==null||d.addEventListener("click",v=>{v.target===v.currentTarget&&h()}),n&&((c=document.getElementById("modal-submit"))==null||c.addEventListener("click",n)),s.addEventListener("keydown",v=>{v.key==="Enter"&&v.target.tagName!=="TEXTAREA"&&n&&(v.preventDefault(),n()),v.key==="Escape"&&h()}),setTimeout(()=>{const v=s.querySelector("input:not([type=radio]), select, textarea");v==null||v.focus()},50)}function h(){const e=document.getElementById("modal-root");e&&(e.innerHTML="")}function R(e,t="colour"){const n=e.querySelector(`input[name="${t}"]:checked`);return n?n.value:k[0]}function qe(e,t){return`
    <div class="budget-tab">
      ${Re(e,t)}
      ${Ye(e,t)}
    </div>
  `}function Ge(e,t,n){var o,s,i;const a=document.querySelector(".budget-tab");a&&((o=a.querySelector("#edit-income-btn"))==null||o.addEventListener("click",()=>{Je(e,t,n)}),(s=a.querySelector("#carryover-btn"))==null||s.addEventListener("click",()=>{Ke(e,t,n)}),(i=a.querySelector("#add-category-btn"))==null||i.addEventListener("click",()=>{Q(e,t,null,n)}),a.addEventListener("click",l=>{const r=l.target.closest("[data-action]");if(!r)return;const d=r.dataset.action,c=r.dataset.id;switch(d){case"add-spend":Xe(e,t,c,n);break;case"edit-category":Q(e,t,c,n);break;case"delete-category":Qe(e,t,c,n);break;case"toggle-log":ze(c);break;case"delete-expense":Ve(e,t,c,n);break}}))}function Re(e,t){const n=w(e,t),a=B(e,t),o=a>0?`<div class="income-row__carryover">+ ${u(a)} carried over</div>`:"";return`
    <div class="income-row">
      <div class="income-row__info">
        <div class="income-row__label">Monthly Income</div>
        <div class="income-row__value">${u(n)}</div>
        ${o}
      </div>
      <div class="income-row__actions">
        <button class="btn btn--secondary btn--sm" id="edit-income-btn">Edit Income</button>
        <button class="btn btn--secondary btn--sm" id="carryover-btn">↩ Carry Over</button>
      </div>
    </div>
  `}function Ye(e,t){const n=w(e,t);return`
    <div class="section-header">
      <h2 class="section-title">Categories</h2>
      <button class="btn btn--primary btn--sm" id="add-category-btn">+ Category</button>
    </div>
    <div class="categories-grid">${e.categories.length===0?`<div class="empty-state" style="grid-column:1/-1;padding:2.5rem 0">
         <div class="empty-state__icon">📂</div>
         No categories yet — add one to start tracking your spending.
       </div>`:e.categories.map(o=>Ue(e,o,t,n)).join("")}</div>
  `}function Ue(e,t,n,a){var g;const o=((g=t.budgets)==null?void 0:g[n])??0,s=z(e,n).filter(m=>m.categoryId===t.id),i=s.reduce((m,f)=>m+f.amount,0),l=i>o&&o>0,r=o>0?o-i:null,d=o>0?J(i/o*100,0,100):0,c=a>0?(i/a*100).toFixed(1):"0.0",v=r!==null?l?`<span class="category-card__remaining--over">Over by ${u(Math.abs(r))}</span>`:`<span class="category-card__remaining--ok">${u(r)} left</span>`:'<span style="color:var(--muted)">No budget set</span>',p=We(s);return`
    <div class="category-card" id="cat-card-${t.id}">
      <div class="category-card__accent" style="background:${t.colour||"var(--accent)"}"></div>
      <div class="category-card__body">
        <div class="category-card__top">
          <div class="category-card__name-row">
            <span class="category-card__emoji">${t.emoji||"📦"}</span>
            <span class="category-card__name">${t.name}</span>
          </div>
          <div class="category-card__actions">
            <button class="btn btn--ghost btn--icon" data-action="edit-category" data-id="${t.id}" title="Edit">✏️</button>
            <button class="btn btn--icon" data-action="delete-category" data-id="${t.id}" title="Delete">✕</button>
          </div>
        </div>

        <div class="category-card__amounts">
          <span class="category-card__spent">${u(i)}</span>
          ${o>0?`<span class="category-card__budget">/ ${u(o)}</span>`:""}
        </div>

        <div class="progress progress--thick">
          <div class="progress__fill${l?" progress__fill--red":""}"
               style="width:${d}%"></div>
        </div>

        <div class="category-card__bar-label">
          ${v}
          <span>${c}% of income</span>
        </div>
      </div>

      <div class="category-card__footer">
        <button class="btn btn--primary btn--sm" data-action="add-spend" data-id="${t.id}">+ Spend</button>
        <button class="btn btn--secondary btn--sm" data-action="edit-category" data-id="${t.id}">Edit</button>
      </div>

      <button class="expense-toggle" data-action="toggle-log" data-id="${t.id}">
        <span>Expenses (${s.length})</span>
        <span id="log-arrow-${t.id}">▸</span>
      </button>

      <div class="expense-log" id="log-${t.id}" style="display:none">
        ${p}
      </div>
    </div>
  `}function We(e){return e.length===0?'<div class="expense-log__empty">No entries this month</div>':[...e].sort((n,a)=>a.date.localeCompare(n.date)).map(n=>`
    <div class="expense-entry">
      <span class="expense-entry__note">${n.note||"—"}</span>
      <span class="expense-entry__date">${de(n.date)}</span>
      <span class="expense-entry__amount">${u(n.amount)}</span>
      <button class="btn btn--icon" data-action="delete-expense" data-id="${n.id}" title="Delete">✕</button>
    </div>
  `).join("")}function ze(e){const t=document.getElementById(`log-${e}`),n=document.getElementById(`log-arrow-${e}`);if(!t)return;const a=t.style.display==="none";t.style.display=a?"block":"none",n&&(n.textContent=a?"▾":"▸")}function Je(e,t,n){const a=w(e,t);x({title:"Edit Income",body:`
      <div class="form-group">
        <label for="income-amount">Monthly Income (£)</label>
        <input id="income-amount" class="form-control" type="number" min="0" step="0.01"
               value="${a}" placeholder="0.00" />
      </div>
    `,submitLabel:"Save",onSubmit:()=>{var s;const o=parseFloat((s=document.getElementById("income-amount"))==null?void 0:s.value);isNaN(o)||o<0||(me(e,t,o),h(),y("Income updated"),n())}})}function Ke(e,t,n){const a=C(t),o=w(e,a),s=B(e,a),i=I(e,a),l=D(e,a),r=o+s-i-l;B(e,t),x({title:"↩ Carry Over from Previous Month",body:`
      <div class="info-list">
        <div class="info-list__row">
          <span class="label">Previous income</span>
          <span class="value">${u(o)}</span>
        </div>
        ${s>0?`
        <div class="info-list__row">
          <span class="label">Previous carryover</span>
          <span class="value">${u(s)}</span>
        </div>`:""}
        <div class="info-list__row">
          <span class="label">Previous spent</span>
          <span class="value" style="color:var(--red)">− ${u(i)}</span>
        </div>
        <div class="info-list__row">
          <span class="label">Previous bills</span>
          <span class="value" style="color:var(--yellow)">− ${u(l)}</span>
        </div>
        <div class="info-list__row info-list__row--total">
          <span class="label">Available to carry</span>
          <span class="value">${u(Math.max(0,r))}</span>
        </div>
      </div>

      <div class="form-group">
        <label for="carry-amount">Amount to carry over (£)</label>
        <input id="carry-amount" class="form-control" type="number" min="0" step="0.01"
               value="${Math.max(0,r).toFixed(2)}" placeholder="0.00" />
      </div>
    `,submitLabel:"Carry Over",onSubmit:()=>{var c;const d=parseFloat((c=document.getElementById("carry-amount"))==null?void 0:c.value);isNaN(d)||d<0||(oe(e,t,d),h(),y(`${u(d)} carried over`),n())}})}function Q(e,t,n,a){var l;const o=n?e.categories.find(r=>r.id===n):null,s=((l=o==null?void 0:o.budgets)==null?void 0:l[t])??"",i=!!o;x({title:i?"Edit Category":"New Category",body:`
      <div class="form-group">
        <label for="cat-name">Name</label>
        <input id="cat-name" class="form-control" type="text"
               value="${(o==null?void 0:o.name)||""}" placeholder="e.g. Groceries" maxlength="32" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="cat-emoji">Emoji</label>
          <input id="cat-emoji" class="form-control" type="text"
                 value="${(o==null?void 0:o.emoji)||""}" placeholder="🛒" maxlength="4" />
        </div>
        <div class="form-group">
          <label for="cat-budget">Budget for this month (£)</label>
          <input id="cat-budget" class="form-control" type="number" min="0" step="0.01"
                 value="${s}" placeholder="0.00" />
        </div>
      </div>
      <div class="form-group">
        <label>Colour</label>
        ${G((o==null?void 0:o.colour)||k[0])}
      </div>
    `,submitLabel:i?"Save Changes":"Add Category",onSubmit:()=>{var p,g,m;const r=(p=document.getElementById("cat-name"))==null?void 0:p.value.trim(),d=((g=document.getElementById("cat-emoji"))==null?void 0:g.value.trim())||"📦",c=parseFloat((m=document.getElementById("cat-budget"))==null?void 0:m.value)||0,v=R(document.getElementById("modal-root"));if(r){if(i){const f=e.categories.find(L=>L.id===n),M={...(f==null?void 0:f.budgets)||{},[t]:c};$e(e,n,{name:r,emoji:d,colour:v,budgets:M}),y("Category updated")}else _e(e,{id:A(),name:r,emoji:d,colour:v,budgets:c>0?{[t]:c}:{}}),y("Category added");h(),a()}}})}function Xe(e,t,n,a){const o=e.categories.find(s=>s.id===n);x({title:`Add Spend — ${(o==null?void 0:o.name)||"Category"}`,body:`
      <div class="form-group">
        <label for="spend-amount">Amount (£)</label>
        <input id="spend-amount" class="form-control" type="number" min="0.01" step="0.01"
               placeholder="0.00" />
      </div>
      <div class="form-group">
        <label for="spend-note">Note (optional)</label>
        <input id="spend-note" class="form-control" type="text"
               placeholder="e.g. Weekly shop" maxlength="80" />
      </div>
      <div class="form-group">
        <label for="spend-date">Date</label>
        <input id="spend-date" class="form-control" type="date"
               value="${K()}" />
      </div>
    `,submitLabel:"Add Spend",onSubmit:()=>{var r,d,c;const s=parseFloat((r=document.getElementById("spend-amount"))==null?void 0:r.value),i=((d=document.getElementById("spend-note"))==null?void 0:d.value.trim())||"",l=((c=document.getElementById("spend-date"))==null?void 0:c.value)||K();isNaN(s)||s<=0||(fe(e,{id:A(),categoryId:n,amount:s,note:i,date:l}),h(),y("Expense added"),a())}})}function Qe(e,t,n,a){const o=e.categories.find(s=>s.id===n);confirm(`Delete category "${o==null?void 0:o.name}"? All its expenses will also be removed.`)&&(he(e,n),y("Category deleted","info"),a())}function Ve(e,t,n,a){confirm("Delete this expense?")&&(ye(e,n),y("Expense deleted","info"),a())}const ce=["Utilities","Subscriptions","Insurance","Transport","Other"],ue=["January","February","March","April","May","June","July","August","September","October","November","December"];function Ze(e,t){const{year:n,month:a}=N(t),o=a+1,s=e.bills.filter(d=>d.frequency==="annual"?d.annualMonth===o:!0),i=s.reduce((d,c)=>d+(c.amount||0),0),l=ce.map(d=>{const c=s.filter(p=>p.category===d);if(c.length===0)return"";const v=c.reduce((p,g)=>p+g.amount,0);return tt(d,c,v,n,a)}).join(""),r=s.length===0?`<div class="empty-state" style="padding:3rem 0">
         <div class="empty-state__icon">🧾</div>
         No bills this month — add one to start tracking.
       </div>`:l;return`
    <div class="bills-tab">
      <div class="bills-tab-header">
        <div>
          <h2 class="tab-title">Bills</h2>
          <div style="font-size:0.8rem;color:var(--muted);margin-top:0.2rem">
            Monthly total: <span class="bills-total">${u(i)}</span>
          </div>
        </div>
        <button class="btn btn--primary btn--sm" id="add-bill-btn">+ Bill</button>
      </div>
      ${r}
    </div>
  `}function et(e,t,n){var o;const a=document.querySelector(".bills-tab");a&&((o=a.querySelector("#add-bill-btn"))==null||o.addEventListener("click",()=>{V(e,t,null,n)}),a.addEventListener("click",s=>{const i=s.target.closest("[data-action]");if(!i)return;const l=i.dataset.action,r=i.dataset.id,{year:d,month:c}=N(t);switch(l){case"toggle-paid":{xe(e,r,d,c);const v=e.bills.find(p=>p.id===r);y(q(v,d,c)?"Marked as paid":"Marked as unpaid"),n();break}case"edit-bill":V(e,t,r,n);break;case"delete-bill":ot(e,r,n);break}}))}function tt(e,t,n,a,o){const i=[...t].sort((l,r)=>l.dayOfMonth-r.dayOfMonth).map(l=>nt(l,a,o)).join("");return`
    <div class="bill-group">
      <div class="bill-group__header">
        <span class="bill-group__name">${e}</span>
        <span class="bill-group__total">${u(n)}</span>
      </div>
      <div class="bills-cards">${i}</div>
    </div>
  `}function nt(e,t,n){const a=q(e,t,n),o=at(e,t,n,a),s=a?"Mark Unpaid":"Mark Paid",i=e.frequency==="annual"?`${ue[e.annualMonth-1]}, ${O(e.dayOfMonth)}`:`${O(e.dayOfMonth)} of month`;return`
    <div class="bill-card${a?" bill-card--paid":""}">
      <div class="bill-card__accent" style="background:${e.colour||"var(--accent)"}"></div>
      <div class="bill-card__body">
        <div class="bill-card__top">
          <div class="bill-card__name-row">
            <span class="colour-dot" style="background:${e.colour||"var(--accent)"}"></span>
            <span class="bill-card__name">${e.name}</span>
          </div>
          <div style="display:flex;gap:0.2rem">
            <button class="btn btn--ghost btn--icon" data-action="edit-bill" data-id="${e.id}" title="Edit">✏️</button>
            <button class="btn btn--icon" data-action="delete-bill" data-id="${e.id}" title="Delete">✕</button>
          </div>
        </div>
        <div class="bill-card__meta">
          <span class="bill-card__due">${i}</span>
          <span class="bill-card__amount">${u(e.amount)}</span>
        </div>
      </div>
      <div class="bill-card__footer">
        ${o}
        <button class="btn btn--secondary btn--xs" data-action="toggle-paid" data-id="${e.id}">
          ${s}
        </button>
      </div>
    </div>
  `}function at(e,t,n,a){if(a)return`<span class="badge badge--green">${Be(e,t,n)?"✓ Paid":"✓ Auto-paid"}</span>`;const o=new Date;if(!(o.getFullYear()===t&&o.getMonth()===n))return`<span class="badge badge--muted">Due ${O(e.dayOfMonth)}</span>`;const i=e.dayOfMonth-o.getDate();return i<0?'<span class="badge badge--red">Overdue</span>':i===0?'<span class="badge badge--yellow">Due Today</span>':i<=3?'<span class="badge badge--yellow">Due Soon</span>':`<span class="badge badge--blue">Due in ${i}d</span>`}function V(e,t,n,a){const o=n?e.bills.find(r=>r.id===n):null,s=!!o,i=ue.map((r,d)=>`<option value="${d+1}"${(o==null?void 0:o.annualMonth)===d+1?" selected":""}>${r}</option>`).join(""),l=ce.map(r=>`<option value="${r}"${(o==null?void 0:o.category)===r?" selected":""}>${r}</option>`).join("");x({title:s?"Edit Bill":"New Bill",body:`
      <div class="form-group">
        <label for="bill-name">Name</label>
        <input id="bill-name" class="form-control" type="text"
               value="${(o==null?void 0:o.name)||""}" placeholder="e.g. Netflix" maxlength="48" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="bill-amount">Amount (£)</label>
          <input id="bill-amount" class="form-control" type="number" min="0.01" step="0.01"
                 value="${(o==null?void 0:o.amount)||""}" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label for="bill-day">Day of Month</label>
          <input id="bill-day" class="form-control" type="number" min="1" max="31"
                 value="${(o==null?void 0:o.dayOfMonth)||""}" placeholder="1–31" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="bill-category">Category</label>
          <select id="bill-category" class="form-control">
            ${l}
          </select>
        </div>
        <div class="form-group">
          <label for="bill-freq">Frequency</label>
          <select id="bill-freq" class="form-control">
            <option value="monthly"${!o||o.frequency==="monthly"?" selected":""}>Monthly</option>
            <option value="annual"${(o==null?void 0:o.frequency)==="annual"?" selected":""}>Annual</option>
          </select>
        </div>
      </div>
      <div class="form-group" id="annual-month-group" style="display:${(o==null?void 0:o.frequency)==="annual"?"flex":"none"}">
        <label for="bill-annual-month">Billing Month</label>
        <select id="bill-annual-month" class="form-control">
          ${i}
        </select>
      </div>
      <div class="form-group">
        <label>Colour</label>
        ${G((o==null?void 0:o.colour)||k[0])}
      </div>
    `,submitLabel:s?"Save Changes":"Add Bill",onSubmit:()=>{var M,L,T,P,j,F;const r=(M=document.getElementById("bill-name"))==null?void 0:M.value.trim(),d=parseFloat((L=document.getElementById("bill-amount"))==null?void 0:L.value),c=parseInt((T=document.getElementById("bill-day"))==null?void 0:T.value,10),v=(P=document.getElementById("bill-category"))==null?void 0:P.value,p=(j=document.getElementById("bill-freq"))==null?void 0:j.value,g=parseInt((F=document.getElementById("bill-annual-month"))==null?void 0:F.value,10)||1,m=R(document.getElementById("modal-root"));if(!r||isNaN(d)||d<=0||isNaN(c)||c<1||c>31)return;const f={name:r,amount:d,dayOfMonth:c,category:v,frequency:p,annualMonth:g,colour:m,manualOverride:(o==null?void 0:o.manualOverride)||{}};s?(we(e,n,f),y("Bill updated")):(Me(e,{id:A(),...f}),y("Bill added")),h(),a()}}),setTimeout(()=>{var r;(r=document.getElementById("bill-freq"))==null||r.addEventListener("change",d=>{const c=document.getElementById("annual-month-group");c&&(c.style.display=d.target.value==="annual"?"flex":"none")})},60)}function ot(e,t,n){const a=e.bills.find(o=>o.id===t);confirm(`Delete bill "${a==null?void 0:a.name}"?`)&&(Ee(e,t),y("Bill deleted","info"),n())}function st(e){return`
    <div class="savings-tab">
      ${rt(e)}
      ${dt(e)}
    </div>
  `}function it(e,t,n){var o,s;const a=document.querySelector(".savings-tab");a&&((o=a.querySelector("#add-goal-btn"))==null||o.addEventListener("click",()=>{Z(e,null,n)}),(s=a.querySelector("#add-pot-btn"))==null||s.addEventListener("click",()=>{ee(e,null,n)}),a.addEventListener("click",i=>{const l=i.target.closest("[data-action]");if(!l)return;const{action:r,id:d}=l.dataset;switch(r){case"add-goal-funds":ut(e,d,n);break;case"edit-goal":Z(e,d,n);break;case"delete-goal":vt(e,d,n);break;case"pot-add":te(e,d,n,"add");break;case"pot-withdraw":te(e,d,n,"withdraw");break;case"edit-pot":ee(e,d,n);break;case"delete-pot":mt(e,d,n);break}}))}function rt(e){return`
    <div class="savings-section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Savings Goals</h2>
        </div>
        <button class="btn btn--primary btn--sm" id="add-goal-btn">+ Goal</button>
      </div>
      ${e.goals.length===0?`<div class="empty-state">
         <div class="empty-state__icon">🎯</div>
         No goals yet — set one to start saving with purpose.
       </div>`:`<div class="goals-grid">${e.goals.map(lt).join("")}</div>`}
    </div>
  `}function lt(e){const t=e.saved||0,n=e.target||0,a=n>0?J(t/n*100,0,100):0,o=n>0&&t>=n;let s="";if(e.deadline&&!o&&n>0){const r=Math.max(0,n-t),d=new Date(e.deadline).getTime(),c=Date.now(),v=Math.max(1,Math.ceil((d-c)/(1e3*60*60*24*30.44)));s=`<span>${u(r/v)}/mo needed</span>`}const i=e.deadline?`<span>Due ${de(e.deadline)}</span>`:"",l=o?'<div class="goal-card__complete-badge">🎉 Complete!</div>':"";return`
    <div class="goal-card">
      <div class="goal-card__accent" style="background:${e.colour||"var(--accent)"}"></div>
      <div class="goal-card__body">
        <div class="goal-card__top">
          <div class="goal-card__title-row">
            <span class="goal-card__emoji">${e.emoji||"🎯"}</span>
            <span class="goal-card__name">${e.name}</span>
          </div>
          <div style="display:flex;gap:0.2rem;align-items:center">
            ${l}
            <button class="btn btn--ghost btn--icon" data-action="edit-goal" data-id="${e.id}" title="Edit">✏️</button>
            <button class="btn btn--icon" data-action="delete-goal" data-id="${e.id}" title="Delete">✕</button>
          </div>
        </div>

        <div class="goal-card__amounts">
          <span class="goal-card__saved">${u(t)}</span>
          <span class="goal-card__target">/ ${u(n)}</span>
        </div>

        <div class="progress progress--thick">
          <div class="progress__fill${o?" progress__fill--green":""}"
               style="width:${a}%;background:${e.colour||"var(--accent)"}"></div>
        </div>

        <div class="goal-card__pct-label">${a.toFixed(1)}%</div>

        ${i||s?`<div class="goal-card__meta">${i}${s}</div>`:""}
      </div>
      <div class="goal-card__footer">
        <button class="btn btn--primary btn--sm" data-action="add-goal-funds" data-id="${e.id}"${o?' disabled style="opacity:0.4"':""}>
          + Add Funds
        </button>
        <button class="btn btn--secondary btn--sm" data-action="edit-goal" data-id="${e.id}">Edit</button>
      </div>
    </div>
  `}function dt(e){return`
    <div class="savings-section">
      <div class="section-header">
        <div>
          <h2 class="section-title">Pots &amp; Accounts</h2>
          <p class="section-subtitle">Savings without a target</p>
        </div>
        <button class="btn btn--primary btn--sm" id="add-pot-btn">+ Pot</button>
      </div>
      ${e.pots.length===0?`<div class="empty-state">
         <div class="empty-state__icon">🪴</div>
         No pots yet — add one to stash savings without a specific target.
       </div>`:`<div class="pots-grid">${e.pots.map(ct).join("")}</div>`}
    </div>
  `}function ct(e){return`
    <div class="pot-card">
      <div class="pot-card__accent" style="background:${e.colour||"var(--accent)"}"></div>
      <div class="pot-card__body">
        <div class="pot-card__top">
          <div class="pot-card__title-row">
            <span class="pot-card__emoji">${e.emoji||"🪴"}</span>
            <span class="pot-card__name">${e.name}</span>
          </div>
          <div style="display:flex;gap:0.2rem">
            <button class="btn btn--ghost btn--icon" data-action="edit-pot" data-id="${e.id}" title="Edit">✏️</button>
            <button class="btn btn--icon" data-action="delete-pot" data-id="${e.id}" title="Delete">✕</button>
          </div>
        </div>
        <div class="pot-card__balance">${u(e.balance||0)}</div>
        ${e.note?`<div class="pot-card__note">${e.note}</div>`:""}
      </div>
      <div class="pot-card__footer">
        <button class="btn btn--primary btn--sm" data-action="pot-add" data-id="${e.id}">+ Add</button>
        <button class="btn btn--secondary btn--sm" data-action="pot-withdraw" data-id="${e.id}">− Withdraw</button>
        <button class="btn btn--secondary btn--sm" data-action="edit-pot" data-id="${e.id}">Edit</button>
      </div>
    </div>
  `}function Z(e,t,n){const a=t?e.goals.find(s=>s.id===t):null,o=!!a;x({title:o?"Edit Goal":"New Savings Goal",body:`
      <div class="form-group">
        <label for="goal-name">Goal Name</label>
        <input id="goal-name" class="form-control" type="text"
               value="${(a==null?void 0:a.name)||""}" placeholder="e.g. Emergency Fund" maxlength="48" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="goal-emoji">Emoji</label>
          <input id="goal-emoji" class="form-control" type="text"
                 value="${(a==null?void 0:a.emoji)||""}" placeholder="🎯" maxlength="4" />
        </div>
        <div class="form-group">
          <label for="goal-target">Target (£)</label>
          <input id="goal-target" class="form-control" type="number" min="0.01" step="0.01"
                 value="${(a==null?void 0:a.target)||""}" placeholder="0.00" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="goal-saved">Already Saved (£)</label>
          <input id="goal-saved" class="form-control" type="number" min="0" step="0.01"
                 value="${(a==null?void 0:a.saved)||0}" placeholder="0.00" />
        </div>
        <div class="form-group">
          <label for="goal-deadline">Deadline (optional)</label>
          <input id="goal-deadline" class="form-control" type="date"
                 value="${(a==null?void 0:a.deadline)||""}" />
        </div>
      </div>
      <div class="form-group">
        <label>Colour</label>
        ${G((a==null?void 0:a.colour)||k[3])}
      </div>
    `,submitLabel:o?"Save Changes":"Add Goal",onSubmit:()=>{var v,p,g,m,f;const s=(v=document.getElementById("goal-name"))==null?void 0:v.value.trim(),i=((p=document.getElementById("goal-emoji"))==null?void 0:p.value.trim())||"🎯",l=parseFloat((g=document.getElementById("goal-target"))==null?void 0:g.value),r=parseFloat((m=document.getElementById("goal-saved"))==null?void 0:m.value)||0,d=((f=document.getElementById("goal-deadline"))==null?void 0:f.value)||null,c=R(document.getElementById("modal-root"));!s||isNaN(l)||l<=0||(o?(se(e,t,{name:s,emoji:i,target:l,saved:r,deadline:d,colour:c}),y("Goal updated")):(Se(e,{id:A(),name:s,emoji:i,target:l,saved:r,deadline:d,colour:c}),y("Goal added")),h(),n())}})}function ut(e,t,n){const a=e.goals.find(s=>s.id===t);if(!a)return;const o=Math.max(0,(a.target||0)-(a.saved||0));x({title:`Add Funds — ${a.name}`,body:`
      <div class="info-list">
        <div class="info-list__row">
          <span class="label">Current saved</span>
          <span class="value">${u(a.saved||0)}</span>
        </div>
        <div class="info-list__row">
          <span class="label">Target</span>
          <span class="value">${u(a.target||0)}</span>
        </div>
        <div class="info-list__row info-list__row--total">
          <span class="label">Remaining</span>
          <span class="value">${u(o)}</span>
        </div>
      </div>
      <div class="form-group">
        <label for="funds-amount">Amount to Add (£)</label>
        <input id="funds-amount" class="form-control" type="number" min="0.01" step="0.01"
               placeholder="0.00" />
      </div>
    `,submitLabel:"Add Funds",onSubmit:()=>{var l;const s=parseFloat((l=document.getElementById("funds-amount"))==null?void 0:l.value);if(isNaN(s)||s<=0)return;const i=(a.saved||0)+s;se(e,t,{saved:i}),h(),y(`${u(s)} added to ${a.name}`),n()}})}function ee(e,t,n){const a=t?e.pots.find(s=>s.id===t):null,o=!!a;x({title:o?"Edit Pot":"New Pot",body:`
      <div class="form-group">
        <label for="pot-name">Name</label>
        <input id="pot-name" class="form-control" type="text"
               value="${(a==null?void 0:a.name)||""}" placeholder="e.g. Holiday Fund" maxlength="48" />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="pot-emoji">Emoji</label>
          <input id="pot-emoji" class="form-control" type="text"
                 value="${(a==null?void 0:a.emoji)||""}" placeholder="🪴" maxlength="4" />
        </div>
        <div class="form-group">
          <label for="pot-balance">Starting Balance (£)</label>
          <input id="pot-balance" class="form-control" type="number" min="0" step="0.01"
                 value="${(a==null?void 0:a.balance)||0}" placeholder="0.00" />
        </div>
      </div>
      <div class="form-group">
        <label for="pot-note">Note (optional)</label>
        <input id="pot-note" class="form-control" type="text"
               value="${(a==null?void 0:a.note)||""}" placeholder="What's this pot for?" maxlength="80" />
      </div>
      <div class="form-group">
        <label>Colour</label>
        ${G((a==null?void 0:a.colour)||k[4])}
      </div>
    `,submitLabel:o?"Save Changes":"Add Pot",onSubmit:()=>{var c,v,p,g;const s=(c=document.getElementById("pot-name"))==null?void 0:c.value.trim(),i=((v=document.getElementById("pot-emoji"))==null?void 0:v.value.trim())||"🪴",l=parseFloat((p=document.getElementById("pot-balance"))==null?void 0:p.value)||0,r=((g=document.getElementById("pot-note"))==null?void 0:g.value.trim())||"",d=R(document.getElementById("modal-root"));s&&(o?(ie(e,t,{name:s,emoji:i,balance:l,note:r,colour:d}),y("Pot updated")):(Ce(e,{id:A(),name:s,emoji:i,balance:l,note:r,colour:d}),y("Pot added")),h(),n())}})}function te(e,t,n,a){const o=e.pots.find(i=>i.id===t);if(!o)return;const s=a==="add";x({title:`${s?"Add to":"Withdraw from"} ${o.name}`,body:`
      <div class="info-list" style="margin-bottom:0.5rem">
        <div class="info-list__row">
          <span class="label">Current balance</span>
          <span class="value">${u(o.balance||0)}</span>
        </div>
      </div>
      <div class="form-group">
        <label for="transfer-amount">Amount (£)</label>
        <input id="transfer-amount" class="form-control" type="number"
               min="0.01" step="0.01" placeholder="0.00" />
      </div>
    `,submitLabel:s?"+ Add":"− Withdraw",onSubmit:()=>{var r;const i=parseFloat((r=document.getElementById("transfer-amount"))==null?void 0:r.value);if(isNaN(i)||i<=0)return;const l=s?(o.balance||0)+i:Math.max(0,(o.balance||0)-i);ie(e,t,{balance:l}),h(),y(s?`${u(i)} added`:`${u(i)} withdrawn`),n()}})}function vt(e,t,n){const a=e.goals.find(o=>o.id===t);confirm(`Delete goal "${a==null?void 0:a.name}"?`)&&(Le(e,t),y("Goal deleted","info"),n())}function mt(e,t,n){const a=e.pots.find(o=>o.id===t);confirm(`Delete pot "${a==null?void 0:a.name}"?`)&&(ke(e,t),y("Pot deleted","info"),n())}let b=ae(),_=re(new Date().getFullYear(),new Date().getMonth()),Y="overview",S=null;function E(){const e=document.getElementById("app");if(!e)return;b=ae();const t=Ne(_,Y),n=yt(),a=pt();e.innerHTML=`
    ${t}
    ${n}
    <main class="main-content">
      ${a}
    </main>
  `,gt(),_t(),bt()}function pt(){switch(Y){case"overview":return X(b,_);case"budget":return qe(b,_);case"bills":return Ze(b,_);case"savings":return st(b);default:return X(b,_)}}function bt(){switch(Y){case"overview":break;case"budget":Ge(b,_,E);break;case"bills":et(b,_,E);break;case"savings":it(b,_,E);break}}function gt(){var e,t;document.querySelectorAll(".nav__tab").forEach(n=>{n.addEventListener("click",()=>{Y=n.dataset.tab,E()})}),(e=document.getElementById("prev-month"))==null||e.addEventListener("click",()=>{_=C(_),E()}),(t=document.getElementById("next-month"))==null||t.addEventListener("click",()=>{const n=Ie(_);_=n,ft(n),E()})}function ft(e){const t=C(e),n=B(b,e)>0,a=pe(b,e);if(n||a){S=null;return}const o=w(b,t),s=B(b,t),i=I(b,t),l=D(b,t);o+s-i-l>0?S=e:S=null}function yt(){if(!S||S!==_)return"";const e=C(_),t=H(e),n=H(_),a=w(b,e),o=B(b,e),s=I(b,e),i=D(b,e),l=a+o-s-i;return l<=0?(S=null,""):`
    <div class="carryover-banner" id="carryover-banner">
      <span class="carryover-banner__text">
        ↩ You had <strong>${u(l)}</strong> left in ${t}.
        Carry it over to ${n}?
      </span>
      <div class="carryover-banner__actions">
        <button class="btn btn--primary btn--sm" id="carry-over-accept">Carry Over</button>
        <button class="btn btn--secondary btn--sm" id="carry-over-dismiss">Dismiss</button>
      </div>
    </div>
  `}function _t(){var l,r;if(!document.getElementById("carryover-banner"))return;const t=C(_),n=w(b,t),a=B(b,t),o=I(b,t),s=D(b,t),i=n+a-o-s;(l=document.getElementById("carry-over-accept"))==null||l.addEventListener("click",()=>{oe(b,_,i),S=null,y(`${u(i)} carried over to ${H(_)}`),E()}),(r=document.getElementById("carry-over-dismiss"))==null||r.addEventListener("click",()=>{be(b,_),S=null,E()})}E();
