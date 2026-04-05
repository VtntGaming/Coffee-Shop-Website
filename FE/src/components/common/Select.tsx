/**
 * ============================================
 * SELECT — Ô chọn lựa dùng chung
 * ============================================
 */
import type { SelectHTMLAttributes } from 'react';
import './Input.css'; // Dùng chung style với Input cho đồng bộ

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export function Select({ label, error, options, id, ...props }: SelectProps) {
  const selectId = id || (label?.toLowerCase().replace(/\s+/g, '-') || '');

  return (
    <div className={`input-group ${error ? 'input-group--error' : ''}`}>
      {label && (
        <label htmlFor={selectId} className="input-group__label">
          {label}
          {props.required && <span className="input-group__required">*</span>}
        </label>
      )}
      
      <select 
        id={selectId}
        className="input-group__input" 
        {...props}
        style={{ cursor: 'pointer', appearance: 'auto' }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <span className="input-group__error">{error}</span>}
    </div>
  );
}
