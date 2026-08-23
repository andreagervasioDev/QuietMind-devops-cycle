import { AMBIENT_SOUND_LABELS, type AmbientSound } from '../hooks/useAmbientSound';

const SOUND_ICONS: Record<AmbientSound, string> = {
  none: '🔇',
  rain: '🌧️',
  ocean: '🌊',
  whiteNoise: '📻',
};

interface SoundPickerProps {
  sound: AmbientSound;
  onSelect: (sound: AmbientSound) => void;
  volume: number;
  onVolumeChange: (volume: number) => void;
}

export function SoundPicker({ sound, onSelect, volume, onVolumeChange }: SoundPickerProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap justify-center gap-2">
        {(Object.keys(AMBIENT_SOUND_LABELS) as AmbientSound[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              sound === key
                ? 'border-dusk-500 bg-dusk-500 text-white'
                : 'border-sage-200 text-sage-600 hover:border-dusk-300 dark:border-sage-700 dark:text-sage-200'
            }`}
          >
            <span aria-hidden="true">{SOUND_ICONS[key]}</span>
            {AMBIENT_SOUND_LABELS[key]}
          </button>
        ))}
      </div>

      {sound !== 'none' && (
        <label className="flex items-center gap-2 text-sm text-sage-600 dark:text-sage-300">
          Volume
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
            className="accent-dusk-500"
          />
        </label>
      )}
    </div>
  );
}
