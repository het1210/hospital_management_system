# Hospital Management System - Project Overview

## Introduction

This is a comprehensive Hospital Management System (HMS) designed to manage multiple hospitals, their staff, patients, appointments, medical episodes, and consultations. The system follows a microservices architecture with a modern web-based frontend, enabling scalable and maintainable healthcare operations management.

## System Architecture

### Architecture Pattern
The system implements a **Microservices Architecture** with the following key characteristics:

- **Service Discovery**: Centralized service registry for dynamic service location
- **API Gateway**: Single entry point for all client requests with JWT-based authentication
- **Independent Services**: Each microservice manages its own domain and database
- **Inter-Service Communication**: Services communicate via REST APIs using Feign clients
- **Stateless Authentication**: JWT tokens for secure, scalable authentication

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Angular)                        │
│                     http://localhost:4200                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/REST + JWT
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      API Gateway (Port 8080)                     │
│              - JWT Validation & User Context Injection           │
│              - Request Routing & Load Balancing                  │
└──────┬──────────────┬──────────────┬──────────────┬─────────────┘
       │              │              │              │
       │              │              │              │
┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐ ┌────▼─────────┐
│   Auth      │ │ Hospital │ │  Patient    │ │   Eureka     │
│  Service    │ │ Service  │ │  Service    │ │   Server     │
│ (Port 8081) │ │(Port 8083)│ │(Port 8084) │ │ (Port 8761)  │
└─────────────┘ └───────────┘ └─────────────┘ └──────────────┘
       │              │              │
       │              │              │
