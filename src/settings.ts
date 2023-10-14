import { LSPluginBaseInfo, SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { t } from 'logseq-l10n';
import { provideStyle, reset } from '.';
import { removeProvideStyle } from './lib';

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (): SettingSchemaDesc[] => {
    const settingArray: SettingSchemaDesc[] = [
        {//機能の一時的なオンオフ
            key: "booleanFunction",
            type: "boolean",
            title: t("Function On/Off"),
            default: true,
            description: "",
        },
        {//@を含むタグがついている場合、編集中以外は非表示
            key: "booleanAtMarkTagHidden",
            type: "boolean",
            //通常のタグと区別するため、@を含むタグを使う場合
            title: t("Hide the tag of including `@` ? (except when editing) If use a tag that includes `@` to distinguish it from a normal tag"),
            default: true,
            // @tagのように、タグの前に@がついている場合、編集中以外は非表示にする
            description: "default: true / ex: @tag",
        },
        {//指定したタグにHierarchyが含まれている場合、その親に一致する場合にもマッチさせる
            key: "booleanHierarchyParentTag",
            type: "boolean",
            title: t("Match parent tag? (if the specified tag contains Hierarchy)"),
            default: false,
            description: "default: false",
        },
        {//アイコンの大きさを大きくする
            key: "booleanIconLarge",
            type: "enum",
            title: t("Large icon?"),
            enumChoices: ["default", "large", "x-large"],
            default: "default",
            description: "",
        },
        {//絵文字コピーサイトへの誘導リンク
            key: "headingEmojiCopy",
            type: "heading",
            title: t("Use Emoji icon"),
            default: "",
            description: t("Press the shortcut key and enter from the selection screen, or copy emoji on the site to clipboard. ") + "https://emojilo.com/ ",
        },
        {//Tabler iconの場合は、プラグインをインストールして、アイコンをコピーする
            key: "headingTablerIconCopy",
            type: "heading",
            title: t("Use Tabler icon"),
            default: "",
            description: t("Install `Tabler-icon` plugin. Then copy icons to clipboard from toolbar."),
        },
    ];

    //option

    //12種類のアイコンを設定する
    const iconArray = ["🔴", "\\eba9", "📚", "\\eaad", "📌", "📝", "📖", "❓", "🌳", "🐶", "🚗", "🔥"];//12
    const tagArray = ["@red", "@people", "@book", "@folder", "@pin", "@memo", "@book", "@question", "@tree", "@dog", "@car", "@fire"];//12

    //12個複製する
    for (let i = 0; i < 12; i++) {
        //二桁にしたい
        const count = ("0" + (i + 1)).slice(-2);
        settingArray.push(
            {
                key: `heading${count}`,
                type: "heading",
                title: `No. ${count}`,
                default: "",
                description: t("Bullets in blocks with that tag are effected."),
            },
            {
                key: `icon${count}`,
                type: "string",
                title: t("Tabler-icon or Emoji icon (`Win + .` / Mac: `cmd + ctrl + space`)"),
                //一文字のみ
                description: t("ex. `\\eaad`(Tabler-icon code) or one character(mark) only"),
                default: iconArray[i],
            },
            {
                key: `tagsList${count}`,
                type: "string",
                inputAs: "textarea",
                title: t("Specify one or more tags to be applied to the icon"),
                description: t("Separated by line breaks. Without `#`. Not must include `@`."),
                default: tagArray[i] + "\n",
            },
            {
                key: `colorBoolean${count}`,
                type: "boolean",
                title: t("Colorize?"),
                //Tabler-iconの場合のみ
                description: t("Tabler-icon only"),
                default: false,
            },
            {
                key: `color${count}`,
                type: "string",
                inputAs: "color",
                title: t("Specify the color of the icon"),
                description: t("Tabler-icon only"),
                default: "#32A482",
            },
        );
    }

    return settingArray;
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
