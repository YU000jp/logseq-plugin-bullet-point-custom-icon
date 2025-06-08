import '@logseq/libs' //https://plugins-doc.logseq.com/
import { settingsTemplate, settingChanged } from './settings'
import { setup as l10nSetup, t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json"
import CSS from './bullet.css?inline'
import { tableIconNonUnicode, tablerIconGetUnicode } from './lib'
import { copyEvent } from './lib'
import { AppInfo } from '@logseq/libs/dist/LSPlugin.user'
export const keyNameToolbarPopup = "toolbar-box"//ポップアップのキー名
let logseqVersion: string = "" //バージョンチェック用
let logseqVersionMd: boolean = false //バージョンチェック用
let logseqDbGraph: boolean = false
// export const getLogseqVersion = () => logseqVersion //バージョンチェック用
export const booleanLogseqVersionMd = () => logseqVersionMd //バージョンチェック用
export const booleanDbGraph = () => logseqDbGraph //バージョンチェック用

/* main */
const main = async (notFirst?: boolean) => {

  // バージョンチェック
  if (notFirst !== true)
    logseqVersionMd = await checkLogseqVersion()
  // console.log("logseq version: ", logseqVersion)
  // console.log("logseq version is MD model: ", logseqVersionMd)
  // 100ms待つ
  await new Promise(resolve => setTimeout(resolve, 100))

  // if (logseqVersionMd === false) {
  //   // Logseq ver 0.10.*以下にしか対応していない
  //   logseq.UI.showMsg("The ’Bullet Point Custom Icon’ plugin only supports Logseq ver 0.10.* and below.", "warning", { timeout: 5000 })
  //   return
  // }
  // // DBグラフチェック
  logseqDbGraph = await checkLogseqDbGraph()
  if (logseqDbGraph === true) {
    // DBグラフには対応していない
    logseq.UI.showMsg("The ’Bullet Point Custom Icon’ plugin not supports Logseq DB graph.", "warning", { timeout: 5000 })
    return
  }

  await l10nSetup({ builtinTranslations: { ja } })

  /* user settings */
  logseq.useSettingsSchema(await settingsTemplate())
  if (!logseq.settings) setTimeout(() => logseq.showSettingsUI(), 300)


  //初回読み込み時にCSSを反映させる
  /* side block */
  provideStyle()


  let settingsCSS = ''
  for (let i = 1; i <= 12; i++) {
    const count = ('0' + i).slice(-2)

    settingsCSS += `
      & div[data-key="colorBoolean${count}"],
      & div[data-key="color${count}"],
      & div[data-key="tagsList${count}"] {
        float: left;
      }

      & div[data-key="icon${count}"] {
        clear: left;
        float: left;
      }

      & div[data-key="icon${count}"],
      & div[data-key="colorBoolean${count}"],
      & div[data-key="color${count}"] {
        vertical-align: middle;
        padding: 10px 0px 10px 0px !important;
      }
      & div[data-key="tagsList${count}"] {
        vertical-align: middle;
        padding: 5px 0px 5px 0px !important;
      }

      & div[data-key="icon${count}"] > h2,
      & div[data-key="colorBoolean${count}"] > h2,
      & div[data-key="color${count}"] > h2,
      & div[data-key="tagsList${count}"] > h2 {
          display: none !important;
      }
    `
  }

  //常時適用CSS
  //プラグイン設定の見た目を整える
  logseq.provideStyle(`
  body>div {
    &#root>div>main article>div[data-id="logseq-plugin-bullet-point-custom-icon"] {
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

      ${settingsCSS}

      & div[data-key="headingTablerIconCopy"] {
        clear: left;
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
  `)


  //ツールバーに設定画面を開くボタンを追加
  logseq.App.registerUIItem('toolbar', {
    key: 'customBulletIconToolbar',
    template: `<div id="customBulletIconSettingsButton" data-rect><a class="button icon" data-on-click="customBulletIconToolbar" style="font-size:15px;color:#1f9ee1;opacity:unset" title="Bullet Point Custom Icon: ${t("plugin settings")}">#️⃣</a></div>`,
  })
  //ツールバーボタンのクリックイベント
  logseq.provideModel({
    customBulletIconToolbar: () => openPopupFromToolbar(),
    showSettingsUI: () => logseq.showSettingsUI(),
  })

  //Setting changed
  settingChanged()


  if (notFirst !== true)
    logseq.App.onCurrentGraphChanged(async () => {
      logseqDbGraph = await checkLogseqDbGraph()
      if (logseqDbGraph === false) main(true)
    })
}/* end_main */


export const provideStyle = () => {
  if (logseq.settings!.booleanFunction === false) return

  let printCSS = ""
  let settingsCSS = ""

  //サンプル
  // &[data-refs-self*='"@page']>.flex.flex-row.pr-2 .bullet-container .bullet:before {
  //     content: "\eaa4" !important;
  //     color: red;
  // }

  //設定に合わせて生成するCSS

  //12個複製する
  let tagsListFull: string[] = []
  for (let i = 1; i <= 12; i++) {
    const count = ("0" + i).slice(-2)
    const { outCSS, outTagsList } = eachCreateCSS(count)
    tagsListFull = tagsListFull.concat(outTagsList)
    printCSS += outCSS

    settingsCSS += eachCreateSettingCSS(count)
  }

  if (printCSS !== "" && tagsListFull.length > 0) {
    const style = `
    ${settingsCSS}
    body>#root>div>main>#app-container {
      ${logseq.settings!.booleanAtMarkTagHidden === true ? `
        /* Optional: hide tags with @ */
        & a.tag[data-ref*="@"] {
            display: none;
        }
       `: ""}
        & div.ls-block {

            ${logseqVersionMd === true ? (`
            &:is(${[...new Set(tagsListFull)].map((tag) => `${logseq.settings!.booleanHierarchyParentTag === false ? `:not([data-refs-self*='${tag}/' i])` : ""}[data-refs-self*='"${tag}"' i]`).join(",\n            ")}) {
              ${logseq.settings!.booleanIconLarge === "medium" ?
          "&>.flex.flex-row.pr-2 .bullet-container .bullet:before {font-size: 1.2em;top: -10px!important;left: -7px!important;}"
          : logseq.settings!.booleanIconLarge === "large" ?
            "&>.flex.flex-row.pr-2 .bullet-container .bullet:before {font-size: 1.5em;top:-13px!important;left:-8.5px!important;}"
            : ""}
            }  
              ${CSS}
            }`) : // DBモデル
        (`${[...new Set(tagsListFull)].map((tag) => `&:has(>div.block-main-container>div.block-control-wrap+div>div.block-main-content>div>div.block-content-or-editor-wrap>div.block-content-or-editor-inner>div>div.block-content-wrapper>div.block-content>div.block-content-inner>div.block-head-wrap>div>span.block-title-wrap>span>span.preview-ref-link>a[data-ref='${tag}' i])`).join(",\n            ")} {
                  &>div>div.block-control-wrap {
                      &:has(span.bullet-closed)>a.block-control>span.control-hide {
                          display: unset;
                      }
                      &>a.bullet-link-wrap>span.bullet-container {
                          &>span.bullet:before {
                              ${logseq.settings!.booleanIconLarge === "medium" ? "font-size: 1.2em;" : "font-size: 1.5em;"};
                              font-family: 'tabler-icons';
                              position: relative;
                              top: -9px;
                              left: -7.8px;
                          }
                          &.bullet-closed {
                              opacity: 0.5;
                              font-size: 0.5em;
                          }
                      }
                  }
            }`)}
${printCSS}
        }
    }
    `
    //動的CSS
    logseq.provideStyle({
      key: 'bullet-point-custom-icon', style
    })

    // console.log(style)

  } else
    if (logseq.settings!.booleanAtMarkTagHidden === true) //固定CSSのみ
      logseq.provideStyle({
        key: 'bullet-point-custom-icon', style: `
    body>#root>div>main>#app-container {
        /*Optional: hide tags with @*/
        & a.tag[data-ref*="@"] {
            display: none;
        }
    }
    ` })
}


