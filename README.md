# 🚀 TechNexus

TechNexus is a modern full-stack e-commerce platform built to provide a seamless, secure, and intelligent online shopping experience.

The platform combines a React-based frontend with a Node.js and Express backend, MongoDB for data storage, Mongoose for database modeling, JWT-based authentication, and Razorpay payment integration.

Beyond traditional e-commerce functionality, TechNexus is evolving into an AI-powered shopping assistant capable of understanding natural language queries and recommending products based on user requirements.

---

# 🌟 Features

## User Features

- User Registration & Login
- Secure JWT Authentication
- Browse Products by Categories
- Product Search & Filtering
- Product Details Page
- Add to Cart
- Remove from Cart
- Quantity Management
- Checkout Process
- Razorpay Payment Integration
- Order Placement
- Responsive Design
- User Profile Management

---

## Admin Features

- Product Management
- Product Creation & Updates
- Product Deletion
- Category Management
- Inventory Monitoring
- Order Monitoring
- User Management

---

# 🏗️ System Architecture

```text
Frontend (React)
        │
        ▼
Axios API Requests
        │
        ▼
Backend (Node.js + Express)
        │
        ▼
Mongoose ODM
        │
        ▼
MongoDB Database
        │
        ▼
Razorpay Payment Gateway
```

---

# 🛠️ Tech Stack

## Frontend

- React.js
- React Router DOM
- Axios
- JavaScript (ES6+)
- CSS3
- HTML5

## Backend

- Node.js
- Express.js

## Database

- MongoDB

## ODM

- Mongoose

## Authentication

- JWT (JSON Web Tokens)
- bcryptjs

## Payment Gateway

- Razorpay

## Development Tools

- Git
- GitHub
- VS Code
- Postman

---

# 📂 Project Structure

```text
TECHNEXUS
│
├── e-comm-project/
│   │
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── assets/
│   │   ├── App.js
│   │   └── index.js
│   │
│   └── package.json
│
├── backendproject/
│   │
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# 🔄 Application Workflow

## Product Browsing Flow

```text
User Opens Website
        │
        ▼
React Frontend
        │
        ▼
Axios Request
        │
        ▼
Express API
        │
        ▼
Mongoose Query
        │
        ▼
MongoDB Database
        │
        ▼
Response Returned
        │
        ▼
Products Rendered
```

---

## Authentication Flow

```text
User Login/Register
        │
        ▼
Frontend Form Submission
        │
        ▼
Backend Validation
        │
        ▼
Password Hash Verification
        │
        ▼
JWT Token Generated
        │
        ▼
Authenticated Session
```

---

## Cart Flow

```text
User Adds Product
        │
        ▼
Cart State Updated
        │
        ▼
Cart Stored
        │
        ▼
Cart Display Updated
        │
        ▼
Ready For Checkout
```

---

## Payment Flow

```text
User Clicks Checkout
        │
        ▼
Frontend Sends Request
        │
        ▼
Backend Creates Razorpay Order
        │
        ▼
Razorpay Checkout Opens
        │
        ▼
User Completes Payment
        │
        ▼
Payment Verification
        │
        ▼
Order Stored In Database
```

---

# 🗄️ Database Design

The application uses MongoDB as its primary database.

## Collections

### Users

Stores:

- User Information
- Authentication Data
- Profile Information

### Products

Stores:

- Product Name
- Product Description
- Product Images
- Product Price
- Category Information
- Stock Details

### Categories

Stores:

- Category Name
- Category Metadata

### Cart

Stores:

- User Cart Items
- Product References
- Quantity Information

### Orders

Stores:

- Order Details
- Ordered Products
- Payment Information
- Delivery Status

### Payments

Stores:

- Razorpay Payment Details
- Verification Information
- Transaction Records

---

# 🔐 Security Features

- JWT Authentication
- Password Hashing using bcryptjs
- Protected Routes
- Secure Payment Verification
- Environment Variable Protection
- Input Validation
- API Security Practices

---

# ⚙️ Installation & Setup

## Clone Repository

```bash
git clone https://github.com/Keshavv-Verma/TECHNEXUS.git
```

```bash
cd TECHNEXUS
```

---

# Frontend Setup

```bash
cd e-comm-project
npm install
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

---

# Backend Setup

```bash
cd backendproject
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

RAZORPAY_KEY_ID=your_key

RAZORPAY_SECRET=your_secret
```

Start Backend:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

# API Overview

## Authentication APIs

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/profile
```

## Product APIs

```http
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

## Cart APIs

```http
GET    /api/cart
POST   /api/cart/add
PUT    /api/cart/update
DELETE /api/cart/remove
```

## Order APIs

```http
POST /api/orders
GET  /api/orders
```

## Payment APIs

```http
POST /api/payment/create-order
POST /api/payment/verify
```

---

# 📈 Future Roadmap

## 🤖 AI Shopping Assistant

TechNexus is evolving into an AI-powered shopping platform.

Users will be able to ask:

- "Suggest a gaming laptop under ₹70,000"
- "Recommend wireless earbuds for gym workouts"
- "Find a gift for a programmer"
- "Compare iPhone and Samsung phones"

The AI Assistant will:

- Understand natural language
- Search product catalog
- Recommend products
- Compare products
- Explain recommendations
- Personalize suggestions

---

## Additional Future Features

- Wishlist System
- Product Reviews & Ratings
- Recommendation Engine
- AI Product Comparison
- Smart Search
- Email Notifications
- Order Tracking
- Admin Analytics Dashboard
- Chat Support
- Product Recommendation System

---

# 🎯 Learning Outcomes

This project demonstrates practical implementation of:

- Full Stack Development
- REST API Development
- MongoDB Database Design
- Mongoose ODM
- Authentication & Authorization
- Payment Gateway Integration
- React Component Architecture
- Client-Server Communication
- E-Commerce Workflows
- Secure Web Development Practices

---

# 👨‍💻 Author

**Keshav Verma**

GitHub:  
https://github.com/Keshavv-Verma

---

# ⭐ Support

If you found this project useful, consider giving it a star on GitHub.

It helps support future development and improvements.

---

# 📄 License

This project is developed for educational, learning, and portfolio purposes.
