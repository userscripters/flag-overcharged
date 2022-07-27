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
// @version        1.3.0
// ==/UserScript==

"use strict";const save=(e,t)=>{try{localStorage.setItem(e,JSON.stringify(t))}catch(e){console.debug("failed to persist input data: "+e)}},load=e=>JSON.parse(localStorage.getItem(e)||"{}"),findRecord=(a,e,s)=>e.find(({addedNodes:e})=>[...e].some(t=>!s.includes(t.nodeType)&&a.some(e=>t.matches(e)))),throttle=(t,a=100)=>{let s=!1;return(...e)=>{if(!s)return s=!0,setTimeout(()=>s=!1,a),t(...e)}},flagTypeToEndpointMap={NAA:"AnswerNotAnAnswer",VLQ:"PostLowQuality"},makeQuickflagButton=(s,o,n)=>{const e=document.createElement("div"),t=(e.classList.add("flex--item"),document.createElement("button")),r=(t.classList.add("s-btn","s-btn__link"),t.textContent=o,t.title="Quickflag as "+o,t.type="button",flagTypeToEndpointMap[o]);return t.addEventListener("click",async()=>{var e=location.origin+`/flags/posts/${n}/add/`+r,t=StackExchange.options.user["fkey"];if(!t)return console.debug(`[${s}] missing user fkey`),StackExchange.helpers.showToast("Unauthorized",{type:"danger"});const a=await fetch(e,{method:"POST",body:new URLSearchParams({fkey:t,otherText:"",overrideWarning:"false"})});if(!a.ok)return console.debug(`[${s}] failed to flag as `+o),StackExchange.helpers.showToast("Something went wrong when quickflagging as "+o,{type:"danger"});var{Success:e,Message:t}=await a.json();return console.debug(`[${s}] ${o} flagging status: `+e),StackExchange.helpers.showToast(t,{type:e?"success":"danger"})}),e.append(t),e};window.addEventListener("load",()=>{const s="flag-overcharged",t=["#popup-flag-post","#popup-close-question"];const a="_flag-overcharged",o=load(a),n=[Node.COMMENT_NODE,Node.TEXT_NODE],e=new MutationObserver(e=>{e=findRecord(t,e,n);if(e){var[e]=e["addedNodes"];const s=e;s.addEventListener("input",throttle(({target:e})=>{var{name:e,value:t}=e;o[e]=t,save(a,o)})),s.addEventListener("click",({target:e})=>{if(e.matches(".js-popup-submit")){const t=s.querySelectorAll("input[type=text], textarea");t.forEach(e=>e.value=o[e.name]="")}}),Object.entries(o).forEach(([e,t])=>{const a=s.querySelector(`[name='${e}']`);a&&(a.value=t)})}});e.observe(document,{subtree:!0,childList:!0}),document.querySelectorAll(".answer .js-post-menu > div:first-child").forEach(e=>{var t=((null==(t=e.closest(".js-post-menu"))?void 0:t.dataset)||{})["postId"];if(!t)return console.debug(`[${s}] missing post id`,e),StackExchange.helpers.showToast("Failed to find answer id",{type:"danger"});var a=makeQuickflagButton(s,"NAA",t),t=makeQuickflagButton(s,"VLQ",t);e.append(t,a)})});