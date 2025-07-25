import React from 'react';
import { Grid, List, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ViewMode, SortOption, FilterOption } from '@/hooks/useWineLibrary';

interface WineLibraryControlsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortBy: SortOption;
  setSortBy: (sort: SortOption) => void;
  filterBy: FilterOption;
  setFilterBy: (filter: FilterOption) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  totalWines: number;
  filteredCount: number;
}

const WineLibraryControls = ({
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  filterBy,
  setFilterBy,
  searchTerm,
  setSearchTerm,
  totalWines,
  filteredCount
}: WineLibraryControlsProps) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search wines, styles, or dishes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Controls Row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4 mr-1" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4 mr-1" />
            List
          </Button>
        </div>

        {/* Filters & Sort */}
        <div className="flex items-center gap-3">
          {/* Filter Dropdown */}
          <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
            <SelectTrigger className="w-32">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Wines</SelectItem>
              <SelectItem value="favorites">Favorites</SelectItem>
              <SelectItem value="red">Red</SelectItem>
              <SelectItem value="white">White</SelectItem>
              <SelectItem value="rosé">Rosé</SelectItem>
              <SelectItem value="sparkling">Sparkling</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {filteredCount} of {totalWines} wines
          </Badge>
          {searchTerm && (
            <Badge variant="outline">
              Search: "{searchTerm}"
            </Badge>
          )}
          {filterBy !== 'all' && (
            <Badge variant="outline">
              Filter: {filterBy}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default WineLibraryControls;