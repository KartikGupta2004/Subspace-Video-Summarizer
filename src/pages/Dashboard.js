import {React, useState} from 'react'
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { useAuthenticationStatus } from '@nhost/react';
import { Youtube, Brain, Clock, Download } from 'lucide-react';

function Dashboard() {
    const { isAuthenticated } = useAuthenticationStatus();
    const [videoUrl , setVideoUrl ] = useState("");
    const [error, setError] = useState("");
    const [isUrlValid, setIsUrlValid] = useState(false);
    const navigate = useNavigate();


    function isValidVideoUrl (url) {
      const pattern =
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/(watch\?v=|embed\/|v\/)?([A-Za-z0-9_-]{11})(\S+)?$/;
      return pattern.test(url);
    }

    const handleInputChange = (e) => {
      const inputUrl = e.target.value;
      setVideoUrl (inputUrl);
  
      if (isValidVideoUrl (inputUrl)) {
        setIsUrlValid(true);
        setError(""); // Clear any previous error
      } else {
        setIsUrlValid(false);
        setError("Please enter a valid YouTube URL.");
      }
    };

    const handleGenerateSummary = () => {
      if (!isUrlValid) {
        setError("Please enter a valid YouTube URL.");
        return;
      }
      // Navigate to the summary page and pass the YouTube URL as state
      navigate("/summary", { state: {videoUrl} });
    };

  return (
    <>
        <div className="space-y-16">
      <section className="text-center space-y-8">
        <h1 className="text-5xl font-bold text-gray-900">
          Transform YouTube Videos into
          <span className="text-blue-600"> Concise Summaries</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get AI-powered summaries of any YouTube video in seconds. Save time and extract key insights effortlessly.
        </p>
        {!isAuthenticated && (
          <div className="space-x-4">
            <Link
              to="/signup"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="inline-block bg-gray-100 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Login
            </Link>
          </div>
        )}
      </section>

      <section className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
          <p className="text-gray-600">
            Advanced AI technology analyzes video content to extract the most important information.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Save Time</h3>
          <p className="text-gray-600">
            Get the key points from long videos in minutes, not hours.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Download className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Easy Export</h3>
          <p className="text-gray-600">
            Download summaries for easy sharing and reference.
          </p>
        </div>
      </section>

      {isAuthenticated && (
        <section className="bg-white p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">Try it now</h2>
        <div className="max-w-2xl">
          <input
            type="text"
            placeholder="Paste YouTube URL here..."
            value={videoUrl}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 rounded-lg border ${
              isUrlValid
                ? "border-green-500 focus:ring-green-500"
                : "border-gray-300 focus:ring-blue-500"
            } focus:border-transparent`}
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <button
            onClick={handleGenerateSummary}
            className={`mt-4 px-6 py-3 rounded-lg font-medium transition-colors ${
              isUrlValid
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!isUrlValid}
          >
            Generate Summary
          </button>
        </div>
      </section>
      )}
    </div>
    </>
  )
}

export default Dashboard