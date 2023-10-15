export const removeProvideStyle = (className: string) => {
    const doc = parent.document.head.querySelector(
        `style[data-injected-style^="${className}"]`
    ) as HTMLStyleElement | null;
    if (doc) doc.remove();
};

export const tableIconNonUnicode = (count: string) => logseq.settings![`icon${count}`].length === 4 ? "\\" + logseq.settings![`icon${count}`] : logseq.settings![`icon${count}`];

export const tablerIconGetUnicode = (count: string) => logseq.settings![`icon${count}`] ?
    //4桁の文字列であれば、&#xを付けて、;を付ける
    logseq.settings![`icon${count}`].length === 4 ? `&#x${logseq.settings![`icon${count}`] as string};` :
        //5桁の文字列であれば、\を削除して、&#xを付けて、;を付ける
        logseq.settings![`icon${count}`].length === 5 ?
            `&#x${(logseq.settings![`icon${count}`] as string).replace("\\", "") as string};` : logseq.settings![`icon${count}`]
    : "---";
