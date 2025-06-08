import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'

export const removeProvideStyle = (className: string) => {
    const doc = parent.document.head.querySelector(
        `style[data-injected-style^="${className}"]`
    ) as HTMLStyleElement | null
    if (doc) doc.remove()
}

export const tableIconNonUnicode = (count: string) => (logseq.settings![`icon${count}`] as string).length === 4 ? "\\" + logseq.settings![`icon${count}`] : logseq.settings![`icon${count}`]

export const tablerIconGetUnicode = (count: string) => (logseq.settings![`icon${count}`] as string) ?
    //4桁の文字列であれば、&#xを付けて、;を付ける
    (logseq.settings![`icon${count}`] as string).length === 4 ? `&#x${logseq.settings![`icon${count}`] as string};` :
        //5桁の文字列であれば、\を削除して、&#xを付けて、;を付ける
        (logseq.settings![`icon${count}`] as string).length === 5 ?
            `&#x${(logseq.settings![`icon${count}`] as string).replace("\\", "") as string};` : logseq.settings![`icon${count}`]
    : "---"

export const copyEvent = async (tag: string) => {
    //現在のブロックを取得
    const currentBlock = await logseq.Editor.getCurrentBlock() as BlockEntity | null
    if (currentBlock) {
        const ele = parent.document.querySelector(`div#root>div>main>div#app-container div:is([blockid="${currentBlock.uuid}"],id="${currentBlock.uuid}"])`) as HTMLDivElement | null
        if (ele) {
            ele.style.outline = "3px solid var(--ls-border-color)"
            setTimeout(() => ele.style.outline = "unset", 6000)
        }
        //現在のブロックの最後にタグを追加
        //tagに空白が含まれていたら、[[ ]]で囲む
        if (tag.includes(" ")) tag = "[[" + tag + "]]"
        //contentの中に、\nが含まれている場合、一つ目の\nの前に、tagを挿入する
        let content = currentBlock.content
        if (content.includes("\n")) content = content.replace("\n", " #" + tag + "\n")
        else content = content + " #" + tag
        await logseq.Editor.updateBlock(currentBlock.uuid, content, currentBlock.properties)
        logseq.UI.showMsg(t("Insert at editing block: #") + tag + ".", "info")
        logseq.Editor.editBlock(currentBlock.uuid)
    } else {
        //ブロックが選択されていない場合
        logseq.UI.showMsg(t("No block selected."), "warning")
    }
}
