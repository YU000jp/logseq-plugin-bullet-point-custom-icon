import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { settingsTemplate, settingChanged } from './settings';
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json";
import CSS from './bullet.css?inline';
import { tableIconNonUnicode, tablerIconGetUnicode } from './lib';
import { copyEvent } from './lib';
export const keyNameToolbarPopup = "toolbar-box";//ポップアップのキー名

/* main */
const main = () => {
  (async () => {
    try {
      await l10nSetup({ builtinTranslations: { ja } });
    } finally {
      /* user settings */
      logseq.useSettingsSchema(await settingsTemplate());
      if (!logseq.settings) setTimeout(() => logseq.showSettingsUI(), 300);
    }
  })();

  //初回読み込み時にCSSを反映させる
  /* side block */
  provideStyle();

  //常時適用CSS
  //プラグイン設定の見た目を整える
  logseq.provideStyle(`
  body>div {
    &#root>div>main {
      & article>div[data-id="logseq-plugin-bullet-point-custom-icon"] {
        & div.heading-item {
          margin-top: 3em;
          border-top-width: 1px;
          padding-top: 1em;
        }
  
        & label.form-control {
          &>input[type="text"].form-input {
            width: 65px;
            font-size: 1.3em;
          }
  
          &>textarea.form-input {
            width: 420px;
            height: 4em;
          }
        }
  
        & div.desc-item {
          & p {
            margin-top: 0.5em;
            margin-bottom: 0.5em;
          }
        }
        & div.desc-item[data-key^="icon"] label input.form-input {
            font-family: 'tabler-icons';
        }
      }
    }
  
    &#logseq-plugin-bullet-point-custom-icon--toolbar-box {
      & h1 {
        font-size: 1.5em;
      }
  
      & button {
        display: unset;
      }
  
      & hr {
        margin-top: 1em;
        margin-bottom: 1em;
      }
  
      & span.tabler-icon {
        font-family: 'tabler-icons';
        font-size: 1.5em;
        margin-left: 0.7em;
      }
    }
  }
  `);

  let settingsCSS = ''
  for (let i = 1; i <= 12; i++) {
    const count = ('0' + i).slice(-2)

    settingsCSS += `
      div[data-key="icon${count}"],
      div[data-key="colorBoolean${count}"],
      div[data-key="color${count}"],
      div[data-key="tagsList${count}"] {
        display: inline-block;
      }

      div[data-key="icon${count}"],
      div[data-key="colorBoolean${count}"],
      div[data-key="color${count}"],
      div[data-key="tagsList${count}"] {
        vertical-align: middle;
        padding: 10px 0px 10px 0px !important;
      }

      div[data-key="icon${count}"] > h2,
      div[data-key="colorBoolean${count}"] > h2,
      div[data-key="color${count}"] > h2,
      div[data-key="tagsList${count}"] > h2 {
          display: none !important;
      }
    `
  }
  logseq.provideStyle(settingsCSS)


  //ツールバーに設定画面を開くボタンを追加
  logseq.App.registerUIItem('toolbar', {
    key: 'customBulletIconToolbar',
    template: `<div id="customBulletIconSettingsButton" data-rect><a class="button icon" data-on-click="customBulletIconToolbar" style="font-size:15px;color:#1f9ee1;opacity:unset" title="Bullet Point Custom Icon: ${t("plugin settings")}">#️⃣</a></div>`,
  });
  //ツールバーボタンのクリックイベント
  logseq.provideModel({
    customBulletIconToolbar: () => openPopupFromToolbar(),
    showSettingsUI: () => logseq.showSettingsUI(),
  });

  //Setting changed
  settingChanged();

};/* end_main */


export const provideStyle = () => {
  if (logseq.settings!.booleanFunction === false) return;

  let printCSS = "";
  let settingsCSS = "";

  //サンプル
  // &[data-refs-self*='"@page']>.flex.flex-row.pr-2 .bullet-container .bullet:before {
  //     content: "\eaa4" !important;
  //     color: red;
  // }

  //設定に合わせて生成するCSS

  //12個複製する
  let tagsListFull: string[] = [];
  for (let i = 1; i <= 12; i++) {
    const count = ("0" + i).slice(-2);
    const { outCSS, outTagsList } = eachCreateCSS(count);
    tagsListFull = tagsListFull.concat(outTagsList);
    printCSS += outCSS;

    settingsCSS += eachCreateSettingCSS(count);
  }

  if (printCSS !== "" && tagsListFull.length > 0) {
    //動的CSS
    logseq.provideStyle({
      key: 'bullet-point-custom-icon', style: `
    ${settingsCSS}
    body>div#root>div>main>div#app-container {
      ${logseq.settings!.booleanAtMarkTagHidden === true ? `
      /*Optional: hide tags with @*/
      & a.tag[data-ref*="@"] {
          display: none;
      }
  `: ""}
      & div.ls-block {
          &:is(${[...new Set(tagsListFull)].map((tag) => `${logseq.settings!.booleanHierarchyParentTag === false ? `:not([data-refs-self*='${tag}/' i])` : ""}[data-refs-self*='"${tag}"' i]`).join(",")}) {
            ${logseq.settings!.booleanIconLarge === "medium" ?
          "&>.flex.flex-row.pr-2 .bullet-container .bullet:before {font-size: 1.2em;top: -10px!important;left: -7px!important;}"
          : logseq.settings!.booleanIconLarge === "large" ? "&>.flex.flex-row.pr-2 .bullet-container .bullet:before {font-size: 1.5em;top:-13px!important;left:-8.5px!important;}"
            : ""}  
            ${CSS}
          }
          ${printCSS}
      }
    }
    `
    });
  } else {
    //固定CSSのみ
    if (logseq.settings!.booleanAtMarkTagHidden === true) logseq.provideStyle({
      key: 'bullet-point-custom-icon', style: `
    body>div#root>div>main>div#app-container {
      /*Optional: hide tags with @*/
      & a.tag[data-ref*="@"] {
          display: none;
      }
    }
    ` });
  }
};


