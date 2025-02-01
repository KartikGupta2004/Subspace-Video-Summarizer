export default async (req,res) => {
  try {
    const { videoUrl } = req.body.input; // Get video URL from the request
    console.log('Webhook' , process.env.REACT_APP_N8N_WEBHOOK_URL)
    // Call n8n webhook securely
    const response = await fetch("https://n8n-dev.subspace.money/webhook-test/ytube", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl: videoUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch summary');
    }

    const data = await response.json();

    return res.json({
        summary: data.summary,
        title: data.title,
        thumbnails: data.thumbnails,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
