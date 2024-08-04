import {parser} from "./command.grammar"
import {LRLanguage, LanguageSupport, indentNodeProp, foldNodeProp, foldInside, delimitedIndent} from "@codemirror/language"
import {styleTags, tags as t} from "@lezer/highlight"

export const EXAMPLELanguage = LRLanguage.define({
    parser: parser.configure({
        props: [
            indentNodeProp.add({
                Application: delimitedIndent({closing: ")", align: false})
            }),
            foldNodeProp.add({
                Application: foldInside
            }),
            styleTags({
                Identifier: t.variableName,
                Boolean: t.bool,
                String: t.string,
                LineComment: t.lineComment,
                "( )": t.paren
            })
        ]
    }),
    languageData: {
        commentTokens: {line: ";"}
    }
})

export function example() {
    return new LanguageSupport(EXAMPLELanguage)
}