# Admin Setup Guide

This guide explains how to set up and manage admin users for the Parttimejob application.

## Prerequisites

1. A Firebase project with Authentication and Firestore enabled
2. Node.js and npm/yarn installed
3. Environment variables configured in your `.env.local` file

## Environment Variables

Make sure your `.env.local` file includes the following Firebase configuration variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Admin credentials (optional - defaults will be used if not provided)
ADMIN_EMAIL=your-admin-email@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Admin User Name
```

## Creating an Admin User

We've included a script to create an admin user in your Firebase project. Run the following command:

```bash
# Install dependencies if not already done
npm install # or yarn

# Run the admin creation script
node scripts/create-admin-user.js
```

This script will:
1. Create a new user in Firebase Authentication with the specified email and password
2. Create a document in the Firestore `users` collection with the admin role
3. If the user already exists, it will update their role to admin

By default, if no environment variables are provided, the script will create an admin user with:
- Email: admin@Parttimejob.com
- Password: securePassword123!
- Name: System Administrator

## Admin Access Security

The admin panel uses multiple layers of security:

1. **Firebase Authentication**: Verifies user credentials
2. **Role-based Access Control**: Checks the user's role in Firestore
3. **Client-side Protection**: AdminGuard component prevents unauthorized access to admin routes
4. **Session Management**: Admin sessions are managed securely

## Managing Admin Users

To add more admin users, you can either:

1. Run the script again with different credentials
2. Update a user's role in Firestore manually:
   ```javascript
   db.collection('users').doc(userId).update({
     role: 'admin'
   });
   ```

## Troubleshooting

### Cannot Access Admin Dashboard

1. Ensure you're logged in with an admin account
2. Check that the user document in Firestore has `role: "admin"`
3. Clear your browser cache and cookies, then try again
4. Check browser console for error messages

### Authentication Errors

If you encounter authentication errors, make sure:
1. Your Firebase project has Email/Password authentication enabled
2. Your environment variables are correctly set
3. Your Firebase security rules allow admin operations

## Security Best Practices

1. Use strong, unique passwords for admin accounts
2. Enable Multi-Factor Authentication (MFA) for admin users
3. Regularly review admin access
4. Set appropriate Firestore security rules
5. Limit the number of admin users
6. Regularly update admin credentials 