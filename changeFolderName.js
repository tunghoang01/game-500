const rootFolder = "./";
const fs = require("fs");
const cheerio = require("cheerio");
const axios = require("axios");
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");

async function getNameOfItem(item, file) {
  console.log("item  -->", item);
  console.log("file  -->", file);

  const { page, index } = item;
  let url = `https://codecanyon.net/category/html5/games?page=${page}`;

  if (page == 1) {
    url = `https://codecanyon.net/category/html5/games?sort=sales`;
  }

  const pageHTML = await axios.get(url);

  const $ = cheerio.load(pageHTML.data);

  $(".shared-item_cards-item_name_component__itemNameLink").each(
    (i, element) => {
      // console.log(i, "-----", $(element).contents().first().text());
      // return;
      if (i == index) {
        const nameOfGame = $(element).contents().first().text();
        const new1 = nameOfGame.replace(/[^a-zA-Z0-9 ]/g, "");
        const currPath = `./${file}`;
        const newPath = `./${new1}`;
        console.log("new name ---> ", newPath);
        fs.rename(currPath, newPath, function (err) {
          if (err) {
            console.log("err  -> ", err);
          } else {
            $(".shared-item_cards-preview_image_component__imageLink").each(
              (j, elm) => {
                if (j == index) {
                  const imgLink = $(elm).find("img").attr("src");
                  const name = uniqueNamesGenerator({
                    dictionaries: [adjectives, colors, animals],
                  });

                  var obj = {
                    name: `${new1}`,
                    version: "1.0.0",
                    hash: "335d3df52df4852c962277ca563e4a7cb67f450a31f9b3fe80543f262bf3f71c",
                    pubKey:
                      "927c8f340255d5a2d7b839ce4859f7dc33c64e5967fe40dde023c0751a53dff3925eec1eaaeb60f83c203c85e9c5b223",
                    sign: "a72c0b66b936b36525fdc1f07c94266a8280abd6acb04d1d87477d8ea790c98593084649f5be7fb7653c8ffcc34dd3e5067b2ffac7feaa85e5e574c972b7363dc0ac7df937c82cdce2ccae7cf6c2df265a3e8c9188cda23d872da08a0e2fa5a4",
                    logo: imgLink,
                    urlLauchScreen: "",
                    urlLoadingScreen: "",
                    urlZip: "",
                    id: `com.${new1}.ibe`,
                    orientation: "landscape",
                    author: name,
                    full_screen: {
                      status_bar: true,
                    },
                  };

                  var json = JSON.stringify(obj);

                  fs.writeFile(
                    `./json/${newPath}.json`,
                    json,
                    "utf-8",
                    function (err) {
                      if (err) {
                        console.log("err addfile json -->", err);
                        return;
                      }
                      console.log("--- completeed ---");
                    }
                  );
                }
              }
            );
          }
        });
      }
    }
  );
}
function copyFile(file) {
  fs.copyFile("./style.css", `./${file}/style.css`, (err) => {
    if (err) {
      console.log("Error Found:", err);
    } else {
      console.log("copy file success");
    }
  });
}
fs.readdirSync(rootFolder).forEach((file, i) => {
  if (file.includes("game-40-")) {
    const indexOfMinus1 = file.split("-", 1).join("-").length;
    const indexOfMinus2 = file.split("-", 2).join("-").length;
    const indexOfMinus3 = file.split("-", 3).join("-").length;
    const pageNumber = file.slice(indexOfMinus1 + 1, indexOfMinus2);
    const itemIndex = file.slice(indexOfMinus2 + 1, indexOfMinus3);
    const item = { page: pageNumber, index: itemIndex };
    getNameOfItem(item, file);
  }
});
