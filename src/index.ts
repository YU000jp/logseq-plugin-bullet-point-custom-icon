import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { settingsTemplate } from './settings';
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json";
import { removeProvideStyle } from './lib';
import { LSPluginBaseInfo } from '@logseq/libs/dist/LSPlugin.user';
import CSS from './style.css?inline';

/* main */
const main = () => {
  (async () => {
    try {
      await l10nSetup({ builtinTranslations: { ja } });
    } finally {
      /* user settings */
      logseq.useSettingsSchema(settingsTemplate());
      if (!logseq.settings) setTimeout(() => logseq.showSettingsUI(), 300);
    }
  })();

  //初回読み込み時にCSSを反映させる
  /* side block */
  provideStyle();

  //常時適用CSS
  //プラグイン設定の見た目を整える
  logseq.provideStyle(`
  article>div[data-id="bullet-point-custom-icon"] div.heading-item {
    margin-top: 2em;
    border-top-width: 1px;
    padding-top: 1em;
  }
  article>div[data-id="bullet-point-custom-icon"] label.form-control{
    &>input[type="text"].form-input {
      width:100px;
      font-size: 1.3em;
    }
    &>textarea.form-input {
      width:350px;
      height: 9em;
    }
  }
  `);


  //ツールバーに設定画面を開くボタンを追加
  logseq.App.registerUIItem('toolbar', {
    key: 'customBulletIconSettingsButton',
    template: `<div><a class="button icon" data-on-click="customBulletIconSettingsButton" style="font-size: 14px" title="Bullet Point Custom Icon: plugin settings">#️⃣</a></div>`,
  });
  //ツールバーボタンのクリックイベント
  logseq.provideModel({
    customBulletIconSettingsButton: () => {
      logseq.showSettingsUI();
    }
  });

  //Setting changed
  logseq.onSettingsChanged((newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
    if (newSet.booleanFunction !== oldSet.booleanFunction) {
      if (newSet.booleanFunction === true) provideStyle();
      else
        if (newSet.booleanFunction === false) removeProvideStyle("bullet-point-custom-icon");
    } else
      if (oldSet.booleanAtMarkTagHidden !== newSet.booleanAtMarkTagHidden
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
        || oldSet.color12 !== newSet.color12
      ) reset();
  });

};/* end_main */

const reset = () => {
  removeProvideStyle("bullet-point-custom-icon");
  provideStyle();
};


const provideStyle = () => {
  if (logseq.settings!.booleanFunction === false) return;

  let printCSS = "";

  //サンプル
  // &[data-refs-self*='"@page']>.flex.flex-row.pr-2 .bullet-container .bullet:before {
  //     content: "\eaa4" !important;
  //     color: red;
  // }

  //設定に合わせて生成するCSS

  //12個複製する
  let tagsListFull: string[] = [];
  for (let i = 1; i < 13; i++) {
    //二桁にしたい
    const count = ("0" + i).slice(-2);
    const { outCSS, outTagsList } = eachCreateCSS(count);
    tagsListFull = tagsListFull.concat(outTagsList);
    printCSS += outCSS;
  }

  if (printCSS !== "" && tagsListFull.length > 0) {
    //動的CSS
    logseq.provideStyle({
      key: 'bullet-point-custom-icon', style: `
    div#root>div>main>div#app-container {
      ${logseq.settings!.booleanAtMarkTagHidden === true ? `
      /*Optional: hide tags with @*/
      & a.tag[data-ref*="@"] {
          display: none;
      }
  `: ""}
      & div.ls-block {
          &:is(${[...new Set(tagsListFull)].map((tag) => `${logseq.settings!.booleanHierarchyParentTag === false ? `:not([data-refs-self*='${tag}/' i])` : ""}[data-refs-self*='"${tag}"' i]`).join(",")}) {
            ${logseq.settings!.booleanIconLarge === "large" ?
          "&>.flex.flex-row.pr-2 .bullet-container .bullet:before {font-size: 1.2em;}"
          : logseq.settings!.booleanIconLarge === "x-large" ? "&>.flex.flex-row.pr-2 .bullet-container .bullet:before {font-size: 1.5em;}"
            : ""}  
            ${CSS}
          }
      }
    }
    `
        + "\ndiv#root>div>main>div#app-container div.ls-block {\n" + printCSS + "\n}\n"
    });
  } else {
    //固定CSS
    if (logseq.settings!.booleanAtMarkTagHidden === true) logseq.provideStyle({
      key: 'bullet-point-custom-icon', style: `
    div#root>div>main>div#app-container {
      /*Optional: hide tags with @*/
      & a.tag[data-ref*="@"] {
          display: none;
      }
    }
    ` });
  }

};


const eachCreateCSS = (count: string) => {
  let outCSS = "";
  //各行が空でないこと
  const outTagsList: string[] = (logseq.settings![`tagsList${count}`].includes("\n") ? logseq.settings![`tagsList${count}`].split("\n") : [logseq.settings![`tagsList${count}`]]).filter((tag) => tag !== "");
  if (logseq.settings![`icon${count}`] !== "" || outTagsList.length > 0) {
    outCSS = `&:is(${outTagsList.map((tag) => `${logseq.settings!.booleanHierarchyParentTag === false ? `:not([data-refs-self*='${tag}/' i])` : ""}[data-refs-self*='"${tag}"' i]`).join(",")})>.flex.flex-row.pr-2 .bullet-container .bullet:before {
        content: "${logseq.settings![`icon${count}`]}" !important;
        ${logseq.settings![`colorBoolean${count}`] === true ? `color: ${logseq.settings![`color${count}`]};` : ""}
      }
      `;
  }
  return { outCSS, outTagsList };
};


logseq.ready(main).catch(console.error);