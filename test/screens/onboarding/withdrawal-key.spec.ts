import {setApp, stopApp, TIMEOUT} from "../setup";
import {Application} from "spectron";
import {expect} from "chai";
import {OnBoardingRoutes, Routes} from "../../../src/renderer/constants/routes";
import {
    KEY_START_WITH_PREFIX,
    KEY_WRONG_CHARACTERS_MESSAGE,
    PUBLIC_KEY_WRONG_LENGTH_MESSAGE
} from "../../../src/renderer/services/utils/input-utils";
import {IMPORT_WITHDRAWAL_KEY_PLACEHOLDER} from "../../../src/renderer/constants/strings";

jest.setTimeout(TIMEOUT);

const publicKeyStr =
    "0x92fffcc44e690220c190be41378baf6152560eb13fa73bdf8b45120b56096acc4b4e87a0e0b97f83e48f0ff4990daa18";

describe("Onboarding withdrawal key import screen", () => {
    let app: Application;

    beforeEach(async () => {
        app = await setApp(Routes.ONBOARD_ROUTE_EVALUATE(OnBoardingRoutes.WITHDRAWAL_IMPORT));
    });

    afterEach(async () => {
        await stopApp(app);
    });

    it("has rendered properly", async function () {
        const {client} = app;
        expect(await client.isExisting(".back-tab")).to.be.true;
        expect(await client.isExisting("#inputKey")).to.be.true;
        expect((await client.elements(".step")).value.length).to.be.equal(5);
        const placeholder = await client.getAttribute("#inputKey", "placeholder");
        expect(placeholder).to.be.equal(IMPORT_WITHDRAWAL_KEY_PLACEHOLDER);
        const currentStep: [] = await client.getAttribute(".step.current", "textContent");
        expect(currentStep.length).to.be.equal(2);
    });
    
    it("should fail invalid inputs", async () => {
        const {client} = app;

        // Invalid key
        await client.setValue(".inputform", "test");
        let errorMessage = await client.getText(".error-message");
        expect(errorMessage).to.be.equal(KEY_START_WITH_PREFIX);

        // Invalid key length
        await client.setValue(".inputform", "0xadfa");
        errorMessage = await client.getText(".error-message");
        expect(errorMessage).to.be.equal(PUBLIC_KEY_WRONG_LENGTH_MESSAGE);

        // Invalid charactes in key
        await client.setValue(".inputform", "0xasdf*=");
        errorMessage = await client.getText(".error-message");
        expect(errorMessage).to.be.equal(KEY_WRONG_CHARACTERS_MESSAGE);
    });


    it("should work valid inputs", async () => {
        const {client} = app;

        // Valid key
        await client.setValue(".inputform", publicKeyStr);
        const errorMessage = await client.getText(".error-message");
        expect(errorMessage).to.be.equal("");
    });

    it("should not submit if error message exists", async () => {
        const {client} = app;

        // User enter invalid key
        await client.setValue(".inputform", "0xasdfasdf");

        const preClickUrl = await client.getUrl();
        await client.waitForVisible("#submit");
        await client.$("#submit").click();
        const postClickUrl = await client.getUrl();
        expect(preClickUrl).to.be.equal(postClickUrl);

        /*
        // User enter valid key
        await client.setValue(".inputform", publicKeyStr);
        await client.$("#submit").click();
        postClickUrl = await client.getUrl();
        expect(postClickUrl.endsWith(Routes.ONBOARD_ROUTE_EVALUATE(
            OnBoardingRoutes.WITHDRAWAL_IMPORT
        ))).to.be.true;
        */
    });

});