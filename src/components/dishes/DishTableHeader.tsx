
import React from 'react';
import { Table, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const DishTableHeader = () => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className={`font-semibold text-slate-700 ${isMobile ? 'w-12 p-2' : 'w-20'}`}>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                {!isMobile && "Select"}
              </div>
            </TableHead>
            <TableHead className="font-semibold text-slate-700">
              Dish Details
            </TableHead>
            {!isMobile && (
              <TableHead className="font-semibold text-slate-700">
                Description
              </TableHead>
            )}
            <TableHead className="font-semibold text-slate-700">
              Price
            </TableHead>
            {isMobile && (
              <TableHead className="font-semibold text-slate-700 w-12">
                More
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
      </Table>
    </div>
  );
};

export default DishTableHeader;
