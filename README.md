# CampusByte 🍛

### Smart Food Ordering & Pickup Management System for College Campuses

CampusByte is a campus-focused food ordering platform that connects students with canteen owners through digital ordering, real-time food availability, and QR-based pickup verification.

## ✨ Features

### Student
- Browse today's menu and food availability
- Add items to cart and place orders
- Online / Cash on Pickup payment options
- Automatic stock reduction after successful orders
- Out-of-stock handling
- View current and previous orders
- QR-based pickup verification

### Canteen Owner
- Add and publish daily food items
- Manage price and available quantity
- Monitor today's pending orders
- View completed and overall orders
- Scan and verify student pickup QR codes
- Complete orders and disable used QR codes

## 🏗️ Tech Stack

| Component | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Java, Spring Boot |
| Database | PostgreSQL |
| ORM | Spring Data JPA / Hibernate |
| API | REST API |
| QR Scanner | HTML5 QR Code |
| Build Tool | Maven |
| Deployment | Vercel |

## 🔄 System Flow

Student → Menu → Cart → Checkout → Order → QR Pickup

Owner → Publish Menu → Manage Stock → View Orders → Scan QR → Complete Order

## ♻️ SDG Alignment

- **SDG 2:** Zero Hunger
- **SDG 9:** Industry, Innovation & Infrastructure
- **SDG 12:** Responsible Consumption & Production

CampusByte helps reduce waiting time, improve food inventory management, and prevent unnecessary food wastage.

## 🚀 Run Locally

### Backend

```bash
cd backend
mvn clean compile
mvn spring-boot:run
