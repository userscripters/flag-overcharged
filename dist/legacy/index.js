"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
(function (_w, d) {
    var flagModalQuery = "#popup-flag-post";
    var submitBtnQuery = ".js-popup-submit";
    var savedData = {};
    var findRecord = function (records, skipped) {
        return records.find(function (_a) {
            var addedNodes = _a.addedNodes;
            return __spreadArray([], __read(addedNodes)).some(function (node) {
                return !skipped.includes(node.nodeType) &&
                    node.matches(flagModalQuery);
            });
        });
    };
    var skippedNodeTypes = [Node.COMMENT_NODE, Node.TEXT_NODE];
    var obs = new MutationObserver(function (records) {
        var record = findRecord(records, skippedNodeTypes);
        if (!record)
            return;
        var _a = __read(record.addedNodes, 1), flagModule = _a[0];
        var modal = flagModule;
        modal.addEventListener("input", function (_a) {
            var target = _a.target;
            var _b = target, name = _b.name, value = _b.value;
            savedData[name] = value;
        });
        modal.addEventListener("click", function (_a) {
            var target = _a.target;
            if (!target.matches(submitBtnQuery))
                return;
            var inputs = __spreadArray([], __read(modal.querySelectorAll("input, textarea")));
            inputs.forEach(function (input) { return (input.value = savedData[input.name] = ""); });
        });
        Object.entries(savedData).forEach(function (_a) {
            var _b = __read(_a, 2), name = _b[0], value = _b[1];
            var input = modal.querySelector("[name=" + name + "]");
            if (!input)
                return;
            input.value = value;
        });
    });
    obs.observe(d, {
        subtree: true,
        childList: true,
    });
})(window, document);
