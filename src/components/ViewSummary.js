import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, gql, useMutation } from '@apollo/client';
import { toast } from 'react-hot-toast';
import showdown from 'showdown'; // For markdown to HTML conversion
import { Download, RefreshCcw } from 'lucide-react'; // Icons for download actions
import { useUserId } from '@nhost/react';
import Spinner from './Spinner';
import { fetchVideoMetadata, fetchResummarizedData } from "../../functions/n8n-webhook";

const GET_SUMMARY = gql`
  query GetSummary($id: uuid!) {
    summaries_by_pk(id: $id) {
      id
      title
      summary
      video_url
      thumbnail_url
      created_at
      updated_at
    }
  }
`;

const UPDATE_SUMMARY_MUTATION = gql`
  mutation UpdateSummary($id: uuid!, $object: summaries_set_input!) {
    update_summaries_by_pk(pk_columns: {id: $id}, _set: $object) {
      id
      title
      summary
      video_url
      thumbnail_url
      updated_at
    }
  }
`;

export function SummaryPage() {
  const { id } = useParams();
  const userId = useUserId();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [summary, setSummary] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [title, setTitle] = useState('');
  const [ytUrl, setYtUrl] = useState('');
  const { data, loading: queryLoading, error: queryError } = useQuery(GET_SUMMARY, {
    variables: { id },
  });

  const [updateSummary] = useMutation(UPDATE_SUMMARY_MUTATION, {
    refetchQueries: [{ query: GET_SUMMARY, variables: { id } }],
  });

  const converter = new showdown.Converter();

  // State for resummarizing
  const [isResummarizing, setIsResummarizing] = useState(false);

  useEffect(() => {
    if (queryError) {
      toast.error('Failed to load summary details.');
      navigate('/history');
    }
  }, [queryError, navigate]);

  useEffect(() => {
    if (data && data.summaries_by_pk) {
      const summaryData = data.summaries_by_pk;
      setTitle(summaryData.title);
      setSummary(summaryData.summary);
      setVideoUrl(summaryData.video_url);
      setThumbnail(summaryData.thumbnail_url);
      setMetadata(summaryData);
    }
    setLoading(queryLoading);
  }, [data, queryLoading]);

  const handleResummarize = async () => {
    setIsResummarizing(true); // Set loading state
    try {
      // const response = await fetch(process.env.REACT_APP_N8N_WEBHOOK_URL, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ videoUrl }),
      // });

      // if (!response.ok) {
      //   const errorDetails = await response.json();
      //   console.error('Error response from server:', errorDetails);
      //   throw new Error(`Failed to fetch data: ${response.statusText}`);
      // }

      // const data = await response.json();

      const data = await fetchResummarizedData(videoUrl);
      const newSummary = data.summary;
      setSummary(newSummary); // Update the local state with the new summary
      toast.success('Summary updated!');

      // Save the updated summary to the database
      const { data: updatedSummary } = await updateSummary({
        variables: {
          id,
          object: {
            title,
            summary: newSummary,
            video_url: ytUrl,
            thumbnail_url: thumbnail.url,
          },
        },
      });

      setMetadata({
        ...metadata,
        updated_at: new Date().toISOString(), // Set the updated_at to the current timestamp
      });

      toast.success('Summary saved to the database!');
    } catch (error) {
      toast.error('Failed to resummarize or save the summary.');
      console.error('Error during resummarization:', error);
    } finally {
      setIsResummarizing(false); // Reset loading state
    }
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'summary.txt';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) return <div>Loading... <Spinner /></div>;
  if (!metadata) return <div>Summary not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
        <p className="text-gray-500">Last updated on {new Date(metadata.updated_at).toLocaleString()}</p>
      </div>

      {/* Thumbnail and Video Metadata */}
      <div className="bg-gray-100 rounded-lg shadow-xl p-6 mb-8">
        <div className="aspect-video relative overflow-hidden rounded-lg mb-4">
          <img
            src={thumbnail}
            alt={title}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
          />
        </div>
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>

      {/* Summary Section */}
      {summary && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl">
          {/* Header Section */}
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
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-semibold py-2 px-4 rounded-lg border border-gray-300 shadow-md hover:shadow-xl"
              >
                <Download className="w-4 h-4 text-gray-600" />
                <span className="font-medium">Download</span>
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div
            className="text-gray-800 space-y-6 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: converter
                .makeHtml(summary)
                .replace(/<h2>/g, "<h2 class='text-3xl font-bold text-gray-900 mb-4'>")
                .replace(/<h3>/g, "<h3 class='text-2xl font-semibold text-gray-800 mt-6 mb-3'>")
                .replace(/<p>/g, "<p class='text-lg text-gray-700 leading-relaxed mb-4'>"),
            }}
          ></div>

          <div className="mt-8 pt-4 border-t border-gray-100 text-sm text-gray-500 italic">
            Generated using AI-powered summarization
          </div>
        </div>
      )}

      {/* No Data Section */}
      {!summary && <div className="text-gray-500 text-center">No summary available.</div>}

      {/* Back Button */}
      <div className="mt-6">
        <button
          onClick={() => navigate('/history')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700"
        >
          Back to History
        </button>
      </div>
    </div>
  );
}
