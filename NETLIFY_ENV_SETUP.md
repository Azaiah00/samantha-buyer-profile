# Setting Up Brevo API Key in Netlify

The Brevo API key needs to be configured in Netlify's environment variables for the form to work on your deployed site.

## Step-by-Step Instructions

### Step 1: Get Your Brevo API Key

1. Log in to Brevo: https://app.brevo.com/
2. Go to **Settings** → **SMTP & API**
3. Scroll to **"API Keys"** section
4. Copy your API key (it starts with `xkeysib-`)

Your API key should look like:
```
xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxx
```

### Step 2: Add Environment Variable in Netlify

1. **Go to Netlify Dashboard**:
   - Visit https://app.netlify.com/
   - Log in to your account

2. **Select Your Site**:
   - Click on your site: `homebuyerinformation` (or your site name)

3. **Go to Site Settings**:
   - Click **"Site settings"** in the top navigation
   - Or click the **"Configuration"** button on your site overview page

4. **Open Environment Variables**:
   - In the left sidebar, click **"Environment variables"**
   - Or go to: **Site settings** → **Build & deploy** → **Environment**

5. **Add New Variable**:
   - Click **"Add a variable"** or **"Add variable"** button
   - **Key**: `VITE_BREVO_API_KEY`
   - **Value**: Paste your Brevo API key (the one you copied in Step 1)
   - **Scopes**: Select **"All scopes"** (or at least "Production" and "Deploy previews")
   - Click **"Save"** or **"Create variable"**

### Step 3: Redeploy Your Site

After adding the environment variable, you need to trigger a new deployment:

1. **Option 1: Trigger Manual Deploy**
   - Go to **"Deploys"** tab in your Netlify dashboard
   - Click **"Trigger deploy"** → **"Clear cache and deploy site"**

2. **Option 2: Push a New Commit**
   - Make a small change to any file
   - Commit and push to trigger automatic deployment

3. **Option 3: Wait for Auto-Deploy**
   - If you just pushed code, Netlify will automatically rebuild
   - The new environment variable will be available in the new build

### Step 4: Verify It's Working

1. **Wait for deployment to complete** (usually 1-2 minutes)
2. **Visit your site**: https://homebuyerinformation.netlify.app
3. **Submit the contact form**
4. **Check**:
   - ✅ No error pop-up should appear
   - ✅ You should receive an email at `fredsaleshomes@gmail.com`
   - ✅ Contact should appear in your Brevo CRM

## Troubleshooting

### Still Getting "Form submission is not configured" Error?

1. **Check Environment Variable Name**:
   - Must be exactly: `VITE_BREVO_API_KEY`
   - Case-sensitive!
   - No spaces or extra characters

2. **Verify Variable is Set**:
   - Go to Netlify → Site settings → Environment variables
   - Make sure `VITE_BREVO_API_KEY` is listed
   - Check that the value is correct (starts with `xkeysib-`)

3. **Check Variable Scopes**:
   - Make sure it's set for "Production" scope
   - Or "All scopes" to work everywhere

4. **Redeploy After Adding Variable**:
   - Environment variables are only available in NEW builds
   - You MUST trigger a new deployment after adding the variable

5. **Check Browser Console**:
   - Open Developer Tools (F12)
   - Go to Console tab
   - Look for the error message
   - Should say: "❌ Brevo API key is not configured" if it's still missing

### API Key Not Working?

1. **Verify API Key is Valid**:
   - Go to Brevo dashboard
   - Check that your API key is still active
   - Regenerate if needed

2. **Check API Key Permissions**:
   - In Brevo → Settings → SMTP & API → API Keys
   - Make sure your key has:
     - ✅ "Send emails" permission
     - ✅ "Manage contacts" permission

3. **Test API Key**:
   - You can test the API key using Brevo's API documentation
   - Or check Brevo dashboard → Transactional → Emails to see if emails are being sent

## Security Notes

⚠️ **Important**: 
- Never commit your API key to Git
- The `.env` file is for local development only
- Environment variables in Netlify are secure and not exposed in the code
- Only people with access to your Netlify account can see environment variables

## Quick Reference

- **Environment Variable Name**: `VITE_BREVO_API_KEY`
- **Where to Set**: Netlify Dashboard → Site Settings → Environment Variables
- **After Setting**: Must trigger a new deployment
- **Your Brevo API Key**: Get it from Brevo Dashboard → Settings → SMTP & API → API Keys

