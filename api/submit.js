export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    // 2. Extract data from your frontend form
    const { name, email, phone } = req.body;

    // 3. Grab the secure API key from your Vercel Environment Variables
    const GHL_API_KEY = process.env.GHL_API_KEY;

    if (!GHL_API_KEY) {
        return res.status(500).json({ success: false, message: 'Server Configuration Error: Missing API Key' });
    }

    try {
        // 4. Split the full name into First and Last for GHL
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // 5. Send POST request to GoHighLevel V1 API (Matches Sub-Account Keys)
        const ghlResponse = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GHL_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                tags: ['API_TEST', 'Agency_Lead']
            })
        });

        const data = await ghlResponse.json();

        // 6. Check if GHL rejected it
        if (!ghlResponse.ok) {
            throw new Error(data.message || data.error || 'Failed to sync with GoHighLevel');
        }

        // 7. Send success response back to your frontend
        return res.status(200).json({ success: true, message: 'Payload securely routed to pipeline.' });

    } catch (error) {
        console.error('Webhook Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
