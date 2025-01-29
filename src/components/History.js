import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNhostClient, useUserId } from '@nhost/react';
import { useQuery, useMutation, gql } from "@apollo/client";
import { toast } from 'react-hot-toast';
import { Trash2 } from "lucide-react"; // Import the Trash icon

const GET_SUMMARIES = gql`
  query GetSummaries {
    summaries {
      id
      title
      summary
      video_url
      thumbnail_url
      created_at
      updated_at
      user_id
    }
  }
`;

const DELETE_SUMMARY = gql`
  mutation DeleteSummary($id: uuid!) {
    delete_summaries_by_pk(id: $id) {
      id
    }
  }
`;

export function History() {
  const nhostClient = useNhostClient();
  const userId = useUserId();
  const navigate = useNavigate();

  const [summaries, setSummaries] = useState([]);

  const { loading, error, data, refetch } = useQuery(GET_SUMMARIES);
  const [deleteSummary] = useMutation(DELETE_SUMMARY);

  const handleDelete = async (summaryId) => {
    try {
      await deleteSummary({ variables: { id: summaryId } });
      toast.success("Summary deleted successfully!");
      refetch(); // Re-fetch summaries after deletion
    } catch (err) {
      toast.error("Failed to delete summary. Please try again.");
      console.error("Error deleting summary:", err);
    }
  };

  useEffect(() => {
    if (data?.summaries) {
      // Sort the summaries by updated_at in descending order
      const sortedSummaries = [...data.summaries].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      setSummaries(sortedSummaries);
    }
  }, [data]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error.message}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Your Summary History</h1>
        <p className="text-gray-500">All your saved summaries in one place</p>
      </div>

      {summaries.length === 0 ? (
        <div className="text-center text-gray-500">No summaries found.</div>
      ) : (
        <div className="space-y-4">
          {summaries.map((summary) => (
            <div key={summary.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 flex justify-between items-center space-x-4">
              <div className="flex space-x-4">
                <img
                  src={summary.thumbnail_url}
                  alt={summary.title}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h2 className="text-xl font-semibold">{summary.title}</h2>
                  <p className="text-gray-600 text-sm">{summary.video_url}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(`/summary/${summary.id}`)} // Navigate to the individual summary page
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(summary.id)}
                  className="flex justify-center items-center px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="ml-2">Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
