import {parser} from "./command.grammar"
import {LRLanguage, LanguageSupport} from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"

export const EXAMPLELanguage = LRLanguage.define({
    parser: parser.configure({
        props: [
            styleTags({
                FileName: t.literal,
                AddFile: t.keyword,
                LineComment: t.lineComment,
            })
        ]
    }),
    languageData: {
        commentTokens: {line: "-- "}
    }
})

export function example() {
    return new LanguageSupport(EXAMPLELanguage)
}

export let p = parser;