const eachCreateSettingCSS = (count: string) => `
    div[data-key="icon${count}"]:has(+ div[data-key="colorBoolean${count}"] > label > input[type="checkbox"]:checked) > label {
        color: ${logseq.settings![`color${count}`]};
    }
  `

const eachCreateCSS = (count: string, iconOff?: boolean) => {
  let outCSS = ""
  //各行が空でないこと
  const settingsTagsList = logseq.settings![`tagsList${count}`] as string
  const outTagsList: string[] = (settingsTagsList.includes("\n") ?
    settingsTagsList.split("\n")
    : [settingsTagsList]).filter((tag) => tag !== "")
  if ((iconOff === false && logseq.settings![`icon${count}`] !== "") || outTagsList.length > 0) {
    outCSS += logseqVersionMd === true ?
      `
      &:is(${outTagsList.map((tag) => `${logseq.settings!.booleanHierarchyParentTag === false ?
        `:not([data-refs-self*='${tag}/' i])`
        : ""}[data-refs-self*='"${tag}"' i]`).join(",")})>.flex.flex-row.pr-2 .bullet-container .bullet:before {
        content: "${tableIconNonUnicode(count)}" !important;
        ${logseq.settings![`colorBoolean${count}`] === true ?
        `color: ${logseq.settings![`color${count}`]};`
        : ""}
      }
      ` : // DBモデル
      `${outTagsList.map((tag) => `
            &:has(>div.block-main-container>div.block-control-wrap+div>div.block-main-content>div>div.block-content-or-editor-wrap>div.block-content-or-editor-inner>div>div.block-content-wrapper>div.block-content>div.block-content-inner>div.block-head-wrap>div>span.block-title-wrap>span>span.preview-ref-link>a[data-ref='${tag}' i])`).join("        ,\n")} {
                &>div>div.block-control-wrap>a.bullet-link-wrap>span.bullet-container>span.bullet:before {
                    content: "${tableIconNonUnicode(count)}" !important;
                    ${logseq.settings![`colorBoolean${count}`] === true ? `color: ${logseq.settings![`color${count}`]};` : ""}
                }
            }
      `
  }
  return { outCSS, outTagsList }
}


