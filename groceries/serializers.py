from rest_framework import serializers
from .models import GroceryShop, GroceryItem, ShopInventory

class GroceryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroceryItem
        fields = "__all__"

class ShopInventorySerializer(serializers.ModelSerializer):
    item = GroceryItemSerializer()

    class Meta:
        model = ShopInventory
        fields = "__all__"

class GroceryShopSerializer(serializers.ModelSerializer):
    inventory = ShopInventorySerializer(many=True, read_only=True)

    class Meta:
        model = GroceryShop
        fields = "__all__"
