export default async (req,res) => {
  try {
    const { videoUrl } = req.body.input; // Get video URL from the request
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

    if (data && data.summary && data.title) {
        return res.json({
          summary: data.summary,
          title: data.title,
        });
      } else {
        // Handle case where n8n does not return the expected data
        throw new Error('Invalid response from n8n');
      }
  } catch (error) {
    return res.status(500).json({
        error: error.message,
        details: error.stack,
      });
  }
};
