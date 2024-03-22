const express = require("express");
const app = express();
const fetch = require("node-fetch").default;
const puppeteer = require("puppeteer");
if (process.env.ENABLE_UI) {
  app.use(express.static('./ui/public'))
}

app.get("/api", async function (req, res) {
  res.redirect("https://github.com/aboutdavid/hctb-api")
})
app.post("/api/session", async function (req, res) {
  const { cookie, person, name, time } = req.query
  if (!cookie || !person || !name || !time) return res.json({ success: false, error: "Please provide all query object" }).status(400)
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
      legacyID: person,
      name: name,
      timeSpanId: time,
      wait: "false",
    }),
    method: "POST",
  })
    .then((resp) => resp.json())
    .then((json) => {
      var lat, lon
      if (json.d.includes("SetBusPushPin")) {
        var strip = /SetBusPushPin\(([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?,([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?\)/i.exec("SetBusPushPin(123.456,679.012)" + json.d)[0]
        var coords = /([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?,([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?/i.exec(strip)[0].split(",")
        lat = coords[0]
        lon = coords[1]
      }
      res.json({ success: true, ...value, lat: lat, lon: lon, cookie })
    });
})

app.post("/api/passengers", async function (req, res) {
  if (!req.query.user || !req.query.pass || !req.query.code)
    return res.json({
      success: false,
      error: "Please provide all credentials",
    }).status(400);
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
    page.waitForNavigation({ waitUntil: 'networkidle2' })
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
  if (!cookie.includes(".ASPXFORMSAUTH")) return res.json({ success: false, error: "Incorrect credentials" }).status(400)
  const passengers = await page.evaluate(() => {
    const selectElement = document.getElementById('ctl00_ctl00_cphWrapper_cphControlPanel_ddlSelectPassenger');
    const options = Array.from(selectElement.querySelectorAll('option'));
    return options.map(option => ({
      text: option.textContent,
      value: option.getAttribute('value')
    }));
  });
  res.json({
    success: true, cookie, passengers
  })


  await browser.close();
  console.log("[Info] Browser instance closed");

});

app.post("/api/login", async function (req, res) {
  if (!req.query.user || !req.query.pass || !req.query.code)
    return res.json({
      success: false,
      error: "Please provide all credentials",
    }).status(400);
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
    page.waitForNavigation({ waitUntil: 'networkidle2' })
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
  if (!cookie.includes(".ASPXFORMSAUTH")) return res.json({ success: false, error: "Incorrect credentials" }).status(400)
  const value = await page.$$eval('option[selected="selected"]', (el) => {
    return { name: el[1].innerHTML, person: el[1].value, time: el[2].value };
  });
  const times = await page.evaluate(() => {
    const selectElement = document.getElementById('ctl00_ctl00_cphWrapper_cphControlPanel_ddlSelectTimeOfDay');
    const optionElements = selectElement.querySelectorAll('option');

    return Array.from(optionElements).map((option, index) => {
      return {
        id: option.getAttribute('value'),
        selected: option.hasAttribute('selected'),
        time: option.textContent,
      };
    });
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
    .then((json) => {
      var lat, lon
      if (json.d.includes("SetBusPushPin")) {
        var strip = /SetBusPushPin\(([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?,([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?\)/i.exec("SetBusPushPin(123.456,679.012)" + json.d)[0]
        var coords = /([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?,([+-]?(?=\.\d|\d)(?:\d+)?(?:\.?\d*))(?:[eE]([+-]?\d+))?/i.exec(strip)[0].split(",")
        lat = coords[0]
        lon = coords[1]
      }
      res.json({ success: true, ...value, lat: lat, lon: lon, cookie, times })
    });

  await browser.close();
  console.log("[Info] Browser instance closed");

});
app.post("/api/reverse", function (request, response) {
  const { lat, lon } = request.query
  fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
      },
      method: "GET",
    }
  )
    .then((res) => res.json())
    .then((json) => response.json({ success: true, name: res.display_name }));
});


// listen for requests :)
const listener = app.listen(process.env.PORT || 8080, function () {
  console.log("[Info] HCTB-API is listening on port " + listener.address().port + " :)");
  if (process.env.ENABLE_UI) console.log("[Info] Web UI Enabled");
});