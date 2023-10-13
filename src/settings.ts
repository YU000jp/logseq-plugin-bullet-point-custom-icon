import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { t } from 'logseq-l10n';

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
            title: t("Hide the tag of including `@` ? (except when editing)"),
            default: true,
            description: "default: true",
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
        }
    ];

    //option

    //12種類のアイコンを設定する
    const iconArray = ["🌟", "👍", "🔵", "📚", "📌", "📝", "📖", "❓", "🌳", "🐶", "🚗", "🔥"];

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
                description: t("one character(mark) only"),
                default: iconArray[i],
            },
            {
                key: `tagsList${count}`,
                type: "string",
                inputAs: "textarea",
                title: t("Specify one or more tags"),
                description: t("separated by line breaks"),
                default: "",
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
                default: "#6032A4",
            },
        );
    }

    return settingArray;
};