export const openPopupSettingsChanged = () => openPopupFromToolbar()

const openPopupFromToolbar = () => {
  let printCurrentSettings = ""
  //現在の設定を表示
  for (let i = 1; i < 13; i++) {
    //二桁にしたい
    const count = ("0" + i).slice(-2)
    const { outCSS, outTagsList } = eachCreateCSS(count, true)
    if (outTagsList.length > 0) {
      //タグを一つずつ表示し、<button>でクリックするとそのタグをコピーする。,で区切る
      const tagsList = outTagsList.map((tag) => `<button class="button" id="customBulletIconToolbar--${count}${tag}" title="${t("Click here to insert a tag at the end of the current block.")}">#${tag}</button>`)

      const icon = tablerIconGetUnicode(count)
      printCurrentSettings += `
          <div><small>${t("Icon")} ${count}:</small><span class="tabler-icon"${logseq.settings![`colorBoolean${count}`] === true ? ` style="color:${logseq.settings![`color${count}`]}"` : ""}>${icon}</span>
          <span style="display:unset">${tagsList}</span></div>
          <hr/>
          `
      //outTagsListに${count}を付けて、タグを一つずつ表示し、<button>でクリックするとそのタグをコピーする。,で区切る
      outTagsList.forEach((tag) => {
        setTimeout(() => {
          const copyTag = parent.document.getElementById(`customBulletIconToolbar--${count}${tag}`) as HTMLButtonElement | null
          if (copyTag) copyTag.addEventListener("click", () => copyEvent(tag))
        }, 120)
      })
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
  })
  setTimeout(() => {
    //設定画面を開くボタンをクリックしたら、設定画面を開く
    const showSettingsUI = parent.document.getElementById("bullet-point-custom-icon--showSettingsUI") as HTMLButtonElement | null
    if (showSettingsUI) showSettingsUI.addEventListener("click", () => logseq.showSettingsUI())
  }, 50)
}


// MDモデルかどうかのチェック DBモデルはfalse
const checkLogseqVersion = async (): Promise<boolean> => {
  const logseqInfo = (await logseq.App.getInfo("version")) as AppInfo | any
  //  0.11.0もしくは0.11.0-alpha+nightly.20250427のような形式なので、先頭の3つの数値(1桁、2桁、2桁)を正規表現で取得する
  const version = logseqInfo.match(/(\d+)\.(\d+)\.(\d+)/)
  if (version) {
    logseqVersion = version[0] //バージョンを取得
    // console.log("logseq version: ", logseqVersion)

    // もし バージョンが0.10.*系やそれ以下ならば、logseqVersionMdをtrueにする
    if (logseqVersion.match(/0\.([0-9]|10)\.\d+/)) {
      logseqVersionMd = true
      // console.log("logseq version is 0.10.* or lower")
      return true
    } else logseqVersionMd = false
  } else logseqVersion = "0.0.0"
  return false
}
// DBグラフかどうかのチェック
const checkLogseqDbGraph = async (): Promise<boolean> => await (logseq.App as any).checkCurrentIsDbGraph() as boolean | false || false

logseq.ready(main).catch(console.error)
