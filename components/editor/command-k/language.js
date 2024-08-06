import {parser} from "./command.grammar"
import {LRLanguage, LanguageSupport} from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"

export const ReplLanguage = LRLanguage.define({
    parser: parser.configure({
        props: [
            styleTags({
                FileName: t.literal,
                AddFile: t.keyword,
                PushFile: t.keyword,
                LineComment: t.lineComment,
            })
        ]
    }),
    languageData: {
        commentTokens: {line: ";; "}
    }
})

export function repl() {
    return new LanguageSupport(ReplLanguage)
}

export const repl_parser = parser;