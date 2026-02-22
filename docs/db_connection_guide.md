# MongoDB Compass Connection Guide

This guide explains how to connect your local MongoDB Compass to the PrepWise project.

## 1. Prerequisites
- **MongoDB Server**: Ensure MongoDB is installed and running on your machine.
- **MongoDB Compass**: Ensure you have the GUI installed.

## 2. Connection Steps

### Step 1: Open MongoDB Compass
Launch MongoDB Compass on your computer.

### Step 2: New Connection
1. Click on **"New Connection"**.
2. In the **Connection String** field, enter:
   ```
   mongodb://127.0.0.1:27017/prepwise
   ```
3. Click **"Connect"**.

### Step 3: Verify Database
- Once connected, you should see a database named `prepwise`.
- If it's your first time, the database might be empty. It will be created automatically when you run the backend for the first time.

## 3. Project Configuration
Your project is already configured to use this local database in the `backend/.env` file:

```env
MONGO_URI=mongodb://127.0.0.1:27017/prepwise
```

## 4. Storing Data (Users & Notes)
The project uses **Mongoose** to interact with the database. We have models defined for:
- **Students**: [Student.js](file:///d:/prepwise/backend/models/Student.js)
- **Teachers**: [Teacher.js](file:///d:/prepwise/backend/models/Teacher.js)
- **Notes**: [Note.js](file:///d:/prepwise/backend/models/Note.js)

### How to test:
1. **Start the backend**:
   ```bash
   cd backend
   npm run dev
   ```
2. **Register a User**: Use the frontend or Postman to create a student or teacher.
3. **Check Compass**: Refresh your `prepwise` database in Compass. You should see `students` or `teachers` collections with the new data.
4. **Upload a Note**: Use the Teacher Dashboard to upload a note and check the `notes` collection in Compass.
