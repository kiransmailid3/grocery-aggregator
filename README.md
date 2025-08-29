# 🛒 Grocery Price Comparison App

A Django-based web application to compare grocery prices across multiple shops.  
Includes a **scraper** (demo with `willys.se`) and a **search page** where users can enter a product name and a city/pincode.

---

## 📦 Features
- Django backend with REST API support (DRF).
- Models for shops, items, and inventories.
- Scraper module (`scraper.py`) to fetch sample product data.
- Web form for user input:
  - **Product name** (e.g., Tomatoes).
  - **City or pincode** (e.g., Stockholm or 11122).
- Display results in a clean Bootstrap-based UI.

---

## ⚙️ Setup Instructions

### Clone Repository
```bash
git clone https://github.com/your-username/grocery_app.git
cd grocery_aggregator
```

### Create virtual environment
```bash
python3 -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
```

### Install requirements
```bash
pip install -r requirements.txt
```

### Run migrations (required if using database)
```bash
python manage.py makemigrations
python manage.py migrate
```

### Run development server
```bash
python manage.py runserver
```

### Accessing the app via webpage locally
Web page (Search):
```bash
http://127.0.0.1:8000/groceries/search/
```

API Endpoints:
```bash
Shops → http://127.0.0.1:8000/api/shops/
Items → http://127.0.0.1:8000/api/items/
```

