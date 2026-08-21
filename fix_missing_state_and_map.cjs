const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

// 1. Update imports
content = content.replace(
  "import { MapPin, Star, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock, User as UserIcon, Loader2, Lock, Save, Eye, X } from 'lucide-react';",
  "import { MapPin, Star, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock, User as UserIcon, Loader2, Lock, Save, Eye, X, Map as MapIcon, Grid as GridIcon } from 'lucide-react';"
);

// 2. Add state
const oldStateLine = "const [filterCity, setFilterCity] = useState<number | string>('');";
const newStateLine = "const [filterCity, setFilterCity] = useState<number | string>('');\n  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');\n  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');";
if (!content.includes("const [sortBy")) {
  content = content.replace(oldStateLine, newStateLine);
}

// 3. Update the filters row to actually add the select dropdown (which previously failed)
// We also add the map/grid toggle!
const oldFiltersHeader = `<h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-zinc-900" />
            {isAr ? 'تصفية الصالونات حسب المنطقة' : 'Filter Salons by Region'}
          </h3>`;
const newFiltersHeader = `<div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-zinc-900" />
              {isAr ? 'تصفية الصالونات' : 'Filter Salons'}
            </h3>
            <div className="flex items-center gap-2 bg-zinc-50 p-1 rounded-xl border border-zinc-200">
              <button onClick={() => setViewMode('grid')} className={\`p-1.5 rounded-lg transition-colors \${viewMode === 'grid' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}\`}>
                <GridIcon className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('map')} className={\`p-1.5 rounded-lg transition-colors \${viewMode === 'map' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}\`}>
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>`;
content = content.replace(oldFiltersHeader, newFiltersHeader);

const oldFiltersGrid = `<div className="grid md:grid-cols-3 gap-4">`;
const newFiltersGrid = `<div className="grid md:grid-cols-4 gap-4">
            <div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'distance' | 'rating')}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none font-medium text-sm"
              >
                <option value="distance">{isAr ? 'الأقرب مسافة' : 'Nearest Distance'}</option>
                <option value="rating">{isAr ? 'الأعلى تقييماً' : 'Highest Rating'}</option>
              </select>
            </div>`;
if (!content.includes('<option value="distance">')) {
  content = content.replace(oldFiltersGrid, newFiltersGrid);
}

fs.writeFileSync('src/screens/ClientApp.tsx', content);
