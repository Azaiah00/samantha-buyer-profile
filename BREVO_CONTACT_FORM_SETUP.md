# Complete Guide: Setting Up Contact Form in Brevo

This guide walks you through everything you need to set up and manage your contact form integration with Brevo.

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [API Key Configuration](#api-key-configuration)
3. [Custom Attributes Setup](#custom-attributes-setup)
4. [Viewing Form Submissions](#viewing-form-submissions)
5. [Setting Up Lists](#setting-up-lists)
6. [Email Automation (Optional)](#email-automation-optional)
7. [Testing the Integration](#testing-the-integration)
8. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Step 1: Create Your Brevo Account (if you don't have one)

1. Go to https://app.brevo.com/
2. Click **"Sign up free"**
3. Fill in your information and verify your email
4. Complete the onboarding process

### Step 2: Verify Your Sender Email

1. **Go to Settings**:
   - Click your profile icon (top right)
   - Select **"SMTP & API"**
2. **Add a Sender**:
   - Click **"Senders"** tab
   - Click **"Add a sender"**
   - Enter your email address (e.g., `fredsaleshomes@gmail.com`)
   - Click **"Save"**
3. **Verify Your Email**:
   - Check your email inbox for a verification email from Brevo
   - Click the verification link
   - Your sender is now verified ✅

**Note**: You can also use Brevo's default sender `noreply@sendinblue.com`, but verifying your own email improves deliverability.

---

## API Key Configuration

### Step 1: Generate Your API Key

1. **Navigate to API Settings**:
   - In Brevo dashboard, click your profile icon (top right)
   - Select **"SMTP & API"**
2. **Create API Key**:
   - Scroll down to **"API Keys"** section
   - Click **"Generate a new API key"**
   - Give it a name: **"Contact Form API"**
   - Click **"Generate"**
   - **⚠️ IMPORTANT**: Copy the API key immediately - you won't be able to see it again!
   - It will look like: `xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxx`

### Step 2: Add API Key to Your Project

1. **Create `.env` file** in your project root directory:
   ```
   /Users/fredsales/Desktop/Buyer Consultation/.env
   ```

2. **Add your API key** to the `.env` file:
   ```
   VITE_BREVO_API_KEY=xkeysib-your-actual-api-key-here
   ```

3. **Save the file**

4. **Restart your development server**:
   ```bash
   # Stop the server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

---

## Custom Attributes Setup

The contact form automatically saves these fields to Brevo. You can view and manage them:

### Step 1: View Custom Attributes

1. **Go to Contacts**:
   - In Brevo dashboard, click **"Contacts"** in the left menu
   - Click **"Attributes"** tab

2. **You'll see these attributes** (created automatically when contacts are added):

   **Standard Attributes (Built-in):**
   - `FIRSTNAME` - Contact's first name (split from full name)
   - `LASTNAME` - Contact's last name (split from full name)
   - `FULLNAME` - Contact's full name
   - `EMAIL` - Contact's email (primary identifier)
   - `PHONE` - Contact's phone number
   - `SMS` - Phone number for SMS (same as PHONE)

   **Custom Attributes (Created Automatically):**
   - `TIMELINE` - The timeline selected (e.g., "1-3 Months", "ASAP - Ready to buy now")
   - `TIMELINE_VALUE` - Raw timeline value (e.g., "1-3", "asap") for filtering
   - `SOURCE` - Always set to "Contact Form"
   - `SOURCE_URL` - Set to "Website Contact Form"
   - `CONTACT_DATE` - Date when they submitted the form (ISO format)
   - `CONTACT_METHOD` - Set to "Website Form"
   - `FORM_SUBMITTED` - Always set to "Yes"
   - `SUBMISSION_DATE` - Date when form was submitted (ISO format)

### Step 2: Customize Attributes (Optional)

1. **Edit Attribute Properties**:
   - Click on any attribute name
   - You can change:
     - **Display Name**: How it appears in your contact list
     - **Type**: Text, Number, Date, etc.
     - **Category**: Contact, Transactional, etc.

2. **Recommended Settings**:
   - `TIMELINE`: Type = **Text**
   - `TIMELINE_VALUE`: Type = **Text**
   - `SOURCE`: Type = **Text**
   - `SOURCE_URL`: Type = **Text**
   - `CONTACT_DATE`: Type = **Date**
   - `SUBMISSION_DATE`: Type = **Date**
   - `CONTACT_METHOD`: Type = **Text**
   - `FORM_SUBMITTED`: Type = **Text**

### Step 3: Understanding Timeline Values

The form saves timeline in two formats:
- **TIMELINE**: Human-readable format (e.g., "1-3 Months", "ASAP - Ready to buy now")
- **TIMELINE_VALUE**: Raw value for filtering (e.g., "1-3", "asap", "browsing")

**Timeline Options:**
- `asap` → "ASAP - Ready to buy now"
- `1-3` → "1-3 Months"
- `3-6` → "3-6 Months"
- `6-12` → "6-12 Months"
- `browsing` → "Just Browsing - Exploring options"

---

## Viewing Form Submissions

### Step 1: View All Contacts

1. **Go to Contacts**:
   - Click **"Contacts"** in the left menu
   - Click **"All contacts"**

2. **You'll see**:
   - All contacts who submitted the form
   - Their email, name, phone, and custom attributes
   - Date they were added

### Step 2: Filter Contacts from Form

1. **Filter by Source**:
   - In the contacts list, click the **filter icon**
   - Select **"SOURCE"** attribute
   - Choose **"Contact Form"**
   - Click **"Apply"**

2. **Now you'll see only contacts from your form**

### Step 3: View Contact Details

1. **Click on any contact** to see:
   - Full contact information
   - All custom attributes (timeline, source, contact date)
   - Email history
   - Activity timeline

---

## Setting Up Lists

### Step 1: Create a List for Form Submissions

1. **Go to Lists**:
   - Click **"Contacts"** → **"Lists"**
   - Click **"Create a list"**

2. **Name Your List**:
   - Name: **"Contact Form Submissions"**
   - Description: "All contacts from website contact form"
   - Click **"Create"**

### Step 2: Automatically Add Contacts to List (Optional)

You can modify the code to automatically add contacts to this list. The code currently doesn't do this, but you can add it by:

1. **Get your List ID**:
   - Go to **"Contacts"** → **"Lists"**
   - Click on your list
   - The List ID is in the URL: `https://app.brevo.com/contacts/list/XXXXX`
   - Copy the number (XXXXX)

2. **Update the code** (optional - we can do this if you want):
   - Add the list ID to the contact creation payload
   - Contacts will automatically be added to the list

### Step 3: Manual List Management

1. **Add contacts to list manually**:
   - Go to **"Contacts"** → **"All contacts"**
   - Select contacts (checkboxes)
   - Click **"Add to list"**
   - Choose your list

2. **Remove contacts from list**:
   - Go to your list
   - Select contacts
   - Click **"Remove from list"**

---

## Email Automation (Optional)

### Step 1: Create a Welcome Email Sequence

1. **Go to Automation**:
   - Click **"Automation"** in the left menu
   - Click **"Create a workflow"**

2. **Choose Trigger**:
   - Select **"Contact added to list"**
   - Choose your "Contact Form Submissions" list
   - Click **"Next"**

3. **Add Action**:
   - Click **"Send an email"**
   - Choose or create an email template
   - Click **"Next"**

4. **Configure Email**:
   - Subject: "Thank you for contacting Frederick Sales!"
   - Personalize with contact attributes:
     - `{{contact.FIRSTNAME}}` - Their first name
     - `{{contact.TIMELINE}}` - Their timeline
   - Click **"Save"**

5. **Activate the workflow**

### Step 2: Create Follow-up Sequences

You can create different workflows based on timeline:
- **"Buying in 0-3 months"** → Send immediate follow-up
- **"Buying in 3-6 months"** → Send monthly updates
- **"Buying in 6+ months"** → Send quarterly newsletters

---

## Testing the Integration

### Step 1: Test Form Submission

1. **Fill out your contact form** on your website:
   - Enter your name
   - Enter your email
   - Enter a phone number
   - Select a timeline
   - Click **"Submit"**

2. **Check Your Email**:
   - You should receive an email notification at `fredsaleshomes@gmail.com`
   - Subject: "New Contact Form Submission"

3. **Check Brevo Dashboard**:
   - Go to **"Contacts"** → **"All contacts"**
   - Look for your test contact
   - Verify all information is correct:
     - ✅ Name
     - ✅ Email
     - ✅ Phone
     - ✅ Timeline attribute
     - ✅ Source = "Contact Form"
     - ✅ Contact date

### Step 2: Verify Email Delivery

1. **Check Transactional Emails**:
   - Go to **"Transactional"** → **"Emails"**
   - You should see your test email
   - Status should be **"Delivered"**

2. **If email failed**:
   - Check the error message
   - Verify your sender email is verified
   - Check API key is correct

### Step 3: Test Contact Creation

1. **Submit form again** with the same email:
   - The contact should be **updated**, not duplicated
   - Check that the timeline/phone is updated

2. **Submit form with different email**:
   - A new contact should be created
   - Verify all fields are saved

---

## Troubleshooting

### Problem: Contacts Not Appearing in Brevo

**Solutions:**
1. **Check API Key**:
   - Verify `.env` file has correct API key
   - Restart development server after adding API key
   - Check browser console for errors

2. **Check Brevo Dashboard**:
   - Go to **"Transactional"** → **"Emails"**
   - Look for any error messages
   - Check API usage limits

3. **Check Code**:
   - Open browser developer tools (F12)
   - Go to **Console** tab
   - Look for error messages
   - Check **Network** tab for API calls

### Problem: Email Not Received

**Solutions:**
1. **Check Spam Folder**:
   - Sometimes emails go to spam initially

2. **Verify Sender Email**:
   - Go to **"SMTP & API"** → **"Senders"**
   - Ensure sender is verified (green checkmark)

3. **Check Brevo Dashboard**:
   - Go to **"Transactional"** → **"Emails"**
   - Check email status
   - Look for bounce/error messages

### Problem: Custom Attributes Not Showing

**Solutions:**
1. **Wait a moment**:
   - Attributes are created automatically when first contact is added
   - Refresh the page

2. **Check Attribute Names**:
   - Go to **"Contacts"** → **"Attributes"**
   - Verify attributes exist:
     - `TIMELINE`
     - `SOURCE`
     - `CONTACT_DATE`

3. **Manually Create Attributes** (if needed):
   - Click **"Create an attribute"**
   - Name: `TIMELINE`, Type: **Text**
   - Name: `SOURCE`, Type: **Text**
   - Name: `CONTACT_DATE`, Type: **Date**

### Problem: API Errors

**Common Error Codes:**
- **401 Unauthorized**: API key is incorrect or invalid
- **400 Bad Request**: Missing required fields or invalid data
- **403 Forbidden**: API key doesn't have required permissions
- **429 Too Many Requests**: Rate limit exceeded

**Solutions:**
1. **Verify API Key**:
   - Check `.env` file
   - Ensure no extra spaces or quotes
   - Regenerate API key if needed

2. **Check API Permissions**:
   - Go to **"SMTP & API"** → **"API Keys"**
   - Ensure key has **"Send emails"** and **"Manage contacts"** permissions

3. **Check Rate Limits**:
   - Free plan: 300 emails/day
   - Check your usage in dashboard

---

## Quick Reference

### Where to Find Things in Brevo:

- **API Key**: Settings → SMTP & API → API Keys
- **Contacts**: Contacts → All contacts
- **Attributes**: Contacts → Attributes
- **Lists**: Contacts → Lists
- **Transactional Emails**: Transactional → Emails
- **Senders**: Settings → SMTP & API → Senders
- **Automation**: Automation → Workflows

### Contact Form Data Saved:

**Standard Fields:**
- ✅ Email (primary identifier)
- ✅ First Name (split from full name)
- ✅ Last Name (split from full name)
- ✅ Full Name (complete name)
- ✅ Phone Number (saved to both PHONE and SMS attributes)

**Custom Attributes:**
- ✅ Timeline (human-readable: "1-3 Months", "ASAP - Ready to buy now", etc.)
- ✅ Timeline Value (raw value: "1-3", "asap", "browsing", etc. - for filtering)
- ✅ Source: "Contact Form"
- ✅ Source URL: "Website Contact Form"
- ✅ Contact Date (ISO format timestamp)
- ✅ Contact Method: "Website Form"
- ✅ Form Submitted: "Yes"
- ✅ Submission Date (ISO format timestamp)

---

## Next Steps

1. ✅ Set up your API key
2. ✅ Test the form submission
3. ✅ Verify contacts are being created
4. ⬜ Create lists for organization
5. ⬜ Set up email automation workflows
6. ⬜ Create email templates for follow-ups

---

## Need Help?

- **Brevo Documentation**: https://developers.brevo.com/
- **Brevo Support**: https://help.brevo.com/
- **API Reference**: https://developers.brevo.com/reference

---

**Last Updated**: January 2025

