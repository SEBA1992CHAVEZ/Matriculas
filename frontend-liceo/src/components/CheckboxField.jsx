import React from 'react';

const CheckboxField = ({ label, name, checked, onChange, section, disabled, className = "" }) => (
  <label className={`flex items-center gap-2 text-sm text-slate-700 cursor-pointer ${className}`}>
    <input 
      type="checkbox" 
      name={name} 
      checked={!!checked} 
      onChange={(e) => onChange(e, section)} 
      disabled={disabled} 
      className="w-4 h-4 rounded border-slate-300"
    />
    {label}
  </label>
);

export default CheckboxField;