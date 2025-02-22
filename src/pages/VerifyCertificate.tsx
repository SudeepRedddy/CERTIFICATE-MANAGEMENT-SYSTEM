import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const VerifyCertificate = () => {
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [certificate, setCertificate] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCertificate(null);

    try {
      const { data, error: searchError } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_id', certificateId)
        .single();

      if (searchError) throw searchError;

      if (data) {
        setCertificate(data);
      } else {
        setError('Certificate not found. Please check the ID and try again.');
      }
    } catch (err) {
      setError('Failed to verify certificate. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center mb-8">
          <Search className="h-12 w-12 text-green-600 mr-4" />
          <h1 className="text-3xl font-bold text-gray-900">Verify Certificate</h1>
        </div>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
              placeholder="Enter Certificate ID"
              className="flex-1 px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-6 bg-red-50 rounded-lg border border-red-100">
            <div className="flex items-center text-red-700 mb-4">
              <XCircle className="h-8 w-8 mr-3" />
              <h2 className="text-xl font-semibold">Certificate Not Found</h2>
            </div>
            <p className="text-red-600 ml-11">{error}</p>
          </div>
        )}

        {certificate && (
          <div className="bg-green-50 p-8 rounded-lg border border-green-100">
            <div className="flex items-center mb-6">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <h2 className="text-2xl font-semibold text-green-800">Certificate Verified!</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Certificate ID</h3>
                <p className="text-lg font-semibold text-gray-900">{certificate.certificate_id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Student Name</h3>
                <p className="text-lg font-semibold text-gray-900">{certificate.student_name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Student ID</h3>
                <p className="text-lg font-semibold text-gray-900">{certificate.student_id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Course</h3>
                <p className="text-lg font-semibold text-gray-900">{certificate.course}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">University</h3>
                <p className="text-lg font-semibold text-gray-900">{certificate.university}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Issue Date</h3>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(certificate.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;