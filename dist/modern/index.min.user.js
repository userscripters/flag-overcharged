// ==UserScript==
// @name           Flag Overcharged
// @author         Oleg Valter
// @description    Enhancements for flagging experience
// @grant          unsafeWindow
// @homepage       https://github.com/userscripters/flag-overcharged#readme
// @match          https://stackoverflow.com/questions/*
// @match          https://serverfault.com/questions/*
// @match          https://superuser.com/questions/*
// @match          https://*.stackexchange.com/questions/*
// @match          https://askubuntu.com/questions/*
// @match          https://stackapps.com/questions/*
// @match          https://mathoverflow.net/questions/*
// @match          https://pt.stackoverflow.com/questions/*
// @match          https://ja.stackoverflow.com/questions/*
// @match          https://ru.stackoverflow.com/questions/*
// @match          https://es.stackoverflow.com/questions/*
// @match          https://meta.stackoverflow.com/questions/*
// @match          https://meta.serverfault.com/questions/*
// @match          https://meta.superuser.com/questions/*
// @match          https://meta.askubuntu.com/questions/*
// @match          https://meta.mathoverflow.net/questions/*
// @match          https://pt.meta.stackoverflow.com/questions/*
// @match          https://ja.meta.stackoverflow.com/questions/*
// @match          https://ru.meta.stackoverflow.com/questions/*
// @match          https://es.meta.stackoverflow.com/questions/*
// @run-at         document-start
// @source         git+https://github.com/userscripters/flag-overcharged.git
// @supportURL     https://github.com/userscripters/flag-overcharged/issues
// @version        1.2.0
// ==/UserScript==

"use strict";const save=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch(e){console.debug("failed to persist input data: "+e)}},load=e=>JSON.parse(localStorage.getItem(e)||"{}"),findRecord=(a,e,s)=>e.find(({addedNodes:e})=>[...e].some(t=>!s.includes(t.nodeType)&&a.some(e=>t.matches(e)))),throttle=(t,a=100)=>{let s=!1;return(...e)=>{if(!s)return s=!0,setTimeout(()=>s=!1,a),t(...e)}},flagTypeToEndpointMap={NAA:"AnswerNotAnAnswer"},makeQuickflagButton=(s,n,o)=>{const e=document.createElement("button"),r=(e.classList.add("s-btn","s-btn__link"),e.textContent=n,e.title="Quickflag as "+n,e.type="button",flagTypeToEndpointMap[n]);return e.addEventListener("click",async()=>{var e=location.origin+`/flags/posts/${o}/add/`+r,t=StackExchange.options.user["fkey"];if(!t)return console.debug(`[${s}] missing user fkey`),StackExchange.helpers.showToast("Unauthorized",{type:"danger"});const a=await fetch(e,{method:"POST",body:new URLSearchParams({fkey:t,otherText:"",overrideWarning:"false"})});if(!a.ok)return console.debug(`[${s}] failed to flag as `+n),StackExchange.helpers.showToast("Something went wrong when quickflagging as "+n,{type:"danger"});var{Success:e,Message:t}=await a.json();return console.debug(`[${s}] ${n} flagging status: `+e),StackExchange.helpers.showToast(t,{type:e?"success":"danger"})}),e};window.addEventListener("load",()=>{const s="flag-overcharged",t=["#popup-flag-post","#popup-close-question"];const a="_flag-overcharged",n=load(a),o=[Node.COMMENT_NODE,Node.TEXT_NODE],e=new MutationObserver(e=>{e=findRecord(t,e,o);if(e){var[e]=e["addedNodes"];const s=e;s.addEventListener("input",throttle(({target:e})=>{var{name:e,value:t}=e;n[e]=t,save(a,n)})),s.addEventListener("click",({target:e})=>{if(e.matches(".js-popup-submit")){const t=s.querySelectorAll("input[type=text], textarea");t.forEach(e=>e.value=n[e.name]="")}}),Object.entries(n).forEach(([e,t])=>{const a=s.querySelector(`[name='${e}']`);a&&(a.value=t)})}});e.observe(document,{subtree:!0,childList:!0}),document.querySelectorAll(".answer .js-post-menu > div:first-child").forEach(e=>{const t=document.createElement("div");t.classList.add("flex--item");var a=((null==(a=e.closest(".js-post-menu"))?void 0:a.dataset)||{})["postId"];if(!a)return console.debug(`[${s}] missing post id`,e),StackExchange.helpers.showToast("Failed to find answer id",{type:"danger"});a=makeQuickflagButton(s,"NAA",a);t.append(a),e.append(t)})});