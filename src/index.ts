type Inputs = HTMLTextAreaElement | HTMLInputElement;

type Data = { [name: string]: string };

((_w, d) => {
    const flagModalQueries = ["#popup-flag-post", "#popup-close-question"];
    const submitBtnQuery = ".js-popup-submit";

    const savedData: Data = {};

    const findRecord = (records: MutationRecord[], skipped: number[]) => {
        return records.find(({ addedNodes }) =>
            [...addedNodes].some(
                (node) =>
                    !skipped.includes(node.nodeType) &&
                    flagModalQueries.some((query) =>
                        (<HTMLElement>node).matches(query)
                    )
            )
        );
    };

    const skippedNodeTypes = [Node.COMMENT_NODE, Node.TEXT_NODE];

    const obs = new MutationObserver((records) => {
        const record = findRecord(records, skippedNodeTypes);
        if (!record) return;

        const {
            addedNodes: [flagModule],
        } = record;

        const modal = <HTMLDivElement>flagModule;

        modal.addEventListener("input", ({ target }) => {
            const { name, value } = <HTMLInputElement>target;
            savedData[name] = value;
        });

        modal.addEventListener("click", ({ target }) => {
            if (!(<HTMLElement>target).matches(submitBtnQuery)) return;

            const inputs = [
                ...modal.querySelectorAll<Inputs>("input, textarea"),
            ];
            inputs.forEach(
                (input) => (input.value = savedData[input.name] = "")
            );
        });

        Object.entries(savedData).forEach(([name, value]) => {
            const input = modal.querySelector<Inputs>(`[name=${name}]`);
            if (!input) return;
            input.value = value;
        });
    });

    obs.observe(d, {
        subtree: true,
        childList: true,
    });
})(window, document);
