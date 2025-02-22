import React from 'react';
import { Link } from 'react-router-dom';
import { Award, FileCheck, Search, List } from 'lucide-react';

const Home = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Certify
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A secure and efficient platform for generating, verifying, and managing academic certificates.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Award className="h-12 w-12 text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Generate Certificates</h2>
          <p className="text-gray-600 mb-4">
            Create secure, verifiable certificates with unique IDs and QR codes.
          </p>
          <Link
            to="/generate"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Generate Now
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <Search className="h-12 w-12 text-green-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Verify Certificates</h2>
          <p className="text-gray-600 mb-4">
            Instantly verify the authenticity of certificates using their unique IDs.
          </p>
          <Link
            to="/verify"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Verify Now
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <List className="h-12 w-12 text-purple-600 mb-4" />
          <h2 className="text-xl font-semibold mb-2">View All Certificates</h2>
          <p className="text-gray-600 mb-4">
            Access and manage all certificates issued through our system.
          </p>
          <Link
            to="/certificates"
            className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            View All
          </Link>
        </div>
      </div>

      <div className="bg-gray-100 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Why Choose Certify?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Secure & Unique</h3>
            <p className="text-gray-600">
              Each certificate comes with a unique identifier and QR code for easy verification.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Easy Management</h3>
            <p className="text-gray-600">
              Efficiently manage and track all certificates in one centralized system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;