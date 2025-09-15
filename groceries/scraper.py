from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup
import time
import re


def print_products_info(products):
    table_hdr = "Index \t Product \t Brand \t Discounted Price \t Ordinary Price"
    liner_count = len(table_hdr)
    print(table_hdr)
    print(liner_count * "=")
    for idx, product in enumerate(products, start=1):
        print(f"{idx}. {product['name']} - {product['brand']} — {product['discount_info']} - {product['ordinary_info']}")
    print(liner_count * "=")

def fetch_products(product_name: str, city: str, limit: int = 5):
    print(f"Fetching products... {product_name} in {city}")

    options = Options()
    options.add_argument("--headless")   # Run without opening browser
    options.add_experimental_option("excludeSwitches", ["enable-logging"])
    driver = webdriver.Chrome(options=options)

    url = f"https://www.willys.se/sok?q={product_name}"

    driver.get(url)
    time.sleep(3)  # wait for JS to load products

    soup = BeautifulSoup(driver.page_source, "html.parser")

    products = []

    # now product cards will be real, not skeletons
    products_list = soup.select("div[data-testid='product']")[:5]
    if len(products_list) == 0:
        print(f"No products found for {product_name}!!")
        return []


    # print("Index \t Product \t Brand \t Discounted Price \t Ordinary Price")
    table_hdr = "Index \t Product \t Brand \t Discounted Price \t Ordinary Price"
    liner_count = len(table_hdr)
    # print(table_hdr)
    # print(liner_count * "=")

    for idx, prod in enumerate(products_list, start=1):
        title_tag = prod.select_one('[itemprop="name"]')
        brand_tag = prod.select_one('[itemprop="brand"]')

        jmf_elem = prod.find(string=re.compile("Jmf-pris"))
        jmf_text = jmf_elem.strip() if jmf_elem else "None"

        ord_elem = prod.find(string=re.compile("Ordinarie pris"))
        ord_text = ord_elem.strip() if ord_elem else "None"

        title = title_tag.get_text(strip=True) if title_tag else "No title"
        brand = brand_tag.get_text(strip=True) if brand_tag else "No brand"

        # print(f"{idx}. {title} - {brand} — {jmf_text} - {ord_text}")
        if title is not None:
            product = {
                "name": title,
                "brand": brand,
                "discount_info": jmf_text,
                "ordinary_info": ord_text
            }
            products.append(product)
    # print(liner_count * "=")
    
    driver.quit()

    # print(f"Fetched products: {products}")

    return products


if __name__ == "__main__":
    products = fetch_products("tomat", "Stockholm", limit=1)
    print_products_info(products)
