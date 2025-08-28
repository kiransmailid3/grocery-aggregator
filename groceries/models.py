# Create your models here.
from django.db import models

class GroceryShop(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    pincode = models.CharField(max_length=10)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.name


class GroceryItem(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return self.name


class ShopInventory(models.Model):
    shop = models.ForeignKey(GroceryShop, on_delete=models.CASCADE, related_name="inventory")
    item = models.ForeignKey(GroceryItem, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=8, decimal_places=2)

    class Meta:
        unique_together = ("shop", "item")

    def __str__(self):
        return f"{self.item.name} at {self.shop.name} - ₹{self.price}"
