// api/prices.js
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const PROXY = "https://api.allorigins.win/raw?url="; // Free proxy for PoC

function extractNumber(text) {
  if (!text) return null;
  const cleaned = text.replace(/\s/g, "").replace(/kr|:-/gi, "");
  const m = cleaned.match(/[\d,.]+/);
  return m ? parseFloat(m[0].replace(",", ".")) : null;
}

async function fetchHtml(url) {
  // Use proxy to avoid CORS and simple blocks (PoC)
  const resp = await fetch(PROXY + encodeURIComponent(url), {
    headers: { "User-Agent": "Mozilla/5.0 (compatible)" }
  });
  if (!resp.ok) throw new Error(`Fetch ${url} failed ${resp.status}`);
  const html = await resp.text();
  return html;
}

function parsePriceFromProductPage($, base) {
  // Try many common selectors; extend/tune if needed per site
  const priceSelectors = [
    "meta[property='product:price:amount']",
    "meta[itemprop='price']",
    ".price--main, .price, .product-price, .product-price__price, .price__value",
    "[data-test*='price']", ".price-amount", ".priceNow", ".priceKrona", ".product-price__amount"
  ];

  for (const sel of priceSelectors) {
    const el = $(sel).first();
    if (el.length) {
      // meta tags
      if (el.attr && (el.attr("content") || el.attr("value"))) {
        const val = el.attr("content") || el.attr("value");
        const num = extractNumber(val);
        if (num != null) return { price: num, priceText: val };
      }
      const text = el.text();
      const num = extractNumber(text);
      if (num != null) return { price: num, priceText: text.trim() };
    }
  }

  // try JSON-LD (ld+json) that often contains price
  const ld = $("script[type='application/ld+json']").map((i, s) => $(s).html()).get();
  for (const block of ld) {
    try {
      const j = JSON.parse(block);
      // if product object
      if (j && j.offers && j.offers.price) {
        const num = extractNumber(String(j.offers.price));
        if (num != null) return { price: num, priceText: String(j.offers.price) };
      }
      // handle array or nested
      if (Array.isArray(j)) {
        for (const item of j) {
          if (item && item.offers && item.offers.price) {
            const num = extractNumber(String(item.offers.price));
            if (num != null) return { price: num, priceText: String(item.offers.price) };
          }
        }
      }
    } catch (e) { /* ignore JSON parse errors */ }
  }

  return null;
}

module.exports = async (req, res) => {
  try {
    // read data/links.json
    const file = path.join(process.cwd(), "data", "links.json");
    if (!fs.existsSync(file)) {
      return res.status(400).json({ error: "data/links.json not found. Add shop product URLs." });
    }
    const raw = fs.readFileSync(file, "utf8");
    const links = JSON.parse(raw);

    const shopsOut = [];

    // iterate shops
    for (const shop of links) {
      const prices = {};
      const productEntries = Object.entries(shop.products || {});
      for (const [itemKey, productUrl] of productEntries) {
        try {
          const html = await fetchHtml(productUrl);
          const $ = cheerio.load(html);
          const parsed = parsePriceFromProductPage($, shop.base);
          if (parsed && parsed.price != null) {
            prices[itemKey.toLowerCase()] = parsed.price;
          } else {
            // fallback: try to find any numeric in the whole page (last resort)
            const fullText = $.text();
            const guess = extractNumber(fullText);
            prices[itemKey.toLowerCase()] = guess;
          }
        } catch (e) {
          prices[itemKey.toLowerCase()] = null;
        }
      }

      shopsOut.push({
        name: shop.name,
        address: shop.address || null,
        prices
      });
    }

    return res.json({ timestamp: Date.now(), shops: shopsOut });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
