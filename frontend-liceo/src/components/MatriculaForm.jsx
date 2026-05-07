import React, { useState } from 'react';
import axios from 'axios';

const MatriculaForm = () => {
  const [formData, setFormData] = useState({
    alumno: {
      rut_estudiante: '', rut_provisorio: '', nombres: '', nombre_social: '',
      apellido_paterno: '', apellido_materno: '', email: '', telefono: '',
      nacionalidad: 'Chile - CL', etnia: 'No pertenece', fecha_nacimiento: '',
      sexo: 'Masculino', id_curso: ''
    },
    apoderado: {
      rut_apoderado: '', nombres: '', apellidos: '', email: '', telefono: '',
      id_parentesco: '', es_titular: 1, sexo: 'Femenino'
    },
    apoderado_suplente: {
      rut_apoderado: '', nombres: '', apellidos: '', email: '', telefono: '',
      id_parentesco: '', es_titular: 0, sexo: 'Masculino', nombre_social: '',
      nacionalidad: 'Chile - CL', etnia: 'No pertenece'
    },
    direccion: { calle_pasaje: '', numero: '', sector: '', id_comuna: '' },
    salud: { 
      sistema_salud: 'FONASA', consultorio_clinica: '', estatura_cm: '', peso_kg: '',
      talla_ropa: '', calzado: '', medicamentos: '', contraindicaciones: '', alergias: '',
      enfermedad_cronica: '', 
      problemas_visuales: 0, problemas_auditivos: 0, problemas_cardiacos: 0, 
      problemas_dentales: 0, problemas_columna: 0,
      pertenece_pie: 0, diagnostico_pie: '', 
      beneficio_junaeb_alimentacion: 0, beneficio_junaeb_utiles: 0, 
      beneficio_dental: 0, beneficio_movilizacion: 0 
    }
  });

  const handleNestedChange = (e, section) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/matriculas', formData);
      if (response.data.success) alert('Matrícula registrada exitosamente');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al procesar matrícula');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full p-10 bg-white shadow-sm border-t border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Formulario de Matrícula 2026</h2>
      
      {/* Sección Alumno */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-3"><h3 className="font-bold text-xl text-slate-700">1. Datos Personales del Estudiante</h3></div>
        <div className="md:col-span-1 text-right text-xs text-slate-400 italic">* Campos obligatorios</div>
        
        <input name="rut_estudiante" placeholder="RUT Estudiante *" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded focus:ring-2 focus:ring-slate-400 outline-none" required />
        <input name="rut_provisorio" placeholder="RUT Provisorio (Opcional)" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded" />
        <input name="nombres" placeholder="Nombres" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded" required />
        <input name="nombre_social" placeholder="Nombre Social" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded" />
        <input name="apellido_paterno" placeholder="Apellido Paterno" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded" required />
        <input name="apellido_materno" placeholder="Apellido Materno" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded" />
        <select name="sexo" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded">
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
        </select>
        <input type="date" name="fecha_nacimiento" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded" />
        <input name="email" type="email" placeholder="Email Alumno" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded" />
        <input name="telefono" placeholder="Teléfono Alumno" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded" />
        <input name="nacionalidad" placeholder="Nacionalidad" defaultValue="Chile - CL" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded" />
        <input name="etnia" placeholder="Etnia" defaultValue="No pertenece" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded" />
        <input name="id_curso" placeholder="ID Curso (ej: 1)" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded" required />
      </div>

      {/* Sección Apoderado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-3"><h3 className="font-bold text-lg text-slate-700">2. Información del Apoderado</h3></div>
        <div className="md:col-span-1"></div>
        
        <input name="rut_apoderado" placeholder="RUT Apoderado" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded" required />
        <input name="nombres" placeholder="Nombres Apoderado" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded" required />
        <input name="apellidos" placeholder="Apellidos Apoderado" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded" />
        <select name="sexo" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded">
          <option value="Femenino">Femenino</option>
          <option value="Masculino">Masculino</option>
          <option value="Otro">Otro</option>
        </select>
        <select name="id_parentesco" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded" required>
          <option value="">Seleccione Parentesco</option>
          <option value="1">Madre</option>
          <option value="2">Padre</option>
          <option value="3">Tutor/a</option>
        </select>
        <input name="email" type="email" placeholder="Email" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded" />
        <input name="telefono" placeholder="Teléfono" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded" />
      </div>

      {/* Sección Apoderado Suplente (Opcional) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-4"><h3 className="font-bold text-xl text-slate-700 border-b pb-1">3. Apoderado Suplente (Opcional)</h3></div>
        
        <input name="rut_apoderado" placeholder="RUT Suplente" onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} className="p-2 border rounded" />
        <input name="nombres" placeholder="Nombres Suplente" onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} className="p-2 border rounded" />
        <input name="apellidos" placeholder="Apellidos Suplente" onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} className="p-2 border rounded" />
        <select name="sexo" onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} className="p-2 border rounded">
          <option value="Masculino">Masculino</option>
          <option value="Femenino">Femenino</option>
          <option value="Otro">Otro</option>
        </select>
        <select name="id_parentesco" onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} className="p-2 border rounded">
          <option value="">Parentesco Suplente</option>
          <option value="1">Madre</option>
          <option value="2">Padre</option>
          <option value="4">Abuelo/a</option>
          <option value="5">Otro Familiar</option>
        </select>
        <input name="email" type="email" placeholder="Email Suplente" onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} className="p-2 border rounded" />
        <input name="telefono" placeholder="Teléfono Suplente" onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} className="p-2 border rounded" />
      </div>

      {/* Sección Dirección y Salud */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-xl text-slate-700 mb-2 border-b pb-1">4. Residencia del Alumno</h3>
          <div className="grid grid-cols-1 gap-2">
            <input name="calle_pasaje" placeholder="Calle/Pasaje" onChange={(e) => handleNestedChange(e, 'direccion')} className="p-2 border rounded" />
            <input name="numero" placeholder="Número/Casa" onChange={(e) => handleNestedChange(e, 'direccion')} className="p-2 border rounded" />
            <input name="sector" placeholder="Sector/Población" onChange={(e) => handleNestedChange(e, 'direccion')} className="p-2 border rounded" />
            <input name="id_comuna" placeholder="ID Comuna (Ej: 1)" onChange={(e) => handleNestedChange(e, 'direccion')} className="p-2 border rounded" required />
          </div>
        </div>
        <div className="md:col-span-2">
          <h3 className="font-bold text-xl text-slate-700 mb-2 border-b pb-1">5. Ficha de Salud y Beneficios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <select name="sistema_salud" onChange={(e) => handleNestedChange(e, 'salud')} className="p-2 border rounded w-full">
                <option value="FONASA">FONASA</option>
                <option value="ISAPRE">ISAPRE</option>
                <option value="DIPRECA/CAPREDENA">DIPRECA/CAPREDENA</option>
                <option value="Particular">Particular</option>
              </select>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" name="pertenece_pie" onChange={(e) => handleNestedChange(e, 'salud')} /> Pertenece a PIE
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" name="beneficio_junaeb_alimentacion" onChange={(e) => handleNestedChange(e, 'salud')} /> Beneficio JUNAEB
                </label>
              </div>
            </div>
            <textarea 
              name="diagnostico_pie" 
              placeholder="Si pertenece a PIE, detalle diagnóstico aquí..." 
              onChange={(e) => handleNestedChange(e, 'salud')} 
              className="p-2 border rounded w-full h-24 text-sm"
            />
          </div>
        </div>
      </div>

      <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition">
        Finalizar Matrícula
      </button>
    </form>
  );
};

export default MatriculaForm;