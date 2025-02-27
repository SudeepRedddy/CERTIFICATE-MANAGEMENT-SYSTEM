import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { FileCheck, Download, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const GenerateCertificate = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    course: '',
    university: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [certificateData, setCertificateData] = useState<{
    id: string;
    pdfUrl: string;
    issueDate: string;
  } | null>(null);

  const generateCertificateId = (studentId: string, course: string) => {
    const timestamp = Date.now().toString(36);
    return `${timestamp}`.toUpperCase();
  };

  const checkDuplicateCertificate = async (studentId: string, course: string) => {
    const { data, error } = await supabase
      .from('certificates')
      .select('id')
      .eq('student_id', studentId)
      .eq('course', course)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data;
  };

  const generateCertificatePDF = async (certId: string) => {
    // Format QR data in line-by-line format instead of JSON
    const qrData = [
      `Certificate ID: ${certId}`,
      `Student ID: ${formData.studentId}`,
      `Student Name: ${formData.studentName}`,
      `Course: ${formData.course}`,
      `University: ${formData.university}`
    ].join('\n');

    const qrCodeDataUrl = await QRCode.toDataURL(qrData);
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Background with radial gradient
    const centerX = pageWidth / 2;
    const centerY = pageHeight / 2;
    const maxRadius = Math.max(pageWidth, pageHeight);
    
    for (let r = maxRadius; r > 0; r -= 1) {
      const ratio = r / maxRadius;
      const color = {
        r: Math.floor(240 + (255 - 240) * ratio),
        g: Math.floor(240 + (255 - 240) * ratio),
        b: Math.floor(250 + (255 - 250) * ratio)
      };
      pdf.setFillColor(color.r, color.g, color.b);
      pdf.circle(centerX, centerY, r, 'F');
    }

    // Border design
    pdf.setLineWidth(0.3);
    const margin = 15;
    pdf.rect(margin, margin, pageWidth - 2 * margin, pageHeight - 2 * margin);

    // Decorative corners
    const cornerSize = 15;
    const cornerMargin = margin + 5;
    
    // Top left corner
    pdf.line(cornerMargin, cornerMargin, cornerMargin + cornerSize, cornerMargin);
    pdf.line(cornerMargin, cornerMargin, cornerMargin, cornerMargin + cornerSize);
    
    // Top right corner
    pdf.line(pageWidth - cornerMargin - cornerSize, cornerMargin, pageWidth - cornerMargin, cornerMargin);
    pdf.line(pageWidth - cornerMargin, cornerMargin, pageWidth - cornerMargin, cornerMargin + cornerSize);
    
    // Bottom left corner
    pdf.line(cornerMargin, pageHeight - cornerMargin - cornerSize, cornerMargin, pageHeight - cornerMargin);
    pdf.line(cornerMargin, pageHeight - cornerMargin, cornerMargin + cornerSize, pageHeight - cornerMargin);
    
    // Bottom right corner
    pdf.line(pageWidth - cornerMargin - cornerSize, pageHeight - cornerMargin, pageWidth - cornerMargin, pageHeight - cornerMargin);
    pdf.line(pageWidth - cornerMargin, pageHeight - cornerMargin - cornerSize, pageWidth - cornerMargin, pageHeight - cornerMargin);

    // Certificate title
    pdf.setTextColor(41, 128, 185);
    pdf.setFontSize(36);
    pdf.setFont(undefined, 'bold');
    pdf.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 45, { align: 'center' });

    // Decorative line under title
    pdf.setLineWidth(0.5);
    pdf.line(pageWidth / 4, 55, (pageWidth * 3) / 4, 55);

    // Certificate content
    const contentStartY = 75;
    
    pdf.setTextColor(44, 62, 80);
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'normal');
    pdf.text('This is to certify that', pageWidth / 2, contentStartY - 10, { align: 'center' });

    // Student name
    pdf.setFontSize(32);
    pdf.setTextColor(41, 128, 185);
    pdf.setFont(undefined, 'bold');
    pdf.text(formData.studentName, pageWidth / 2, contentStartY + 10, { align: 'center' });

    // Course completion text
    pdf.setFontSize(16);
    pdf.setTextColor(44, 62, 80);
    pdf.setFont(undefined, 'normal');
    pdf.text('has successfully completed the course', pageWidth / 2, contentStartY + 25, { align: 'center' });

    // Course name
    pdf.setFontSize(28);
    pdf.setTextColor(41, 128, 185);
    pdf.setFont(undefined, 'bold');
    pdf.text(formData.course, pageWidth / 2, contentStartY + 45, { align: 'center' });

    // University name
    pdf.setFontSize(16);
    pdf.setTextColor(44, 62, 80);
    pdf.setFont(undefined, 'normal');
    pdf.text(`at ${formData.university}`, pageWidth / 2, contentStartY + 60, { align: 'center' });

    // Issue date
    const issueDate = new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    pdf.setFontSize(14);
    pdf.text(`Issued on ${issueDate}`, pageWidth / 2, contentStartY + 75, { align: 'center' });

    // Certificate ID
    pdf.setFontSize(12);
    pdf.setTextColor(41, 128, 185);
    pdf.text(`Certificate ID: ${certId}`, pageWidth / 2, contentStartY + 90, {align: 'center'});

    // QR code
    const qrSize = 35;
    const qrX = 30;
    const qrY = pageHeight - 65;
    
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 3, 3, 'F');
    pdf.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

    // Convert to base64
    const pdfBase64 = pdf.output('datauristring');
    return { pdfBase64, issueDate };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setCertificateData(null);

    try {
      const isDuplicate = await checkDuplicateCertificate(formData.studentId, formData.course);
      if (isDuplicate) {
        throw new Error('A certificate for this student and course already exists.');
      }

      const newCertificateId = generateCertificateId(formData.studentId, formData.course);
      const { pdfBase64, issueDate } = await generateCertificatePDF(newCertificateId);

      const { error: uploadError } = await supabase.from('certificates').insert({
        certificate_id: newCertificateId,
        student_id: formData.studentId,
        student_name: formData.studentName,
        course: formData.course,
        university: formData.university,
        pdf_url: pdfBase64
      });

      if (uploadError) throw uploadError;
      
      setCertificateData({
        id: newCertificateId,
        pdfUrl: pdfBase64,
        issueDate
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate certificate. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (certificateData) {
      const link = document.createElement('a');
      link.href = certificateData.pdfUrl;
      link.download = `certificate-${formData.studentName.toLowerCase().replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {!certificateData ? (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-8">
            <FileCheck className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">Generate Certificate</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                  Student ID
                </label>
                <input
                  type="text"
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">
                  Student Name
                </label>
                <input
                  type="text"
                  id="studentName"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                  Course
                </label>
                <input
                  type="text"
                  id="course"
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>

              <div>
                <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                  University
                </label>
                <input
                  type="text"
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Generating...
                </>
              ) : (
                'Generate Certificate'
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-8">
          {success && (
            <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Certificate generated successfully!
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Certificate Details</h2>
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-5 w-5 mr-2" />
                Download PDF
              </button>
            </div>
            
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <p>Certificate ID: <span className="font-medium text-gray-900">{certificateData.id}</span></p>
              <p>Issue Date: <span className="font-medium text-gray-900">{certificateData.issueDate}</span></p>
            </div>
          </div>

          <div className="aspect-[1.414] w-full bg-white rounded-lg overflow-hidden shadow-lg">
            <object
              data={certificateData.pdfUrl}
              type="application/pdf"
              className="w-full h-full"
            >
              <p>Your browser does not support PDF preview.</p>
            </object>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => {
                setCertificateData(null);
                setSuccess(false);
                setFormData({
                  studentId: '',
                  studentName: '',
                  course: '',
                  university: ''
                });
              }}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Generate Another Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateCertificate;
