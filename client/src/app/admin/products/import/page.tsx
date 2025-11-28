'use client';

import ProductImport from '@/components/admin/ProductImport';

export default function ProductImportPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gradient">Import Products</h1>
        <p className="text-earth-sage mt-2">
          Bulk import products from CSV files
        </p>
      </div>
      
      <ProductImport />
    </div>
  );
}