# Quizcraze API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Register User
```http
POST /auth/register
```
**Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "teacher|student",
  "department": "string (required for students)",
  "prn": "string (12 digits, required for students)"
}
```

### Verify OTP
```http
POST /auth/verify-otp
```
**Body:**
```json
{
  "email": "string",
  "otp": "string (6 digits)"
}
```

### Login
```http
POST /auth/login
```
**Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
**Response:**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "string",
    "name": "string",
    "role": "string"
  }
}
```

### Refresh Token
```http
POST /auth/refresh-token
```
**Body:**
```json
{
  "refreshToken": "string"
}
```

## Class Management

### Create Class (Teacher)
```http
POST /classes
```
**Headers:**
```
Authorization: Bearer {accessToken}
```
**Body:**
```json
{
  "name": "string",
  "enrollmentKey": "string"
}
```

### Join Class (Student)
```http
POST /classes/join
```
**Headers:**
```
Authorization: Bearer {accessToken}
```
**Body:**
```json
{
  "enrollmentKey": "string"
}
```

### Get Classes
```http
GET /classes/teacher  # For teachers
GET /classes/student  # For students
```
**Headers:**
```
Authorization: Bearer {accessToken}
```

### Get Class Details (Teacher)
```http
GET /classes/details/:classId
```
**Headers:**
```
Authorization: Bearer {accessToken}
```

### Get Class Leaderboard
```http
GET /classes/:classId/leaderboard
```
**Headers:**
```
Authorization: Bearer {accessToken}
```

### Block/Unblock Student (Teacher)
```http
POST /classes/toggle-block
```
**Headers:**
```
Authorization: Bearer {accessToken}
```
**Body:**
```json
{
  "classId": "string",
  "studentId": "string",
  "action": "block|unblock"
}
```

## Quiz Management

### Create Quiz (Teacher)
```http
POST /quizzes
```
**Headers:**
```
Authorization: Bearer {accessToken}
```
**Body:**
```json
{
  "title": "string",
  "description": "string",
  "classIds": ["string"],
  "questions": [{
    "text": "string",
    "options": [{
      "text": "string",
      "isCorrect": "boolean"
    }]
  }],
  "timeLimit": "number",
  "scheduledFor": "date",
  "passingCriteria": "number (optional)"
}
```

### Get Quizzes
```http
GET /quizzes/teacher  # For teachers
GET /quizzes/student  # For students
```
**Headers:**
```
Authorization: Bearer {accessToken}
```

### Get Quiz Details
```http
GET /quizzes/:quizId
```
**Headers:**
```
Authorization: Bearer {accessToken}
```

### Submit Quiz (Student)
```http
POST /quizzes/:quizId/submit
```
**Headers:**
```
Authorization: Bearer {accessToken}
```
**Body:**
```json
{
  "answers": [{
    "selectedOptions": ["string"]
  }]
}
```

### Extend Quiz Time (Teacher)
```http
POST /quizzes/extend-time
```
**Headers:**
```
Authorization: Bearer {accessToken}
```
**Body:**
```json
{
  "quizId": "string",
  "studentId": "string",
  "extraTime": "number"
}
```

### Generate Quiz Report (Teacher)
```http
GET /quizzes/:quizId/report
```
**Headers:**
```
Authorization: Bearer {accessToken}
```

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

## Testing with Postman

1. Import the Postman collection from the `postman` directory
2. Set up environment variables:
   - `BASE_URL`: Your API base URL
   - `ACCESS_TOKEN`: JWT token received after login
3. Use the pre-request scripts to automatically set tokens
4. Follow the request sequence:
   - Register user
   - Verify OTP
   - Login
   - Use other endpoints

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
