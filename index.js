const express = require("express");
const app = express();
const fetch = require("node-fetch");
const puppeteer = require("puppeteer");

app.get("/", async function (req, res) {
res.redirect("https://github.com/aboutdavid/hctb-api")
})
app.post("/login", async function (req, res) {
  if (!req.query.user || !req.query.pass || !req.query.code)
    return res.json({
      success: false,
      error: "Please provide all credentals",
    });
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  console.log("[Info] Browser instance started");

  const page = await browser.newPage();
  console.log("[Info] Opened a new page");

  await page.goto("https://login.herecomesthebus.com/Authenticate.aspx");
  await page.type(
    `input[name="ctl00$ctl00$cphWrapper$cphContent$tbxUserName"]`,
    req.query.user
  );
  await page.type(
    `input[name="ctl00$ctl00$cphWrapper$cphContent$tbxPassword"]`,
    req.query.pass
  );
  await page.type(
    `input[name="ctl00$ctl00$cphWrapper$cphContent$tbxAccountNumber"]`,
    req.query.code
  );
  await Promise.all([
    page.click(
      'input[name="ctl00$ctl00$cphWrapper$cphContent$btnAuthenticate"]'
    ),
    page.waitForNavigation({waitUntil: 'networkidle2'})
]);
  console.log("[Info] Logging in to Here Comes The Bus");
 
    const cookies = await page.cookies();
    var i = 0;
    var cookie = "";
    console.log("[Info] Parsing cookie");

    while (i < cookies.length) {
      cookie += `${cookies[i].name}=${cookies[i].value}; `;
      i++;
    }
    if (!cookie.includes(".ASPXFORMSAUTH")) return res.json({success: false, error: "Incorrect Credentals"})
    const value = await page.$$eval('option[selected="selected"]', (el) => {
      return { name: el[1].innerHTML, person: el[1].value, time: el[2].value };
    });


    fetch("https://login.herecomesthebus.com/Map.aspx/RefreshMap", {
    headers: {
      accept: "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en-US,en;q=0.9,ja;q=0.8",
      "content-type": "application/json; charset=UTF-8",
      "sec-ch-ua":
        '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
      cookie: cookie,
      Referer: "https://login.herecomesthebus.com/Map.aspx",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
    body: JSON.stringify({
      legacyID: value.person,
      name: value.name,
      timeSpanId: value.time,
      wait: "false",
    }),
    method: "POST",
  })
    .then((resp) => resp.json())
    .then((json) =>  {
        var lat, lon
        if (json.d.includes("SetBusPushPin")){
          var strip = /SetBusPushPin\(([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?,([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?\)/i.exec("SetBusPushPin(123.456,679.012)"+json.d)[0]
          var coords =  /([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?,([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?/i.exec(strip)[0].split(",")
          lat = coords[0]
          lon = coords[1]
        }
        res.json({ success: true, ...value, lat:lat, lon:lon })
    });

    await browser.close();
    console.log("[Info] Browser instance closed");
 
});



// listen for requests :)
const listener = app.listen(process.env.PORT || 8080, function () {
  console.log("HCTB-API is listening on port " + listener.address().port + " :)");
});