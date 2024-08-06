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
        autocomplete: (c) => window.ide_autocomplete_command_prompt(c),
        commentTokens: {line: ";;"}
    }
})

export function repl() {
    return new LanguageSupport(ReplLanguage)
}

export const repl_parser = parser;