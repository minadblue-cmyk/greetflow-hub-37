import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, X, AlertCircle, Loader2 } from 'lucide-react';
import { formatFileSize, isExcelFile } from '@/utils/format';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import * as XLSX from 'xlsx';

interface UploadedFile {
  name: string;
  size: number;
  file: File;
}

interface ExcelUploaderProps {
  onUploadSuccess?: (result: any) => void;
}

export function ExcelUploader({ onUploadSuccess }: ExcelUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;

    const file = files[0];
    
    if (!isExcelFile(file.name)) {
      toast({
        title: 'Formato inválido',
        description: 'Apenas arquivos .xls e .xlsx são aceitos.',
        variant: 'destructive',
      });
      return;
    }

    setUploadedFile({
      name: file.name,
      size: file.size,
      file
    });

    console.log('[ExcelUploader] File selected:', file.name, formatFileSize(file.size));
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);

    try {
      // Processar arquivo Excel primeiro
      const data = await uploadedFile.file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('[ExcelUploader] Dados processados:', jsonData.length, 'linhas');
      
      // Usa o webhook de mercado diretamente
      const webhookUrl = 'https://n8n-lavo-n8n.15gxno.easypanel.host/webhook/mercado';
      
      console.log('[ExcelUploader] Enviando para webhook:', webhookUrl);
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: jsonData,
          fileName: uploadedFile.name,
          targetDatabase: 'mercado_x',
          logged_user: {
            id: user?.id || 5,
            name: user?.nome || 'Administrador Code-IQ',
            email: user?.email || 'admin@code-iq.com.br'
          }
        }),
      });

      console.log('[ExcelUploader] Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Erro ao enviar arquivo: ${response.status}`;
        try {
          const errorText = await response.text();
          if (errorText) {
            try {
              const errorData = JSON.parse(errorText);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              errorMessage = errorText;
            }
          }
        } catch {
          // Se não conseguir ler o erro, usa a mensagem padrão
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('[ExcelUploader] Upload response:', result);

      toast({
        title: 'Upload realizado com sucesso',
        description: `Arquivo processado. ${result.rows ? `${result.rows} linhas encontradas.` : ''}`,
      });
      
      onUploadSuccess?.(result);
      setUploadedFile(null); // Limpa o arquivo após sucesso
    } catch (error) {
      console.error('[ExcelUploader] Upload error:', error);
      toast({
        title: 'Erro no upload',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  return (
    <Card className="card-gradient">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Arquivo Excel
        </CardTitle>
        <CardDescription>
          Faça upload de planilhas .xls ou .xlsx para processamento
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status de integração com backend */}
        <div className="webhook-box">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-info mt-0.5" />
            <div>
              <p className="text-sm font-medium">Integração configurada:</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>✓ Upload de arquivo: webhook/mercado</li>
              </ul>
            </div>
          </div>
        </div>

        {!uploadedFile ? (
          /* Drop Zone */
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
              isDragOver 
                ? 'border-primary bg-primary/5 scale-105' 
                : 'border-border hover:border-primary/50 hover:bg-accent/20'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <FileSpreadsheet className="h-8 w-8 text-primary" />
              </div>
              
              <div>
                <h3 className="text-lg font-medium">Arraste um arquivo aqui</h3>
                <p className="text-muted-foreground">ou clique para selecionar</p>
              </div>
              
              <div>
                <input
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-input"
                />
                <Button asChild className="button-primary">
                  <label htmlFor="file-input" className="cursor-pointer">
                    Selecionar Arquivo
                  </label>
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                Formatos aceitos: .xls, .xlsx
              </div>
            </div>
          </div>
        ) : (
          /* File Selected */
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent/20 rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(uploadedFile.size)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Excel</Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="button-primary flex-1"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Fazer Upload'
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleRemoveFile}
                disabled={isUploading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}