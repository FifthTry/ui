
// Define a basic FTD grammar with "-- import:" keyword
import {LanguageSupport, LRLanguage, syntaxTree} from "@codemirror/language";
import {styleTags, tags as t} from "@lezer/highlight";
import {parser} from "./ftd.grammar";

const ftdLanguage = LRLanguage.define({
    parser: parser.configure({
        // Basic tokenizer for FTD import grammar
        props: [
            styleTags({
                KeywordComponent: t.literal,
                KeywordRecord: t.literal,
                SectionType: t.typeName,
                SectionName: t.keyword,
                SectionCaption: t.string,
                Comment: t.comment,
                HeaderType: t.meta,
                HeaderName: t.number,
                HeaderValue: t.string,
            })
        ]
    }),
});

// Autocomplete support for FTD packages
const ftdAutocomplete = ftdLanguage.data.of({
    autocomplete: (context) => {
        let nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1);
        if (nodeBefore.name == "Import") {
            return {
                from: nodeBefore.from,
                options: [
                    {label: "ftd_core", type: "variable"},
                    {label: "ftd_ui", type: "variable"},
                    {label: "ftd_utils", type: "variable"},
                    {label: "ftd_data", type: "variable"}
                ]
            };
        }
        return null;
    }
});

// Create a language support extension
function ftd() {
    return new LanguageSupport(ftdLanguage, [ftdAutocomplete]);
}

export {ftd}