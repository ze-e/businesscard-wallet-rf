"use client";

type MultiValueTextareaProps = {
  label: string;
  value: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function MultiValueTextarea({
  label,
  value,
  onChange,
  disabled = false
}: MultiValueTextareaProps) {
  return (
    <label>
      {label}
      <textarea
        disabled={disabled}
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}