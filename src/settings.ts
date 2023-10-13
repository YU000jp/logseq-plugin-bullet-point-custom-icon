import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (): SettingSchemaDesc[] => [
    {
        key: "booleanFunction",
        type: "boolean",
        title: "On/Off",
        default: true,
        description: "",
    },
    {
        key: "heading001",
        type: "heading",
        title: "no settings",
        default: "",
        description: "",
    },
];
