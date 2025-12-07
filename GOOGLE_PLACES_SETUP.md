# Google Places API Setup Guide

## Why This Feature is Important

The property address autocomplete feature allows users to enter a full property address, and the system automatically:
- Looks up the exact tax rate for that specific address
- Provides accurate property tax calculations
- Makes the mortgage calculator as accurate as possible

## Step 1: Get a Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click "Enable"

## Step 2: Create API Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key
4. (Recommended) Restrict the API key:
   - Click on the API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Choose "Places API"
   - Under "Application restrictions", you can restrict by HTTP referrer (your website domain)

## Step 3: Add API Key to Your Website

1. Open `index.html`
2. Find this line:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_PLACES_API_KEY&libraries=places&callback=initGooglePlaces" async defer></script>
   ```
3. Replace `YOUR_GOOGLE_PLACES_API_KEY` with your actual API key

## Step 4: Test

1. Start your development server: `npm run dev`
2. Navigate to the Mortgage Calculator section
3. Start typing an address in the "Property Address" field
4. You should see autocomplete suggestions appear
5. Select an address and verify the tax rate is calculated correctly

## Pricing

Google Places API has a free tier:
- **$200 free credit per month** (covers most small to medium websites)
- After free credit: $17 per 1,000 requests for Autocomplete
- For a typical website, this should be well within the free tier

## Security Note

**Important:** Never commit your API key to version control if it's unrestricted. Consider:
- Using environment variables
- Restricting the API key to your domain only
- Using a separate API key for development vs production

## Troubleshooting

**If autocomplete doesn't work:**
1. Check browser console for errors
2. Verify the API key is correct in `index.html`
3. Make sure Places API is enabled in Google Cloud Console
4. Check that your API key has the correct restrictions (or no restrictions for testing)

**If you see "This API project is not authorized to use this API":**
- Go to Google Cloud Console
- Enable the Places API for your project

