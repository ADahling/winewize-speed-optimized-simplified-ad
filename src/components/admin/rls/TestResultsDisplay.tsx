
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';
import { TestResult } from './types';

interface TestResultsDisplayProps {
  testResults: TestResult[];
}

const TestResultsDisplay: React.FC<TestResultsDisplayProps> = ({ testResults }) => {
  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  const getStatusBadge = (success: boolean) => {
    return (
      <Badge variant={success ? "default" : "destructive"}>
        {success ? 'PASS' : 'FAIL'}
      </Badge>
    );
  };

  if (testResults.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Test Results</h3>
      
      <div className="grid gap-3">
        {testResults.map((result, index) => (
          <div 
            key={index}
            className={`border rounded-lg p-4 ${
              result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(result.success)}
                <div>
                  <span className="font-medium">{result.table}</span>
                  <span className="text-slate-600 ml-2">{result.operation}</span>
                </div>
              </div>
              {getStatusBadge(result.success)}
            </div>
            
            {result.error && (
              <p className="text-red-600 text-sm mt-2">{result.error}</p>
            )}
            
            {result.recordCount !== undefined && (
              <p className="text-slate-600 text-sm mt-2">
                Records found: {result.recordCount}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-slate-100 rounded-lg p-4">
        <p className="text-sm text-slate-600">
          💡 <strong>Tip:</strong> Open your browser's developer console to see detailed logging 
          of auth.uid(), policy execution, and query results for each test.
        </p>
      </div>
    </div>
  );
};

export default TestResultsDisplay;
