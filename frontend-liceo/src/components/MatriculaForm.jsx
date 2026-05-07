import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MatriculaForm = () => {
  const [electivosDB, setElectivosDB] = useState([]);
  const [cursosDB, setCursosDB] = useState([]);

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
    },
    electivos: { religion: '', artes: '', especialidad: '' }
  });

  // Cargar datos iniciales (electivos y cursos) desde el Backend al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Realizamos ambas peticiones en paralelo para optimizar la carga
        const [electivosRes, cursosRes] = await Promise.all([
          axios.get('http://localhost:3000/api/electivos'),
          axios.get('http://localhost:3000/api/cursos')
        ]);

        if (electivosRes.data.success) {
          setElectivosDB(electivosRes.data.data);
        }
        if (cursosRes.data.success) {
          setCursosDB(cursosRes.data.data);
        }
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
      }
    };
    fetchData();
  }, []);

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

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">RUT Estudiante *</label>
          <input name="rut_estudiante" placeholder="12.345.678-9" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded focus:ring-2 focus:ring-slate-400 outline-none" required />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">RUT Provisorio</label>
          <input name="rut_provisorio" placeholder="Si aplica" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Nombres *</label>
          <input name="nombres" placeholder="Ej: Juan Pedro" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded outline-none focus:border-slate-400" required />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Nombre Social</label>
          <input name="nombre_social" placeholder="Opcional" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Apellido Paterno *</label>
          <input name="apellido_paterno" placeholder="Ej: Pérez" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded outline-none focus:border-slate-400" required />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Apellido Materno</label>
          <input name="apellido_materno" placeholder="Ej: Soto" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Sexo *</label>
          <select name="sexo" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded outline-none focus:border-slate-400 bg-white">
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Fecha Nacimiento</label>
          <input type="date" name="fecha_nacimiento" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Email Alumno</label>
          <input name="email" type="email" placeholder="alumno@correo.cl" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Teléfono Alumno</label>
          <input name="telefono" placeholder="+56 9..." onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Nacionalidad</label>
          <input name="nacionalidad" defaultValue="Chile - CL" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Etnia</label>
          <input name="etnia" defaultValue="No pertenece" onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase text-blue-600">Curso Asignado *</label>
          <select 
            name="id_curso" 
            value={formData.alumno.id_curso}
            onChange={(e) => handleNestedChange(e, 'alumno')} 
            className="p-2 border border-blue-200 rounded outline-none focus:ring-2 focus:ring-blue-400 bg-white" 
            required
          >
            <option value="">Seleccione...</option>
            {cursosDB.map(curso => (
              <option key={curso.id_curso} value={curso.id_curso}>
                {curso.nombre_nivel} - {curso.letra}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sección Apoderado */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-3"><h3 className="font-bold text-lg text-slate-700">2. Información del Apoderado</h3></div>
        <div className="md:col-span-1"></div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">RUT Apoderado *</label>
          <input name="rut_apoderado" placeholder="12.345.678-9" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded outline-none focus:border-slate-400" required />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Nombres *</label>
          <input name="nombres" placeholder="Nombres" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded outline-none focus:border-slate-400" required />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Apellidos</label>
          <input name="apellidos" placeholder="Apellidos" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Sexo</label>
          <select name="sexo" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded outline-none focus:border-slate-400 bg-white">
            <option value="Femenino">Femenino</option>
            <option value="Masculino">Masculino</option>
            <option value="Otro">Otro</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Parentesco *</label>
          <select name="id_parentesco" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded outline-none focus:border-slate-400 bg-white" required>
            <option value="">Seleccione...</option>
            <option value="1">Madre</option>
            <option value="2">Padre</option>
            <option value="3">Tutor/a</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Email</label>
          <input name="email" type="email" placeholder="apoderado@correo.cl" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Teléfono</label>
          <input name="telefono" placeholder="+56 9..." onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
      </div>

      {/* Sección Apoderado Suplente (Opcional) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-4"><h3 className="font-bold text-xl text-slate-700 border-b pb-1">3. Apoderado Suplente (Opcional)</h3></div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">RUT Suplente</label>
          <input name="rut_apoderado" placeholder="RUT" onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Nombres</label>
          <input name="nombres" placeholder="Nombres" onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Apellidos</label>
          <input name="apellidos" placeholder="Apellidos" onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Parentesco</label>
          <select name="id_parentesco" onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} className="p-2 border rounded outline-none focus:border-slate-400 bg-white">
            <option value="">Seleccione...</option>
            <option value="1">Madre</option>
            <option value="2">Padre</option>
            <option value="4">Abuelo/a</option>
            <option value="5">Otro Familiar</option>
          </select>
        </div>
      </div>

      {/* Sección Residencia */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-4"><h3 className="font-bold text-xl text-slate-700 border-b pb-1">4. Residencia del Alumno</h3></div>
        <div className="flex flex-col md:col-span-2">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Calle / Pasaje</label>
          <input name="calle_pasaje" placeholder="Ej: Los Avellanos" onChange={(e) => handleNestedChange(e, 'direccion')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Número</label>
          <input name="numero" placeholder="123" onChange={(e) => handleNestedChange(e, 'direccion')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Sector</label>
          <input name="sector" placeholder="Villa..." onChange={(e) => handleNestedChange(e, 'direccion')} className="p-2 border rounded outline-none focus:border-slate-400" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase text-blue-600">ID Comuna *</label>
          <input name="id_comuna" placeholder="Ej: 1" onChange={(e) => handleNestedChange(e, 'direccion')} className="p-2 border border-blue-200 rounded outline-none focus:ring-1 focus:ring-slate-400" required />
        </div>
      </div>

      {/* Sección Salud */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-4"><h3 className="font-bold text-xl text-slate-700 border-b pb-1">5. Ficha de Salud y Beneficios</h3></div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Sistema de Salud *</label>
          <select name="sistema_salud" onChange={(e) => handleNestedChange(e, 'salud')} className="p-2 border rounded w-full bg-white outline-none focus:border-slate-400">
            <option value="FONASA">FONASA</option>
            <option value="ISAPRE">ISAPRE</option>
            <option value="DIPRECA/CAPREDENA">DIPRECA/CAPREDENA</option>
            <option value="Particular">Particular</option>
          </select>
        </div>
        <div className="flex flex-col justify-center gap-2 pt-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="pertenece_pie" onChange={(e) => handleNestedChange(e, 'salud')} /> Pertenece a PIE
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="beneficio_junaeb_alimentacion" onChange={(e) => handleNestedChange(e, 'salud')} /> Beneficio JUNAEB
          </label>
        </div>
        <div className="flex flex-col md:col-span-2">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Detalle Diagnóstico (Si aplica)</label>
          <textarea 
            name="diagnostico_pie" 
            onChange={(e) => handleNestedChange(e, 'salud')} 
            className="p-2 border rounded w-full h-12 md:h-20 text-sm outline-none focus:border-slate-400"
          />
        </div>
      </div>

      {/* Sección Electivos (Basado en el nuevo script) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-4"><h3 className="font-bold text-xl text-slate-700 border-b pb-1">6. Plan Electivo (1° Medio / Especialidad)</h3></div>
        
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-600 mb-1">Clase de Religión</label>
          <select name="religion" onChange={(e) => handleNestedChange(e, 'electivos')} className="p-2 border rounded bg-white">
            <option value="">Seleccione opción...</option>
            {electivosDB
              .filter(e => e.nombre_categoria === 'Religión')
              .map(e => (
                <option key={e.id_electivo} value={e.id_electivo}>{e.nombre_electivo}</option>
              ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-slate-600 mb-1">Artes</label>
          <select name="artes" onChange={(e) => handleNestedChange(e, 'electivos')} className="p-2 border rounded bg-white">
            <option value="">Seleccione opción...</option>
            {electivosDB
              .filter(e => e.nombre_categoria === 'Artes')
              .map(e => (
                <option key={e.id_electivo} value={e.id_electivo}>{e.nombre_electivo}</option>
              ))}
          </select>
        </div>
        
        <div className="md:col-span-2 text-xs text-slate-500 flex items-end pb-2 italic">
          * Las opciones se habilitan según la disponibilidad del nivel.
        </div>
      </div>

      <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition">
        Finalizar Matrícula
      </button>
    </form>
  );
};

export default MatriculaForm;