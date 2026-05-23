# 🚀 TechNexus

TechNexus is a full-stack e-commerce platform designed to provide a seamless online shopping experience with secure authentication, dynamic product management, cart functionality, order processing, and integrated online payments.

The project follows a modern web architecture using React for the frontend, Node.js and Express for the backend, PostgreSQL as the database, Prisma ORM for database management, and Razorpay for payment processing.

---

## 🌟 Features

### User Features
- User Registration & Login
- Secure Authentication
- Browse Products by Categories
- Product Search & Filtering
- Product Details Page
- Add to Cart
- Update Cart Quantity
- Remove Items from Cart
- Order Placement
- Razorpay Payment Integration
- Responsive UI

### Admin Features
- Product Management
- Category Management
- Inventory Control
- Order Monitoring
- User Management

---

## 🏗️ System Architecture

```text
Frontend (React)
        │
        ▼
Axios API Calls
        │
        ▼
Backend (Node.js + Express)
        │
        ▼
Prisma ORM
        │
        ▼
PostgreSQL Database
        │
        ▼
Razorpay Payment Gateway
```

---

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router DOM
- Axios
- CSS3
- JavaScript (ES6+)

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL

### ORM
- Prisma ORM

### Payment Gateway
- Razorpay

### Authentication
- JWT (JSON Web Tokens)
- bcrypt

### Deployment
- Vercel (Frontend)
- Render / Railway / VPS (Backend)
- PostgreSQL Database

---

## 📂 Project Structure

```text
TECHNEXUS
│
├── e-comm-project/          # Frontend Application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── assets/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── backendproject/          # Backend Application
│   ├── prisma/
│   │   └── schema.prisma
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🔄 Application Flow

### Product Flow

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
Prisma Query
        │
        ▼
PostgreSQL
        │
        ▼
Response Returned
        │
        ▼
React UI Updated
```

---

### Payment Flow

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
Backend Verifies Payment Signature
        │
        ▼
Order Stored in Database
```

---

## 🗄️ Database Design

Core entities include:

- Users
- Products
- Categories
- Cart
- Orders
- Payments

Relationships are managed through Prisma ORM and PostgreSQL.

---

## 🔐 Security Features

- Password Hashing using bcrypt
- JWT Authentication
- Protected API Routes
- Secure Payment Verification
- Environment Variable Management

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/Keshavv-Verma/TECHNEXUS.git
```

```bash
cd TECHNEXUS
```

---

## Frontend Setup

```bash
cd e-comm-project
npm install
npm start
```

Runs on:

```text
http://localhost:3000
```

---

## Backend Setup

```bash
cd backendproject
npm install
```

Create a `.env` file:

```env
DATABASE_URL=
JWT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_SECRET=
```

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Start backend:

```bash
npm run dev
```

Runs on:

```text
http://localhost:5000
```

---

## Environment Variables

### Backend

```env
DATABASE_URL=
JWT_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_SECRET=
```

---

## 📈 Future Enhancements

- Wishlist Functionality
- Product Reviews & Ratings
- Recommendation Engine
- AI-powered Product Search
- Order Tracking
- Email Notifications
- Admin Analytics Dashboard
- Redis Caching
- Docker Deployment

---

## 🎯 Learning Outcomes

This project demonstrates practical implementation of:

- Full Stack Development
- REST API Design
- Database Management
- Authentication & Authorization
- ORM Usage (Prisma)
- Payment Gateway Integration
- State Management
- Component-Based Architecture
- Secure Coding Practices

---

## 👨‍💻 Author

Keshav Verma

GitHub:
https://github.com/Keshavv-Verma

---

## 📜 License

This project is developed for educational and portfolio purposes.
