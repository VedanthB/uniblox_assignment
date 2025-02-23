# ShopEasy – A Simple E-commerce Store

## Technologies and Tools

The project is built and tested using the following tools and technologies:

- **Next.js 15:** Used as the primary framework with its new app directory.
- **NextAuth:** For authentication and session management.
- **Vitest & React Testing Library:** For unit and integration testing of both backend APIs and UI pages.
- **Tailwind CSS:** For styling the application with utility‑first CSS classes.

## Overview

ShopEasy is a modern e-commerce platform built with Next.js, featuring:

- User authentication and session management
- Product browsing and shopping cart functionality
- Discount code system with admin controls
- Order processing and history tracking
- RESTful API endpoints for all operations

## Quick Start

```bash
# Install and run
npm install
npm run dev

# Access the store
http://localhost:3000
```

## Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/VedanthB/uniblox_assignment.git
    ```

2. **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3. **Set up environment variables:**

    Create a `.env.local` file in the root directory with the following content:

    ```plaintext
    NEXTAUTH_SECRET=ho1UvJ24bLFebjwDgrlaACsh3lP1uh7EonD/DN0N9Xo=
    ADMIN_SECRET_KEY=mysecureadminkey
    ```

4. **Run the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Folder Structure

```
/ (root)
├── .env.local                     # Environment variables for authentication and admin keys.
├── README.md                      # This documentation.
├── package.json                   # Project metadata and scripts.
├── tsconfig.json                  # TypeScript configuration.
├── /app                           # Next.js application folder
│   ├── page.tsx                   # Landing page / products page.
│   ├── layout.tsx                 # Root layout including ThemeProvider and global header.
│   ├── /api                       # API endpoints
│   │   ├── /admin                 
│   │   │   ├── generate-discount/route.ts  # Generates discount codes (global or user‑specific).
│   │   │   └── summary/route.ts    # Returns order summary statistics.
│   │   ├── /auth                  
│   │   │   ├── [...nextauth]/route.ts # NextAuth authentication endpoint.
│   │   │   └── signup/route.ts     # User registration endpoint.
│   │   ├── /cart                  
│   │   │   ├── [userId]/route.ts   # Gets cart for a specific user.
│   │   │   ├── add/route.ts        # Adds an item to the cart.
│   │   │   ├── remove/route.ts     # Removes an item from the cart.
│   │   │   └── update/route.ts     # Updates cart item quantity.
│   │   ├── checkout/route.ts       # Processes checkout (applies discounts, generates orders).
│   │   └── /orders                
│   │       └── [userId]/route.ts   # Retrieves order history for a user.
│   └── /auth                      # Pages for authentication (login and signup).
│       ├── login/page.tsx         # Login page.
│       └── signup/page.tsx        # Sign-up page.
├── /components                    # UI components
│   ├── header.tsx                 # Application header with navigation and theme toggle.
│   ├── cart-item.tsx              # Component for displaying a cart item.
│   ├── product-card.tsx           # Card component for displaying product information.
│   ├── quantity-stepper.tsx       # Component for modifying item quantity.
│   └── client-layout.tsx          # Layout for client-side rendering with NextAuth provider.
├── /data                          # Static product data.
├── /lib                           # Library code
│   ├── inMemoryDB.ts              # In‑memory datastore (holds orders, cart, discount codes, etc.).
│   └── auth/authOptions.ts        # Configuration for NextAuth.
└── /__tests__                     # Test suites using Vitest and React Testing Library.
     ├── /api                       # Tests for API endpoints.
     └── /pages                     # Tests for UI pages and components.
