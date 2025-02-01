export default async (req,res) => {
  try {
    const { videoUrl } = req.body.input; // Get video URL from the request
    // Call n8n webhook securely
    const response = await fetch("https://n8n-dev.subspace.money/webhook/ytube", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl: videoUrl }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch summary');
    }

    const data = await response.json();

    if(data && data.title && data.summary){
        return res.json({
          summary: data.summary,
          title: data.title,
          thumbnails : data.thumbnails
        });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
