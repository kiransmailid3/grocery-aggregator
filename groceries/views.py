from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from .models import GroceryShop, GroceryItem
from .serializers import GroceryShopSerializer, GroceryItemSerializer
from .scraper import fetch_products

class ShopListView(generics.ListAPIView):
    queryset = GroceryShop.objects.all()
    serializer_class = GroceryShopSerializer

class ItemListView(generics.ListAPIView):
    queryset = GroceryItem.objects.all()
    serializer_class = GroceryItemSerializer


def product_search(request):
    """Renders the form page only."""
    return render(request, "groceries/product_search.html")

def product_results(request):
    """Handles the search and renders results page."""
    product_name = request.GET.get("product_name")
    city = request.GET.get("city")
    products = None

    if product_name and city:
        products = fetch_products(product_name, city)

    return render(request, "groceries/product_results.html", {
        "product_name": product_name,
        "city": city,
        "products": products
    })