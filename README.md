# Just Shop

<p align="center">
  <b>Full-Stack E-Commerce Platform</b><br/>
  Built with Next.js, MongoDB, NextAuth, and Stripe
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-App%20Router-black" />
  <img src="https://img.shields.io/badge/TypeScript-Ready-blue" />
  <img src="https://img.shields.io/badge/MongoDB-Database-green" />
  <img src="https://img.shields.io/badge/Stripe-Payments-purple" />
  <img src="https://img.shields.io/badge/Status-Portfolio%20Ready-orange" />
</p>

---

## Overview

**Just Shop** is a modern full-stack e-commerce web application built as a graduation project and portfolio project.

It supports:
- Customer shopping experience
- Seller dashboard and product management
- Admin control panel
- Reviews, wishlist, cart, checkout, and Stripe payment

The project is designed to simulate a real-world e-commerce platform with multiple user roles and dashboards.

---

## Main Features

### Authentication & Users
- Email/password registration and login
- Google login
- Forgot password / reset password
- Email verification flow
- Profile management
- Role-based access control
- Customer / Seller / Admin roles

### Store Features
- Homepage with dynamic banners
- Product listing page
- Category sidebar and filters
- Product details page
- Wishlist / favorites
- Product reviews and ratings
- Related products

### Cart & Checkout
- Add/remove products from cart
- Quantity update
- Promo code support
- Checkout flow
- Stripe payment integration
- Cash on Delivery support
- Order success page

### Orders
- Place orders
- Track order status
- Order history
- Seller order processing
- Admin order management

### Seller Dashboard
- Seller products management
- Inventory control
- Seller orders
- Revenue / earnings overview

### Admin Dashboard
- User management
- Role changer (customer / seller / admin)
- Product management
- Categories management
- Promo codes management
- Banner management
- Review moderation

---

## Tech Stack

### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Lucide React
- Sonner

### Backend
- Next.js API Routes
- MongoDB
- Mongoose
- Auth.js / NextAuth

### Payment
- Stripe

### Dev Tools
- Git & GitHub
- VS Code

---

## Project Structure

```bash
src/
├── app/
│   ├── admin/
│   ├── api/
│   ├── auth/
│   ├── cart/
│   ├── checkout/
│   ├── order/
│   ├── products/
│   ├── profile/
│   ├── seller/
│   └── ...
├── components/
├── lib/
├── models/
└── types/