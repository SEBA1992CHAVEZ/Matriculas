import React from 'react';

const FormField = ({ label, name, value, onChange, type = "text", placeholder, disabled, required, options, section, className = "" }) => {
  const baseStyles = "p-2 border rounded outline-none focus:border-slate-400 uppercase w-full";
  const disabledStyles = "bg-slate-50 cursor-not-allowed opacity-50";
  
  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-xs font-bold text-slate-600 mb-1 uppercase">{label} {required && '*'}</label>
      {type === "select" ? (
        <select name={name} value={value} onChange={(e) => onChange(e, section)} disabled={disabled} required={required} className={`${baseStyles} bg-white ${disabled ? disabledStyles : ''}`}>
          <option value="">SELECCIONE...</option>
          {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea name={name} value={value} onChange={(e) => onChange(e, section)} placeholder={placeholder} disabled={disabled} className={`${baseStyles} h-16 text-sm ${disabled ? disabledStyles : ''}`} />
      ) : (
        <input type={type} name={name} value={value} onChange={(e) => onChange(e, section)} placeholder={placeholder} disabled={disabled} required={required} className={`${baseStyles} ${disabled ? disabledStyles : ''}`} />
      )}
    </div>
  );
};

export default FormField;