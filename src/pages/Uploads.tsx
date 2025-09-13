import React, { useState } from 'react';
import { ExcelUploader } from '@/components/uploads/ExcelUploader';
import { ProspectAgentPanel } from '@/components/uploads/ProspectAgentPanel';
import { LeadsRealtimeCard } from '@/components/uploads/LeadsRealtimeCard';

export default function Uploads() {
  const [uploadedFileId, setUploadedFileId] = useState<string | undefined>();

  const handleUploadSuccess = (result: any) => {
    console.log('[UploadsPage] Upload successful:', result);
    setUploadedFileId(result.id);
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload de Arquivo</h1>
        <p className="text-muted-foreground mt-1">
          Faça upload de planilhas Excel e gerencie o agente de prospecção
        </p>
      </div>

      {/* Upload Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ExcelUploader onUploadSuccess={handleUploadSuccess} />
        <ProspectAgentPanel fileId={uploadedFileId} />
      </div>

      {/* Leads Section */}
      <LeadsRealtimeCard />
    </div>
  );
}