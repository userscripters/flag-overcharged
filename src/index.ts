type Inputs = HTMLTextAreaElement | HTMLInputElement;

type Data = { [name: string]: string };

/**
 * @summary saves data to local storage
 * @param key data key
 * @param data data value
 */
const save = (key: string, data: Data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.debug(`failed to persist input data: ${error}`);
    }
};

/**
 * @summary loads persisted data from local storage
 * @param key data key
 */
const load = (key: string) => JSON.parse(localStorage.getItem(key) || "{}");

/**
 * @summary finds a {@link MutationRecord} that adds nodes matching {@link queries}
 * @param queries list of CSS selectors to match by
 * @param records array of {@link MutationRecord}s
 * @param skipped node types to skip over
 */
const findRecord = (queries: string[], records: MutationRecord[], skipped: number[]) => {
    return records.find(({ addedNodes }) =>
        [...addedNodes].some(
            (node) =>
                !skipped.includes(node.nodeType) &&
                queries.some((query) => (<HTMLElement>node).matches(query))
        )
    );
};

/**
 * @summary throttles a given {@link callback}
 * @param callback function to throttle
 * @param period optional number of milliseconds to throttle for
 */
const throttle = <T extends (...args: any[]) => any>(
    callback: T,
    period = 100
) => {
    let throttled = false;
    return (...args: Parameters<T>) => {
        if (!throttled) {
            throttled = true;
            setTimeout(() => (throttled = false), period);
            return callback(...args);
        }
    };
};

window.addEventListener("load", () => {
    const flagModalQueries = ["#popup-flag-post", "#popup-close-question"];
    const submitBtnQuery = ".js-popup-submit";
    const skey = "_flag-overcharged";

    const savedData: Data = load(skey);

    const skippedNodeTypes = [Node.COMMENT_NODE, Node.TEXT_NODE];

    const obs = new MutationObserver((records) => {
        const record = findRecord(flagModalQueries, records, skippedNodeTypes);
        if (!record) return;

        const {
            addedNodes: [flagModule],
        } = record;

        const modal = <HTMLDivElement>flagModule;

        modal.addEventListener(
            "input",
            throttle(({ target }) => {
                const { name, value } = <HTMLInputElement>target;
                savedData[name] = value;
                save(skey, savedData);
            })
        );

        modal.addEventListener("click", ({ target }) => {
            if (!(<HTMLElement>target).matches(submitBtnQuery)) return;

            const inputs = modal.querySelectorAll<Inputs>("input, textarea");
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

    obs.observe(document, {
        subtree: true,
        childList: true,
    });
});
