from django.urls import path
from .views import ShopListView, ItemListView

urlpatterns = [
    path('shops/', ShopListView.as_view(), name='shop-list'),
    path('items/', ItemListView.as_view(), name='item-list'),
]
