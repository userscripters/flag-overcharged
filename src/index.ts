/// <reference types="@userscripters/stackexchange-global-types" />

type Inputs = HTMLTextAreaElement | HTMLInputElement;

type Data = { [name: string]: string };

type FlagResult = {
    FlagType: number;
    Message: string;
    Outcome: number;
    ResultChangedState: boolean;
    Success: boolean;
};

type QuickflagType = "NAA" | "VLQ";

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

/**
 * @summary map of flag types to enpoints to POST to add the flag
 */
const flagTypeToEndpointMap: Record<QuickflagType, string> = {
    NAA: "AnswerNotAnAnswer",
    VLQ: "PostLowQuality",
};

/**
 * @summary creates a quickflag button
 * @param scriptName name of the userscript
 * @param type flag type
 * @param postId id of the post to flag
 */
const makeQuickflagButton = (
    scriptName: string,
    type: QuickflagType,
    postId: number | string,
) => {
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
            return StackExchange.helpers.showToast(
                `Something went wrong when quickflagging as ${type}`,
                { type: "danger" }
            );
        }

        const { Success, Message }: FlagResult = await res.json();
        console.debug(`[${scriptName}] ${type} flagging status: ${Success}`);
        return StackExchange.helpers.showToast(
            Message,
            { type: Success ? "success" : "danger" }
        );
    });

    return quickflagNAA;
};

window.addEventListener("load", () => {
    const scriptName = "flag-overcharged";
    const flagModalQueries = ["#popup-flag-post", "#popup-close-question"];
    const submitBtnQuery = ".js-popup-submit";
    const postMenuQuery = ".answer .js-post-menu > div:first-child";
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

            const inputs = modal.querySelectorAll<Inputs>("input[type=text], textarea");
            inputs.forEach(
                (input) => (input.value = savedData[input.name] = "")
            );
        });

        Object.entries(savedData).forEach(([name, value]) => {
            const input = modal.querySelector<Inputs>(`[name='${name}']`);
            if (!input) return;
            input.value = value;
        });
    });

    obs.observe(document, {
        subtree: true,
        childList: true,
    });

    document.querySelectorAll<HTMLElement>(postMenuQuery).forEach((menuWrapper) => {
        const itemWrapper = document.createElement("div");
        itemWrapper.classList.add("flex--item");

        const { postId } = menuWrapper.closest<HTMLElement>(".js-post-menu")?.dataset || {};
        if (!postId) {
            console.debug(`[${scriptName}] missing post id`, menuWrapper);
            return StackExchange.helpers.showToast(
                "Failed to find answer id",
                { type: "danger" }
            );
        }

        const quickflagNAA = makeQuickflagButton(scriptName, "NAA", postId);
        const quickflagVLQ = makeQuickflagButton(scriptName, "VLQ", postId);

        itemWrapper.append(quickflagVLQ, quickflagNAA);
        menuWrapper.append(itemWrapper);
    });
});
