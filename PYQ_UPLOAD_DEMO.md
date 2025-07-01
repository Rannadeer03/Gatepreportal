# PYQ Upload Functionality Demo

## 🎯 Overview
This guide demonstrates how teachers can upload PYQ (Previous Year Questions) with PDF files in the placement preparation system.

## 📋 How to Upload PYQ Questions

### Step 1: Access Teacher Placement Dashboard
1. Login as a teacher
2. Navigate to Teacher Main Dashboard
3. Click on "Placement Preparation" section
4. You'll be taken to the Teacher Placement Dashboard

### Step 2: Open Upload Modal
1. In the Teacher Placement Dashboard, click the green "Upload PYQ" button
2. A comprehensive upload modal will appear with the following sections:
   - 📋 Upload Instructions
   - Form fields for question details
   - File upload areas for questions and answers

### Step 3: Fill in Question Details
**Required Fields (marked with *):**
- **Title**: Enter a descriptive title for the question
- **Company Name**: e.g., "Google", "Microsoft", "Amazon"
- **Position**: e.g., "Software Engineer", "Data Scientist"

**Optional Fields:**
- **Description**: Detailed description of the question
- **Year**: The year the question appeared
- **Question Type**: Aptitude, Technical, Coding, Interview, or Other
- **Difficulty**: Easy, Medium, or Hard
- **Solution**: Text-based solution or answer

### Step 4: Upload Files
**Question File Upload:**
- Click on the dashed border area or the upload icon
- Select a PDF, DOC, DOCX, or TXT file (max 10MB)
- The file name and size will be displayed once selected
- This is optional but recommended

**Answer File Upload:**
- Similar process for answer files
- Upload solution files to help students verify their answers
- Also optional but helpful for students

### Step 5: Submit
1. Review all entered information
2. Click "Upload PYQ" button
3. The system will:
   - Validate all required fields
   - Check file sizes
   - Upload files to Supabase storage
   - Create the question record in the database
   - Show a success message
   - Close the modal and refresh the questions list

## 🎨 Enhanced Features

### Visual Improvements:
- **Drag & Drop Style**: Dashed border upload areas with hover effects
- **File Preview**: Shows selected file name and size
- **Loading State**: Upload button shows spinner during upload
- **Success Message**: Green notification appears after successful upload
- **Required Field Indicators**: Red asterisks (*) mark required fields
- **File Type Validation**: Only accepts PDF, DOC, DOCX, TXT files
- **File Size Validation**: Maximum 10MB per file

### User Experience:
- **Clear Instructions**: Blue info box with upload guidelines
- **Form Validation**: Prevents submission with missing required fields
- **Error Handling**: Shows specific error messages for validation failures
- **Responsive Design**: Works on all device sizes

## 📁 File Support

### Supported File Types:
- **PDF** (.pdf) - Most common for question papers
- **Microsoft Word** (.doc, .docx) - For formatted documents
- **Text Files** (.txt) - For simple text-based questions

### File Size Limits:
- Maximum 10MB per file
- Separate limits for question and answer files
- Automatic validation before upload

## 🔒 Security Features

### File Upload Security:
- File type validation on frontend and backend
- File size limits to prevent abuse
- Secure storage in Supabase with proper access controls
- Only teachers can upload files
- Students can only download files

### Data Validation:
- Required field validation
- Input sanitization
- SQL injection prevention through Supabase
- Row Level Security (RLS) policies

## 🎯 Student Access

Once uploaded, students can:
1. Navigate to Student Placement Dashboard
2. Click "Placement Resources"
3. Browse all available PYQ questions
4. Filter by company, type, or difficulty
5. View question details and download files
6. Access solutions and study materials

## 🚀 Testing the Upload

### Test Scenario:
1. **Create a test PDF**: Create a simple PDF with a sample question
2. **Upload as teacher**: Use the upload form to add the question
3. **Verify as student**: Switch to student account and check if the question appears
4. **Download test**: Verify file download functionality works

### Sample Test Data:
```
Title: "Google Software Engineer Coding Question 2023"
Company: "Google"
Position: "Software Engineer"
Year: 2023
Type: "Coding"
Difficulty: "Medium"
Description: "Implement a function to find the longest palindromic substring"
```

## 🔧 Technical Implementation

### Frontend Components:
- **Upload Modal**: React component with form validation
- **File Input**: Custom styled file upload areas
- **Progress Indicator**: Loading states and success messages
- **Form Validation**: Client-side validation with error messages

### Backend Integration:
- **Supabase Storage**: File upload to `pyq-files` bucket
- **Database**: Question metadata stored in `pyq_questions` table
- **Security**: RLS policies and file access controls
- **Error Handling**: Comprehensive error handling and user feedback

This implementation provides a complete, user-friendly solution for teachers to upload PYQ questions with PDF files, making placement preparation resources easily accessible to students. 