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
    products = None
    if request.method == "POST":
        product_name = request.POST.get("product_name")
        city = request.POST.get("city")
        products = fetch_products(product_name, city)
    return render(request, "groceries/product_search.html", {"products": products})