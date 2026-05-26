import React from 'react';

const Section = ({ title, children, description }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    <div className="md:col-span-3">
      <h3 className="font-bold text-xl text-slate-700 border-b pb-1">{title}</h3>
    </div>
    {description && <div className="md:col-span-1 text-right text-xs text-slate-400 italic">{description}</div>}
    {children}
  </div>
);

export default Section;