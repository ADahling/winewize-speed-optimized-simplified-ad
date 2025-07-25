
import React, { useState } from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import DishEmptyState from './dishes/DishEmptyState';
import DishTableHeader from './dishes/DishTableHeader';
import DishTableRow from './dishes/DishTableRow';

interface MenuItem {
  id: string;
  dish_name: string;
  description: string;
  price: string;
  dish_type: string;
  ingredients: string[];
}

interface DishesTableProps {
  filteredItems: MenuItem[];
  selectedDishes: string[];
  onDishSelect: (dishId: string) => void;
  menuItemsLength: number;
}

const DishesTable = ({ 
  filteredItems, 
  selectedDishes, 
  onDishSelect, 
  menuItemsLength 
}: DishesTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (itemId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedRows(newExpanded);
  };

  if (filteredItems.length === 0) {
    return <DishEmptyState menuItemsLength={menuItemsLength} />;
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <DishTableHeader />
      
      <ScrollArea className="h-[50vh] w-full">
        <Table>
          <TableBody>
            {filteredItems.map((item) => {
              // Ensure item has a valid ID (should come from edge function now)
              if (!item.id) {
                console.error('Menu item missing ID:', item);
                return null;
              }

              const isSelected = selectedDishes.includes(item.id);
              const isExpanded = expandedRows.has(item.id);
              
              return (
                <DishTableRow
                  key={item.id}
                  item={item}
                  isSelected={isSelected}
                  isExpanded={isExpanded}
                  onDishSelect={onDishSelect}
                  onToggleExpand={toggleRow}
                />
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default DishesTable;
