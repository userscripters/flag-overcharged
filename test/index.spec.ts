import { expect } from "chai";
import { readFile } from "fs/promises";
import { JSDOM } from "jsdom";

type Area = HTMLTextAreaElement;

describe("main", () => {
    it("should save input correctly", async () => {
        const content = await readFile("./test/fixtures/popup.html", {
            encoding: "utf-8",
        });

        const {
            window: { document, InputEvent },
        } = new JSDOM(content, { runScripts: "dangerously" });

        const script = await readFile("./dist/modern/index.js", {
            encoding: "utf-8",
        });

        document.body.append(`<script>${script}</script>`);

        const areaSel = "[name='otherText']";

        const modal = document.getElementById("popup-flag-post")!;
        const custom = modal.querySelector<Area>(areaSel)!;

        const text = "test value";

        custom.value = text;

        const ev = new InputEvent("input", { bubbles: true });
        custom.dispatchEvent(ev);

        const dolly = <HTMLElement>modal.cloneNode(true);

        const form = dolly.querySelector("form")!;
        form.reset();

        modal.replaceWith(dolly);

        const { value } = modal.querySelector<Area>(areaSel)!;

        expect(value).to.equal(text);
    });
});
