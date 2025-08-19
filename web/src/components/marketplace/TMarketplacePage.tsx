'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Store,
  Search,
  Filter,
  SortDesc,
  Clock,
  Palette,
  Package,
  ArrowRight,
  ExternalLink,
  Coins,
  TrendingUp
} from 'lucide-react';

// Mock data for marketplace items
const mockMarketplaceItems = [
  {
    id: 1,
    name: "Cosmic Dragon",
    creator: "0x1234...5678",
    price: "0.5 ETH",
    image: "https://models.readyplayer.me/647c6f35b88933e3db456fb7.glb",
    category: "Fantasy",
    likes: 24,
    views: 156
  },
  {
    id: 2,
    name: "Futuristic Car",
    creator: "0x8765...4321",
    price: "0.3 ETH",
    image: null,
    category: "Vehicle",
    likes: 18,
    views: 89
  },
  {
    id: 3,
    name: "Ancient Sword",
    creator: "0x9999...1111",
    price: "0.8 ETH",
    image: null,
    category: "Weapon",
    likes: 42,
    views: 234
  }
];

const categories = ["All", "Fantasy", "Vehicle", "Weapon", "Character", "Architecture"];
const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "popular", label: "Most Popular" }
];

function MarketplaceCard({ item }: { item: any }) {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden bg-white/50 backdrop-blur-sm border-neutral-200">
      <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-neutral-50 to-neutral-100">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="h-16 w-16 text-neutral-400" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-xs bg-white/80 backdrop-blur-sm">
            {item.category}
          </Badge>
        </div>
        <div className="absolute bottom-2 left-2">
          <Badge className="text-xs bg-neutral-900/80 text-white backdrop-blur-sm">
            {item.price}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-1 px-4 pt-3">
        <CardTitle className="text-sm line-clamp-1 text-neutral-900">{item.name}</CardTitle>
        <p className="text-xs text-neutral-600">
          by {item.creator}
        </p>
      </CardHeader>

      <CardContent className="pt-0 space-y-1 px-4 pb-3">
        {/* 统计信息 */}
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.views}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {item.likes}
            </span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-2">
          <Button
            size="sm"
            className="flex-1 bg-neutral-900 hover:bg-neutral-800 h-6 text-xs py-1"
          >
            <Coins className="h-3 w-3 mr-1" />
            Buy Now
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-neutral-300 hover:bg-neutral-50 h-6 px-2 py-1"
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function TMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const filteredItems = mockMarketplaceItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* 主标题区域 - 与首页风格一致 */}
      <div className="text-center space-y-4">
        <h1 className="text-[4rem] leading-[4rem] anim-r opacity-0 ![animation-delay:200ms] font-bold text-neutral-900">
          NFT MARKETPLACE
        </h1>
        <h2 className="text-[2rem] leading-[2rem] anim-r opacity-0 ![animation-delay:300ms] text-neutral-600">
          Discover & Trade 3D Digital Assets
        </h2>
      </div>

      {/* 市场内容区域 */}
      <div className="space-y-6 flex-1 anim-b opacity-0 ![animation-delay:400ms]">
        {/* 搜索和筛选栏 */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-neutral-200">
          <div className="flex items-center gap-4 flex-1">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="Search NFTs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-neutral-300"
              />
            </div>

            {/* 分类筛选 */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32 border-neutral-300">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 排序 */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 border-neutral-300">
                <SortDesc className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm text-neutral-600">
            <span>Showing {filteredItems.length} items</span>
            <span className="flex items-center gap-1">
              <Store className="h-4 w-4" />
              Total Volume: 1,234.5 ETH
            </span>
          </div>
          <Badge variant="outline" className="border-neutral-300">
            {mockMarketplaceItems.length} total items
          </Badge>
        </div>

        {/* NFT网格 */}
        {filteredItems.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-h-[600px] overflow-y-auto pr-2">
            {filteredItems.map((item) => (
              <MarketplaceCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="mx-auto w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center">
                <Store className="h-12 w-12 text-neutral-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-neutral-900">No Items Found</h3>
                <p className="text-neutral-600 max-w-md mx-auto">
                  Try adjusting your search or filter criteria
                </p>
              </div>
              <Button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="bg-neutral-900 hover:bg-neutral-800"
              >
                <Palette className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* 开发中提示 */}
        <Card className="bg-yellow-50/50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-yellow-800">Marketplace Coming Soon</p>
                <p className="text-sm text-yellow-700">
                  The full marketplace functionality is under development. Mock data is shown for preview.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}