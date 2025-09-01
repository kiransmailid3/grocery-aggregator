// api/scrape.js
const cheerio = require("cheerio");

const PROXY = "https://api.allorigins.win/raw?url="; // free HTML proxy for PoC

function extractNumber(text) {
  if (!text) return null;
  const m = text.replace(/\s/g, "").match(/[\d,.]+/);
  return m ? parseFloat(m[0].replace(",", ".")) : null;
}

module.exports = async (req, res) => {
  const { shop, query, url } = req.query;

  // Basic input check
  if (!url && !shop) {
    return res.status(400).json({ error: "Provide shop=willys|coop OR url=PRODUCT_URL (optionally query=search-term)" });
  }

  // Build candidate URLs (search pages). If url provided, we fetch that single page.
  const targets = [];
  if (url) {
    targets.push(url);
  } else {
    const q = encodeURIComponent(query || "");
    if (shop === "willys") {
      targets.push(`https://www.willys.se/sok?q=${q}`);
    } else if (shop === "coop") {
      // Coop search patterns — try a couple of plausible URLs
      targets.push(`https://www.coop.se/handla/sok?q=${q}`);
      targets.push(`https://www.coop.se/sok/?q=${q}`);
    } else {
      return res.status(400).json({ error: "Unknown shop. Use shop=willys or shop=coop or pass url=" });
    }
  }

  const results = [];

  // Try each target until we find results
  for (const target of targets) {
    try {
      const fetchUrl = PROXY + encodeURIComponent(target);
      const fetchRes = await fetch(fetchUrl, { headers: { "User-Agent": "Mozilla/5.0 (compatible)" }});
      if (!fetchRes.ok) throw new Error(`Fetch failed ${fetchRes.status}`);

      const html = await fetchRes.text();
      const $ = cheerio.load(html);

      // Candidate selectors to find product tiles & prices — extend/tune as needed
      const tileSelectors = [
        ".product-card", ".product-item", ".product", ".product-tile",
        ".product-list__item", ".product-list-item", ".product-search-result"
      ];
      const resultsLocal = [];

      for (const sel of tileSelectors) {
        const nodes = $(sel);
        if (nodes.length) {
          nodes.each((i, el) => {
            const el$ = $(el);
            const name = el$.find("h3, h2, .product-title, .product-name, .name, .title").first().text().trim()
              || el$.find("a").attr("title") || el$.find("img").attr("alt") || "";
            let priceText = el$.find(".price, .product-price, .price__value, .price-amount, .priceNow, .priceKrona").first().text().trim();
            if (!priceText) priceText = el$.find("[data-test*='price']").text().trim() || "";

            const price = extractNumber(priceText);
            if (name || price) {
              resultsLocal.push({ name: name || null, price: price, priceText: priceText || null, source: target });
            }
          });
        }
        if (resultsLocal.length) break; // stop if found
      }

      // fallback: maybe this is a single product page — try to extract main product name + price
      if (!resultsLocal.length) {
        const name = $("h1, .product-name, .product-title, .pdp-title").first().text().trim();
        let priceText = $(".price, .product-price, .price-amount, .price__value").first().text().trim() || "";
        const price = extractNumber(priceText);
        if (name || price) {
          resultsLocal.push({ name: name || null, price, priceText, source: target });
        }
      }

      if (resultsLocal.length) {
        results.push(...resultsLocal);
        break; // stop after successful parse
      } else {
        // no results on this target — record it
        results.push({ source: target, note: "no matches found (you may need to tune selectors or provide product URL)" });
      }
    } catch (err) {
      results.push({ source: target, error: err.message });
    }
  }

  return res.json({ shop, query, url, results });
};
