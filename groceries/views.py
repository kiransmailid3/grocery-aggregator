from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from .models import GroceryShop, GroceryItem
from .serializers import GroceryShopSerializer, GroceryItemSerializer

class ShopListView(generics.ListAPIView):
    queryset = GroceryShop.objects.all()
    serializer_class = GroceryShopSerializer

class ItemListView(generics.ListAPIView):
    queryset = GroceryItem.objects.all()
    serializer_class = GroceryItemSerializer