```

## Environment Variables

The application relies on the following environment variables (set in `.env.local`):

- `NEXTAUTH_SECRET`: Used by NextAuth to secure sessions.
- `ADMIN_SECRET_KEY`: Secret key for admin operations (e.g., generating discount codes).

## API Endpoints

The application exposes several RESTful APIs. Below is an overview of each endpoint, including its purpose, request format, and response format.

### Admin APIs

#### Generate Discount Code

- **Endpoint:** `POST /api/admin/generate-discount`
- **Description:** Generates a discount code. If a `userId` is provided, it creates a user‑specific code (only if the user has 5 or more orders); otherwise, it creates a global discount code.
- **Request Body:**

  ```json
  {
     "adminKey": "mysecureadminkey",
     "userId": "optional-user-id"
  }
  ```

- **Responses:**
  - `201 – Global Discount Code Generated:`

     ```json
     {
        "message": "Global discount code generated",
        "discountCode": "ADMIN-DISCOUNT-<timestamp>"
     }
     ```

  - `201 – User-Specific Discount Code Generated:`

     ```json
     {
        "message": "New discount code generated for user user123",
        "discountCode": "ADMIN-USER-user123-<timestamp>"
     }
     ```

  - `400 – Error if User has fewer than 5 orders:`

     ```json
     {
        "error": "User has fewer than 5 orders. Code not allowed."
     }
     ```

  - `403 – Unauthorized if adminKey is invalid:`

     ```json
     {
        "error": "Unauthorized"
     }
     ```

  Refer to `/app/api/admin/generate-discount/route.ts` for the implementation.

#### Admin Summary

- **Endpoint:** `GET /api/admin/summary`
- **Description:** Returns summary statistics of all orders, including total orders, total items purchased, total purchase amount, total discount amount, along with lists of orders and discount codes.
- **Response Example:**

  ```json
  {
     "totalOrders": 10,
     "totalItemsPurchased": 25,
     "totalPurchaseAmount": 5000,
     "totalDiscountAmount": 300,
     "orders": [/* array of order objects */],
     "userDiscountCodes": { "user123": [ { "code": "DISCOUNT-...", "expired": false } ] },
     "adminDiscountCodes": ["ADMIN-DISCOUNT-..."]
  }
  ```

  See `/app/api/admin/summary/route.ts` for details.

### Authentication APIs

#### User Sign-Up

- **Endpoint:** `POST /api/auth/signup`
- **Description:** Registers a new user.
- **Request Body:**

  ```json
  {
     "username": "testuser",
     "password": "password123"
  }
  ```

- **Responses:**
  - `201 – User Created:`

     ```json
     {
        "message": "User created successfully"
     }
     ```

  - `400 – Missing Fields or User Exists:`

     ```json
     {
        "error": "Username and password are required"
     }
     ```

     or

     ```json
     {
        "error": "User already exists"
     }
     ```

  Refer to `/app/api/auth/signup/route.ts` for the implementation.

#### NextAuth Authentication

- **Endpoint:** `GET/POST /api/auth/[...nextauth]`
- **Description:** Handles authentication via NextAuth (e.g., using a credentials provider).

  See `/app/api/auth/[...nextauth]/route.ts`.

### Cart & Checkout APIs

#### Get Cart

- **Endpoint:** `GET /api/cart/[userId]`
- **Description:** Retrieves the cart items and discount codes for the logged‑in user. Only the session user can access their own cart.
- **Response Example:**

  ```json
  {
     "cart": [
        { "productId": "p1", "name": "Test Product", "price": 100, "quantity": 2 }
     ],
     "discountCodes": [
        { "code": "TESTCODE", "expired": false }
     ]
  }
  ```

  Refer to `/app/api/cart/[userId]/route.ts` for details.

#### Add to Cart

- **Endpoint:** `POST /api/cart/add`
- **Description:** Adds a product to the cart. If the product already exists, its quantity is incremented.
- **Request Body:**

  ```json
  {
     "userId": "test-user",
     "productId": "p1",
     "name": "Test Product",
     "price": 100,
     "quantity": 1
  }
  ```

- **Response Example:**

  ```json
  {
     "message": "Item added to cart successfully",
     "cart": [ /* updated cart array */ ]
  }
  ```

  Refer to `/app/api/cart/add/route.ts`.

#### Remove from Cart

- **Endpoint:** `POST /api/cart/remove`
- **Description:** Removes an item from the cart.
- **Request Body:**

  ```json
  {
     "userId": "test-user",
     "productId": "p1"
  }
  ```

- **Responses:**
  - `200 – Successful Removal:`

     ```json
     {
        "message": "Item removed successfully",
        "cart": [ /* updated cart */ ]
     }
     ```

  - `404 – If the cart is not found:`

     ```json
     {
        "error": "Cart not found"
     }
     ```

  - `403 – If session user does not match:`

     ```json
     {
        "error": "Forbidden"
     }
     ```

  See `/app/api/cart/remove/route.ts` for details.

#### Update Cart Item

- **Endpoint:** `POST /api/cart/update`
- **Description:** Updates the quantity of a cart item. If the quantity is 0 or less, the item is removed.
- **Request Body:**

  ```json
  {
     "userId": "test-user",
     "productId": "p1",
     "quantity": 3
  }
  ```

- **Response Example:**

  ```json
  {
     "message": "Cart updated",
     "cart": [ /* updated cart array */ ]
  }
  ```

  Refer to `/app/api/cart/update/route.ts`.

#### Checkout

- **Endpoint:** `POST /api/checkout`
- **Description:** Processes the checkout by calculating the total amount (with an optional discount), incrementing the user’s order count, generating a new discount code every 5th order, and clearing the cart.
- **Request Body (Optional):**

  ```json
  {
     "discountCode": "VALIDCODE"
  }
  ```

- **Response Example:**

  ```json
  {
     "message": "Order placed successfully",
     "order": {
        "orderId": "ORDER-<timestamp>",
        "userId": "test-user",
        "items": [ /* cart items */ ],
        "totalAmount": 180,
        "discountApplied": true,
        "discountCode": "VALIDCODE",
        "newDiscountCode": "DISCOUNT-<timestamp>" // if applicable
     }
  }
  ```

  See `/app/api/checkout/route.ts` for details.

### Orders API

#### Get Order History

- **Endpoint:** `GET /api/orders/[userId]`
- **Description:** Returns all orders for the specified user.
- **Response Example:**

  ```json
  {
     "orders": [
        {
          "orderId": "order1",
          "userId": "test-user",
          "items": [ /* items array */ ],
          "totalAmount": 100,
          "discountApplied": false
        }
     ]
  }
  ```

  Refer to `/app/api/orders/[userId]/route.ts` for details.

## Data Models and Schemas

Below are some of the core data structures used throughout the application:

- **User:**

  ```typescript
  interface User {
     id: string;
     username: string;
     password: string;
  }
  ```

- **Cart Item:**

  ```typescript
  interface CartItem {
     productId: string;
     name: string;
     price: number;
     quantity: number;
  }
  ```

- **Order:**

  ```typescript
  interface Order {
     orderId: string;
     userId: string;
     items: CartItem[];
     totalAmount: number;
     discountApplied?: boolean;
     discountCode?: string;
  }
  ```

- **Discount Code:**

  ```typescript
  interface DiscountCode {
     code: string;
     expired: boolean;
  }
  ```

These definitions are used in various API endpoints (see `/app/api/.../route.ts`) and are referenced in the tests.

## Running Tests

The project uses Vitest and React Testing Library for unit and integration tests. To run the tests, execute:

```bash
npm run test
# or
yarn test
```

Tests are located under the `/__tests__` folder with separate directories for API endpoints and UI pages/components.

## Deployment

ShopEasy can be deployed on Vercel with minimal configuration. Simply connect your Git repository to Vercel and configure the environment variables in the Vercel dashboard. For additional details, refer to the Next.js Deployment Documentation.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Write tests for your changes.
4. Submit a pull request with a detailed description of your changes.

## License

This project is licensed under the MIT License.
