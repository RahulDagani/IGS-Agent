"use client"
import React, { useState, useMemo } from "react";
import Badge from "@/components/ui/badge/Badge";
import { Calendar, YoutubeIcon } from "lucide-react";

interface Resource {
  id: number;
  title: string;
  channel: string;
  publishDate: string;
  status: "Published" | "Scheduled" | "Draft" | "Processing";
  youtubeUrl: string;
  videoId: string;
  description: string;
  category?: string;
  duration?: string;
  views?: number;
  likes?: number;
  tags?: string[];
}

// Define the table data using the interface
const tableData: Resource[] = [
  {
    id: 1,
    title: "Complete React Tutorial for Beginners",
    channel: "CodeWithChris",
    publishDate: "2024-06-15",
    status: "Published",
    youtubeUrl: "https://www.youtube.com/embed/ffqQSDjZl3E",
    videoId: "ffqQSDjZl3E",
    description: "Learn React from scratch with this comprehensive tutorial covering all the fundamental concepts and advanced patterns.",
    category: "Programming",
    duration: "45:22",
    views: 15420,
    likes: 1245,
    tags: ["React", "JavaScript", "Frontend"]
  },
  {
    id: 2,
    title: "Advanced TypeScript Patterns",
    channel: "TechTalks",
    publishDate: "2024-06-10",
    status: "Published",
    youtubeUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    videoId: "dQw4w9WgXcQ",
    description: "Deep dive into advanced TypeScript patterns and best practices for enterprise applications.",
    category: "Programming",
    duration: "32:15",
    views: 8920,
    likes: 856,
    tags: ["TypeScript", "Programming", "Web Development"]
  },
  {
    id: 3,
    title: "UI/UX Design Principles 2024",
    channel: "DesignMaster",
    publishDate: "2024-06-05",
    status: "Published",
    youtubeUrl: "https://www.youtube.com/embed/abc123def456",
    videoId: "abc123def456",
    description: "Modern UI/UX design principles and trends that every designer should know in 2024.",
    category: "Design",
    duration: "28:45",
    views: 12350,
    likes: 1102,
    tags: ["UI/UX", "Design", "Figma"]
  },
  {
    id: 4,
    title: "Machine Learning Fundamentals",
    channel: "AITutorials",
    publishDate: "2024-05-28",
    status: "Published",
    youtubeUrl: "https://www.youtube.com/embed/xyz789ghi012",
    videoId: "xyz789ghi012",
    description: "Introduction to machine learning concepts, algorithms, and practical implementations.",
    category: "Data Science",
    duration: "52:30",
    views: 21500,
    likes: 1987,
    tags: ["Machine Learning", "AI", "Python"]
  },
  {
    id: 5,
    title: "Web Performance Optimization",
    channel: "WebDevPro",
    publishDate: "2024-05-20",
    status: "Published",
    youtubeUrl: "https://www.youtube.com/embed/mno345pqr678",
    videoId: "mno345pqr678",
    description: "Techniques and tools to optimize your website performance and improve user experience.",
    category: "Web Development",
    duration: "38:12",
    views: 18700,
    likes: 1654,
    tags: ["Performance", "Web Development", "Optimization"]
  },
];

type SortField = keyof Resource | "";
type SortDirection = "asc" | "desc";

