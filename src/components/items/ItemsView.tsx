import React, { useState } from 'react';
import {
  Plus,
  Search,
  Package,
  AlertTriangle,
  Barcode,
  Layers,
  Download,
  X,
  History,
  TrendingUp,
} from 'lucide-react';
import { Item, StockAdjustment, CompanyProfile, ItemType, UnitType } from '../../types/erp';
import { useLanguage } from '../../context/LanguageContext';

interface ItemsViewProps {
  items: Item[];
  adjustments: StockAdjustment[];
  company: CompanyProfile;
  onSaveItem: (item: Item) => void;
  onDeleteItem: (id: string) => void;
  onAdjustStock: (itemId: string, qtyDelta: number, reason: string, type: 'add' | 'reduce') => void;
  globalSearch: string;
}

export const ItemsView: React.FC<ItemsViewProps> = ({
  items,
  adjustments,
  company,
  onSaveItem,
  onDeleteItem,
  onAdjustStock,
  globalSearch,
}) => {
  const { t } = useLanguage();
  const [filterType, setFilterType] = useState<'all' | 'low_stock' | 'product' | 'service'>('all');
  const [localSearch, setLocalSearch] = useState('');
  const [showAdjustmentHistory, setShowAdjustmentHistory] = useState(false);

  // Add / Edit Modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  // Adjust Stock Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTargetItem, setAdjustTargetItem] = useState<Item | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'reduce'>('add');
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('Stock replenishment');

  // Item Form Fields
  const [name, setName] = useState('');
  const [type, setType] = useState<ItemType>('product');
  const [sku, setSku] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState<UnitType>('PCS');
  const [salePrice, setSalePrice] = useState<number>(0);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [stockQty, setStockQty] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [description, setDescription] = useState('');

  const filteredItems = items.filter((item) => {
    if (filterType === 'low_stock' && (item.type !== 'product' || item.stockQty > item.minStockAlert)) return false;
    if (filterType === 'product' && item.type !== 'product') return false;
    if (filterType === 'service' && item.type !== 'service') return false;

    const query = (globalSearch || localSearch).trim().toLowerCase();
    if (query) {
      const matchName = item.name.toLowerCase().includes(query);
      const matchSku = item.sku.toLowerCase().includes(query);
      const matchHsn = item.hsnCode.includes(query);
      const matchCat = item.category.toLowerCase().includes(query);
      if (!matchName && !matchSku && !matchHsn && !matchCat) return false;
    }
    return true;
  });

  // Inventory Valuations
  const totalStockUnits = items
    .filter((i) => i.type === 'product')
    .reduce((acc, i) => acc + i.stockQty, 0);

  const totalCostValuation = items
    .filter((i) => i.type === 'product')
    .reduce((acc, i) => acc + (i.stockQty * i.purchasePrice), 0);

  const totalRetailValuation = items
    .filter((i) => i.type === 'product')
    .reduce((acc, i) => acc + (i.stockQty * i.salePrice), 0);

  const openNewItemModal = () => {
    setEditingItem(null);
    setName('');
    setType('product');
    setSku(`SKU-${Date.now().toString().slice(-4)}`);
    setHsnCode('8471');
    setCategory('General');
    setUnit('PCS');
    setSalePrice(0);
    setPurchasePrice(0);
    setTaxRate(18);
    setStockQty(10);
    setMinStockAlert(5);
    setDescription('');
    setIsItemModalOpen(true);
  };

  const openEditItemModal = (item: Item) => {
    setEditingItem(item);
    setName(item.name);
    setType(item.type);
    setSku(item.sku);
    setHsnCode(item.hsnCode);
    setCategory(item.category);
    setUnit(item.unit);
    setSalePrice(item.salePrice);
    setPurchasePrice(item.purchasePrice);
    setTaxRate(item.taxRate);
    setStockQty(item.stockQty);
    setMinStockAlert(item.minStockAlert);
    setDescription(item.description || '');
    setIsItemModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const itemData: Item = {
      id: editingItem ? editingItem.id : `itm_${Date.now()}`,
      name: name.trim(),
      type,
      sku: sku.trim(),
      hsnCode: hsnCode.trim(),
      category: category.trim() || 'General',
      unit,
      salePrice: Number(salePrice) || 0,
      purchasePrice: Number(purchasePrice) || 0,
      taxRate: Number(taxRate) || 0,
      stockQty: Number(stockQty) || 0,
      minStockAlert: Number(minStockAlert) || 0,
      description: description.trim(),
      createdAt: editingItem?.createdAt || new Date().toISOString(),
    };

    onSaveItem(itemData);
    setIsItemModalOpen(false);
  };

  const handleOpenAdjustStock = (item: Item) => {
    setAdjustTargetItem(item);
    setAdjustType('add');
    setAdjustQty(1);
    setAdjustReason('Stock replenishment');
    setIsAdjustModalOpen(true);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTargetItem || adjustQty <= 0) return;

    onAdjustStock(adjustTargetItem.id, adjustQty, adjustReason, adjustType);
    setIsAdjustModalOpen(false);
  };

  const handleExportStockCSV = () => {
    const headers = [
      t('Item Name', 'পণ্যের নাম'),
      t('Type', 'ধরণ'),
      t('SKU', 'এসকেইউ'),
      t('HSN', 'এইচএসএন'),
      t('Category', 'বিভাগ'),
      t('Sale Price', 'বিক্রয় মূল্য'),
      t('Purchase Price', 'ক্রয় মূল্য'),
      t('Stock Qty', 'স্টক পরিমাণ'),
      t('Unit', 'একক'),
      t('Stock Value', 'স্টক মূল্য'),
    ];
    const rows = items.map((i) => [
      `"${i.name}"`,
      `"${i.type}"`,
      `"${i.sku}"`,
      `"${i.hsnCode}"`,
      `"${i.category}"`,
      i.salePrice,
      i.purchasePrice,
      i.stockQty,
      `"${i.unit}"`,
      i.stockQty * i.purchasePrice,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Inventory_Stock_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {t('Items & Inventory Management', 'পণ্য ও স্টক পরিচালনা')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              'Catalog, stock level monitoring, low-stock reorder thresholds & valuations',
              'পণ্য ক্যাটালগ, মজুত স্টক পর্যবেক্ষণ, কম স্টক সতর্কতা ও আর্থিক মূল্যায়ন'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdjustmentHistory(!showAdjustmentHistory)}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <History className="h-3.5 w-3.5" />
            <span>{t('Audit History', 'স্টক অডিট লগ')}</span>
          </button>

          <button
            onClick={handleExportStockCSV}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{t('Export CSV', 'সিএসভি ডাউনলোড')}</span>
          </button>

          <button
            onClick={openNewItemModal}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t('+ Add New Item', '+ নতুন পণ্য / সেবা')}</span>
          </button>
        </div>
      </div>

      {/* Valuation Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">{t('Stock Units on Hand', 'হাতে থাকা মোট স্টক একক')}</span>
          <div className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums">
            {totalStockUnits.toLocaleString()} {t('units', 'একক')}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {t(`Across ${items.length} SKUs`, `মোট ${items.length} টি পণ্য`)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">{t('Inventory Cost Value', 'স্টকের মোট ক্রয়মূল্য')}</span>
          <div className="mt-1 text-xl font-bold font-mono text-indigo-700 tabular-nums">
            {company.currencySymbol}{totalCostValuation.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">{t('At supplier purchase cost', 'সাপ্লায়ার ক্রয়মূল্য অনুযায়ী')}</span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500">{t('Expected Retail Value', 'প্রত্যাশিত বিক্রয়মূল্য')}</span>
          <div className="mt-1 text-xl font-bold font-mono text-emerald-700 tabular-nums">
            {company.currencySymbol}{totalRetailValuation.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            +{company.currencySymbol}{(totalRetailValuation - totalCostValuation).toLocaleString()} {t('gross margin', 'মোট লাভ')}
          </span>
        </div>
      </div>

      {/* Audit History Drawer if toggled */}
      {showAdjustmentHistory && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <History className="h-4 w-4 text-indigo-600" />
              <span>{t('Stock Adjustment Logs (Manual Corrections)', 'ম্যানুয়াল স্টক সমন্বয় ইতিহাস')}</span>
            </h3>
            <button
              onClick={() => setShowAdjustmentHistory(false)}
              className="text-xs text-slate-400 hover:text-slate-600"
            >
              {t('Close', 'বন্ধ করুন')}
            </button>
          </div>

          {adjustments.length === 0 ? (
            <p className="text-xs text-slate-500">{t('No manual adjustments recorded yet.', 'কোনো স্টক সমন্বয় রেকর্ড নেই।')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-200 uppercase text-[10px]">
                    <th className="py-2 px-3">{t('Date', 'তারিখ')}</th>
                    <th className="py-2 px-3">{t('Item', 'পণ্য')}</th>
                    <th className="py-2 px-3">{t('Type', 'ধরণ')}</th>
                    <th className="py-2 px-3 text-right">{t('Qty Delta', 'পরিমাণ')}</th>
                    <th className="py-2 px-4">{t('Reason', 'কারণ')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {adjustments.slice(0, 10).map((adj) => (
                    <tr key={adj.id}>
                      <td className="py-2 px-3 font-mono text-slate-500">{adj.date}</td>
                      <td className="py-2 px-3 font-semibold text-slate-800">{adj.itemName}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`font-semibold uppercase text-[10px] ${
                            adj.type === 'add' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {adj.type === 'add' ? t('+ Added', '+ বৃদ্ধি') : t('- Reduced', '- হ্রাস')}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold">
                        {adj.type === 'add' ? `+${adj.qty}` : `-${adj.qty}`}
                      </td>
                      <td className="py-2 px-4 text-slate-600">{adj.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Main Catalog View */}
      <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter and Search Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterType === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                {t('All', 'সকল')} ({items.length})
              </button>
              <button
                onClick={() => setFilterType('low_stock')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterType === 'low_stock' ? 'bg-white text-amber-700 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                {t('Low Stock', 'কম স্টক')} ({items.filter((i) => i.type === 'product' && i.stockQty <= i.minStockAlert).length})
              </button>
              <button
                onClick={() => setFilterType('product')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterType === 'product' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                {t('Products', 'পণ্যসমূহ')}
              </button>
              <button
                onClick={() => setFilterType('service')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  filterType === 'service' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                {t('Services', 'সেবাসমূহ')}
              </button>
            </div>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('Search by name, SKU/barcode, HSN...', 'নাম, বারকোড বা এইচএসএন দিয়ে খুঁজুন...')}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4">{t('Item Details', 'পণ্যের নাম ও বিবরণ')}</th>
                <th className="py-2.5 px-3">{t('SKU / Barcode', 'বারকোড / SKU')}</th>
                <th className="py-2.5 px-3 text-center">{t('HSN Code', 'এইচএসএন')}</th>
                <th className="py-2.5 px-3 text-right">{t('Sale Price', 'বিক্রয় মূল্য')}</th>
                <th className="py-2.5 px-3 text-right">{t('Purchase Cost', 'ক্রয় মূল্য')}</th>
                <th className="py-2.5 px-3 text-right">{t('Stock Qty', 'স্টক পরিমাণ')}</th>
                <th className="py-2.5 px-4 text-right">{t('Actions', 'পদক্ষেপ')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isLow = item.type === 'product' && item.stockQty <= item.minStockAlert;
                const margin =
                  item.salePrice > 0 && item.purchasePrice > 0
                    ? Math.round(((item.salePrice - item.purchasePrice) / item.salePrice) * 100)
                    : 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="capitalize">{item.category}</span>
                        <span>·</span>
                        <span>GST: {item.taxRate}%</span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">
                      {item.sku || '-'}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-600">
                      {item.hsnCode || '-'}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                      {company.currencySymbol}{item.salePrice.toLocaleString()}
                    </td>

                    <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                      {item.purchasePrice > 0 ? `${company.currencySymbol}${item.purchasePrice.toLocaleString()}` : '-'}
                      {margin > 0 && (
                        <span className="text-[10px] text-emerald-600 block">+{margin}%</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right">
                      {item.type === 'service' ? (
                        <span className="text-slate-400 font-medium">{t('Service (N/A)', 'সেবা (স্টক নেই)')}</span>
                      ) : (
                        <div className="inline-block">
                          <span
                            className={`font-mono font-bold text-xs tabular-nums ${
                              isLow ? 'text-amber-700' : 'text-slate-900'
                            }`}
                          >
                            {item.stockQty} {item.unit}
                          </span>
                          {isLow && (
                            <span className="text-[10px] text-amber-700 block font-semibold">
                              {t(`Low Stock! (Min ${item.minStockAlert})`, `কম স্টক! (ন্যূনতম ${item.minStockAlert})`)}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.type === 'product' && (
                          <button
                            onClick={() => handleOpenAdjustStock(item)}
                            title={t('Adjust Stock', 'স্টক সমন্বয়')}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
                          >
                            {t('Adjust', 'স্টক সমন্বয়')}
                          </button>
                        )}
                        <button
                          onClick={() => openEditItemModal(item)}
                          className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded"
                        >
                          {t('Edit', 'সম্পাদনা')}
                        </button>
                        <button
                          onClick={() => {
                            const conf = t(`Delete ${item.name}?`, `আপনি কি ${item.name} পণ্যটি মুছে ফেলতে চান?`);
                            if (window.confirm(conf)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          className="px-2 py-1 text-[11px] text-rose-600 hover:bg-rose-50 rounded"
                        >
                          {t('Delete', 'মুছুন')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {editingItem ? t('Edit Item Details', 'পণ্যের তথ্য সংশোধন') : t('Add New Item / Service', 'নতুন পণ্য / সেবা তৈরি')}
              </h3>
              <button
                onClick={() => setIsItemModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('Item / Service Name *', 'পণ্য বা সেবার নাম *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('e.g. Legal Deed Drafting or Land Registration', 'যেমন: জমির দলিল রেজিস্ট্রি বা ড্রাফটিং')}
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('Item Type', 'আইটেমের ধরণ')}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ItemType)}
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="product">{t('Physical Product (Stockable)', 'ভৌত পণ্য (স্টকযোগ্য)')}</option>
                    <option value="service">{t('Professional Service / Fee', 'পেশাগত সেবা / ফি')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('Category', 'বিভাগ বা শ্রেণী')}
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="General / Legal"
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('SKU / Item Code', 'এসকেইউ বা কোড')}
                  </label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full h-9 px-3 text-xs font-mono bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('HSN / SAC Code', 'এইচএসএন / এসএসি কোড')}
                  </label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="e.g. 998211"
                    className="w-full h-9 px-3 text-xs font-mono bg-white border border-slate-300 rounded-lg outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('Sale Price', 'বিক্রয় মূল্য')} ({company.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={salePrice}
                    onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 text-xs font-mono font-semibold bg-white border border-slate-300 rounded-lg outline-none tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('Purchase Cost', 'ক্রয় খরচ')} ({company.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 text-xs font-mono bg-white border border-slate-300 rounded-lg outline-none tabular-nums"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('GST Tax Rate (%)', 'জিএসটি করের হার (%)')}
                  </label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full h-9 px-3 text-xs font-mono bg-white border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="0">0% ({t('Exempt', 'করমুক্ত')})</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('Unit of Measurement', 'পরিমাপের একক')}
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitType)}
                    className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                  >
                    <option value="SERVICE">{t('SERVICE (Professional)', 'SERVICE (পেশাগত সেবা)')}</option>
                    <option value="PCS">{t('PCS (Pieces)', 'PCS (পিস)')}</option>
                    <option value="BOX">{t('BOX (Boxes)', 'BOX (বক্স)')}</option>
                    <option value="KG">{t('KG (Kilograms)', 'KG (কেজি)')}</option>
                    <option value="LTR">{t('LTR (Litres)', 'LTR (লিটার)')}</option>
                    <option value="MTR">{t('MTR (Metres)', 'MTR (মিটার)')}</option>
                    <option value="BAG">{t('BAG (Bags)', 'BAG (ব্যাগ)')}</option>
                    <option value="SET">{t('SET (Sets)', 'SET (সেট)')}</option>
                    <option value="NOS">{t('NOS (Numbers)', 'NOS (সংখ্যা)')}</option>
                  </select>
                </div>

                {type === 'product' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t('Current Stock Quantity', 'বর্তমান মজুত পরিমাণ')}
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={stockQty}
                        onChange={(e) => setStockQty(parseFloat(e.target.value) || 0)}
                        className="w-full h-9 px-3 text-xs font-mono bg-white border border-slate-300 rounded-lg outline-none tabular-nums"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t('Low Stock Alert Level', 'ন্যূনতম স্টক সতর্কতা')}
                      </label>
                      <input
                        type="number"
                        value={minStockAlert}
                        onChange={(e) => setMinStockAlert(parseFloat(e.target.value) || 0)}
                        className="w-full h-9 px-3 text-xs font-mono bg-white border border-slate-300 rounded-lg outline-none tabular-nums"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {t('Cancel', 'বাতিল')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  {t('Save Item', 'সংরক্ষণ')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && adjustTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{t('Adjust Inventory Stock', 'স্টক সমন্বয় করুন')}</h3>
                <p className="text-xs text-slate-500">{adjustTargetItem.name}</p>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="p-5 space-y-4">
              <div>
                <span className="text-xs text-slate-500 block">{t('Current Stock:', 'বর্তমান মজুত:')}</span>
                <span className="font-mono font-bold text-base text-slate-900">
                  {adjustTargetItem.stockQty} {adjustTargetItem.unit}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('Action', 'কার্যক্রম')}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      adjustType === 'add'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {t('+ Add Stock', '+ স্টক বৃদ্ধি')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('reduce')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      adjustType === 'reduce'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 font-bold'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    {t('- Reduce Stock', '- স্টক হ্রাস')}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('Quantity', 'পরিমাণ')} ({adjustTargetItem.unit})
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="any"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseFloat(e.target.value) || 0)}
                  className="w-full h-9 px-3 text-sm font-mono font-semibold bg-white border border-slate-300 rounded-lg outline-none tabular-nums"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('Reason', 'সমন্বয়ের কারণ')}</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg outline-none"
                >
                  <option value="Stock replenishment">{t('Stock replenishment', 'স্টক যোগ / রিফিল')}</option>
                  <option value="Physical recount correction">{t('Physical recount correction', 'শারীরিক গণনা সংশোধন')}</option>
                  <option value="Damaged / Expired goods">{t('Damaged / Expired goods', 'নষ্ট বা মেয়াদোত্তীর্ণ পণ্য')}</option>
                  <option value="Gift / Sample dispatch">{t('Gift / Sample dispatch', 'উপহার বা নমুনা প্রদান')}</option>
                  <option value="Internal usage">{t('Internal business usage', 'অভ্যন্তরীণ অফিসের ব্যবহার')}</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  {t('Cancel', 'বাতিল')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  {t('Save Adjustment', 'সংরক্ষণ করুন')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
