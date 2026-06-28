# AirBnb Clone

A full-stack Express.js application that models a vacation rental platform with user authentication, listing management, reviews, image uploads to Cloudinary, and MongoDB persistence.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [Project Structure](#project-structure)
- [Core Concepts](#core-concepts)
  - [Routes](#routes)
  - [Controllers](#controllers)
  - [Models](#models)
  - [Middleware](#middleware)
  - [Validation](#validation)
  - [Cloudinary Image Upload](#cloudinary-image-upload)
  - [Flash Messages](#flash-messages)
  - [Authentication](#authentication)
- [Views](#views)
- [Database Behavior](#database-behavior)
- [Error Handling](#error-handling)
- [Notes](#notes)

## Project Overview

This repository contains an Airbnb-like rental listings application built with Express.js and MongoDB. Users can register, log in, create and manage listings, upload photos, and leave reviews for listings.

## Features

- User registration and login with Passport.js
- Listing creation, editing, deletion
- Review creation and deletion for listings
- Image upload and storage on Cloudinary
- MongoDB session storage using `connect-mongo`
- Server-side form validation with `joi`
- Flash success/error notifications
- EJS templating with `ejs-mate`
- Middleware for authentication, authorization, and validation

## Tech Stack

- Node.js + Express.js
- MongoDB + Mongoose
- Passport.js + `passport-local-mongoose`
- EJS + `ejs-mate`
- Cloudinary for image storage
- Joi for request validation
- Multer + `multer-storage-cloudinary` for uploads
- Connect-mongo session store
- `express-session` and `connect-flash`

## Getting Started

### Prerequisites

- Node.js 22.x (project specifies `node 22.14.0`)
- MongoDB Atlas or local MongoDB instance
- Cloudinary account for image uploads

### Installation

1. Clone the repository:

```bash
git clone <repo-url>
cd AirBnb
```

2. Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root with the following values:

```env
NODE_ENV=development
ATLASDB_URL=<your-mongodb-connection-string>
SECRET=<session-secret-string>
CLOUD_NAME=<cloudinary-cloud-name>
CLOUD_API_KEY=<cloudinary-api-key>
CLOUD_API_SECRET=<cloudinary-api-secret>
```

- `ATLASDB_URL` is the MongoDB connection string.
- `SECRET` is used for session encryption.
- `CLOUD_NAME`, `CLOUD_API_KEY`, and `CLOUD_API_SECRET` are Cloudinary credentials.

### Running the App

```bash
node app.js
```

The server starts on port `8080`.

## Project Structure

- `app.js` — main Express application entry point
- `cloudConfig.js` — Cloudinary configuration and storage adapter
- `schema.js` — Joi schemas for listing and review validation
- `middleware.js` — custom middleware for auth, ownership checks, and validation
- `models/` — Mongoose models for Listing, Review, and User
- `routes/` — modular route definitions for listings, reviews, and users
- `controllers/` — request handlers for listings, reviews, and user flows
- `utils/` — helper utilities, including async wrapper and custom errors
- `views/` — EJS views and layouts
- `public/` — static assets for CSS and client-side JavaScript

## Core Concepts

### Routes

`app.js` mounts the routes as follows:

- `/listings` — listing CRUD operations
- `/listings/:id/reviews` — create/delete reviews for listings
- `/signup` — user signup
- `/login` — user login
- `/logout` — user logout

### Controllers

- `controllers/listings.js`
  - `index` — render all listings
  - `renderNewForm` — display form to create a listing
  - `showListing` — display a single listing with reviews and owner data
  - `createListing` — create a listing, upload image to Cloudinary, assign owner
  - `renderEditForm` — show edit page, including transformed image URL for preview
  - `updateListing` — update listing fields and optionally replace image
  - `destroyListing` — delete listing and remove associated reviews

- `controllers/reviews.js`
  - `createReview` — add a review to a listing and link it to the current user
  - `destroyReview` — remove a review and unlink it from a listing

- `controllers/users.js` (not yet read, but expected to contain signup/login/logout handlers)

### Models

- `models/listing.js`
  - title: String, required
  - description: String
  - image: `url`, `filename`
  - price: Number
  - location: String
  - country: String
  - reviews: array of Review references
  - owner: User reference
  - cleanup hook removes reviews when a listing is deleted

- `models/review.js`
  - comment: String
  - rating: Number between 1 and 5
  - createdAt: Date
  - author: User reference

- `models/user.js`
  - email: String, required
  - Passport-local plugin for username, hash, and salt management

### Middleware

- `middleware.js` exposes:
  - `isLoggedIn` — protects routes and redirects unauthenticated requests to `/login`
  - `saveRedirectUrl` — preserves original path before login
  - `isOwner` — verifies the current user owns the listing before edit/delete
  - `validateListing` — checks request body against `listingSchema`
  - `validateReview` — checks review payload against `reviewSchema`
  - `isReviewAuthor` — verifies the current user created the review before deletion

### Validation

- `schema.js` defines Joi validation:
  - `listingSchema` requires title, description, location, country, and price
  - `reviewSchema` requires rating (1-5) and comment

Validation failures throw an `ExpressError` with `400` status.

### Cloudinary Image Upload

- `cloudConfig.js` configures Cloudinary with credentials from environment variables
- `multer-storage-cloudinary` stores uploaded files directly in Cloudinary
- `routes/listing.js` uses multer middleware to upload one image field: `listing[image]`
- Listing create/update handlers save `image.url` and `image.filename`

### Flash Messages

- `connect-flash` provides one-time `success` and `error` messages
- `app.js` exposes `res.locals.success`, `res.locals.error`, and `res.locals.currUser` for all views

### Authentication

- Passport.js local strategy is configured in `app.js`
- `User.authenticate()`, `serializeUser()`, and `deserializeUser()` are provided by `passport-local-mongoose`
- User sessions are stored in MongoDB via `connect-mongo`

## Views

EJS view structure:

- `views/layouts/boilerplate.ejs` — base layout wrapper
- `views/includes/navbar.ejs` — navigation links and current user display
- `views/includes/flash.ejs` — flash message partial
- `views/listings/index.ejs` — listing directory
- `views/listings/new.ejs` — new listing form
- `views/listings/edit.ejs` — edit listing form
- `views/listings/show.ejs` — listing detail page with reviews
- `views/users/login.ejs` — login page
- `views/users/signup.ejs` — signup page
- `views/error.ejs` — error page

## Database Behavior

- Listings embed Cloudinary image metadata and refer to reviews and owner by ObjectId.
- Reviews refer to their author and are stored separately.
- When a listing is deleted, its related reviews are also removed via `findOneAndDelete` middleware.
- `connect-mongo` persists sessions in the same MongoDB database.

## Error Handling

- `utils/ExpressError.js` is a custom error class that holds HTTP status codes.
- `utils/wrapAsync.js` wraps async route handlers and forwards exceptions to Express.
- `app.js` includes a catch-all route that creates a `404` error for missing pages.
- The final error handler renders `views/error.ejs` with the status code and message.

## Notes

- The app currently listens on port `8080`.
- A starter `package.json` exists, but there is no test script configured.
- The server will only load `.env` values when `NODE_ENV` is not `production`.
- Some code comments show alternate route declarations and a demo user creation route that is commented out.

---

### Recommended Improvements

- Add `npm start` script for easier startup.
- Add `test` and `lint` scripts.
- Add a local MongoDB fallback when `ATLASDB_URL` is missing.
- Implement validation of uploaded file presence and file type.
- Restrict listing delete/create actions to full ownership flow in the UI.
