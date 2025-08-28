import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.willys.se"
OFFER_URL = BASE_URL + "/erbjudanden/ehandel"

def fetch_products(limit=5):
    print("Fetching products.....")
    resp = requests.get(OFFER_URL, timeout=10)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, 'html.parser')

    products = []
    # This selector might need adjusting depending on actual markup
    items = soup.select(".product-list-item")  # hypothetical CSS class

    for item in items[:limit]:
        title_el = item.select_one(".product-title")
        price_el = item.select_one(".product-price")
        compare_el = item.select_one(".product-compare-price")
        link_el = item.select_one("a")

        product = {
            "name": title_el.get_text(strip=True) if title_el else "—",
            "price": price_el.get_text(strip=True) if price_el else "—",
            "compare_price": compare_el.get_text(strip=True) if compare_el else None,
            "url": BASE_URL + link_el["href"] if link_el and link_el.get("href") else None,
        }
        products.append(product)
    
    print(f"Fetched below products: \n {products}")

    return products

if __name__ == "__main__":
    for prod in fetch_products():
        print(prod)
