from django.core.management.base import BaseCommand
from groceries.models import GroceryItem  # or create a separate model for scraped products
from ...scraper import fetch_products  # use the function above

class Command(BaseCommand):
    help = "Fetch 5 offer products from Willys"

    def handle(self, *args, **options):
        products = fetch_products(5)
        for prod in products:
            self.stdout.write(f"- {prod['name']} — {prod['price']} — {prod['url']}")
            GroceryItem.objects.update_or_create(
                name=prod["name"],
                defaults={"description": prod.get("compare_price") or "", "external_url": prod["url"]}
            )
