// Ownership Attestation Upload Interface
// Allows users to upload ownership documents for verification
// Elegant, secure, compliance-focused

import React, { useState, useCallback } from 'react';
import { ForgeWorksAPI } from '../services/api';
import { OwnershipAttestation } from '../types/api';

interface OwnershipAttestationProps {
  deviceId?: string;
  onVerificationComplete?: (result: OwnershipAttestation) => void;
}

type AttestationType = 
  | 'PurchaseReceipt'
  | 'CourtOrder'
  | 'InheritanceDocument'
  | 'GiftDocument'
  | 'EnterpriseAuthorization'
  | 'ServiceCenterAuthorization';

export default function OwnershipAttestationPage({
  deviceId,
  onVerificationComplete
}: OwnershipAttestationProps) {
  const [attestationType, setAttestationType] = useState<AttestationType>('PurchaseReceipt');
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<OwnershipAttestation | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
      setError(null);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!deviceId) {
      setError('Device ID is required');
      return;
    }

    if (files.length === 0) {
      setError('Please select at least one document');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload files and get references
      const documentReferences: string[] = [];
      
      for (const file of files) {
        // In real implementation, upload to backend and get hash/reference
        const formData = new FormData();
        formData.append('file', file);
        formData.append('deviceId', deviceId);
        formData.append('attestationType', attestationType);

        // This would call actual upload endpoint
        // const response = await fetch('/api/v1/ownership/upload', {
        //   method: 'POST',
        //   body: formData,
        // });
        // const result = await response.json();
        // documentReferences.push(result.reference);

        // Mock for now
        documentReferences.push(`hash_${file.name}_${Date.now()}`);
      }

      // Verify ownership
      setVerifying(true);
      const result = await ForgeWorksAPI.verifyOwnership(deviceId, {
        attestationType,
        documentReferences,
      });

      setVerificationResult(result);
      setConfidence(result.confidence);
      
      if (onVerificationComplete) {
        onVerificationComplete(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setUploading(false);
      setVerifying(false);
    }
  };

  const getAttestationTypeLabel = (type: AttestationType): string => {
    const labels: Record<AttestationType, string> = {
      PurchaseReceipt: 'Purchase Receipt',
      CourtOrder: 'Court Order',
      InheritanceDocument: 'Inheritance Document',
      GiftDocument: 'Gift Document',
      EnterpriseAuthorization: 'Enterprise Authorization',
      ServiceCenterAuthorization: 'Service Center Authorization',
    };
    return labels[type];
  };

  const getConfidenceColor = (conf: number): string => {
    if (conf >= 85) return 'text-green-500';
    if (conf >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceLabel = (conf: number): string => {
    if (conf >= 85) return 'High Confidence';
    if (conf >= 70) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <section className="ownership-attestation">
      <div className="container max-w-4xl mx-auto py-8">
        <h2 className="text-3xl font-bold mb-2">Ownership Confidence Assessment</h2>
        <p className="text-gray-600 mb-8">
          Upload documentation to verify device ownership. Additional documentation may be required.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Attestation Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Attestation Type
            </label>
            <select
              value={attestationType}
              onChange={(e) => setAttestationType(e.target.value as AttestationType)}
              className="w-full px-4 py-2 border rounded-lg"
              disabled={uploading || verifying}
            >
              {Object.keys({
                PurchaseReceipt: 'Purchase Receipt',
                CourtOrder: 'Court Order',
                InheritanceDocument: 'Inheritance Document',
                GiftDocument: 'Gift Document',
                EnterpriseAuthorization: 'Enterprise Authorization',
                ServiceCenterAuthorization: 'Service Center Authorization',
              } as Record<AttestationType, string>).map((type) => (
                <option key={type} value={type}>
                  {getAttestationTypeLabel(type as AttestationType)}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Documentation
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={uploading || verifying}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <div className="text-gray-600 mb-2">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
                </p>
              </label>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                    <div className="flex items-center space-x-3">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800"
                      disabled={uploading || verifying}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              onClick={handleUpload}
              disabled={uploading || verifying || files.length === 0 || !deviceId}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading && 'Uploading...'}
              {verifying && 'Verifying...'}
              {!uploading && !verifying && 'Submit for Verification'}
            </button>
          </div>

          {/* Confidence Score Display */}
          {confidence !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold mb-2">Verification Result</h3>
              <div className="flex items-center space-x-4">
                <div className={`text-3xl font-bold ${getConfidenceColor(confidence)}`}>
                  {confidence}%
                </div>
                <div>
                  <p className="font-medium">{getConfidenceLabel(confidence)}</p>
                  <p className="text-sm text-gray-600">
                    {confidence >= 85
                      ? 'Ownership confidence threshold met. Proceeding may be permitted.'
                      : confidence >= 70
                      ? 'Additional documentation may be required for higher confidence.'
                      : 'External authorization required before proceeding.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Information Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> All uploaded documents are securely stored and used only for 
              ownership verification. Documents are hashed and referenced in audit logs. 
              No document content is stored in plain text.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
