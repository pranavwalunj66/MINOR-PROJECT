# Quizcraze API Documentation

## Base URLs
```
Production: https://minor-project-sfsm.vercel.app/api
Development: http://localhost:5000/api
```

## Testing with Postman

### Setup Steps
1. Create a new Postman Collection named "Quizcraze API"
2. Set up environment variables:
   - Create two environments: "Development" and "Production"
   - Add these variables to both:
     - `BASE_URL`: Use respective URLs from above
     - `TOKEN`: Will be automatically filled after login

### Authentication Flow
1. Register a new user
2. Login with credentials
3. Copy the token from the response
4. Set up a Collection-level Authorization:
   - Type: Bearer Token
   - Token: `{{TOKEN}}`

## API Endpoints

### 1. Authentication

#### Register User
```http
POST {{BASE_URL}}/auth/register
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "+919876543210",
  "password": "Test@123",
  "role": "teacher", // or "student"
  "department": "Computer Science", // required for students
  "prn": "123456789012" // required for students, 12 digits
}
```

#### Login
```http
POST {{BASE_URL}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test@123"
}
```
**Response**: Copy the token and set it as environment variable `TOKEN`

### 2. Class Management

#### Create Class (Teacher Only)
```http
POST {{BASE_URL}}/classes
Content-Type: application/json
Authorization: Bearer {{TOKEN}}

{
  "name": "Test Class",
  "enrollmentKey": "test123"
}
```

#### Join Class (Student Only)
```http
POST {{BASE_URL}}/classes/join
Content-Type: application/json
Authorization: Bearer {{TOKEN}}

{
  "enrollmentKey": "test123"
}
```

#### Get My Classes
For Teachers:
```http
GET {{BASE_URL}}/classes/teacher
Authorization: Bearer {{TOKEN}}
```

For Students:
```http
GET {{BASE_URL}}/classes/student
Authorization: Bearer {{TOKEN}}
```

### 3. Quiz Management

#### Create Quiz (Teacher Only)
```http
POST {{BASE_URL}}/quizzes
Content-Type: application/json
Authorization: Bearer {{TOKEN}}

{
  "title": "Test Quiz",
  "description": "Quiz description",
  "classIds": ["class_id_here"],
  "timeLimit": 30,
  "windowStart": "2025-03-29T10:00:00.000Z",
  "windowEnd": "2025-03-29T11:00:00.000Z",
  "questions": [
    {
      "text": "Question 1?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctOption": 0
    }
  ]
}
```

#### Get Quiz Details
```http
GET {{BASE_URL}}/quizzes/:quizId
Authorization: Bearer {{TOKEN}}
```

#### Start Quiz (Student Only)
```http
POST {{BASE_URL}}/quizzes/:quizId/start
Authorization: Bearer {{TOKEN}}
```

#### Submit Quiz (Student Only)
```http
POST {{BASE_URL}}/quizzes/:quizId/submit
Content-Type: application/json
Authorization: Bearer {{TOKEN}}

{
  "answers": [0, 1, 2] // Array of selected option indices
}
```

### Testing Checklist

1. **Authentication**
   - [ ] Register as teacher
   - [ ] Register as student
   - [ ] Login as teacher
   - [ ] Login as student
   - [ ] Verify token works

2. **Class Management**
   - [ ] Create class (teacher)
   - [ ] Join class (student)
   - [ ] View teacher's classes
   - [ ] View student's classes
   - [ ] Block/unblock student

3. **Quiz Management**
   - [ ] Create quiz
   - [ ] Set time window
   - [ ] Add questions
   - [ ] Start quiz (verify time window)
   - [ ] Submit answers
   - [ ] View results

### Common Issues and Solutions

1. **Invalid Token**
   - Ensure token is copied correctly
   - Token might be expired (re-login)
   - Check if Bearer prefix is included

2. **Permission Errors**
   - Verify user role (teacher/student)
   - Check if user belongs to the class
   - Validate time window for quizzes

3. **Time Window Issues**
   - Use UTC times in requests
   - Ensure windowStart is before windowEnd
   - Check server timezone settings

### Response Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": "string"
}
```

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Something went wrong"
}
```

## Rate Limiting
- 100 requests per 15 minutes per IP
- OTP verification limited to 5 attempts

## Security Features
- JWT-based authentication
- Password hashing
- OTP verification
- Role-based access control
- Rate limiting
- CORS enabled
