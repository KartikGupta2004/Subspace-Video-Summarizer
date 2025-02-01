import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import showdown from "showdown"; // Import showdown for markdown conversion
import { Download, Save, RefreshCcw } from "lucide-react"; // Import the Download icon
import { useUserId } from '@nhost/react';
import { toast } from 'react-hot-toast';
import { gql, useMutation } from '@apollo/client';

const getHighestResolutionThumbnail = (thumbnails) =>
  thumbnails?.reduce((highest, current) =>
    current.width * current.height > highest.width * highest.height ? current : highest
  );

const INSERT_SUMMARY_MUTATION = gql`
  mutation InsertSummary($object: summaries_insert_input!) {
    insert_summaries_one(object: $object) {
      id
    }
  }
`;

const GENERATE_SUMMARY_MUTATION = gql`
  mutation GenerateSummary($videoUrl: String!) {
    generateSummary(videoUrl: $videoUrl) {
      summary
      title
      thumbnails {
      url
      width
      height
    }
    }
  }
`;

export function Summary() {
  const userId = useUserId();
  const location = useLocation();
  const navigate = useNavigate();
  const videoUrl = location.state?.videoUrl;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metadata, setMetadata] = useState(null); // To store fetched video metadata
  const [title, setTitle] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [summary, setSummary] = useState(""); // To store the AI-generated summary
  const [isResummarizing, setIsResummarizing] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const converter = new showdown.Converter(); // Initialize showdown converter

  useEffect(() => {
    if (metadata?.thumbnails) {
      const highestThumbnail = getHighestResolutionThumbnail(metadata.thumbnails);
      setThumbnail(highestThumbnail);
    }
  }, [metadata]);

  // Apollo mutation hook
  const [insertSummary] = useMutation(INSERT_SUMMARY_MUTATION);

  const [generateSummary] = useMutation(GENERATE_SUMMARY_MUTATION);

  const handleSave = async () => {
    if (!title || !summary || !ytUrl) {
      toast.error("Cannot save. Some required fields are missing.");
      return;
    }

    try {
      const { data } = await insertSummary({
        variables: {
          object: {
            title,
            summary,
            video_url: ytUrl,
            thumbnail_url: thumbnail.url,
            user_id: userId,
          },
        },
      });

      if (data) {
        toast.success("Summary saved successfully!");
      }
    } catch (err) {
      toast.error("Failed to save summary. Please try again.");
      console.error("GraphQL error:", err);
    }
  };
  
  const handleResummarize = async () => {
    setIsResummarizing(true);
    try {
      // const response = await fetch(process.env.REACT_APP_N8N_WEBHOOK_URL, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ videoUrl: ytUrl }),
      // });

      // if (!response.ok) {
      //   const errorDetails = await response.json();
      //   console.error("Error response from server:", errorDetails);
      //   throw new Error(`Failed to fetch data: ${response.statusText}`);
      // }
      // const data = await response.json();

      const { data } = await generateSummary({ variables: { videoUrl: ytUrl } });
      
      // const newSummary = data.summary;

      // setSummary(newSummary); // Update the local state with the new summary
      setSummary(data.generateSummary.summary);
    setTitle(data.generateSummary.title);

      toast.success("Summary Resummarized!");

      // Save the updated summary to the database
      await insertSummary({
        variables: {
          object: {
            title,
            summary,
            video_url: ytUrl,
            thumbnail_url: thumbnail?.url,
            user_id: userId,
          },
        },
      });
    } catch (error) {
      toast.error("Failed to resummarize the summary.");
      console.error("Error during resummarization:", error);
    } finally {
      setIsResummarizing(false);
    }
  };
  

  const handleDownload = () => {
    const blob = new Blob([summary], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "summary.txt";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    console.log("videoUrl:", videoUrl);

    if (!videoUrl) {
      navigate("/"); // Redirect if no YouTube URL was provided
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        // const response = await fetch(process.env.REACT_APP_N8N_WEBHOOK_URL, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify({ videoUrl }),
        // });

        // if (!response.ok) {
        //   const errorDetails = await response.json();
        //   console.error("Error response from server:", errorDetails);
        //   throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        // }

        // const data = await response.json();
        const { data } = await generateSummary({ variables: { videoUrl } });

        console.log("Fetched data:", data);
        // const data = await fetchVideoMetadata(videoUrl);
        setMetadata(data.generateSummary);
        // setSummary(data.summary);
        // setTitle(data.title);
        setSummary(data.generateSummary.summary);
        setTitle(data.generateSummary.title);
        setYtUrl(videoUrl);
        setError("");
      } catch (err) {
        toast.error("Failed to fetch video data. Please try again.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    if(!metadata && videoUrl)
    fetchData();
  }, [videoUrl, navigate]);

  if (loading) return <div className="flex justify-center items-center m-auto">Summarizing... <Spinner className="ml-2" /></div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Video Summary</h1>
        <p className="text-gray-500">AI-powered summary of your video content</p>
      </div>

      {metadata && (
        <div className="bg-gray-100 rounded-lg shadow-xl p-6 mb-8">
          <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
            <img src={thumbnail?.url} alt={title} className="object-cover w-full h-full transition-transform duration-300 hover:scale-110" />
          </div>
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
      )}

      {summary && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Summary</h3>
            <div className="flex space-x-4">
            <button
                onClick={handleResummarize}
                disabled={isResummarizing} // Disable the button while resummarizing
                className="flex items-center gap-2 text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                {isResummarizing ? (
                  <Spinner size={20} /> // Show spinner inside the button
                ) : (
                  <RefreshCcw className="w-4 h-4 text-gray-600" />
                )}
                <span>{isResummarizing ? 'Resummarizing...' : 'Resummarize'}</span>
              </button>
              <button onClick={handleDownload} className="flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 shadow-md hover:shadow-xl">
                <Download className="w-4 h-4 text-gray-600" />
                <span className="font-medium">Download</span>
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 shadow-md hover:shadow-xl">
                <Save className="w-4 h-4 text-gray-600" />
                <span className="font-medium">{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
          <div className="text-gray-800 space-y-6 leading-relaxed" dangerouslySetInnerHTML={{
            __html: converter.makeHtml(summary).replace(/<h2>/g, "<h2 class='text-3xl font-bold text-gray-900 mb-4'>")
              .replace(/<h3>/g, "<h3 class='text-2xl font-semibold text-gray-800 mt-6 mb-3'>")
              .replace(/<p>/g, "<p class='text-lg text-gray-700 leading-relaxed mb-4'>")
          }}></div>
          <div className="mt-8 pt-4 border-t border-gray-100 text-sm text-gray-500 italic">
            Generated using AI-powered summarization
          </div>
        </div>
      )}

      {!metadata && !summary && (
        <div className="text-gray-500 text-center">No data available.</div>
      )}
    </div>
  );
}
