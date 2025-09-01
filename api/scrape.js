import puppeteer from "puppeteer";

export default async function handler(req, res) {
  const { shop, query } = req.query;

  let url;
  if (shop === "willys") {
    url = `https://www.willys.se/sok?q=${encodeURIComponent(query)}`;
  } else if (shop === "coop") {
    url = `https://www.coop.se/handla/sok?q=${encodeURIComponent(query)}`;
  } else {
    return res.status(400).json({ error: "Unknown shop" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    let results;
    if (shop === "willys") {
      results = await page.evaluate(() =>
        Array.from(document.querySelectorAll(".product-item")).map(el => ({
          name: el.querySelector(".product-name")?.innerText.trim(),
          price: el.querySelector(".price")?.innerText.trim(),
        }))
      );
    } else if (shop === "coop") {
      results = await page.evaluate(() =>
        Array.from(document.querySelectorAll(".product-tile")).map(el => ({
          name: el.querySelector(".name")?.innerText.trim(),
          price: el.querySelector(".price")?.innerText.trim(),
        }))
      );
    }

    await browser.close();
    res.status(200).json({ shop, query, results });
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
}
