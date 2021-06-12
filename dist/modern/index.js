"use strict";
((_w, d) => {
    const flagModalQueries = ["#popup-flag-post", "#popup-close-question"];
    const submitBtnQuery = ".js-popup-submit";
    const skey = "_flag-overcharged";
    const save = (data) => {
        try {
            localStorage.setItem(skey, JSON.stringify(data));
        }
        catch (error) {
            console.debug(`failed to persist input data: ${error}`);
        }
    };
    const load = () => JSON.parse(localStorage.getItem(skey) || "{}");
    const findRecord = (records, skipped) => {
        return records.find(({ addedNodes }) => [...addedNodes].some((node) => !skipped.includes(node.nodeType) &&
            flagModalQueries.some((query) => node.matches(query))));
    };
    const throttle = (cbk, period = 100) => {
        let throttled = false;
        return (...args) => {
            if (!throttled) {
                throttled = true;
                setTimeout(() => (throttled = false), period);
                return cbk(...args);
            }
        };
    };
    const savedData = load();
    const skippedNodeTypes = [Node.COMMENT_NODE, Node.TEXT_NODE];
    const obs = new MutationObserver((records) => {
        const record = findRecord(records, skippedNodeTypes);
        if (!record)
            return;
        const { addedNodes: [flagModule], } = record;
        const modal = flagModule;
        modal.addEventListener("input", throttle(({ target }) => {
            const { name, value } = target;
            savedData[name] = value;
            save(savedData);
        }));
        modal.addEventListener("click", ({ target }) => {
            if (!target.matches(submitBtnQuery))
                return;
            const inputs = [
                ...modal.querySelectorAll("input, textarea"),
            ];
            inputs.forEach((input) => (input.value = savedData[input.name] = ""));
        });
        Object.entries(savedData).forEach(([name, value]) => {
            const input = modal.querySelector(`[name=${name}]`);
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
