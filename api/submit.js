export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    const { name, email, phone } = req.body;
    
    // 1. Grab the secure API key from Vercel
    const GHL_API_KEY = process.env.GHL_API_KEY;
    
    // 2. Your specific GoHighLevel Location ID (Wrapped in quotes!)
    const GHL_LOCATION_ID = "RjRdO55z7LzIW2SEwbNW";

    if (!GHL_API_KEY) {
        return res.status(500).json({ success: false, message: 'Server Configuration Error: Missing API Key' });
    }

    try {
        const nameParts = name.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // 3. Send payload to GHL
        const ghlResponse = await fetch('https://services.leadconnectorhq.com/contacts/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GHL_API_KEY}`,
                'Version': '2021-07-28',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                locationId: GHL_LOCATION_ID, 
                tags: ['API_TEST', 'Agency_Lead']
            })
        });

        const data = await ghlResponse.json();

        if (!ghlResponse.ok) {
            throw new Error(data.message || 'Failed to sync with GoHighLevel');
        }

        return res.status(200).json({ success: true, message: 'Payload securely routed to pipeline.' });

    } catch (error) {
        console.error('Webhook Error:', error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
