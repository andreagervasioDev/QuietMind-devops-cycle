const PRESETS = [3, 5, 10, 15, 20];

interface DurationPickerProps {
  minutes: number;
  onSelect: (minutes: number) => void;
  disabled?: boolean;
}

export function DurationPicker({ minutes, onSelect, disabled }: DurationPickerProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(preset)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              minutes === preset
                ? 'border-sage-500 bg-sage-500 text-white'
                : 'border-sage-200 text-sage-600 hover:border-sage-400 dark:border-sage-700 dark:text-sage-200'
            }`}
          >
            {preset} min
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-sage-600 dark:text-sage-300">
        Personalizza:
        <input
          type="number"
          min={1}
          max={120}
          value={minutes}
          disabled={disabled}
          onChange={(event) => {
            const value = Number(event.target.value);
            if (value > 0 && value <= 120) onSelect(value);
          }}
          className="w-16 rounded-lg border border-sage-200 bg-sand-50 px-2 py-1 text-center text-sage-700 disabled:opacity-50 dark:border-sage-700 dark:bg-sage-800 dark:text-sage-100"
        />
        min
      </label>
    </div>
  );
}
