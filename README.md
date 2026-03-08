
# <img src="assets/logo.png" alt="CURIO Logo" width="120" /> CURIO

### 🔧 Tech Versions

![Node.js](https://img.shields.io/badge/Node.js-v18.17.0-brightgreen?logo=node.js&logoColor=white) ![React](https://img.shields.io/badge/React-v18.2.0-61DAFB?logo=react&logoColor=white) ![Flutter](https://img.shields.io/badge/Flutter-v3.13.4-02569B?logo=flutter&logoColor=white) ![npm](https://img.shields.io/badge/npm-dependencies-blue?logo=npm) ![MySQL](https://img.shields.io/badge/MySQL-v8.1.0-4479A1?logo=mysql&logoColor=white)

---

**CURIO** is a **Full Stack Marketplace Platform** connecting **buyers and artisans**.  
Buyers request custom handmade products, while artisans showcase, sell, and apply to requests.  

The platform supports multiple clients, including a **React-based Web App** and **Flutter Mobile App**, all powered by a centralized Node.js/MySQL backend.

---

## 📦 Table of Contents

<details>
<summary>Click to expand</summary>

1. [Tech Stack](#-tech-stack)  
2. [Project Structure](#-project-structure)  
3. [Quick Setup](#-quick-setup)  
4. [Backend Setup](#-backend-setup)  
5. [Frontend (React) Setup](#-frontend-react-setup)  
6. [Mobile (Flutter) Setup](#-mobile-flutter-setup)  
7. [Database](#-database)  
8. [Features](#-features)  
9. [Prototype](#-prototype)  
10. [Authors](#-authors)  

</details>

---

## 🛠 Tech Stack

### Backend
* Node.js, Express.js, MySQL

### Frontend & Mobile
* **Web:** React.js
* **Mobile:** Flutter / React Native

---

## 📁 Project Structure

```text
CURIO/
│
├── backend/               # Node.js API
│   ├── db/                # Database connection & init
│   ├── modules/           # Auth, User, Portfolio, Marketplace
│   └── server.js
│
├── frontend-react/        # React Web Application
│   ├── src/
│   └── public/
│
├── mobile-flutter/        # Flutter Mobile Application
│   ├── lib/
│   └── assets/
│
├── assets/                # README static files
└── .gitignore

```

---

## ⚡ Quick Setup

```bash
git clone [https://github.com/jana-hagras/curio-fullstack.git](https://github.com/hagras/curio-fullstack.git)
cd curio-fullstack

```

---

## 🖥 Backend Setup

```bash
cd backend
npm install
npm start

```

*The database and tables are automatically created on the first run if your MySQL credentials are set.*

---
---

# node_modules Folder

The `node_modules` folder contains all project dependencies.  

This folder is **not included in the repository** because it can be very large.  

Instead, it is automatically created by running:

```bash
npm install
````

This command reads the dependencies from `package.json` and downloads them.


```
---

## 🌐 Frontend (React) Setup

```bash
cd frontend-react
npm install
npm start

```

Visit the web app at: [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)

---

## 📱 Mobile (Flutter) Setup

```bash
cd mobile-flutter
flutter pub get
flutter run

```

---

## 💾 Database Tables

The system auto-creates the following architecture:

* **User System:** `user`, `Buyer`, `Artisan`
* **Portfolio:** `PortfolioProjects`, `Gallery`
* **Marketplace:** `MarketItem`, `Order`, `OrderItem`
* **Custom Requests:** `Request`, `Application`, `Milestone`
* **Payments & Reviews:** `Payment`, `Review`

---

## ✨ Features

<details>
<summary>Buyer Features</summary>

* Create custom requests
* Order artisan products
* Leave reviews and ratings

</details>

<details>
<summary>Artisan Features</summary>

* Create portfolio projects
* Upload gallery images
* Sell products in marketplace
* Apply to buyer requests

</details>

---

## 🎨 Prototype

<p align="center">
  <a href="https://www.figma.com/proto/UzAp7JCpZQc9DbDfvPjtnR/Egyptique?node-id=29-405&t=Ocdo2nqffXSr8q49-1">
    <img src="https://img.shields.io/badge/%20Launch%20Prototype-8A2BE2?style=for-the-badge&logo=figma&logoColor=white&labelColor=0d1117"/>
  </a>
</p>

---

## 👥 Authors

**Jana Hagars | Youssef Ahmed | Adham Baher | Anas Mohammed | Ahmed Abdelrehim**

---

