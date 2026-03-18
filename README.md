# 🏥 Hospital Management System (HMS)

> A comprehensive, microservices-based Hospital Management System built with **Spring Boot** and **Angular 21**, designed to streamline clinical workflows, patient management, and laboratory operations.

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat&logo=spring-boot)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat&logo=angular)](https://angular.io)
[![Java](https://img.shields.io/badge/Java-17+-007396?style=flat&logo=java)](https://www.java.com)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture Overview](#-architecture-overview)
- [Modules Description](#-modules-description)
- [Lab Module Flow (Detailed)](#-lab-module-flow-detailed)
- [User Roles & Responsibilities](#-user-roles--responsibilities)
- [Database Design Overview](#-database-design-overview)
- [API Overview](#-api-overview)
- [Frontend Structure](#-frontend-structure)
- [Setup Instructions](#-setup-instructions)
- [Environment Configuration](#-environment-configuration)
- [Future Enhancements](#-future-enhancements)

---

## 🌐 Project Overview

The **Hospital Management System (HMS)** is an enterprise-grade, full-stack application designed to digitize and optimize day-to-day hospital operations. It supports the complete patient journey — from registration and appointment booking through clinical consultation and laboratory diagnostics — within a unified, role-based platform.

### Purpose

HMS aims to eliminate paper-based workflows, reduce administrative overhead, and improve patient care quality by providing real-time visibility into appointments, consultations, and lab results across all hospital departments.

### Key Features

- **Patient Registration & Profile Management** — centralized patient records with demographic and clinical history
- **Episode & Encounter Management** — structured tracking of patient visits and clinical episodes
- **Appointment Booking** — scheduling for outpatient consultations and lab appointments
- **Consultation Workflow** — doctor-facing interface for clinical notes, diagnosis, prescriptions, and lab order generation
- **Lab Management Module** — end-to-end laboratory workflow covering order creation, sample collection, processing, result entry, and report generation
- **Dashboard & Analytics** — real-time charts and KPIs for administrators, doctors, and front desk staff
- **Role-Based Access Control (RBAC)** — distinct interfaces and permissions for Doctors, Front Desk staff, and Lab Technicians

---

## 🏗 Architecture Overview

HMS is built on a **microservices architecture**, where each domain is an independently deployable service communicating over REST APIs, coordinated through an API Gateway.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Angular 21 Frontend                     │
│         (Patient UI · Doctor UI · Lab UI · Admin UI)            │
└───────────────────────────────┬─────────────────────────────────┘
                                │  HTTP / REST
                                ▼
                    ┌───────────────────────┐
                    │      API Gateway       │
                    │  (Routing · Auth · CORS)│
                    └──────────┬────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Patient &    │    │ Consultation &   │    │  Lab Management  │
│ Appointment  │    │ Episode Service  │    │    Service       │
│  Service     │    │                  │    │                  │
└──────┬───────┘    └────────┬─────────┘    └────────┬─────────┘
       │                     │                        │
       ▼                     ▼                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    Shared PostgreSQL / MySQL DB               │
│           (Schema-per-service or shared schema)              │
└──────────────────────────────────────────────────────────────┘
```

### High-Level Interaction Flow

1. The **Angular frontend** communicates exclusively through the **API Gateway**.
2. The API Gateway authenticates requests (JWT/OAuth2) and routes them to the appropriate microservice.
3. Each microservice owns its domain logic and persists data via **JPA/Hibernate**.
4. Cross-service communication (e.g., Consultation → Lab) is handled through **REST calls** or an internal **event bus**.
5. Responses are aggregated where necessary and returned to the frontend.

---

## 🧩 Modules Description

### 1. Patient Management

Manages the complete lifecycle of a patient's administrative profile.

- **Registration** — capture demographics, contact information, insurance details, and assign a unique Patient ID
- **Search & Lookup** — search patients by name, ID, phone, or date of birth
- **Medical History** — view past episodes, consultations, prescriptions, and lab reports
- **Profile Updates** — edit and maintain up-to-date patient information

---

### 2. Episode Management

An **Episode** represents a clinical visit or a period of care (e.g., an outpatient visit, an inpatient stay).

- Each patient visit generates a new Episode linked to the Patient record
- Episodes contain one or more **Encounters** (individual consultations or interactions)
- Tracks episode status: `OPEN` → `IN_PROGRESS` → `CLOSED`
- Provides a chronological clinical summary per episode

---

### 3. Appointment System

Handles scheduling for both clinical consultations and laboratory appointments.

- **Outpatient Appointments** — book, reschedule, or cancel doctor appointments
- **Lab Appointments** — schedule sample collection slots (triggered from lab orders)
- **Calendar View** — daily/weekly availability view for doctors and lab technicians
- **Status Tracking** — `SCHEDULED` → `CHECKED_IN` → `COMPLETED` / `CANCELLED`
- **Front Desk Integration** — front desk staff manage walk-ins and scheduled bookings

---

### 4. Consultation Module

The primary clinical interface for doctors during a patient encounter.

- **SOAP Notes** — structured documentation (Subjective, Objective, Assessment, Plan)
- **Diagnosis** — ICD-10 code selection and free-text clinical notes
- **Prescription Management** — add, modify, and print prescriptions
- **Lab Order Generation** — raise one or more lab test orders directly from the consultation screen
- **Encounter Summary** — auto-generated visit summary accessible to patient and front desk
- **Status Workflow** — `PENDING` → `IN_CONSULTATION` → `COMPLETED`

---

### 5. Lab Management Module

> **Newly Added — Core Module**

The Lab Management Module provides a complete end-to-end laboratory workflow, integrating clinical orders from doctors with the operational processes carried out by lab technicians.

**Key Capabilities:**

- Receive lab orders raised during consultation
- Book lab appointments for sample collection
- Track the status of each test from order to report
- Enable lab technicians to record sample details, enter results, and generate reports
- Provide doctors with instant access to completed lab reports

**Entities Involved:** `LabOrder`, `LabOrderTest`, `Sample`, `LabReport`

**Roles Involved:** Doctor, Front Desk, Lab Technician

---

## 🔬 Lab Module Flow (Detailed)

### Overview

The lab workflow spans three user roles and five distinct status stages, ensuring traceability and accountability at every step.

```
Doctor (Consultation)
        │
        │  Raises Lab Order
        ▼
[Status: ORDERED]
        │
        │  Front Desk books Lab Appointment
        ▼
[Status: BOOKED]
        │
        │  Lab Technician collects sample
        ▼
[Status: SAMPLE_COLLECTED]
        │
        │  Lab Technician begins processing
        ▼
[Status: IN_PROGRESS]
        │
        │  Results entered + Report generated
        ▼
[Status: COMPLETED]
        │
        │  Doctor reviews report in consultation/dashboard
```

---

### Step 1 — Doctor Raises Lab Order (`ORDERED`)

During an active consultation, the doctor:

1. Opens the **Lab Orders** panel within the Consultation screen
2. Searches and selects one or more **lab tests** (e.g., CBC, LFT, HbA1c)
3. Adds clinical notes or special instructions per test
4. Submits the lab order

> A `LabOrder` record is created, linked to the current `Encounter` and `Episode`. Each selected test creates a `LabOrderTest` entry. Status is set to **`ORDERED`**.

---

### Step 2 — Front Desk Books Lab Appointment (`BOOKED`)

The front desk operator:

1. Views pending lab orders on their dashboard
2. Selects a patient's lab order and assigns an available **time slot** for sample collection
3. Confirms the booking

> The `LabOrder` status transitions to **`BOOKED`**. An `Appointment` record is created of type `LAB`. The patient is notified of the scheduled slot.

---

### Step 3 — Sample Collection by Lab Technician (`SAMPLE_COLLECTED`)

At the scheduled appointment:

1. The lab technician locates the patient's lab order in the **Lab Queue**
2. Verifies patient identity and order details
3. Collects the required biological sample(s) (blood, urine, tissue, etc.)
4. Records **sample metadata** — sample type, collection time, container type, and technician ID
5. Labels and registers the sample in the system

> A `Sample` record is created and linked to the `LabOrder`. Status transitions to **`SAMPLE_COLLECTED`**.

---

### Step 4 — Processing (`IN_PROGRESS`)

Once the sample reaches the lab bench:

1. The lab technician marks the order as **In Progress**
2. Performs analysis using lab instruments or manual procedures
3. Intermediate observations can be saved as draft results

> `LabOrder` status transitions to **`IN_PROGRESS`**. Draft result entries are stored against each `LabOrderTest`.

---

### Step 5 — Result Entry & Report Generation (`COMPLETED`)

Upon completion of analysis:

1. The lab technician enters final numeric or descriptive results for each test
2. The system flags results that fall **outside reference ranges**
3. The technician reviews and **finalizes** the results
4. A structured **Lab Report** is generated and attached to the order
5. The report becomes available to the treating doctor

> A `LabReport` record is created. `LabOrder` status transitions to **`COMPLETED`**. The doctor is notified and can access the report from the consultation or patient history screen.

---

### Lab Order Status Lifecycle Summary

| Status | Triggered By | Description |
|---|---|---|
| `ORDERED` | Doctor | Lab order raised during consultation |
| `BOOKED` | Front Desk | Lab appointment scheduled for patient |
| `SAMPLE_COLLECTED` | Lab Technician | Biological sample collected and logged |
| `IN_PROGRESS` | Lab Technician | Sample under analysis |
| `COMPLETED` | Lab Technician | Results entered and report generated |

---

## 👥 User Roles & Responsibilities

### 🩺 Doctor

| Responsibility | Description |
|---|---|
| Conduct Consultations | Create encounters, write SOAP notes, record diagnoses |
| Generate Lab Orders | Select tests, add instructions, submit orders |
| Review Lab Reports | Access completed reports from consultation or patient history |
| Manage Prescriptions | Issue and update prescriptions during consultation |

---

### 🏢 Front Desk

| Responsibility | Description |
|---|---|
| Patient Registration | Register new patients and update existing profiles |
| Appointment Booking | Schedule outpatient and lab appointments |
| Lab Order Coordination | View pending lab orders and assign collection slots |
| Patient Check-In | Mark patient arrivals and manage waiting queues |

---

### 🧪 Lab Technician

| Responsibility | Description |
|---|---|
| View Lab Queue | Access all assigned and pending lab orders |
| Sample Collection | Record and label collected biological samples |
| Processing | Mark orders as in-progress and perform analysis |
| Result Entry | Input final test results against each ordered test |
| Report Generation | Finalize and publish lab reports for doctor review |

---

## 🗄 Database Design Overview

### Core Entities & Relationships

```
Patient (1) ──────────── (N) Episode
Episode (1) ──────────── (N) Encounter
Episode (1) ──────────── (N) Appointment
Encounter (1) ─────────── (N) LabOrder
LabOrder (1) ──────────── (N) LabOrderTest
LabOrder (1) ──────────── (1) Sample
LabOrder (1) ──────────── (1) LabReport
```

### Key Entity Descriptions

**`Patient`**
Stores demographic and contact information. Central reference for all clinical and administrative records.
Fields: `patientId`, `firstName`, `lastName`, `dob`, `gender`, `contactNumber`, `address`, `createdAt`

---

**`Episode`**
Represents a period of clinical care or a specific visit.
Fields: `episodeId`, `patientId`, `startDate`, `endDate`, `status`, `type`

---

**`Appointment`**
Stores scheduling data for both clinical and lab appointments.
Fields: `appointmentId`, `patientId`, `episodeId`, `doctorId`, `appointmentType` (`CONSULTATION` / `LAB`), `scheduledAt`, `status`

---

**`Encounter`**
Represents a single doctor-patient interaction within an episode.
Fields: `encounterId`, `episodeId`, `doctorId`, `encounterDate`, `notes`, `diagnosis`, `status`

---

**`LabOrder`**
The master record for a group of lab tests ordered by a doctor.
Fields: `labOrderId`, `encounterId`, `patientId`, `doctorId`, `orderDate`, `status`, `clinicalNotes`

---

**`LabOrderTest`**
Represents an individual test within a lab order.
Fields: `labOrderTestId`, `labOrderId`, `testCode`, `testName`, `result`, `unit`, `referenceRange`, `isAbnormal`, `status`

---

**`Sample`**
Records sample collection details for a lab order.
Fields: `sampleId`, `labOrderId`, `sampleType`, `collectedAt`, `collectedBy`, `containerType`, `barcode`

---

**`LabReport`**
The finalized report generated once all tests are completed.
Fields: `reportId`, `labOrderId`, `generatedAt`, `generatedBy`, `reportUrl`, `remarks`

---

## 🔌 API Overview

All APIs are exposed through the API Gateway and secured with JWT authentication.

### Patient & Appointment Service

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/patients` | Register a new patient |
| `GET` | `/api/patients/{id}` | Fetch patient by ID |
| `GET` | `/api/patients/search` | Search patients by query params |
| `PUT` | `/api/patients/{id}` | Update patient profile |
| `POST` | `/api/appointments` | Book an appointment |
| `GET` | `/api/appointments/{id}` | Get appointment details |
| `PUT` | `/api/appointments/{id}/status` | Update appointment status |
| `GET` | `/api/appointments/patient/{patientId}` | List appointments for a patient |

---

### Consultation & Episode Service

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/episodes` | Create a new episode |
| `GET` | `/api/episodes/{id}` | Fetch episode details |
| `POST` | `/api/encounters` | Create a new encounter |
| `PUT` | `/api/encounters/{id}` | Update encounter notes/diagnosis |
| `GET` | `/api/encounters/{id}/summary` | Get encounter summary |
| `POST` | `/api/encounters/{id}/prescriptions` | Add prescription to encounter |

---

### Lab Management Service

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/lab/orders` | Doctor raises a new lab order |
| `GET` | `/api/lab/orders/{id}` | Get lab order by ID |
| `GET` | `/api/lab/orders/patient/{patientId}` | List all lab orders for a patient |
| `PUT` | `/api/lab/orders/{id}/status` | Update lab order status |
| `POST` | `/api/lab/orders/{id}/book` | Front desk books lab appointment |
| `POST` | `/api/lab/orders/{id}/sample` | Record sample collection |
| `PUT` | `/api/lab/orders/{id}/results` | Lab technician enters results |
| `POST` | `/api/lab/orders/{id}/report` | Generate and finalize lab report |
| `GET` | `/api/lab/reports/{reportId}` | Fetch lab report |
| `GET` | `/api/lab/queue` | Fetch lab technician's work queue |

---

## 🖥 Frontend Structure

Built with **Angular 21** following a modular, lazy-loaded architecture.

```
src/
├── app/
│   ├── core/                    # Auth guards, interceptors, services
│   │   ├── auth/
│   │   ├── guards/
│   │   └── interceptors/
│   │
│   ├── shared/                  # Reusable components, pipes, directives
│   │   ├── components/
│   │   └── pipes/
│   │
│   ├── modules/
│   │   ├── dashboard/           # Admin/Doctor dashboard with charts
│   │   │   └── dashboard.component
│   │   │
│   │   ├── patients/            # Patient registration & profile
│   │   │   ├── patient-list/
│   │   │   ├── patient-register/
│   │   │   └── patient-detail/
│   │   │
│   │   ├── appointments/        # Appointment booking & calendar
│   │   │   ├── appointment-list/
│   │   │   ├── appointment-book/
│   │   │   └── appointment-calendar/
│   │   │
│   │   ├── consultation/        # Doctor consultation interface
│   │   │   ├── encounter-view/
│   │   │   ├── soap-notes/
│   │   │   ├── prescription/
│   │   │   └── lab-order-panel/
│   │   │
│   │   ├── lab/                 # Lab management module
│   │   │   ├── lab-queue/       # Technician work queue
│   │   │   ├── lab-order-list/  # Front desk order view
│   │   │   ├── sample-collection/
│   │   │   ├── result-entry/
│   │   │   └── lab-report-view/
│   │   │
│   │   └── episodes/            # Episode management
│   │       ├── episode-list/
│   │       └── episode-detail/
│   │
│   ├── app-routing.module.ts
│   └── app.module.ts
│
├── assets/
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
└── styles/
```

### Key Pages

| Page | Module | Description |
|---|---|---|
| Dashboard | `dashboard` | Charts for appointments, lab stats, patient flow |
| Patient Registration | `patients` | Register/edit patient profiles |
| Consultation | `consultation` | SOAP notes, diagnosis, prescriptions, lab orders |
| Lab Queue | `lab` | Technician's daily work queue with status filters |
| Sample Collection | `lab` | Record and confirm sample collection |
| Result Entry | `lab` | Enter test results with reference range validation |
| Lab Report | `lab` | View and print finalized lab reports |
| Appointments | `appointments` | Calendar-based booking and management |

---

## ⚙️ Setup Instructions

### Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 20+ & npm 10+
- Angular CLI 17+
- PostgreSQL 14+ (or MySQL 8+)
- Docker (optional, for containerized services)

---

### Backend — Spring Boot

**1. Clone the repository**

```bash
git clone https://github.com/your-org/hms-backend.git
cd hms-backend
```

**2. Configure the database**

Update `application.properties` or `application.yml` in each service (see [Environment Configuration](#-environment-configuration)).

**3. Build all services**

```bash
mvn clean install -DskipTests
```

**4. Run individual services**

```bash
# Patient & Appointment Service
cd patient-service && mvn spring-boot:run

# Consultation & Episode Service
cd consultation-service && mvn spring-boot:run

# Lab Management Service
cd lab-service && mvn spring-boot:run

# API Gateway
cd api-gateway && mvn spring-boot:run
```

**5. (Optional) Run with Docker Compose**

```bash
docker-compose up --build
```

---

### Frontend — Angular 21

**1. Clone the frontend repository**

```bash
git clone https://github.com/your-org/hms-frontend.git
cd hms-frontend
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment**

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiGatewayUrl: 'http://localhost:8080/api'
};
```

**4. Run the development server**

```bash
ng serve
```

The app will be available at `http://localhost:4200`.

**5. Build for production**

```bash
ng build --configuration production
```

---

## 🌍 Environment Configuration

### Backend — `application.yml`

```yaml
server:
  port: 8081   # Change per service (8082, 8083, etc.)

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/hms_db
    username: hms_user
    password: your_password
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
  application:
    name: patient-service

jwt:
  secret: your_jwt_secret_key
  expiration: 86400000   # 24 hours in ms
```

### API Gateway Configuration

```yaml
server:
  port: 8080

spring:
  cloud:
    gateway:
      routes:
        - id: patient-service
          uri: http://localhost:8081
          predicates:
            - Path=/api/patients/**, /api/appointments/**

        - id: consultation-service
          uri: http://localhost:8082
          predicates:
            - Path=/api/encounters/**, /api/episodes/**

        - id: lab-service
          uri: http://localhost:8083
          predicates:
            - Path=/api/lab/**
```

### Service Port Reference

| Service | Default Port |
|---|---|
| API Gateway | `8080` |
| Patient & Appointment Service | `8081` |
| Consultation & Episode Service | `8082` |
| Lab Management Service | `8083` |
| Angular Frontend | `4200` |
| PostgreSQL | `5432` |

---

## 🚀 Future Enhancements

| Enhancement | Description |
|---|---|
| **WebSocket Integration** | Real-time notifications for lab order status changes, appointment updates, and doctor alerts |
| **Patient Portal** | Self-service portal for patients to view appointments, reports, and prescriptions |
| **Lab Machine Integration** | HL7/ASTM interface to automatically import results from lab analyzers |
| **Billing & Insurance Module** | Invoice generation, insurance claim management, and payment tracking |
| **Pharmacy Module** | In-house pharmacy with prescription fulfillment and stock management |
| **Mobile Application** | React Native or Flutter app for doctors and patients |
| **Advanced Analytics** | AI-powered diagnostics assistance and population health dashboards |
| **Audit Logging** | Centralized audit trail for all clinical and administrative actions |
| **Multi-Tenancy** | Support multiple hospital branches or clinics under a single deployment |
