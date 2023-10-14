import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { settingsTemplate, settingChanged } from './settings';
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json";
import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user';
import CSS from './style.css?inline';
import { tableIconNonUnicode, tablerIconGetUnicode } from './lib';
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
  article>div[data-id="bullet-point-custom-icon"] {
    & div.heading-item {
      margin-top: 3em;
      border-top-width: 1px;
      padding-top: 1em;
    }
    & label.form-control {
      &>input[type="text"].form-input {
        width: 100px;
        font-size: 1.3em;
      }
      &>textarea.form-input {
        width: 350px;
        height: 9em;
      }
    }
  }
  `);


  //ツールバーに設定画面を開くボタンを追加
  logseq.App.registerUIItem('toolbar', {
    key: 'customBulletIconToolbar',
    template: `<div id="customBulletIconSettingsButton" data-rect><a class="button icon" data-on-click="customBulletIconToolbar" style="font-size: 15px;color:#1f9ee1" title="Bullet Point Custom Icon: plugin settings">#️⃣</a></div>`,
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
            ${logseq.settings!.booleanIconLarge === "medium" ?
          "&>.flex.flex-row.pr-2 .bullet-container .bullet:before {font-size: 1.2em;top: -10px!important;left: -7px!important;}"
          : logseq.settings!.booleanIconLarge === "large" ? "&>.flex.flex-row.pr-2 .bullet-container .bullet:before {font-size: 1.5em;top:-13px!important;left:-8.5px!important;}"
            : ""}  
            ${CSS}
          }
      }
    }
    `
        + "\ndiv#root>div>main>div#app-container div.ls-block {\n" + printCSS + "\n}\n"
    });
  } else {
    //固定CSSのみ
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
        content: "${tableIconNonUnicode(count)}" !important;
        ${logseq.settings![`colorBoolean${count}`] === true ? `color: ${logseq.settings![`color${count}`]};` : ""}
      }
      `;
  }
  return { outCSS, outTagsList };
};


const copyEvent = async (tag: string) => {
  //現在のブロックを取得
  const currentBlock = await logseq.Editor.getCurrentBlock() as BlockEntity | null;
  if (currentBlock) {
    const ele = parent.document.querySelector(`div#root>div>main>div#app-container div[blockid="${currentBlock.uuid}"]`) as HTMLDivElement | null;
    if (ele) {
      ele.style.outline = "3px solid var(--ls-border-color)";
      setTimeout(() => ele.style.outline = "unset", 6000);
    }
    //現在のブロックの最後にタグを追加
    //tagに空白が含まれていたら、[[ ]]で囲む
    if (tag.includes(" ")) tag = "[[" + tag + "]]";
    await logseq.Editor.updateBlock(currentBlock.uuid, currentBlock.content + " #" + tag, currentBlock.properties);
    logseq.UI.showMsg("Insert at editing block: #" + tag + ".", "info");
    logseq.Editor.editBlock(currentBlock.uuid);
  } else {
    //ブロックが選択されていない場合
    logseq.UI.showMsg("No block selected.", "warning");
  }
};

export const openPopupSettingsChanged = () => {
  openPopupFromToolbar();
};

const openPopupFromToolbar = () => {
  let printCurrentSettings = `
      <div>
      <h1>${t("Current settings")} <button class="button" id="bullet-point-custom-icon--showSettingsUI">⚙️</button></h1>
      <p>${t("Select a block first, then click the tag name to insert that tag.")}</p>
      <hr/>
      `;
  //現在の設定を表示
  for (let i = 1; i < 13; i++) {
    //二桁にしたい
    const count = ("0" + i).slice(-2);
    const { outCSS, outTagsList } = eachCreateCSS(count);
    if (outTagsList.length > 0) {
      //タグを一つずつ表示し、<button>でクリックするとそのタグをコピーする。,で区切る
      const tagsList = outTagsList.map((tag) => `<button class="button" id="customBulletIconToolbar--${count}${tag}" title="${t("Click here to insert a tag at the end of the current block.")}">#${tag}</button>`) || "(none)";

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
  printCurrentSettings += "</div>";

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
        ${printCurrentSettings}
        </div>
        <style>
        body>div#bullet-point-custom-icon--toolbar-box {
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
        </style>
        `,
  });
  setTimeout(() => {
    //設定画面を開くボタンをクリックしたら、設定画面を開く
    const showSettingsUI = parent.document.getElementById("bullet-point-custom-icon--showSettingsUI") as HTMLButtonElement | null;
    if (showSettingsUI) showSettingsUI.addEventListener("click", () => logseq.showSettingsUI(), { once: true });
  }, 50);
};


logseq.ready(main).catch(console.error);