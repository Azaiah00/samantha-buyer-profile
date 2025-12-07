# Brevo (Sendinblue) Integration Guide

This guide will help you connect your Brevo account with the contact form.

## Step 1: Get Your Brevo API Key

1. **Log in to your Brevo account**: https://app.brevo.com/
2. **Navigate to Settings**:
   - Click on your profile icon (top right)
   - Select **"SMTP & API"** from the menu
3. **Get your API Key**:
   - Scroll down to **"API Keys"** section
   - If you don't have an API key, click **"Generate a new API key"**
   - Give it a name (e.g., "Contact Form API")
   - **Copy the API key** - you'll need this for the code
   - ⚠️ **Important**: Copy it now - you won't be able to see it again!

## Step 2: Create a Transactional Email Template (Optional but Recommended)

1. **Go to Transactional Email Templates**:
   - In Brevo dashboard, go to **"Transactional"** → **"Templates"**
   - Click **"Create a new template"**
2. **Create your template**:
   - Choose **"Blank template"**
   - Name it: "Contact Form Submission"
   - Add your email content using these variables:
     - `{{params.name}}` - Contact's name
     - `{{params.email}}` - Contact's email
     - `{{params.phone}}` - Contact's phone
     - `{{params.timeline}}` - Contact's timeline
3. **Example Template Content**:
   ```
   New Contact Form Submission
   
   Name: {{params.name}}
   Email: {{params.email}}
   Phone: {{params.phone}}
   Timeline: {{params.timeline}}
   ```
4. **Save the template** and note the **Template ID** (you'll see it in the URL or template settings)

## Step 2.5: Set Up Custom Attributes for Contact Data (Recommended)

The form automatically saves all form data to Brevo contacts. To ensure all fields are captured properly:

1. **Go to Contacts**:
   - In Brevo dashboard, go to **"Contacts"** → **"Attributes"**
2. **Verify/Create Custom Attributes**:
   The form uses these attributes:
   - `TIMELINE` - Contact's timeline (already created automatically)
   - `SOURCE` - Where the contact came from (already created automatically)
   - `CONTACT_DATE` - Date of contact (already created automatically)
   
   **Note**: Brevo automatically creates these attributes when the contact is created, so you don't need to manually create them. However, you can customize them:
   - Click on an attribute to edit its name or type
   - Set `TIMELINE` as a text attribute
   - Set `SOURCE` as a text attribute
   - Set `CONTACT_DATE` as a date attribute

3. **Standard Attributes Used**:
   - `FIRSTNAME` - Contact's first name (built-in)
   - `LASTNAME` - Contact's last name (built-in)
   - `SMS` - Phone number for SMS (built-in)
   - `PHONE` - Phone number (built-in)

**All form submissions will automatically:**
- Create a new contact in your Brevo CRM
- Update existing contacts if the email already exists
- Save all form fields (name, email, phone, timeline) as contact attributes
- Tag the contact with source information

## Step 3: Update Your Code

The code has been updated to use Brevo's API. You just need to:

1. **Add your Brevo API key** to the code (see Step 4)
2. **Add your email address** where you want to receive form submissions
3. **Optionally add your template ID** if you created a template

## Step 4: Configure the Code

In `src/App.jsx`, find the Brevo configuration section and update:

```javascript
const BREVO_API_KEY = 'YOUR_BREVO_API_KEY_HERE' // Paste your API key from Step 1
const BREVO_SENDER_EMAIL = 'noreply@yourdomain.com' // Your verified sender email in Brevo
const BREVO_RECIPIENT_EMAIL = 'fred@kerishullteam.com' // Your email to receive submissions
const BREVO_TEMPLATE_ID = null // Optional: Your template ID from Step 2, or null to use default
```

### Important Notes:

- **Sender Email**: Must be a verified sender in your Brevo account
  - Go to **"SMTP & API"** → **"Senders"** to verify your email
  - Or use Brevo's default: `noreply@sendinblue.com` (but this may have deliverability issues)
- **Template ID**: If you created a template, use its ID. If not, leave as `null` and the code will send a plain text email.

## Step 5: Test the Integration

1. **Fill out the contact form** on your website
2. **Submit the form**
3. **Check your email** - you should receive the form submission
4. **Check Brevo dashboard** - go to **"Transactional"** → **"Emails"** to see sent emails

## Troubleshooting

### Email not received?

1. **Check Brevo Dashboard**:
   - Go to **"Transactional"** → **"Emails"**
   - Check if the email was sent successfully
   - Look for any error messages

2. **Check API Key**:
   - Make sure your API key is correct
   - Ensure the API key has the right permissions (should have "Send emails" permission)

3. **Check Sender Email**:
   - The sender email must be verified in Brevo
   - Go to **"SMTP & API"** → **"Senders"** to verify

4. **Check Browser Console**:
   - Open browser developer tools (F12)
   - Check the Console tab for any error messages
   - Look for API errors from Brevo

### Common Errors:

- **401 Unauthorized**: Your API key is incorrect or invalid
- **400 Bad Request**: Check that all required fields are being sent
- **403 Forbidden**: Your API key doesn't have the right permissions

## Brevo API Documentation

For more details, see Brevo's official documentation:
- **API Reference**: https://developers.brevo.com/reference/sendtransacemail
- **Getting Started**: https://developers.brevo.com/getting-started

## Security Note

⚠️ **Important**: Never commit your API key to public repositories!

The code uses environment variables. For production:
1. Create a `.env` file in your project root
2. Add: `VITE_BREVO_API_KEY=your_api_key_here`
3. Update the code to use: `import.meta.env.VITE_BREVO_API_KEY`
4. Add `.env` to your `.gitignore` file