interface FilterOptions {
  channel: string;
  category: string;
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  channels: string[];
  categories: string[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  channels,
  categories,
}) => {
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handleApply = () => {
    const filters: FilterOptions = {
      channel: selectedChannel,
      category: selectedCategory,
    };
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setSelectedChannel("all");
    setSelectedCategory("all");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex z-99999">
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Apply Filters
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Channel Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Channel
            </label>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Channels</option>
              {channels.map((channel) => (
                <option key={channel} value={channel}>
                  {channel}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 text-sm bg-brand-500 text-white rounded-lg hover:bg-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white-800 dark:bg-dark-700 border border-gray-100 dark:border-gray-800  shadow-sm rounded-xl h-full overflow-hidden flex flex-col">
  {/* Video Embed */}
  <div className="relative h-[225px] overflow-hidden">
    <iframe
      src={resource.youtubeUrl}
      frameBorder="0"
      allowFullScreen
      className="w-full h-full"
      title={`YouTube video: ${resource.title}`}
    ></iframe>
  </div>

  {/* Content Section */}
  <div className=" p-3 flex flex-col flex-grow">
    <div className="font-bold text-base mb-1 text-gray-900 dark:text-white">
      {resource.title}
    </div>
    <div className="text-gray-500 dark:text-white text-sm mb-2">
      {resource.channel}
    </div>
    <p className="text-gray-600 dark:text-white text-sm mt-auto">
      {resource.description}
    </p>
  </div>

  {/* Footer Section */}
  <div className="px-3 mb-3 flex flex-col xl:flex-row justify-between items-start xl:items-center mt-auto gap-2">
    <span className="inline-flex items-center gap-1 bg-yellow-400 text-gray-900 font-semibold text-xs px-2 py-1 rounded-md">
      <YoutubeIcon className="w-3.5 h-3.5" />
      YouTube Resource
    </span>
    <span className="text-gray-500 dark:text-white text-xs flex items-center gap-1">
      <Calendar className="w-3.5 h-3.5" />
      {formatDate(resource.publishDate)}
    </span>
  </div>

  {/* Tags Section */}
  <div className="px-3 pb-3">
    <div className="flex flex-wrap gap-2">
      {resource.tags?.slice(0, 3).map((tag, index) => (
        <span
          key={index}
          className="bg-gray-10 dark:bg-dark-800 text-gray-800 dark:text-white text-xs border border-gray-300 dark:border-gray-600 rounded-md px-2 py-0.5"
        >
          {tag}
        </span>
      ))}
    </div>
  </div>
</div>

  );
};

export default function ResourceCards() {
  const [sortField] = useState<SortField>("");
  const [sortDirection] = useState<SortDirection>("asc");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    channel: "all",
    category: "all",
  });

  // Get unique values for filters
  const channels = useMemo(() => {
    return Array.from(new Set(tableData.map(resource => resource.channel)));
  }, []);

  const categories = useMemo(() => {
    return Array.from(new Set(tableData.map(resource => resource.category).filter(Boolean))) as string[];
  }, []);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = tableData.filter((resource) => {
      const matchesChannel = filters.channel === "all" || resource.channel === filters.channel;
      const matchesCategory = filters.category === "all" || resource.category === filters.category;
      
      return matchesChannel && matchesCategory;
    });

    // Sorting
    if (sortField) {
      filtered.sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return sortDirection === "asc" ? 1 : -1;
        if (bValue === undefined) return sortDirection === "asc" ? -1 : 1;
        
        if (typeof aValue === "string" && typeof bValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) {
          return sortDirection === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortDirection === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [filters, sortField, sortDirection]);

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = filters.channel !== "all" || filters.category !== "all";

  const clearAllFilters = () => {
    setFilters({
      channel: "all",
      category: "all",
    });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Filter Button and Active Filters */}
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="dark:bg-dark-900 h-11 px-4 rounded-lg border border-gray-200 bg-transparent text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Apply Filters
          </button>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.channel !== "all" && (
            <Badge size="sm" color="primary">
              Channel: {filters.channel}
            </Badge>
          )}
          {filters.category !== "all" && (
            <Badge size="sm" color="primary">
              Category: {filters.category}
            </Badge>
          )}
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedData.length > 0 ? (
          filteredAndSortedData.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">
              No resources found matching your criteria.
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Showing {filteredAndSortedData.length} of {tableData.length} resources
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={handleApplyFilters}
        channels={channels}
        categories={categories}
      />
    </div>
  );
}