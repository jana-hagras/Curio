# CURIO – Full Stack Marketplace Platform

CURIO is a **Full Stack web platform** that connects **buyers and artisans**.
Buyers can request custom handmade products, while artisans can showcase their work, apply to requests, and sell products through a marketplace.

The platform provides a system for **portfolio management, custom requests, product ordering, and reviews**.

---

# Tech Stack

### Backend

* Node.js
* Express.js
* MySQL
* mysql2

### Frontend

* React / Flutter / React Native (depending on implementation)

### Tools

* Git & GitHub
* Postman / Thunder Client
* npm

---

# Project Structure

```
CURIO/
│
├── backend/
│   ├── db/
│   │   ├── connection.js
│   │   └── setup.js
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── portfolioProjects/
│   │   └── ...
│   │
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── .gitignore
└── README.md
```

---

# Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/curio-fullstack.git
cd curio-fullstack
```

---

# Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Run the backend server:

```bash
npm start
```

or

```bash
node index.js
```

The backend will start and automatically:

* Connect to MySQL
* Create the **CURIO database**
* Create all required tables

---

# Frontend Setup

Open another terminal and navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the frontend application:

```bash
npm start
```

The frontend will run locally on:

```
http://localhost:3000
```

---

# node_modules Folder

The `node_modules` folder contains all project dependencies.

This folder is **not included in the repository** because it can be very large.

Instead, it is automatically created by running:

```bash
npm install
```

This command reads the dependencies from `package.json` and downloads them.

---

# Database Tables

The system automatically creates the following tables:

### User System

* user
* Buyer
* Artisan

### Portfolio

* PortfolioProjects
* Gallery

### Marketplace

* MarketItem
* Order
* OrderItem

### Custom Requests

* Request
* Application
* Milestone

### Payment & Reviews

* Payment
* Review

---

# API Testing

The backend API can be tested using:

* Postman

Example endpoints:

```
POST /auth/register
POST /auth/login

GET /portfolioProjects
POST /portfolioProjects

GET /user
PUT /user/:id
DELETE /user/:id
```

---

# Features

### Buyer Features

* Create custom requests
* Order artisan products
* Leave reviews and ratings

### Artisan Features

* Create portfolio projects
* Upload gallery images
* Sell products in the marketplace
* Apply to buyer requests

### Platform Features

* Milestone-based project workflow
* Escrow payment system
* Product ordering system
* Review and rating system

---

# Future Improvements

* JWT authentication
* Image upload system
* Payment gateway integration
* Notifications system
* Admin dashboard
* API documentation

---

# Prototype link:

<div align="center">
  <h1>🎨 CURIO</h1>
  <p><strong>A Full Stack Marketplace Platform Connecting Buyers and Artisans</strong></p>
  
  [![Figma Prototype](https://img.shields.io/badge/Figma-Prototype-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/proto/UzAp7JCpZQc9DbDfvPjtnR/Egyptique?node-id=29-405&t=Ocdo2nqffXSr8q49-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=10%3A837&show-proto-sidebar=1)
</div>

---
# Authors

Jana Hagars
Youssef Ahmed
Adham Baher
Anas Mohammed
Ahmed Abdelrehim 

---
