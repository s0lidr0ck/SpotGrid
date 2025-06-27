import React, { useState } from 'react';
import { Check, Plus, Minus } from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { formatCurrency } from '../../utils/calculations';
import { DayPart } from '../../pages/EstimateDetails';

interface SelectedSlot {
  id: string;
  dayPartId: string;
  specificDate: string;
  userDefinedCpm: number;
  spotsPerOccurrence: number;
}

interface ScheduleGridProps {
  dayParts: DayPart[];
  selectedSlots: SelectedSlot[];
  onSlotSelect: (slot: SelectedSlot) => void;
  onSlotRemove: (slotId: string) => void;
  isEditable?: boolean;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  dayParts,
  selectedSlots,
  onSlotSelect,
  onSlotRemove,
  isEditable = true
}) => {
  const [editingSpots, setEditingSpots] = useState<{ [key: string]: number }>({});
  const [editingCpm, setEditingCpm] = useState<{ [key: string]: number }>({});

  const formatTime = (timeString: string | null | undefined): string => {
    if (!timeString) return 'N/A';
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours, 10);
      
      if (isNaN(hour)) return 'N/A';
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}${minutes !== '00' ? `:${minutes}` : ''} ${period}`;
    } catch {
      return 'N/A';
    }
  };

  const isSlotSelected = (dayPartId: string): SelectedSlot | undefined => {
    return selectedSlots.find(slot => slot.dayPartId === dayPartId);
  };

  const handleCpmChange = (dayPart: DayPart, amount: number) => {
    const currentCpm = editingCpm[dayPart.id] || dayPart.lowestCpm;
    const newCpm = Math.max(dayPart.lowestCpm, currentCpm + amount);
    setEditingCpm({ ...editingCpm, [dayPart.id]: newCpm });
  };

  const handleSpotsChange = (dayPart: DayPart, spots: number) => {
    setEditingSpots({ ...editingSpots, [dayPart.id]: spots });
  };

  const handleAddSlot = (dayPart: DayPart) => {
    const spotsPerOccurrence = editingSpots[dayPart.id] || dayPart.spotFrequency;
    const userDefinedCpm = editingCpm[dayPart.id] || dayPart.lowestCpm;
    
    onSlotSelect({
      id: crypto.randomUUID(),
      dayPartId: dayPart.id,
      specificDate: new Date().toISOString().split('T')[0],
      spotsPerOccurrence,
      userDefinedCpm
    });
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Spot Grid</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Slot
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPM
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Spots
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dayParts.map((dayPart) => {
              const selected = isSlotSelected(dayPart.id);
              const currentSpots = editingSpots[dayPart.id] || dayPart.spotFrequency;
              const currentCpm = editingCpm[dayPart.id] || dayPart.lowestCpm;
              
              return (
                <tr key={dayPart.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{dayPart.name}</div>
                    <div className="text-sm text-gray-500">
                      {formatTime(dayPart.startTime)} - {formatTime(dayPart.endTime)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Multiplier: {dayPart.multiplier}x • Max {dayPart.spotFrequency} spots
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {isEditable && !selected ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="light"
                          onClick={() => handleCpmChange(dayPart, -0.5)}
                          disabled={currentCpm <= dayPart.lowestCpm}
                          icon={<Minus size={16} />}
                        />
                        <span className="min-w-[80px] text-center font-medium">
                          {formatCurrency(currentCpm)}
                        </span>
                        <Button
                          size="sm"
                          variant="light"
                          onClick={() => handleCpmChange(dayPart, 0.5)}
                          icon={<Plus size={16} />}
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900">
                        {formatCurrency(selected?.userDefinedCpm || dayPart.lowestCpm)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isEditable && !selected ? (
                      <select
                        className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        value={currentSpots}
                        onChange={(e) => handleSpotsChange(dayPart, parseInt(e.target.value))}
                      >
                        {Array.from({ length: dayPart.spotFrequency }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="text-sm text-gray-900">
                        {selected?.spotsPerOccurrence || dayPart.spotFrequency}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {dayPart.days} days per week
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {selected ? (
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => onSlotRemove(selected.id)}
                        disabled={!isEditable}
                        icon={<Check size={16} className="text-green-500" />}
                      >
                        Added
                      </Button>
                    ) : (
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => handleAddSlot(dayPart)}
                        disabled={!isEditable}
                        icon={<Plus size={16} />}
                      >
                        Add
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default ScheduleGrid;