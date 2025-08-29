import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.willys.se"

def fetch_products(product_name: str, city: str, limit: int = 5):
    """
    Fetch products from Willys with given product name and city/pincode.
    Currently searches the 'erbjudanden' page as placeholder.
    """
    print(f"Fetching products... {product_name} in {city}")
    url = BASE_URL + "/erbjudanden/ehandel"
    resp = requests.get(url, timeout=10)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, 'html.parser')

    products = []
    items = soup.select(".product-list-item")  # TODO: refine selector

    for item in items[:limit]:
        title_el = item.select_one(".product-title")
        price_el = item.select_one(".product-price")

        title = title_el.get_text(strip=True) if title_el else "—"
        if product_name.lower() not in title.lower():
            continue  # filter by product name

        product = {
            "name": title,
            "price": price_el.get_text(strip=True) if price_el else "—",
            "city": city,
        }
        products.append(product)

    print(f"Fetched products: \n {products}")
    return products
