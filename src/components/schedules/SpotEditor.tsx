import React, { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import Button from '../ui/Button';
import { formatCurrency } from '../../utils/calculations';

interface SpotEditorProps {
  dayPartName: string;
  baseCpm: number;
  maxSpots: number;
  currentSpots: number;
  onSpotsChange: (spots: number) => void;
  onCpmChange: (cpm: number) => void;
  onClose: () => void;
}

const SpotEditor: React.FC<SpotEditorProps> = ({
  dayPartName,
  baseCpm,
  maxSpots,
  currentSpots,
  onSpotsChange,
  onCpmChange,
  onClose
}) => {
  const [cpm, setCpm] = useState(baseCpm);
  const [spots, setSpots] = useState(maxSpots); // Default to maximum spots

  // Automatically add spots when component mounts
  useEffect(() => {
    onSpotsChange(spots);
    onCpmChange(cpm);
  }, []);

  const handleCpmChange = (amount: number) => {
    const newCpm = Math.max(baseCpm, cpm + amount);
    setCpm(newCpm);
    onCpmChange(newCpm);
  };

  const handleSpotsChange = (amount: number) => {
    const newSpots = Math.min(Math.max(1, spots + amount), maxSpots);
    setSpots(newSpots);
    onSpotsChange(newSpots);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[300px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{dayPartName}</h3>
          <p className="text-sm text-gray-500">Added to order with maximum spots</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CPM (Minimum: {formatCurrency(baseCpm)})
          </label>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="light"
              onClick={() => handleCpmChange(-0.5)}
              disabled={cpm <= baseCpm}
              icon={<Minus size={16} />}
            />
            <span className="min-w-[80px] text-center font-medium">
              {formatCurrency(cpm)}
            </span>
            <Button
              size="sm"
              variant="light"
              onClick={() => handleCpmChange(0.5)}
              icon={<Plus size={16} />}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Spots (Maximum: {maxSpots})
          </label>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="light"
              onClick={() => handleSpotsChange(-1)}
              disabled={spots <= 1}
              icon={<Minus size={16} />}
            />
            <span className="min-w-[80px] text-center font-medium">
              {spots}
            </span>
            <Button
              size="sm"
              variant="light"
              onClick={() => handleSpotsChange(1)}
              disabled={spots >= maxSpots}
              icon={<Plus size={16} />}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="primary"
            className="w-full"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpotEditor;