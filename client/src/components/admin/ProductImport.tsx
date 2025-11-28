'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface ImportResult {
  row: number;
  success?: boolean;
  product?: {
    id: string;
    name: string;
    price: number;
    category: string;
  };
  error?: string;
  data?: any;
}

interface ImportSummary {
  totalRows: number;
  successCount: number;
  errorCount: number;
  successRate: string;
}

interface ImportResponse {
  success: boolean;
  data: {
    summary: ImportSummary;
    results: ImportResult[];
    errors: ImportResult[];
  };
  message: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function ProductImport() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await api.get('/admin/categories');
      console.log('Categories response:', response);
      
      if (response.data.success) {
        setCategories(response.data.data.categories || []);
      } else {
        console.error('Categories fetch was not successful:', response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setImportResult(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', file);

      console.log('Starting CSV import...', file.name);

      // Use axios for file upload with proper configuration
      const response = await api.post('/admin/products/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Import response:', response);
      const result = response.data;
      setImportResult(result);

      if (result.success) {
        // Clear the file after successful import
        setFile(null);
      } else {
        console.error('Import was not successful:', result);
      }
    } catch (error: any) {
      console.error('Import error:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error occurred';
      setImportResult({
        success: false,
        data: {
          summary: { totalRows: 0, successCount: 0, errorCount: 1, successRate: '0' },
          results: [],
          errors: [{ row: 0, error: errorMessage }]
        },
        message: `Import failed: ${errorMessage}`
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get('/admin/products/import/template', {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product-import-template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Template download error:', error);
      alert('Failed to download template');
    }
  };

  return (
    <div className="card-modern p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-earth-dark mb-2">Upload CSV File</h2>
        <p className="text-earth-sage">
          Upload a CSV file to bulk import products. Make sure your CSV follows the required format.
        </p>
      </div>

      {/* Template Download */}
      <div className="mb-6 p-4 bg-earth-bronze/10 rounded-lg border border-earth-bronze/20">
        <h3 className="font-semibold text-earth-brown mb-2">Need a template?</h3>
        <p className="text-earth-sage text-sm mb-3">
          Download our CSV template with sample data and required column headers.
        </p>
        <div className="flex gap-2">
          <button
            onClick={downloadTemplate}
            className="bg-earth-bronze text-white px-4 py-2 rounded-md hover:bg-earth-caramel transition-colors"
          >
            Download CSV Template
          </button>
          <button
            onClick={async () => {
              try {
                const response = await api.get('/admin/test');
                const result = response.data;
                console.log('Admin test result:', result);
                alert(`Admin test: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`);
              } catch (error: any) {
                console.error('Admin test error:', error);
                const errorMessage = error.response?.data?.error?.message || error.message || 'Unknown error';
                alert('Admin test failed: ' + errorMessage);
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Test Admin Connection
          </button>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-earth-bronze bg-earth-bronze/10'
              : 'border-earth-light hover:border-earth-sage'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div>
              <div className="text-earth-olive mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-earth-dark">{file.name}</p>
              <p className="text-sm text-earth-sage">{(file.size / 1024).toFixed(2)} KB</p>
              <button
                onClick={() => setFile(null)}
                className="mt-2 text-red-600 hover:text-red-700"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div>
              <div className="text-earth-sage mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-earth-dark mb-2">
                Drop your CSV file here, or click to browse
              </p>
              <p className="text-sm text-earth-sage mb-4">
                Supports CSV files up to 5MB
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="bg-earth-bronze text-white px-6 py-2 rounded-md hover:bg-earth-caramel cursor-pointer transition-colors"
              >
                Choose File
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Import Button */}
      {file && (
        <div className="mb-6">
          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full bg-earth-olive text-white py-3 px-4 rounded-md hover:bg-earth-forest disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {importing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Importing Products...
              </div>
            ) : (
              'Import Products'
            )}
          </button>
        </div>
      )}

      {/* Import Results */}
      {importResult && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Import Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {importResult.data.summary.totalRows}
                </div>
                <div className="text-sm text-gray-600">Total Rows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {importResult.data.summary.successCount}
                </div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {importResult.data.summary.errorCount}
                </div>
                <div className="text-sm text-gray-600">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {importResult.data.summary.successRate}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Success Results */}
          {importResult.data.results.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">
                Successfully Imported Products (showing first 10)
              </h3>
              <div className="space-y-2">
                {importResult.data.results.map((result, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-green-800">
                      Row {result.row}: {result.product?.name}
                    </span>
                    <span className="text-green-600 font-medium">
                      ${result.product?.price} - {result.product?.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {importResult.data.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-3">
                Import Errors (showing first 10)
              </h3>
              <div className="space-y-2">
                {importResult.data.errors.map((error, index) => (
                  <div key={index} className="text-sm">
                    <div className="font-medium text-red-800">
                      Row {error.row}: {error.error}
                    </div>
                    {error.data && (
                      <div className="text-red-600 text-xs mt-1">
                        Data: {JSON.stringify(error.data)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          <div className={`p-4 rounded-lg ${
            importResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {importResult.message}
          </div>
        </div>
      )}

      {/* Available Categories */}
      <div className="mt-8 bg-earth-olive/10 rounded-lg p-4 border border-earth-olive/20">
        <h3 className="font-semibold text-earth-brown mb-3">Available Categories</h3>
        {loadingCategories ? (
          <div className="text-earth-sage">Loading categories...</div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
            {categories.map((category) => (
              <div key={category._id} className="bg-white rounded p-2 border border-earth-light">
                <div className="font-medium text-earth-dark">{category.name}</div>
                <div className="text-earth-sage text-xs font-mono">{category._id}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-earth-sage">No categories found. Please create categories first.</div>
        )}
      </div>

      {/* CSV Format Guide */}
      <div className="mt-6 bg-earth-light/20 rounded-lg p-4 border border-earth-light/30">
        <h3 className="font-semibold text-earth-dark mb-3">CSV Format Requirements</h3>
        <div className="text-sm text-earth-sage space-y-2">
          <p><strong>Required columns:</strong> name, price, categoryId</p>
          <p><strong>Optional columns:</strong> description, sku, images (comma-separated URLs), tags (comma-separated), featured (true/false), isActive (true/false), trackInventory (true/false), inventoryCount, allowBackorder (true/false), lowStockThreshold, weight, dimensions (LxWxH)</p>
          <p><strong>Notes:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Use category IDs from the list above</li>
            <li>Images should be comma-separated URLs</li>
            <li>Tags should be comma-separated values</li>
            <li>Boolean values: use 'true'/'false' or '1'/'0'</li>
            <li>Dimensions format: '10x5x3' (length x width x height)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}