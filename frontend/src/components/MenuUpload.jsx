import { useState } from 'react';
import { XMarkIcon, PhotoIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const LABEL_COLORS = {
  Low:        'bg-eco-green/20 text-eco-green',
  Medium:     'bg-eco-yellow/20 text-eco-yellow',
  High:       'bg-orange-500/20 text-orange-400',
  'Very High':'bg-eco-red/20 text-eco-red',
};

const MenuUpload = ({ onClose, onMenuUploaded }) => {
  const { saveRestaurant } = useAuth();
  const [restaurantName, setRestaurantName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResults(null);
    setError(null);
    setSaved(false);
  };

  const handleScan = async () => {
    if (!selectedFile || !restaurantName.trim()) return;
    setScanning(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch('/api/menu/scan', { method: 'POST', body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Scan failed');
      }
      setResults(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setScanning(false);
    }
  };

  const handleSave = () => {
    saveRestaurant({
      id: Date.now(),
      name: restaurantName.trim(),
      source: 'scan',
      avg_carbon_score: results.avg_carbon_score,
      avg_label: results.avg_label,
      top5_dishes: results.top5_dishes,
    });
    setSaved(true);
    onMenuUploaded?.();
  };

  const handleReset = () => {
    setResults(null);
    setSelectedFile(null);
    setPreviewUrl(null);
    setRestaurantName('');
    setSaved(false);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">

        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-white">Scan Menu</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Restaurant name */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-widest mb-1.5">
            Restaurant Name <span className="text-eco-red">*</span>
          </label>
          <input
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            disabled={!!results}
            placeholder="e.g. Nobu, Le Bernardin…"
            className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-eco-green disabled:opacity-50 transition-colors"
          />
        </div>

        {/* Image upload */}
        <div className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center">
          {previewUrl ? (
            <img src={previewUrl} alt="Menu preview" className="mx-auto max-h-48 object-contain rounded-lg" />
          ) : (
            <>
              <PhotoIcon className="mx-auto h-10 w-10 text-gray-600" />
              <p className="mt-2 text-sm text-gray-500">Upload a photo of the menu</p>
            </>
          )}
          {!results && (
            <label htmlFor="menu-image-upload" className="mt-3 inline-block cursor-pointer text-eco-green hover:text-green-400 text-sm font-medium transition-colors">
              {previewUrl ? 'Change image' : 'Select image'}
              <input id="menu-image-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
            </label>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-eco-red bg-eco-red/10 border border-eco-red/20 rounded-xl px-3 py-2">{error}</p>
        )}

        {!results && (
          <button
            onClick={handleScan}
            disabled={!selectedFile || !restaurantName.trim() || scanning}
            className="mt-4 w-full px-4 py-2.5 bg-eco-green text-gray-950 rounded-xl font-semibold hover:bg-green-400 disabled:opacity-40 transition-colors"
          >
            {scanning ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Analyzing menu…
              </span>
            ) : 'Scan Menu'}
          </button>
        )}

        {results && (
          <div className="mt-6 space-y-5">
            {/* Summary */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 text-center">
              <p className="font-semibold text-white">{restaurantName}</p>
              <p className="text-xs text-gray-400 uppercase tracking-widest font-medium mt-2">Average Carbon Score</p>
              <p className="text-4xl font-bold text-white mt-1">
                {results.avg_carbon_score}
                <span className="text-base font-normal text-gray-500 ml-1">kg CO₂e</span>
              </p>
              <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${LABEL_COLORS[results.avg_label]}`}>
                {results.avg_label} Impact
              </span>
              <p className="text-xs text-gray-500 mt-2">{results.total_dishes} dishes analyzed</p>
            </div>

            {/* Top 5 dishes */}
            <div>
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">Top 5 Eco-Friendly Dishes</h3>
              <div className="space-y-2">
                {results.top5_dishes.map((dish, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-800 rounded-xl px-3 py-2.5 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-eco-green/20 text-eco-green text-xs flex items-center justify-center font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm text-white truncate" title={dish.dish}>
                        {dish.dish.length > 36 ? dish.dish.slice(0, 36) + '…' : dish.dish}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-gray-500 font-mono">{dish.carbon_score_kg_co2e} kg</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LABEL_COLORS[dish.label]}`}>
                        {dish.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 border border-gray-700 rounded-xl text-gray-400 hover:text-white text-sm font-medium transition-colors"
              >
                Scan Another
              </button>
              {saved ? (
                <div className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-eco-green/10 rounded-xl text-eco-green text-sm font-medium">
                  <CheckCircleIcon className="h-4 w-4" />
                  Saved!
                </div>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 bg-eco-green text-gray-950 rounded-xl text-sm font-semibold hover:bg-green-400 transition-colors"
                >
                  Save to My Places
                </button>
              )}
            </div>

            {saved && (
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 border border-gray-700 rounded-xl text-gray-400 hover:text-white text-sm font-medium transition-colors"
              >
                Done
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuUpload;
