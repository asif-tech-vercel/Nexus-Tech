export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    // 2. Extract data from your frontend form
    const { name, email, phone } = req.body;

    // 3. Grab the secure API key from your Vercel Environment Variables (.env)
    const GHL_API_KEY = process.env.GHL_API_KEY;

    if (!GHL_API_KEY) {
        return res.status(500).json({ success: false, message: 'Server Configuration Error: Missing API Key' });
    }

    try {
        // 4. Split the full name into First and Last for GHL
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ');

        // 5. Send the secure POST request directly to GoHighLevel V2 API
        const ghlResponse = await fetch('https://services.leadconnectorhq.com/contacts/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GHL_API_KEY}`,
                'Version': '2021-07-28', // Required by GHL V2 API
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                tags: ['API_TEST', 'Agency_Lead'] // Automatically tags them in the CRM
            })
        });

        const data = await ghlResponse.json();

        if (!ghlResponse.ok) {
            throw new Error(data.message || 'Failed to sync with GoHighLevel');
        }

        // 6. Send success response back to your frontend
        return res.status(200).json({ success: true, message: 'Payload securely routed to pipeline.' });

    } catch (error) {
        console.error('Webhook Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}