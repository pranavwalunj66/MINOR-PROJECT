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
  "title": "Sample Quiz",
  "description": "A test quiz",
  "classIds": ["class_id1", "class_id2"],
  "timeLimit": 30, // in minutes
  "windowStart": "2025-04-01T10:00:00Z",
  "windowEnd": "2025-04-01T23:59:59Z",
  "questions": [
    {
      "text": "What is 2+2?",
      "options": ["3", "4", "5", "6"],
      "correctOption": 1
    }
    // Maximum 50 questions allowed
  ]
}
```

#### Get Quiz Details
```http
GET {{BASE_URL}}/quizzes/:quizId
Authorization: Bearer {{TOKEN}}
```
- Teachers see full details including correct answers and all attempts
- Students see limited details based on quiz status
- Updates quiz status automatically based on time window

#### Get Teacher's Quizzes
```http
GET {{BASE_URL}}/quizzes/teacher/all
Authorization: Bearer {{TOKEN}}
```
Returns all quizzes created by the teacher with their current status

#### Get Student's Quizzes
```http
GET {{BASE_URL}}/quizzes/student/all
Authorization: Bearer {{TOKEN}}
```
Returns:
- Upcoming quizzes from enrolled classes
- Ongoing quizzes that can be attempted
- Past quizzes with student's attempt details

#### Start Quiz (Student Only)
```http
POST {{BASE_URL}}/quizzes/:quizId/start
Authorization: Bearer {{TOKEN}}
```
- Validates quiz timing and student eligibility
- Creates a new attempt with start time
- Returns questions without correct answers

#### Submit Quiz (Student Only)
```http
POST {{BASE_URL}}/quizzes/:quizId/submit
Content-Type: application/json
Authorization: Bearer {{TOKEN}}

{
  "answers": [
    {
      "questionIndex": 0,
      "selectedOption": 1
    }
  ]
}
```
- Validates submission timing
- Calculates score automatically
- Prevents multiple submissions

#### Extend Quiz Time (Teacher Only)
```http
POST {{BASE_URL}}/quizzes/:quizId/extend
Content-Type: application/json
Authorization: Bearer {{TOKEN}}

{
  "additionalMinutes": 15
}
```
Extends the time limit for ongoing quiz attempts

#### Generate Quiz Report (Teacher Only)
```http
GET {{BASE_URL}}/quizzes/:quizId/report
Authorization: Bearer {{TOKEN}}
```
Generates an Excel report with:
- Student details
- Submission times
- Scores
- Question-wise analysis

#### Get Quiz Leaderboard
```http
GET {{BASE_URL}}/quizzes/:quizId/leaderboard
Authorization: Bearer {{TOKEN}}
```
- Accessible to both teachers and students
- Shows class-wise rankings
- Based on total correct answers
- Updates in real-time as students submit

## Response Formats

### Success Response
```json
{
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

## Common HTTP Status Codes
- 200: Success
- 201: Created successfully
- 400: Bad request / Invalid input
- 401: Unauthorized / Invalid token
- 403: Forbidden / Insufficient permissions
- 404: Resource not found
- 500: Server error

## Rate Limiting
- 100 requests per minute per IP
- Applies to all endpoints
- Status 429 when limit exceeded

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

## Security Features
- JWT-based authentication
- Password hashing
- OTP verification
- Role-based access control
- Rate limiting
- CORS enabled

## Testing Checklist

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
