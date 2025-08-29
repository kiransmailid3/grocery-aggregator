from django.urls import path
from .views import ShopListView, ItemListView
from .views import product_search

urlpatterns = [
    path('shops/', ShopListView.as_view(), name='shop-list'),
    path('items/', ItemListView.as_view(), name='item-list'),


    path('search/', product_search, name='product-search'),
]
