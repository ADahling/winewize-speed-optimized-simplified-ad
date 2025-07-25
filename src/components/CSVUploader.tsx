
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CSVRow {
  tip_text: string;
  category?: string;
  is_active?: boolean;
  display_order?: number;
}

const CSVUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    inserted: number;
    updated: number;
    errors: string[];
  } | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadResults(null);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please select a CSV file",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === 0 || values.every(v => !v)) continue;

      const row: CSVRow = {
        tip_text: '',
      };

      headers.forEach((header, index) => {
        const value = values[index];
        if (!value) return;

        switch (header.toLowerCase()) {
          case 'tip_text':
            row.tip_text = value;
            break;
          case 'category':
            row.category = value;
            break;
          case 'is_active':
            row.is_active = value.toLowerCase() === 'true' || value === '1';
            break;
          case 'display_order':
            const displayOrder = parseInt(value);
            if (!isNaN(displayOrder)) {
              row.display_order = displayOrder;
            }
            break;
        }
      });

      if (row.tip_text) {
        rows.push(row);
      }
    }

    return rows;
  };

  const uploadCSV = async () => {
    if (!file) return;

    setIsUploading(true);
    const results = { inserted: 0, updated: 0, errors: [] as string[] };

    try {
      const csvText = await file.text();
      const rows = parseCSV(csvText);

      if (rows.length === 0) {
        throw new Error('No valid rows found in CSV file');
      }

      for (const row of rows) {
        try {
          // Check if a tip with the same text already exists
          const { data: existingTip } = await supabase
            .from('quick_vino_tips')
            .select('id')
            .eq('tip_text', row.tip_text)
            .maybeSingle();

          if (existingTip) {
            // Update existing tip
            const { error } = await supabase
              .from('quick_vino_tips')
              .update({
                category: row.category,
                is_active: row.is_active ?? true,
                display_order: row.display_order,
              })
              .eq('id', existingTip.id);

            if (error) throw error;
            results.updated++;
          } else {
            // Insert new tip
            const { error } = await supabase
              .from('quick_vino_tips')
              .insert({
                tip_text: row.tip_text,
                category: row.category || 'general',
                is_active: row.is_active ?? true,
                display_order: row.display_order,
              });

            if (error) throw error;
            results.inserted++;
          }
        } catch (error) {
          console.error('Error processing row:', error);
          results.errors.push(`Failed to process tip: "${row.tip_text}" - ${error.message}`);
        }
      }

      setUploadResults(results);
      
      if (results.errors.length === 0) {
        toast({
          title: "Upload successful!",
          description: `${results.inserted} tips inserted, ${results.updated} tips updated`,
        });
      } else {
        toast({
          title: "Upload completed with errors",
          description: `${results.inserted} inserted, ${results.updated} updated, ${results.errors.length} errors`,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to process CSV file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Quick Vino Tips CSV
          </CardTitle>
          <CardDescription>
            Upload a CSV file to add or update tips in the quick_vino_tips table.
            Expected columns: tip_text (required), category, is_active, display_order
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="csv-file" className="text-sm font-medium">
              Select CSV File
            </label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
              <FileText className="w-4 h-4 text-slate-600" />
              <span className="text-sm text-slate-700">{file.name}</span>
              <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}

          <Button 
            onClick={uploadCSV}
            disabled={!file || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload CSV
              </>
            )}
          </Button>

          {uploadResults && (
            <Card className="mt-4">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">{uploadResults.inserted} tips inserted</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">{uploadResults.updated} tips updated</span>
                  </div>
                  {uploadResults.errors.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{uploadResults.errors.length} errors</span>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {uploadResults.errors.map((error, index) => (
                          <p key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                            {error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-xs text-slate-500 space-y-1">
            <p><strong>CSV Format Requirements:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li><strong>tip_text:</strong> Required. The main tip content</li>
              <li><strong>category:</strong> Optional. Category for the tip</li>
              <li><strong>is_active:</strong> Optional. true/false or 1/0 (defaults to true)</li>
              <li><strong>display_order:</strong> Optional. Numeric value for ordering</li>
            </ul>
            <p className="mt-2">Tips with identical text will be updated instead of creating duplicates.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CSVUploader;
