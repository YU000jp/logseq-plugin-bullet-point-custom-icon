import { provideStyle } from '.';
import { reset } from './settings';
import { LSPluginBaseInfo } from '@logseq/libs/dist/LSPlugin.user';

export const removeProvideStyle = (className: string) => {
    const doc = parent.document.head.querySelector(
        `style[data-injected-style^="${className}"]`
    ) as HTMLStyleElement | null;
    if (doc) doc.remove();
};
export const settingChanged = () => {
    logseq.onSettingsChanged((newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
        if (newSet.booleanFunction !== oldSet.booleanFunction) {
            if (newSet.booleanFunction === true) provideStyle();

            else if (newSet.booleanFunction === false) removeProvideStyle("bullet-point-custom-icon");
        }
        else if (oldSet.booleanAtMarkTagHidden !== newSet.booleanAtMarkTagHidden
            || oldSet.booleanHierarchyParentTag !== newSet.booleanHierarchyParentTag
            || oldSet.booleanIconLarge !== newSet.booleanIconLarge
            || oldSet.icon01 !== newSet.icon01
            || oldSet.icon02 !== newSet.icon02
            || oldSet.icon03 !== newSet.icon03
            || oldSet.icon04 !== newSet.icon04
            || oldSet.icon05 !== newSet.icon05
            || oldSet.icon06 !== newSet.icon06
            || oldSet.icon07 !== newSet.icon07
            || oldSet.icon08 !== newSet.icon08
            || oldSet.icon09 !== newSet.icon09
            || oldSet.icon10 !== newSet.icon10
            || oldSet.icon11 !== newSet.icon11
            || oldSet.icon12 !== newSet.icon12
            || oldSet.tagsList01 !== newSet.tagsList01
            || oldSet.tagsList02 !== newSet.tagsList02
            || oldSet.tagsList03 !== newSet.tagsList03
            || oldSet.tagsList04 !== newSet.tagsList04
            || oldSet.tagsList05 !== newSet.tagsList05
            || oldSet.tagsList06 !== newSet.tagsList06
            || oldSet.tagsList07 !== newSet.tagsList07
            || oldSet.tagsList08 !== newSet.tagsList08
            || oldSet.tagsList09 !== newSet.tagsList09
            || oldSet.tagsList10 !== newSet.tagsList10
            || oldSet.tagsList11 !== newSet.tagsList11
            || oldSet.tagsList12 !== newSet.tagsList12
            || oldSet.colorBoolean01 !== newSet.colorBoolean01
            || oldSet.colorBoolean02 !== newSet.colorBoolean02
            || oldSet.colorBoolean03 !== newSet.colorBoolean03
            || oldSet.colorBoolean04 !== newSet.colorBoolean04
            || oldSet.colorBoolean05 !== newSet.colorBoolean05
            || oldSet.colorBoolean06 !== newSet.colorBoolean06
            || oldSet.colorBoolean07 !== newSet.colorBoolean07
            || oldSet.colorBoolean08 !== newSet.colorBoolean08
            || oldSet.colorBoolean09 !== newSet.colorBoolean09
            || oldSet.colorBoolean10 !== newSet.colorBoolean10
            || oldSet.colorBoolean11 !== newSet.colorBoolean11
            || oldSet.colorBoolean12 !== newSet.colorBoolean12
            || oldSet.color01 !== newSet.color01
            || oldSet.color02 !== newSet.color02
            || oldSet.color03 !== newSet.color03
            || oldSet.color04 !== newSet.color04
            || oldSet.color05 !== newSet.color05
            || oldSet.color06 !== newSet.color06
            || oldSet.color07 !== newSet.color07
            || oldSet.color08 !== newSet.color08
            || oldSet.color09 !== newSet.color09
            || oldSet.color10 !== newSet.color10
            || oldSet.color11 !== newSet.color11
            || oldSet.color12 !== newSet.color12) reset();
    });
};

export const tableIconNonUnicode = (count: string) => logseq.settings![`icon${count}`].length === 4 ? "\\" + logseq.settings![`icon${count}`] : logseq.settings![`icon${count}`];

export const tablerIconGetUnicode = (count: string) => logseq.settings![`icon${count}`] ?
    //4桁の文字列であれば、&#xを付けて、;を付ける
    logseq.settings![`icon${count}`].length === 4 ? `&#x${logseq.settings![`icon${count}`] as string};` :
        //5桁の文字列であれば、\を削除して、&#xを付けて、;を付ける
        logseq.settings![`icon${count}`].length === 5 ?
            `&#x${(logseq.settings![`icon${count}`] as string).replace("\\", "") as string};` : logseq.settings![`icon${count}`]
    : "---";
