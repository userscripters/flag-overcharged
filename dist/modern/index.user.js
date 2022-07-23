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

"use strict";
const save = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    }
    catch (error) {
        console.debug(`failed to persist input data: ${error}`);
    }
};
const load = (key) => JSON.parse(localStorage.getItem(key) || "{}");
const findRecord = (queries, records, skipped) => {
    return records.find(({ addedNodes }) => [...addedNodes].some((node) => !skipped.includes(node.nodeType) &&
        queries.some((query) => node.matches(query))));
};
const throttle = (callback, period = 100) => {
    let throttled = false;
    return (...args) => {
        if (!throttled) {
            throttled = true;
            setTimeout(() => (throttled = false), period);
            return callback(...args);
        }
    };
};
const flagTypeToEndpointMap = {
    NAA: "AnswerNotAnAnswer"
};
const makeQuickflagButton = (scriptName, type, postId) => {
    const quickflagNAA = document.createElement("button");
    quickflagNAA.classList.add("s-btn", "s-btn__link");
    quickflagNAA.textContent = type;
    quickflagNAA.title = `Quickflag as ${type}`;
    quickflagNAA.type = "button";
    const endpoint = flagTypeToEndpointMap[type];
    quickflagNAA.addEventListener("click", async () => {
        const url = `${location.origin}/flags/posts/${postId}/add/${endpoint}`;
        const { fkey } = StackExchange.options.user;
        if (!fkey) {
            console.debug(`[${scriptName}] missing user fkey`);
            return StackExchange.helpers.showToast("Unauthorized", { type: "danger" });
        }
        const res = await fetch(url, {
            method: "POST",
            body: new URLSearchParams({
                fkey,
                otherText: "",
                overrideWarning: "false",
            })
        });
        if (!res.ok) {
            console.debug(`[${scriptName}] failed to flag as ${type}`);
            return StackExchange.helpers.showToast(`Something went wrong when quickflagging as ${type}`, { type: "danger" });
        }
        const { Success, Message } = await res.json();
        console.debug(`[${scriptName}] ${type} flagging status: ${Success}`);
        return StackExchange.helpers.showToast(Message, { type: Success ? "success" : "danger" });
    });
    return quickflagNAA;
};
window.addEventListener("load", () => {
    const scriptName = "flag-overcharged";
    const flagModalQueries = ["#popup-flag-post", "#popup-close-question"];
    const submitBtnQuery = ".js-popup-submit";
    const postMenuQuery = ".answer .js-post-menu > div:first-child";
    const skey = "_flag-overcharged";
    const savedData = load(skey);
    const skippedNodeTypes = [Node.COMMENT_NODE, Node.TEXT_NODE];
    const obs = new MutationObserver((records) => {
        const record = findRecord(flagModalQueries, records, skippedNodeTypes);
        if (!record)
            return;
        const { addedNodes: [flagModule], } = record;
        const modal = flagModule;
        modal.addEventListener("input", throttle(({ target }) => {
            const { name, value } = target;
            savedData[name] = value;
            save(skey, savedData);
        }));
        modal.addEventListener("click", ({ target }) => {
            if (!target.matches(submitBtnQuery))
                return;
            const inputs = modal.querySelectorAll("input[type=text], textarea");
            inputs.forEach((input) => (input.value = savedData[input.name] = ""));
        });
        Object.entries(savedData).forEach(([name, value]) => {
            const input = modal.querySelector(`[name='${name}']`);
            if (!input)
                return;
            input.value = value;
        });
    });
    obs.observe(document, {
        subtree: true,
        childList: true,
    });
    document.querySelectorAll(postMenuQuery).forEach((menuWrapper) => {
        var _a;
        const itemWrapper = document.createElement("div");
        itemWrapper.classList.add("flex--item");
        const { postId } = ((_a = menuWrapper.closest(".js-post-menu")) === null || _a === void 0 ? void 0 : _a.dataset) || {};
        if (!postId) {
            console.debug(`[${scriptName}] missing post id`, menuWrapper);
            return StackExchange.helpers.showToast("Failed to find answer id", { type: "danger" });
        }
        const quickflagNAA = makeQuickflagButton(scriptName, "NAA", postId);
        itemWrapper.append(quickflagNAA);
        menuWrapper.append(itemWrapper);
    });
});
