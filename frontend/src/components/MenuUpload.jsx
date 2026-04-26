import { useState } from 'react';
import { XMarkIcon, PhotoIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const LABEL_COLORS = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  'Very High': 'bg-red-100 text-red-800',
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
      const res = await fetch('/api/menu/scan', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Scan failed');
      }
      const data = await res.json();
      setResults(data);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-bold text-gray-900">Scan Menu</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Restaurant name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Restaurant Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            disabled={!!results}
            placeholder="e.g. Nobu, Le Bernardin..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>

        {/* Image upload area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Menu preview"
              className="mx-auto max-h-48 object-contain rounded-md"
            />
          ) : (
            <>
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Upload a photo of the restaurant menu</p>
            </>
          )}
          {!results && (
            <label
              htmlFor="menu-image-upload"
              className="mt-3 inline-block cursor-pointer text-green-600 hover:text-green-500 text-sm font-medium"
            >
              {previewUrl ? 'Change image' : 'Select image'}
              <input
                id="menu-image-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-md px-3 py-2">{error}</p>
        )}

        {!results && (
          <button
            onClick={handleScan}
            disabled={!selectedFile || !restaurantName.trim() || scanning}
            className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {scanning ? (
              <span className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Analyzing menu...</span>
              </span>
            ) : (
              'Scan Menu'
            )}
          </button>
        )}

        {results && (
          <div className="mt-6 space-y-5">
            {/* Summary card */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-5 text-center">
              <p className="font-semibold text-gray-800 text-base">{restaurantName}</p>
              <p className="text-sm text-gray-500 uppercase tracking-wide font-medium mt-2">
                Average Carbon Score
              </p>
              <p className="text-4xl font-bold text-gray-900 mt-1">
                {results.avg_carbon_score}
                <span className="text-lg font-normal text-gray-400 ml-1">kg CO₂e</span>
              </p>
              <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${LABEL_COLORS[results.avg_label]}`}>
                {results.avg_label} Impact
              </span>
              <p className="text-xs text-gray-400 mt-2">{results.total_dishes} dishes analyzed</p>
            </div>

            {/* Top 5 dishes */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Top 5 Eco-Friendly Dishes</h3>
              <div className="space-y-2">
                {results.top5_dishes.map((dish, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2.5 gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <span
                        className="text-sm text-gray-900 leading-snug"
                        title={dish.dish}
                      >
                        {dish.dish.length > 36 ? dish.dish.slice(0, 36) + '…' : dish.dish}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-xs text-gray-400 font-mono whitespace-nowrap">
                        {dish.carbon_score_kg_co2e} kg
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${LABEL_COLORS[dish.label]}`}>
                        {dish.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
              >
                Scan Another
              </button>
              {saved ? (
                <div className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-100 rounded-md text-green-700 text-sm font-medium">
                  <CheckCircleIcon className="h-4 w-4" />
                  Saved!
                </div>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                >
                  Save to My Places
                </button>
              )}
            </div>
            {saved && (
              <button
                onClick={onClose}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm font-medium"
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
