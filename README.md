### Inventory Management System

A simple inventory management system built with React (frontend) and Node.js + Express + SQLite (backend). Supports product management, image upload, and inventory history.

### Features

- Add, edit, and delete products
- Upload product images
- View stock status (In Stock / Out of Stock)
- Inventory history tracking
- Responsive table design

### Tech Stack
- Frontend: React, Axios, CSS
- Backend: Node.js, Express, SQLite, Multer
- Database: SQLite
- Image Storage: Local /uploads folder on backend

### Backend Setup
1. Clone backend repository
```bash
git clone https://github.com/Sravanikonapalli/inventory-system.git
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Setup database
# SQLite CLI
sqlite3 database.sqlite
.read sampleData.sql


The sampleData.sql file contains initial product data. Use INSERT OR IGNORE if some products already exist.

4. Start backend server
```bash
npm start
```

The backend should now run on:

http://localhost:4000

Backend Endpoints
Method	Endpoint	Description
GET	/products	Get all products
GET	/products/:id	Get single product by ID
POST	/products	Add new product
PUT	/products/:id	Update product
DELETE	/products/:id	Delete product
GET	/products/:id/history	Get inventory change history
GET	/products/categories	Get product categories

### Frontend Setup
1. Clone frontend repository
```bash
git clone https://github.com/Sravanikonapalli/inventory-system.git
cd frontend
``` 

2. Install dependencies
```bash
npm install
``` 

3. Start frontend server
```bash
npm start
```

The frontend should now run on:

http://localhost:3000

### LIVE URLS

Frontend: https://your-frontend-live-url.com

Backend: https://your-backend-live-url.com


### Usage

- Open the frontend URL in your browser
- Add new products using the modal
- Upload images when adding or editing products
- View product list with stock status
- Click History to view inventory changes