┌──────▼──────────────▼──────────────▼──────────────────────────┐
│                    MySQL Database (HMS)                        │
│         - users, roles, user_roles                             │
│         - hospitals                                            │
│         - patients, patient_hospital                           │
│         - appointments, episodes, encounters                   │
│         - consultations, prescriptions                         │
└────────────────────────────────────────────────────────────────┘
```

## Backend Services

### 1. Eureka Server (Service Discovery)
**Port**: 8761

**Purpose**: Service registry that enables microservices to discover and communicate with each other dynamically.

**Functionality**:
- Maintains a registry of all available microservice instances
- Provides service location information to clients
- Enables load balancing and failover capabilities
- Health monitoring of registered services

### 2. API Gateway
**Port**: 8080

**Purpose**: Single entry point for all client requests, handling routing, authentication, and cross-cutting concerns.

**Key Features**:
- **JWT Authentication Filter**: Validates JWT tokens for all incoming requests (except public endpoints)
- **Request Routing**: Routes requests to appropriate microservices based on path patterns
- **User Context Propagation**: Extracts user information from JWT and forwards as HTTP headers
- **CORS Handling**: Manages cross-origin requests from the frontend

**Route Mappings**:
- `/auth/**` → Auth Service (public, no JWT required)
- `/api/hospital/**` → Hospital Service
- `/api/users/**` → Auth Service
- `/api/role/**` → Auth Service
- `/api/patients/**` → Patient Service
- `/api/appointments/**` → Patient Service
- `/api/episodes/**` → Patient Service
- `/api/consultations/**` → Patient Service

**Authentication Flow**:
1. Extracts JWT token from Authorization header
2. Validates token signature and expiration
3. Extracts claims (userId, hospitalId, username, roles)
4. Forwards user context as headers (X-User-Id, X-Hospital-Id, X-Username, X-User-Roles)
5. Routes request to target service

### 3. Auth Service
**Port**: 8081

**Purpose**: Manages user authentication, authorization, and user/role management.

**Core Entities**:
- **Users**: System users with credentials, personal information, and hospital association
- **Roles**: User roles (SUPER_ADMIN, HOSPITAL_ADMIN, DOCTOR, NURSE, FRONTDESK, LAB_TECHNICIAN, PHARMACIST, PATIENT)
- **User-Role Mapping**: Many-to-many relationship between users and roles

**Key APIs**:
- `POST /auth/login` - User authentication, returns JWT tokens
- `POST /auth/register` - User registration (public)
- `POST /auth/refresh` - Refresh access token
- `GET /auth/validate` - Validate JWT token
- `POST /api/users/register` - Create new user (admin only)
- `GET /api/users` - List users with pagination
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user
- `GET /api/users/search` - Search doctors by query
- `GET /api/role` - Get all available roles

**Security**:
- Password encryption using BCrypt
- JWT token generation with user claims
- Role-based access control (RBAC)
- Token expiration management

**Inter-Service Communication**:
- Calls Hospital Service via Feign client to fetch hospital details

### 4. Hospital Service
**Port**: 8083

**Purpose**: Manages hospital information and operations.

**Core Entity**:
- **Hospital**: Hospital details including name, address, registration number, contact information, and status

**Key APIs**:
- `POST /api/hospital` - Create new hospital (SUPER_ADMIN only)
- `GET /api/hospital` - List hospitals with pagination
- `PUT /api/hospital/update/{id}` - Update hospital
- `DELETE /api/hospital/{id}` - Delete hospital
- `GET /api/hospital/count` - Get hospital statistics
- `GET /api/hospital/names` - Get hospital names for dropdowns
- `POST /api/hospital/internal/batch` - Internal API for batch hospital retrieval

**Security**:
- User context filter extracts user information from gateway headers
- Role-based authorization using @PreAuthorize annotations
- Most operations restricted to SUPER_ADMIN

### 5. Patient Service
**Port**: 8084

**Purpose**: Comprehensive patient care management including patient records, appointments, episodes, encounters, and consultations.

**Core Entities**:
- **Patient**: Patient demographics and identification (Aadhaar-based)
- **PatientHospital**: Tracks patient registration across multiple hospitals
- **Appointment**: Scheduled patient-doctor meetings
- **Episode**: Care episodes representing a period of treatment
- **Encounter**: Individual interactions within an episode (OPD, Lab, Surgery, etc.)
- **Consultation**: Medical consultation details with diagnosis and notes
- **Prescription**: Medications prescribed during consultations

**Key APIs**:

**Patient Management**:
- `POST /api/patients` - Register new patient
- `GET /api/patients` - List patients with pagination
- `PUT /api/patients/{id}` - Update patient
- `DELETE /api/patients/{id}` - Delete patient
- `GET /api/patients/search` - Search patients by query

**Appointment Management**:
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - List appointments with date filters
- `GET /api/appointments/{id}` - Get appointment details
- `GET /api/appointments/doctor/{doctorId}` - Get doctor's appointments
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Cancel appointment
- `GET /api/appointments/role/{role}/today` - Get appointment counts for dashboard

**Episode Management**:
- `POST /api/episodes` - Create new episode
- `GET /api/episodes/search` - Search episodes by patient
- `GET /api/episodes/{id}` - Get episode with encounters

**Consultation Management**:
- `POST /api/consultations` - Create consultation (DOCTOR only)
- `GET /api/consultations/patient/{aadhaar}` - Get patient consultation history

**Security**:
- User context filter for authentication
- Role-based authorization
- Hospital-scoped data access

**Inter-Service Communication**:
- Calls Auth Service via Feign client to fetch user/doctor details

## Frontend Application

### Framework & Structure
The frontend is built as a Single Page Application (SPA) using Angular with standalone components.

**Port**: 4200

### Application Structure

**Core Components**:
- **App Root**: Main application component with router outlet
- **Home**: Layout wrapper with side menu and content area
- **Sidemenu**: Navigation sidebar with role-based menu items
- **Toast**: Global notification system

**Pages** (Route-based views):
- **Login**: User authentication page
- **Dashboard**: Role-specific dashboard with statistics and charts
- **Hospitals**: Hospital management (SUPER_ADMIN only)
- **Users**: User management (admins only)
- **Patients**: Patient registration and listing
- **Appointments**: Appointment scheduling and management
- **Episodes**: Episode creation and tracking
- **Consultations**: Consultation records and history
- **Episode Details**: Detailed view of episode with encounters

**Reusable Components**:
- Form components: Hospital, User, Patient, Appointment, Episode, Consultation
- View components: Display lists with search, pagination, and actions
- QR Print: Generate QR codes for patient identification

### Services (API Integration)

**Core Services**:
- **AuthService**: Authentication, login/logout, token management
- **HospitalService**: Hospital CRUD operations
- **UserService**: User management
- **RoleService**: Role fetching
- **PatientService**: Patient management
- **AppointmentService**: Appointment operations
- **EpisodeService**: Episode management
- **ConsultationService**: Consultation records
- **ToastService**: Global notifications
- **ConsultationPdfService**: PDF generation for consultations

### Security & Authentication

**Auth Guard**: Protects routes requiring authentication
**Role Guard**: Restricts access based on user roles (SUPER_ADMIN, HOSPITAL_ADMIN)

**Auth Interceptor**: 
- Automatically attaches JWT token to all HTTP requests
- Adds user context headers (X-User-Id, X-Hospital-Id, X-Username, X-User-Roles)
- Mirrors the gateway's expected header format

**Token Management**:
- Access token and refresh token stored in localStorage
- Automatic token attachment to API calls
- Role-based UI rendering

### User Roles & Permissions

The system supports multiple user roles with different access levels:

1. **SUPER_ADMIN**: 
   - Manage all hospitals
   - View system-wide statistics
   - Full administrative access

2. **HOSPITAL_ADMIN**:
   - Manage users within their hospital
   - View hospital-specific statistics
   - Manage hospital operations

3. **DOCTOR**:
   - View and manage appointments
   - Create episodes and consultations
   - Access patient medical records
   - Write prescriptions

4. **FRONTDESK**:
   - Register patients
   - Schedule appointments
   - Check-in patients
   - Create episodes

5. **NURSE**:
   - View patient information
   - Access assigned patients

6. **LAB_TECHNICIAN**: Lab operations (UI prepared, backend extensible)

7. **PHARMACIST**: Pharmacy operations (UI prepared, backend extensible)

8. **PATIENT**: View own records (UI prepared, backend extensible)

## Data Model & Relationships

### Core Domain Entities

**Hospital**
- Represents a healthcare facility
- Contains registration details, contact information, and status
- Referenced by Users, Patients, Appointments, and Episodes

**User**
- System users (doctors, admins, staff)
- Associated with a single hospital
- Can have multiple roles
- Credentials managed by Auth Service

**Patient**
- Patient demographics and identification
- Unique Aadhaar number for identification
- Can be registered at multiple hospitals (PatientHospital junction table)
- Unique patient identifier per hospital

**Appointment**
- Scheduled meeting between patient and doctor
- Status: BOOKED, CHECKED_IN, COMPLETED, CANCELLED
- Time-bound with start and end times
- Associated with hospital, patient, and doctor

**Episode**
- Represents a care episode (period of treatment)
- Contains multiple encounters
- Status: ACTIVE, CLOSED
- Tracks reason for visit and treatment period

**Encounter**
- Individual interaction within an episode
- Types: OPD, LAB, RADIOLOGY, INPATIENT, ICU, SURGERY, FOLLOW_UP
- Links to appointment and consultation
- Time-stamped interactions

**Consultation**
- Medical consultation record
- Contains symptoms, diagnosis, and notes
- One-to-one with encounter
- Links to prescriptions

**Prescription**
- Medication details
- Dosage, frequency, and duration
- Multiple prescriptions per consultation

### Entity Relationships

```
Hospital (1) ──────── (N) User
Hospital (1) ──────── (N) Patient (via PatientHospital)
Hospital (1) ──────── (N) Appointment
Hospital (1) ──────── (N) Episode

Patient (1) ─────────── (N) Appointment
Patient (1) ─────────── (N) Episode
Patient (1) ─────────── (N) Consultation

User/Doctor (1) ──────── (N) Appointment
User/Doctor (1) ──────── (N) Encounter
User/Doctor (1) ──────── (N) Consultation

Episode (1) ──────────── (N) Encounter
Encounter (1) ─────────── (1) Consultation
Consultation (1) ──────── (N) Prescription
Appointment (1) ────────── (1) Encounter
```

## Application Flow

### 1. User Authentication Flow

```
User enters credentials
    ↓
Frontend → POST /auth/login → API Gateway → Auth Service
    ↓
Auth Service validates credentials
    ↓
Generates JWT tokens (access + refresh)
    ↓
Returns tokens with user info (userId, hospitalId, roles)
    ↓
Frontend stores tokens in localStorage
    ↓
All subsequent requests include JWT in Authorization header
```

### 2. Request Flow (Authenticated)

```
Frontend makes API call with JWT token
    ↓
API Gateway receives request
    ↓
JwtAuthenticationFilter validates token
    ↓
Extracts user context (userId, hospitalId, username, roles)
    ↓
Adds context as HTTP headers (X-User-Id, X-Hospital-Id, etc.)
    ↓
Routes to appropriate microservice
    ↓
Target service's UserContextFilter reads headers
    ↓
Sets SecurityContext with user authorities
    ↓
Controller method checks @PreAuthorize annotation
    ↓
Business logic executes with user context
    ↓
Response returns through gateway to frontend
```

### 3. Patient Registration & Care Flow

```
1. PATIENT REGISTRATION
   Frontdesk/Admin → Create Patient → Patient Service
   - Captures demographics and Aadhaar number
   - Generates unique patient identifier
   - Creates PatientHospital association

2. APPOINTMENT SCHEDULING
   Frontdesk/Doctor → Create Appointment → Patient Service
   - Select patient, doctor, date/time
   - Status: BOOKED
   - Visible in doctor's calendar

3. PATIENT CHECK-IN
   Frontdesk → Update Appointment Status → CHECKED_IN
   - Patient arrives at hospital
   - Ready for consultation

4. EPISODE CREATION
   Doctor/Frontdesk → Create Episode → Patient Service
   - Represents treatment period
   - Captures reason for visit
   - Status: ACTIVE

5. ENCOUNTER & CONSULTATION
   Doctor → Create Consultation → Patient Service
   - Creates Encounter (links appointment to episode)
   - Records symptoms, diagnosis, notes
   - Adds prescriptions
   - Appointment status → COMPLETED

6. EPISODE CLOSURE
   Doctor → Update Episode Status → CLOSED
   - Treatment period ends
   - Episode archived with all encounters
```

### 4. Dashboard & Analytics Flow

```
User logs in → Redirected to Dashboard
    ↓
Dashboard loads role-specific statistics
    ↓
For SUPER_ADMIN:
  - Fetches hospital count
  - System-wide metrics
    ↓
For DOCTOR:
  - Fetches today's appointments
  - Displays calendar view
  - Shows appointment statistics
    ↓
For FRONTDESK:
  - Check-in statistics
  - Pending registrations
    ↓
Charts and visualizations render using Chart.js
```

## Key Features

### Multi-Hospital Support
- System supports multiple hospitals
- Each hospital operates independently
- SUPER_ADMIN manages all hospitals
- Hospital-specific admins manage their facility
- Users and patients are scoped to hospitals

### Role-Based Access Control (RBAC)
- Fine-grained permissions at API level
- Frontend adapts UI based on user role
- Backend enforces authorization using @PreAuthorize
- User context propagated from gateway to services

### Patient Identification
- Aadhaar number as primary identifier
- Unique patient identifier per hospital
- QR code generation for quick patient lookup
- Cross-hospital patient tracking

### Appointment Management
- Calendar-based scheduling
- Doctor availability tracking
- Status workflow: BOOKED → CHECKED_IN → COMPLETED/CANCELLED
- Date range filtering and search

### Episode-Based Care Tracking
- Episodes represent treatment periods
- Multiple encounters per episode
- Different encounter types (OPD, Lab, Surgery, etc.)
- Complete medical history tracking

### Consultation & Prescription
- Structured consultation records
- Symptoms, diagnosis, and clinical notes
- Multiple prescriptions per consultation
- PDF generation for consultation reports

### Search & Filtering
- Patient search by name, Aadhaar, phone
- Doctor search for appointment booking
- Episode search by patient
- Date-based appointment filtering
- Hospital-scoped queries

## Security Implementation

### Authentication
- JWT-based stateless authentication
- Access tokens with configurable expiration
- Refresh tokens for session extension
- Password encryption using BCrypt

### Authorization
- Role-based access control at method level
- Gateway-level JWT validation
- Service-level authorization checks
- Hospital-scoped data access

### User Context Propagation
1. Gateway validates JWT and extracts claims
2. User context forwarded as HTTP headers
3. Services read headers via UserContextFilter
4. SecurityContext populated with authorities
5. Controllers access user information for business logic

## Inter-Service Communication

### Feign Clients
Services communicate synchronously using Feign clients:

**Auth Service → Hospital Service**:
- Fetches hospital details for user registration validation

**Patient Service → Auth Service**:
- Fetches user/doctor details for appointments and consultations
- Enriches response data with user information

### Service Discovery
- All services register with Eureka Server
- Feign clients use logical service names (e.g., "auth-service")
- Eureka resolves service names to actual instances
- Enables load balancing and failover

## Database Design

### Single Database Approach
All services share a single MySQL database (HMS) with logical separation:

**Auth Service Tables**:
- users
- roles
- user_roles

**Hospital Service Tables**:
- hospitals

**Patient Service Tables**:
- patients
- patient_hospital
- appointments
- episodes
- encounters
- consultations
- prescriptions

### Data Isolation
- Hospital-scoped queries ensure data isolation
- Foreign key references maintained across service boundaries
- Services own their domain tables

## Frontend Architecture

### Component Organization

**Pages**: Route-level components representing full views
**Components**: Reusable UI components (forms, lists, dialogs)
**Services**: API integration and business logic
**Models**: TypeScript interfaces matching backend DTOs
**Guards**: Route protection (authentication, authorization)
**Interceptors**: HTTP request/response manipulation

### State Management
- LocalStorage for authentication state
- BehaviorSubject for user state observable
- Component-level state for UI data
- No global state management library

### UI Features
- Responsive design
- Form validation
- Pagination for large datasets
- Search and filtering
- Calendar view for appointments
- Charts and statistics (Chart.js)
- Toast notifications
- QR code generation
- PDF export for consultations

## Typical User Workflows

### Super Admin Workflow
1. Login to system
2. View system-wide dashboard
3. Create/manage hospitals
4. Monitor hospital statistics
5. View all users across hospitals

### Hospital Admin Workflow
1. Login to system
2. View hospital dashboard
3. Create/manage users (doctors, nurses, staff)
4. Monitor hospital operations
5. View hospital-specific reports

### Doctor Workflow
1. Login to system
2. View today's appointments on calendar
3. Check patient details
4. Create episode for new patient visit
5. Create encounter and consultation
6. Record symptoms, diagnosis, and notes
7. Add prescriptions
8. Complete appointment
9. Generate consultation PDF

### Frontdesk Workflow
1. Login to system
2. Register new patients
3. Schedule appointments
4. Check-in patients when they arrive
5. Create episodes for walk-in patients
6. View appointment statistics

## Technical Highlights

### Backend
- Microservices architecture with service discovery
- JWT-based stateless authentication
- Role-based authorization
- RESTful API design
- JPA/Hibernate for ORM
- Pagination support
- Exception handling with global handlers
- Validation using Bean Validation
- Feign clients for inter-service communication

### Frontend
- Angular standalone components
- Reactive forms with validation
- HTTP interceptors for authentication
- Route guards for authorization
- Lazy loading for optimization
- TypeScript for type safety
- SCSS for styling
- Third-party integrations (FullCalendar, Chart.js, QR codes, PDF generation)

### Infrastructure
- Service registry (Eureka)
- API Gateway pattern
- Centralized routing
- Load balancing ready
- Horizontal scaling capable

## Deployment Considerations

### Service Ports
- Eureka Server: 8761
- API Gateway: 8080
- Auth Service: 8081
- Hospital Service: 8083
- Patient Service: 8084
- Frontend: 4200

### Database
- Single MySQL instance
- Database name: HMS
- All services connect to same database
- Schema managed via JPA auto-update

### Service Startup Order
1. Start MySQL database
2. Start Eureka Server (wait for startup)
3. Start all microservices (Auth, Hospital, Patient)
4. Start API Gateway
5. Start Frontend application

### Configuration
- YAML-based configuration
- JWT secret shared across gateway and auth service
- Database credentials configured per service
- Eureka client configuration in each service

## Scalability & Extensibility

### Horizontal Scaling
- Stateless services enable multiple instances
- Eureka handles service discovery and load balancing
- API Gateway distributes requests

### Extensibility Points
- New microservices can be added easily
- New roles can be defined in database
- New encounter types supported
- Additional modules (Billing, Pharmacy, Lab) can be integrated
- Frontend components are modular and reusable

### Future Enhancements
- Billing and payment management
- Lab test management
- Pharmacy inventory
- Radiology image management
- Patient portal
- Mobile application
- Real-time notifications
- Audit logging
- Advanced analytics and reporting

## Summary

This Hospital Management System provides a robust, scalable solution for managing healthcare operations across multiple hospitals. The microservices architecture ensures maintainability and scalability, while the role-based access control provides security and appropriate data access. The system covers the complete patient care lifecycle from registration through consultation and prescription, with comprehensive tracking via episodes and encounters.
