# Social Login Setup Guide

This guide walks through the real Google login setup for this project one step at a time.

## What this project currently has

- The Google button is wired in the UI.
- The app has code hooks for Google sign-in.
- Real login will only work after you add provider credentials and run the app from `http://localhost` or a hosted domain.

## Step 1. Run the app from a local web server

OAuth login will not work from `file://` URLs.

You need to open the app from a local server such as:

- `http://localhost:3000`
- `http://localhost:5173`
- or any deployed HTTPS domain

If you do not have a local server yet, the easiest option is to use VS Code Live Server or a simple static server.

## Step 2. Create Google login credentials

In Google Cloud Console:

1. If you do not have a project yet, click **Create Project** and make one now.
2. If you already have one, select it from the project picker.
3. Enable the Google Identity Services / OAuth setup.
4. Create an OAuth client ID.
5. Set the authorized JavaScript origin to your local server address.
6. Copy the client ID.

## Step 3. Put the Google credential into the app

Update the social auth config in `js/auth.js`:

- Google client ID

## Step 4. Test Google sign-in

1. Open the app from the local server.
2. Click the Google button.
3. Complete sign-in.
4. Confirm the app creates a session and moves forward.

## Important note

If you want this to work for real users, the app must be deployed to HTTPS and the provider settings must match that domain.

## Adding Apple later

Yes, Apple can be added later. The clean way is to reintroduce the Apple button, load the Apple SDK, and add the Apple client ID and redirect URI back into `js/auth.js`.
