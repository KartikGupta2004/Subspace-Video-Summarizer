// n8nService.js
export const fetchVideoMetadata = async (videoUrl) => {
    try {
      const response = await fetch(process.env.REACT_APP_N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });
  
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error response from server:", errorDetails);
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (err) {
      console.error("Error fetching video metadata:", err);
      throw new Error("Failed to fetch video data. Please try again.");
    }
  };
  
  export const fetchResummarizedData = async (videoUrl) => {
    try {
      const response = await fetch(process.env.REACT_APP_N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });
  
      if (!response.ok) {
        const errorDetails = await response.json();
        console.error("Error response from server:", errorDetails);
        throw new Error(`Failed to resummarize: ${response.statusText}`);
      }
  
      return await response.json();
    } catch (err) {
      console.error("Error during resummarization:", err);
      throw new Error("Failed to resummarize the summary.");
    }
  };
  