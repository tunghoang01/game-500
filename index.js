const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const folderName = "game";

async function main(page) {
  let url = `https://codecanyon.net/category/html5/games?page=${page}`;

  if (page == 1) {
    url = `https://codecanyon.net/category/html5/games?sort=sales`;
  }

  const pageHTML = await axios.get(url);

  const $ = cheerio.load(pageHTML.data);

  $(".shared-item_cards-list-image_card_component__itemLinkOverlay").each((index, element) => {
    getPreviewPage($, index, element, page);
  });
}

async function getPreviewPage($, indexElm, element, page) {
  console.log("log game");

  const paginationURL = $(element).attr("href");

  const contentPageHTML = await axios.get(paginationURL);

  const $$ = cheerio.load(contentPageHTML.data);

  const imgLink = $$(".item-preview").find("a").find("img").attr("src");

  $$("a.btn-icon.live-preview").each((i, element) => {
    createFolder(element, $$, indexElm, page, imgLink);
  });
}

async function createFolder(element, $$, indexElm, page, imgLink) {
  const pathFolder = `./${folderName}-${page}-${indexElm}`;
  try {
    if (!fs.existsSync(pathFolder)) {
      await fs.mkdirSync(pathFolder);
      getIframe(element, $$, indexElm, page, pathFolder);
      downloadImage(imgLink, pathFolder);
    }
  } catch (err) {
    console.error(err);
  }
}

const getIframe = async (element, $$, indexElm, page, pathFolder) => {
  try {
    const iframeURL = $$(element).attr("href");

    const contentIframe = await axios.get(`https://codecanyon.net${iframeURL}`);

    const $$$ = cheerio.load(contentIframe.data);

    $$$("iframe").each((i, e) => {
      const child = $$$(e).attr("src");

      console.log("child ---->", child);

      createIndexHtml(indexElm, child, page, pathFolder);
    });
  } catch (error) {
    console.log("🚀 ~ file: index.js ~ line 51 ~ getIframe ~ error", error);
  }
};

const downloadImage = (url, pathFolder) =>
  axios({
    url,
    responseType: "stream",
  }).then(
    (response) =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(`${pathFolder}/logo.png`))
          .on("finish", () => resolve())
          .on("error", (e) => reject(e));
      })
  );

function createIndexHtml(indexElm, iframe, page, pathFolder) {
  fs.writeFile(
    `${pathFolder}/index.html`,
    `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>

    <link rel="stylesheet" href="../style.css">
</head>

<body>
 <div class="loading">
        <div class="loading-text">
            <span class="loading-text-words">L</span>
            <span class="loading-text-words">O</span>
            <span class="loading-text-words">A</span>
            <span class="loading-text-words">D</span>
            <span class="loading-text-words">I</span>
            <span class="loading-text-words">N</span>
            <span class="loading-text-words">G</span>
        </div>
    </div>
    
    <iframe src="${iframe}" frameborder="0" height="100%" width="100%" ></iframe>
     <script>

            let loading = document.querySelector(".loading");
            setTimeout(() => {
                loading.remove();
            }, 5000);
        </script>
</body>


</html>
    `,
    function (err) {
      if (err) throw err;

      console.log("success");
    }
  );
}

for (let index = 56; index < 58; index++) {
  main(index);
}
