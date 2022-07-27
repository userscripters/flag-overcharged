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

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var save = function (key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    }
    catch (error) {
        console.debug("failed to persist input data: ".concat(error));
    }
};
var load = function (key) { return JSON.parse(localStorage.getItem(key) || "{}"); };
var findRecord = function (queries, records, skipped) {
    return records.find(function (_a) {
        var addedNodes = _a.addedNodes;
        return __spreadArray([], __read(addedNodes), false).some(function (node) {
            return !skipped.includes(node.nodeType) &&
                queries.some(function (query) { return node.matches(query); });
        });
    });
};
var throttle = function (callback, period) {
    if (period === void 0) { period = 100; }
    var throttled = false;
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!throttled) {
            throttled = true;
            setTimeout(function () { return (throttled = false); }, period);
            return callback.apply(void 0, __spreadArray([], __read(args), false));
        }
    };
};
var flagTypeToEndpointMap = {
    NAA: "AnswerNotAnAnswer",
    VLQ: "PostLowQuality",
};
var makeQuickflagButton = function (scriptName, type, postId) {
    var itemWrapper = document.createElement("div");
    itemWrapper.classList.add("flex--item");
    var quickflag = document.createElement("button");
    quickflag.classList.add("s-btn", "s-btn__link");
    quickflag.textContent = type;
    quickflag.title = "Quickflag as ".concat(type);
    quickflag.type = "button";
    var endpoint = flagTypeToEndpointMap[type];
    quickflag.addEventListener("click", function () { return __awaiter(void 0, void 0, void 0, function () {
        var url, fkey, res, _a, Success, Message;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    url = "".concat(location.origin, "/flags/posts/").concat(postId, "/add/").concat(endpoint);
                    fkey = StackExchange.options.user.fkey;
                    if (!fkey) {
                        console.debug("[".concat(scriptName, "] missing user fkey"));
                        return [2, StackExchange.helpers.showToast("Unauthorized", { type: "danger" })];
                    }
                    return [4, fetch(url, {
                            method: "POST",
                            body: new URLSearchParams({
                                fkey: fkey,
                                otherText: "",
                                overrideWarning: "false",
                            })
                        })];
                case 1:
                    res = _b.sent();
                    if (!res.ok) {
                        console.debug("[".concat(scriptName, "] failed to flag as ").concat(type));
                        return [2, StackExchange.helpers.showToast("Something went wrong when quickflagging as ".concat(type), { type: "danger" })];
                    }
                    return [4, res.json()];
                case 2:
                    _a = _b.sent(), Success = _a.Success, Message = _a.Message;
                    console.debug("[".concat(scriptName, "] ").concat(type, " flagging status: ").concat(Success));
                    return [2, StackExchange.helpers.showToast(Message, { type: Success ? "success" : "danger" })];
            }
        });
    }); });
    itemWrapper.append(quickflag);
    return itemWrapper;
};
window.addEventListener("load", function () {
    var scriptName = "flag-overcharged";
    var flagModalQueries = ["#popup-flag-post", "#popup-close-question"];
    var submitBtnQuery = ".js-popup-submit";
    var postMenuQuery = ".answer .js-post-menu > div:first-child";
    var skey = "_flag-overcharged";
    var savedData = load(skey);
    var skippedNodeTypes = [Node.COMMENT_NODE, Node.TEXT_NODE];
    var obs = new MutationObserver(function (records) {
        var record = findRecord(flagModalQueries, records, skippedNodeTypes);
        if (!record)
            return;
        var _a = __read(record.addedNodes, 1), flagModule = _a[0];
        var modal = flagModule;
        modal.addEventListener("input", throttle(function (_a) {
            var target = _a.target;
            var _b = target, name = _b.name, value = _b.value;
            savedData[name] = value;
            save(skey, savedData);
        }));
        modal.addEventListener("click", function (_a) {
            var target = _a.target;
            if (!target.matches(submitBtnQuery))
                return;
            var inputs = modal.querySelectorAll("input[type=text], textarea");
            inputs.forEach(function (input) { return (input.value = savedData[input.name] = ""); });
        });
        Object.entries(savedData).forEach(function (_a) {
            var _b = __read(_a, 2), name = _b[0], value = _b[1];
            var input = modal.querySelector("[name='".concat(name, "']"));
            if (!input)
                return;
            input.value = value;
        });
    });
    obs.observe(document, {
        subtree: true,
        childList: true,
    });
    document.querySelectorAll(postMenuQuery).forEach(function (menuWrapper) {
        var _a;
        var postId = (((_a = menuWrapper.closest(".js-post-menu")) === null || _a === void 0 ? void 0 : _a.dataset) || {}).postId;
        if (!postId) {
            console.debug("[".concat(scriptName, "] missing post id"), menuWrapper);
            return StackExchange.helpers.showToast("Failed to find answer id", { type: "danger" });
        }
        var quickflagNAA = makeQuickflagButton(scriptName, "NAA", postId);
        var quickflagVLQ = makeQuickflagButton(scriptName, "VLQ", postId);
        menuWrapper.append(quickflagVLQ, quickflagNAA);
    });
});
