import {parser} from "./command.grammar";
import {LRLanguage, LanguageSupport} from "@codemirror/language";
import {styleTags, tags as t} from "@lezer/highlight";
import {autocompletion} from "@codemirror/autocomplete";

export const ReplLanguage = LRLanguage.define({
    name: "fifthtry_ide_repl",
    parser: parser.configure({
        props: [
            styleTags({
                FileName: t.literal,
                AddFile: t.keyword,
                DeleteFile: t.keyword,
                PushFile: t.keyword,
                LineComment: t.lineComment,
            })
        ]
    }),
    languageData: {
        autocomplete: (context) => {
            return (
                window.ide_autocomplete_command_prompt
                && window.ide_autocomplete_command_prompt(context)
            )
        },
        commentTokens: {line: ";;"}
    }
})

export function repl() {
    return new LanguageSupport(ReplLanguage, [
        autocompletion({
            icons: false,
            addToOptions: [{
                render: (completion, state, view) => {
                    return (
                        window.ide_autocomplete_command_prompt_extra
                        && window.ide_autocomplete_command_prompt_extra(completion, state, view)
                    );
                },
                position: 90,
            }],
        })
    ])
}

export const repl_parser = parser;