# Expense Tracker

A full-stack Expense Tracker application built using React and Spring Boot. The application allows users to manage expenses, budgets, categories, and view financial reports through a simple dashboard.

## 🚀 Features

- User Login and Authentication
- Expense Management
  - Add expense
  - View expenses
  - Update expense
  - Delete expense
- Budget Management
  - Create budgets
  - View budgets
  - Delete budgets
  - Budget alert threshold
- Category Management
- Dashboard
  - Total spending
  - Total budget
  - Budget usage percentage
  - Transaction count
  - Category-wise spending
  - Recent transactions
- Budget Alerts
- Monthly Reports
- Yearly Reports
- PostgreSQL database
- RESTful APIs
- Responsive React interface

## 🛠️ Technology Stack

### Frontend
- React
- JavaScript
- HTML5
- CSS3
- Vite

### Backend
- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- REST APIs
- Maven

### Database
- PostgreSQL
- Hibernate / JPA

### Other Technologies
- JWT Authentication
- Swagger / OpenAPI
- Lombok
- ModelMapper

## 🏗️ Project Structure

```text
Expense Tracker/
│
├── expense-tracker-frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── src/
│   └── main/
│       ├── java/
│       │   └── com/example/expensetracker/
│       └── resources/
│
└── pom.xml