const eachCreateSettingCSS = (count: string) => {
  return `
    div[data-key="icon${count}"]:has(+ div[data-key="colorBoolean${count}"] > label > input[type="checkbox"]:checked) > label {
      color: ${logseq.settings![`color${count}`]};
    }
  `
}

const eachCreateCSS = (count: string, iconOff?: boolean) => {
  let outCSS = "";
  //各行が空でないこと
  const outTagsList: string[] = (logseq.settings![`tagsList${count}`].includes("\n") ? logseq.settings![`tagsList${count}`].split("\n") : [logseq.settings![`tagsList${count}`]]).filter((tag) => tag !== "");
  if ((iconOff === false && logseq.settings![`icon${count}`] !== "") || outTagsList.length > 0) {
    outCSS += `&:is(${outTagsList.map((tag) => `${logseq.settings!.booleanHierarchyParentTag === false ? `:not([data-refs-self*='${tag}/' i])` : ""}[data-refs-self*='"${tag}"' i]`).join(",")})>.flex.flex-row.pr-2 .bullet-container .bullet:before {
        content: "${tableIconNonUnicode(count)}" !important;
        ${logseq.settings![`colorBoolean${count}`] === true ? `color: ${logseq.settings![`color${count}`]};` : ""}
      }
      `;
  }
  return { outCSS, outTagsList };
};


export const openPopupSettingsChanged = () => openPopupFromToolbar();

const openPopupFromToolbar = () => {
  let printCurrentSettings = "";
  //現在の設定を表示
  for (let i = 1; i < 13; i++) {
    //二桁にしたい
    const count = ("0" + i).slice(-2);
    const { outCSS, outTagsList } = eachCreateCSS(count, true);
    if (outTagsList.length > 0) {
      //タグを一つずつ表示し、<button>でクリックするとそのタグをコピーする。,で区切る
      const tagsList = outTagsList.map((tag) => `<button class="button" id="customBulletIconToolbar--${count}${tag}" title="${t("Click here to insert a tag at the end of the current block.")}">#${tag}</button>`);

      const icon = tablerIconGetUnicode(count);
      printCurrentSettings += `
          <div><small>${t("Icon")} ${count}:</small><span class="tabler-icon"${logseq.settings![`colorBoolean${count}`] === true ? ` style="color:${logseq.settings![`color${count}`]}"` : ""}>${icon}</span>
          <span style="display:unset">${tagsList}</span></div>
          <hr/>
          `;
      //outTagsListに${count}を付けて、タグを一つずつ表示し、<button>でクリックするとそのタグをコピーする。,で区切る
      outTagsList.forEach((tag) => {
        setTimeout(() => {
          const copyTag = parent.document.getElementById(`customBulletIconToolbar--${count}${tag}`) as HTMLButtonElement | null;
          if (copyTag) copyTag.addEventListener("click", () => copyEvent(tag));
        }, 120);
      });
    }
  }

  //ポップアップを表示
  logseq.provideUI({
    attrs: {
      title: "Bullet Point Custom Icon plugin",
    },
    key: keyNameToolbarPopup,
    reset: true,
    style: {
      width: "370px",
      minHeight: "500px",
      maxHeight: "94vh",
      overflowY: "auto",
      left: "unset",
      bottom: "unset",
      right: "1em",
      top: "4em",
      paddingLeft: "2em",
      paddingTop: "2em",
      backgroundColor: 'var(--ls-primary-background-color)',
      color: 'var(--ls-primary-text-color)',
      boxShadow: '1px 2px 5px var(--ls-secondary-background-color)',
    },
    template: `
        <div title="">
        <div>
        <h1>${t("Current settings")} <button class="button" id="bullet-point-custom-icon--showSettingsUI" title="Bullet Point Custom Icon: ${t("plugin settings")}">⚙️</button></h1>
        <p>${t("Select a block first, then click the tag name to insert that tag.")}</p>
        <hr/>
        ${printCurrentSettings}
        </div>
        </div>
        `,
  });
  setTimeout(() => {
    //設定画面を開くボタンをクリックしたら、設定画面を開く
    const showSettingsUI = parent.document.getElementById("bullet-point-custom-icon--showSettingsUI") as HTMLButtonElement | null;
    if (showSettingsUI) showSettingsUI.addEventListener("click", () => logseq.showSettingsUI(), { once: true });
  }, 50);
};


logseq.ready(main).catch(console.error);
