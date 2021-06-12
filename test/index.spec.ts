import { expect } from "chai";
import { readFile } from "fs/promises";
import { JSDOM } from "jsdom";

type Area = HTMLTextAreaElement;

const appendDist = async (d: Document) => {
    const script = await readFile("./dist/modern/index.js", {
        encoding: "utf-8",
    });
    d.body.append(`<script>${script}</script>`);
};

const dispatchInput = (
    modal: HTMLElement,
    text: string,
    eiv: typeof InputEvent
) => {
    const custom = modal.querySelector<Area>("[name='otherText']")!;
    custom.value = text;
    const ev = new eiv("input", { bubbles: true });
    custom.dispatchEvent(ev);
};

const getPopup = () =>
    readFile("./test/fixtures/popup.html", { encoding: "utf-8" });

describe("main", () => {
    it("should save input correctly", async () => {
        const content = await getPopup();

        const {
            window: { document, InputEvent },
        } = new JSDOM(content, { runScripts: "dangerously" });

        await appendDist(document);

        const modal = document.getElementById("popup-flag-post")!;
        const text = "test value";

        dispatchInput(modal, text, InputEvent);

        const dolly = <HTMLElement>modal.cloneNode(true);

        const form = dolly.querySelector("form")!;
        form.reset();

        modal.replaceWith(dolly);

        const { value } = modal.querySelector<Area>("[name='otherText']")!;

        expect(value).to.equal(text);
    });

    it("should work with storage disabled", async () => {
        const content = await getPopup();

        const {
            window: { document, InputEvent },
        } = new JSDOM(content, { storageQuota: 0, runScripts: "dangerously" });

        await appendDist(document);

        const modal = document.getElementById("popup-flag-post")!;
        const text = "no quota, but still works";

        dispatchInput(modal, text, InputEvent);

        const dolly = <HTMLElement>modal.cloneNode(true);

        const form = dolly.querySelector("form")!;
        form.reset();

        modal.replaceWith(dolly);

        const { value } = modal.querySelector<Area>("[name='otherText']")!;

        expect(value).to.equal(text);
    });
});
