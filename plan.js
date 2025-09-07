// plan.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  const itemsInput = document.getElementById("items");
  const results = document.getElementById("results");
  const statusEl = document.getElementById("status");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    results.innerHTML = "";
    statusEl.textContent = "Calculating…";

    try {
      // Load shop data from the same origin (no CORS issues)
      // const res = await fetch("shops.json", { cache: "no-store" });
      // if (!res.ok) throw new Error("Failed to load shops.json");
      // const shops = await res.json();
      // fetch real-time prices from serverless endpoint
      const apiRes = await fetch("/api/prices", { cache: "no-store" });
      if (!apiRes.ok) throw new Error("Failed to fetch live prices");
      const apiJson = await apiRes.json();
      const shops = apiJson.shops || [];

      // Parse items
      const items = String(itemsInput.value || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (items.length === 0) throw new Error("Please enter at least one item.");

      // Compute plan
      const plan = [];
      const grouped = {};

      for (const item of items) {
        let cheapestShop = null;
        let cheapestPrice = Infinity;

        for (const shop of shops) {
          const price = shop?.prices?.[item];
          if (typeof price === "number" && price < cheapestPrice) {
            cheapestPrice = price;
            cheapestShop = shop.name;
          }
        }

        if (cheapestShop) {
          plan.push({ item, shop: cheapestShop, price: cheapestPrice });
          if (!grouped[cheapestShop]) grouped[cheapestShop] = { items: [], total: 0 };
          grouped[cheapestShop].items.push({ item, price: cheapestPrice });
          grouped[cheapestShop].total += cheapestPrice;
        } else {
          plan.push({ item, shop: null, price: null, note: "Not available" });
          if (!grouped["Unavailable"]) grouped["Unavailable"] = { items: [], total: 0 };
          grouped["Unavailable"].items.push({ item, price: null });
        }
      }

      // Render: by item
      const byItem = document.createElement("div");
      byItem.innerHTML = "<h2>Result by item</h2>";
      const ul1 = document.createElement("ul");
      plan.forEach((row) => {
        const li = document.createElement("li");
        li.textContent = row.shop
          ? `${row.item}: ${row.shop} — ${row.price.toFixed(2)}`
          : `${row.item}: ${row.note}`;
        ul1.appendChild(li);
      });
      byItem.appendChild(ul1);

      // Render: grouped by shop
      const byShop = document.createElement("div");
      byShop.innerHTML = "<h2>Grouped by shop</h2>";
      const ul2 = document.createElement("ul");
      Object.entries(grouped).forEach(([shop, info]) => {
        const li = document.createElement("li");
        const totalStr = info.total > 0 ? ` (total ${info.total.toFixed(2)})` : "";
        li.innerHTML = `<strong>${shop}</strong>${totalStr}`;
        const inner = document.createElement("ul");
        info.items.forEach((it) => {
          const li2 = document.createElement("li");
          li2.textContent =
            it.price != null ? `${it.item} — ${it.price.toFixed(2)}` : `${it.item} — n/a`;
          inner.appendChild(li2);
        });
        li.appendChild(inner);
        ul2.appendChild(li);
      });
      byShop.appendChild(ul2);

      results.appendChild(byItem);
      results.appendChild(byShop);
      statusEl.textContent = "Done";
    } catch (err) {
      statusEl.textContent = "";
      results.innerHTML = `<div style="color:crimson">Error: ${err.message}</div>`;
    }
  });
});
