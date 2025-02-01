export default async (req,res) => {
  try {
    console.log('Request',req.body);
    const { videoUrl } = req.body.input; // Get video URL from the request

    // Call n8n webhook securely
    const response = await fetch(process.env.REACT_APP_N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch summary');
    }

    const data = await response.json();

    return res.json({
      summary: data.summary,
      title: data.title,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
