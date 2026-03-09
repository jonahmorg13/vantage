interface CheckboxProps {
  checked: boolean
  onChange: () => void
}

export function Checkbox({ checked, onChange }: CheckboxProps) {
  return (
    <label className="flex items-center justify-center cursor-pointer select-none">
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      <div
        className={`w-4 h-4 rounded-sm border transition-all duration-150 flex items-center justify-center ${
          checked ? 'bg-accent border-accent' : 'bg-surface2 border-border hover:border-accent/60'
        }`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </label>
  )
}
