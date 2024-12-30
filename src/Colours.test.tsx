import { parseMarkup } from "./Colours";

test("parses markup correctly", () => {

    const str = "{{r|red death dacca}}";

    parseMarkup(str);
})

test("parses no markup correctly", () => {

    const str = "red death dacca";

    parseMarkup(str);
})