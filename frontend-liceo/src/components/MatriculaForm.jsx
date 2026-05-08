import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MatriculaForm = () => {
  // --- ESTADOS DE CONTROL DE FLUJO ---
  const [electivosDB, setElectivosDB] = useState([]);
  const [nivelesDB, setNivelesDB] = useState([]);
  const [comunasDB, setComunasDB] = useState([]);
  const [step, setStep] = useState('rut'); // Controla si mostramos el buscador o el formulario
  const [isExistingStudent, setIsExistingStudent] = useState(false); // Bloquea campos si el alumno ya existe
  const [loadingSearch, setLoadingSearch] = useState(false); // Estado visual de carga

  // --- MODELO DE DATOS LIMPIO (Sin campos no utilizados) ---
  const initialFormState = {
    alumno: {
      rut_estudiante: '', rut_provisorio: '', has_rut_provisorio: 0, nombres: '', nombre_social: '', has_nombre_social: 0,
      apellido_paterno: '', apellido_materno: '', email: '', telefono: '',
      nacionalidad: 'CHILE - CL', etnia: 'NO PERTENECE', fecha_nacimiento: '',
      sexo: 'MASCULINO', id_nivel: ''
    },
    apoderado: {
      rut_apoderado: '', nombres: '', apellidos: '', email: '', telefono: '',
      id_parentesco: '', es_titular: 1, sexo: 'FEMENINO'
    },
    apoderado_suplente: {
      rut_apoderado: '', nombres: '', apellidos: '', email: '', telefono: '', has_suplente: 0,
      id_parentesco: '', es_titular: 0, sexo: 'MASCULINO'
    },
    direccion: { calle_pasaje: '', numero: '', sector: '', id_comuna: '' },
    salud: { 
      sistema_salud: 'FONASA', pertenece_pie: 0, diagnostico_pie: '', 
      beneficio_junaeb_alimentacion: 0 
    },
    electivos: { religion: '', artes: '', especialidad: '', formacion_diferenciada: '' }
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- CARGA DE DATOS MAESTROS ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [electivosRes, nivelesRes, comunasRes] = await Promise.all([
          axios.get('http://localhost:3000/api/electivos', config),
          axios.get('http://localhost:3000/api/niveles', config),
          axios.get('http://localhost:3000/api/comunas', config)
        ]);

        if (electivosRes.data.success) {
          setElectivosDB(electivosRes.data.data);
        }
        if (nivelesRes.data.success) {
          setNivelesDB(nivelesRes.data.data);
        }
        if (comunasRes.data.success) {
          setComunasDB(comunasRes.data.data);
        }
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
      }
    };
    fetchData();
  }, []);

  // --- PASO 0: LÓGICA DE BÚSQUEDA ---
  const handleSearchRut = async (e) => {
    e.preventDefault();
    setLoadingSearch(true);
    
    // Aseguramos que el RUT no lleve puntos al enviarse a la URL
    const rut = formData.alumno.rut_estudiante.replace(/\./g, "");

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/alumnos/check/${rut}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.exists) {
        // ALUMNO EXISTE: Cargamos su data y bloqueamos campos clave
        const d = res.data.data;
        setIsExistingStudent(true);
        setFormData(prev => ({
          ...prev,
          alumno: { 
            ...prev.alumno, 
            ...d, 
            has_rut_provisorio: d.rut_provisorio ? 1 : 0, 
            has_nombre_social: d.nombre_social ? 1 : 0 
          },
          direccion: { calle_pasaje: d.calle_pasaje || '', numero: d.numero || '', sector: d.sector || '', id_comuna: d.id_comuna || '' },
          salud: { ...prev.salud, sistema_salud: d.sistema_salud || 'FONASA', pertenece_pie: d.pertenece_pie || 0, diagnostico_pie: d.diagnostico_pie || '' }
        }));
      } else {
        // ALUMNO NUEVO: Limpiamos todo excepto el RUT ingresado
        setIsExistingStudent(false);
        setFormData({
          ...initialFormState,
          alumno: { ...initialFormState.alumno, rut_estudiante: rut }
        });
      }
      setStep('form'); // Pasamos a la pestaña de matrícula
    } catch (err) {
      console.error(err);
      alert("Error al conectar con el servidor para validar el RUT.");
    } finally {
      setLoadingSearch(false);
    }
  };

  // --- UTILIDADES ---
  const getSelectedLevelName = () => {
    const nivelId = parseInt(formData.alumno.id_nivel);
    if (!nivelId) return "";
    const nivel = nivelesDB.find(n => n.id_nivel === nivelId);
    return nivel ? nivel.nombre_nivel.toUpperCase() : '';
  };

  const handleNestedChange = (e, section) => {
    const { name, value, type, checked } = e.target;
    
    let finalValue = type === 'checkbox' ? (checked ? 1 : 0) : value;

    if (typeof value === 'string') {
      if (name.includes('rut')) {
        // Formato RUT: sin puntos y con guion (ej: 12345678-9)
        let clean = value.replace(/[^0-9kK]/g, "").toUpperCase();
        if (clean.length > 1) {
          finalValue = clean.slice(0, -1) + "-" + clean.slice(-1);
        } else {
          finalValue = clean;
        }
      } else {
        finalValue = value.toUpperCase();
      }
    }

    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [name]: finalValue
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/matriculas', 
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) alert('Matrícula registrada exitosamente');
    } catch (err) {
      alert(err.response?.data?.message || 'Error al procesar matrícula');
    }
  };

  // --- RENDERIZADO CONDICIONAL DE PESTAÑAS ---
  if (step === 'rut') {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white shadow-xl rounded-2xl border border-slate-100 max-w-2xl mx-auto mt-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-800">Admisión 2026</h2>
          <p className="text-slate-500 italic mt-2">Ingrese el RUT del estudiante para iniciar el proceso</p>
        </div>
        <form onSubmit={handleSearchRut} className="w-full space-y-4">
          <input 
            name="rut_estudiante" 
            value={formData.alumno.rut_estudiante} 
            onChange={(e) => handleNestedChange(e, 'alumno')}
            placeholder="12.345.678-9"
            className="w-full p-4 border-2 border-slate-200 rounded-xl outline-none focus:border-blue-500 text-2xl font-mono font-bold text-center uppercase"
            required
          />
          <button 
            type="submit" 
            disabled={loadingSearch}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition transform active:scale-95 disabled:bg-slate-400"
          >
            {loadingSearch ? 'VERIFICANDO...' : 'COMENZAR MATRÍCULA'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full p-10 bg-white shadow-sm border-t border-slate-200">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Formulario de Matrícula 2026</h2>
        <button 
          type="button" 
          onClick={() => setStep('rut')} 
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm transition"
        >
          ← VOLVER / CAMBIAR RUT
        </button>
      </div>
      
      {/* Sección Alumno */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-3"><h3 className="font-bold text-xl text-slate-700">1. Datos Personales del Estudiante</h3></div>
        <div className="md:col-span-1 text-right text-xs text-slate-400 italic">* Campos obligatorios</div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">RUT Estudiante *</label>
          <input 
            name="rut_estudiante" 
            value={formData.alumno.rut_estudiante} 
            readOnly 
            className="p-2 border rounded bg-slate-50 font-bold text-blue-600 outline-none uppercase" 
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase flex items-center justify-between">
            RUT Provisorio
            <input type="checkbox" name="has_rut_provisorio" checked={!!formData.alumno.has_rut_provisorio} onChange={(e) => handleNestedChange(e, 'alumno')} className="w-3 h-3" title="Habilitar si el alumno no posee RUT chileno definitivo" />
          </label>
          <input 
            name="rut_provisorio" 
            value={formData.alumno.rut_provisorio} 
            placeholder={formData.alumno.has_rut_provisorio ? "IPE / RUT PROVISORIO" : "NO APLICA"} 
            onChange={(e) => handleNestedChange(e, 'alumno')} 
            disabled={!formData.alumno.has_rut_provisorio || isExistingStudent}
            className={`p-2 border rounded outline-none focus:border-slate-400 uppercase ${!formData.alumno.has_rut_provisorio ? 'bg-slate-50 cursor-not-allowed opacity-50' : 'bg-white'}`} 
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Nombres *</label>
          <input name="nombres" value={formData.alumno.nombres} readOnly={isExistingStudent} onChange={(e) => handleNestedChange(e, 'alumno')} className={`p-2 border rounded outline-none uppercase ${isExistingStudent ? 'bg-slate-50 text-slate-500' : ''}`} required />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase flex items-center justify-between">
            Nombre Social
            <input type="checkbox" name="has_nombre_social" checked={!!formData.alumno.has_nombre_social} onChange={(e) => handleNestedChange(e, 'alumno')} className="w-3 h-3" />
          </label>
          <input 
            name="nombre_social" 
            value={formData.alumno.nombre_social} 
            placeholder={formData.alumno.has_nombre_social ? "NOMBRE ELEGIDO" : "NO APLICA"} 
            onChange={(e) => handleNestedChange(e, 'alumno')} 
            disabled={!formData.alumno.has_nombre_social || isExistingStudent}
            className={`p-2 border rounded outline-none focus:border-slate-400 uppercase ${!formData.alumno.has_nombre_social ? 'bg-slate-50 cursor-not-allowed opacity-50' : 'bg-white'}`} 
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Apellido Paterno *</label>
          <input name="apellido_paterno" value={formData.alumno.apellido_paterno} readOnly={isExistingStudent} onChange={(e) => handleNestedChange(e, 'alumno')} className={`p-2 border rounded outline-none uppercase ${isExistingStudent ? 'bg-slate-50 text-slate-500' : ''}`} required />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Apellido Materno</label>
          <input name="apellido_materno" value={formData.alumno.apellido_materno} readOnly={isExistingStudent} onChange={(e) => handleNestedChange(e, 'alumno')} className={`p-2 border rounded outline-none uppercase ${isExistingStudent ? 'bg-slate-50 text-slate-500' : ''}`} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Sexo *</label>
          <select name="sexo" value={formData.alumno.sexo} onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded outline-none focus:border-slate-400 bg-white uppercase">
            <option value="MASCULINO">MASCULINO</option>
            <option value="FEMENINO">FEMENINO</option>
            <option value="OTRO">OTRO</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Fecha Nacimiento</label>
          <input type="date" name="fecha_nacimiento" value={formData.alumno.fecha_nacimiento} onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded outline-none focus:border-slate-400" />
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
          <input name="nacionalidad" value={formData.alumno.nacionalidad} onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded outline-none focus:border-slate-400 uppercase" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Etnia</label>
          <input name="etnia" value={formData.alumno.etnia} onChange={(e) => handleNestedChange(e, 'alumno')} className="p-2 border rounded outline-none focus:border-slate-400 uppercase" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase text-blue-600">Nivel Asignado *</label>
          <select 
            name="id_nivel" 
            value={formData.alumno.id_nivel}
            onChange={(e) => handleNestedChange(e, 'alumno')} 
            className="p-2 border border-blue-200 rounded outline-none focus:ring-2 focus:ring-blue-400 bg-white uppercase" 
            required
          >
            <option value="">Seleccione...</option>
            {nivelesDB.map(nivel => (
              <option key={nivel.id_nivel} value={nivel.id_nivel}>
                {nivel.nombre_nivel}
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
          <input name="rut_apoderado" value={formData.apoderado.rut_apoderado} placeholder="12.345.678-9" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded outline-none focus:border-slate-400 uppercase" required />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Nombres *</label>
          <input name="nombres" value={formData.apoderado.nombres} placeholder="Nombres" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded outline-none focus:border-slate-400 uppercase" required />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Apellidos</label>
          <input name="apellidos" value={formData.apoderado.apellidos} placeholder="Apellidos" onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded outline-none focus:border-slate-400 uppercase" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Sexo</label>
          <select name="sexo" value={formData.apoderado.sexo} onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded outline-none focus:border-slate-400 bg-white uppercase">
            <option value="FEMENINO">FEMENINO</option>
            <option value="MASCULINO">MASCULINO</option>
            <option value="OTRO">OTRO</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Parentesco *</label>
          <select name="id_parentesco" value={formData.apoderado.id_parentesco} onChange={(e) => handleNestedChange(e, 'apoderado')} className="p-2 border rounded outline-none focus:border-slate-400 bg-white uppercase" required>
            <option value="">SELECCIONE...</option>
            <option value="1">MADRE</option>
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
        <div className="md:col-span-4 flex items-center gap-4 border-b pb-1">
          <h3 className="font-bold text-xl text-slate-700">3. Apoderado Suplente (Opcional)</h3>
          <label className="text-xs text-blue-600 font-bold flex items-center gap-2 cursor-pointer bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition">
            <input type="checkbox" name="has_suplente" checked={!!formData.apoderado_suplente.has_suplente} onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} /> 
            HABILITAR SUPLENTE
          </label>
        </div>

        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">RUT Suplente</label>
          <input name="rut_apoderado" value={formData.apoderado_suplente.rut_apoderado} placeholder="RUT" onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} disabled={!formData.apoderado_suplente.has_suplente} className={`p-2 border rounded outline-none focus:border-slate-400 uppercase ${!formData.apoderado_suplente.has_suplente ? 'bg-slate-50 cursor-not-allowed opacity-50' : 'bg-white'}`} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Nombres</label>
          <input name="nombres" value={formData.apoderado_suplente.nombres} placeholder="Nombres" onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} disabled={!formData.apoderado_suplente.has_suplente} className={`p-2 border rounded outline-none focus:border-slate-400 uppercase ${!formData.apoderado_suplente.has_suplente ? 'bg-slate-50 cursor-not-allowed opacity-50' : 'bg-white'}`} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Apellidos</label>
          <input name="apellidos" value={formData.apoderado_suplente.apellidos} placeholder="Apellidos" onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} disabled={!formData.apoderado_suplente.has_suplente} className={`p-2 border rounded outline-none focus:border-slate-400 uppercase ${!formData.apoderado_suplente.has_suplente ? 'bg-slate-50 cursor-not-allowed opacity-50' : 'bg-white'}`} />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Parentesco</label>
          <select name="id_parentesco" value={formData.apoderado_suplente.id_parentesco} onChange={(e) => handleNestedChange(e, 'apoderado_suplente')} disabled={!formData.apoderado_suplente.has_suplente} className={`p-2 border rounded outline-none focus:border-slate-400 bg-white uppercase ${!formData.apoderado_suplente.has_suplente ? 'bg-slate-50 cursor-not-allowed opacity-50' : 'bg-white'}`}>
            <option value="">SELECCIONE...</option>
            <option value="1">MADRE</option>
            <option value="2">PADRE</option>
            <option value="4">ABUELO/A</option>
            <option value="5">OTRO FAMILIAR</option>
          </select>
        </div>
      </div>

      {/* Sección Residencia */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-4"><h3 className="font-bold text-xl text-slate-700 border-b pb-1">4. Residencia del Alumno</h3></div>
        <div className="flex flex-col md:col-span-2">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Calle / Pasaje</label>
          <input name="calle_pasaje" value={formData.direccion.calle_pasaje} placeholder="Ej: Los Avellanos" onChange={(e) => handleNestedChange(e, 'direccion')} className="p-2 border rounded outline-none focus:border-slate-400 uppercase" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Número</label>
          <input name="numero" value={formData.direccion.numero} placeholder="123" onChange={(e) => handleNestedChange(e, 'direccion')} className="p-2 border rounded outline-none focus:border-slate-400 uppercase" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Sector</label>
          <input name="sector" value={formData.direccion.sector} placeholder="Villa..." onChange={(e) => handleNestedChange(e, 'direccion')} className="p-2 border rounded outline-none focus:border-slate-400 uppercase" />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase text-blue-600">Comuna *</label>
          <select 
            name="id_comuna" 
            value={formData.direccion.id_comuna}
            onChange={(e) => handleNestedChange(e, 'direccion')} 
            className="p-2 border border-blue-200 rounded outline-none focus:ring-2 focus:ring-blue-400 bg-white uppercase" 
            required
          >
            <option value="">Seleccione...</option>
            {comunasDB.map(comuna => (
              <option key={comuna.id_comuna} value={comuna.id_comuna}>
                {comuna.nombre_comuna}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sección Salud */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-4"><h3 className="font-bold text-xl text-slate-700 border-b pb-1">5. Ficha de Salud y Beneficios</h3></div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Sistema de Salud *</label>
          <select name="sistema_salud" value={formData.salud.sistema_salud} onChange={(e) => handleNestedChange(e, 'salud')} className="p-2 border rounded w-full bg-white outline-none focus:border-slate-400 uppercase">
            <option value="FONASA">FONASA</option>
            <option value="ISAPRE">ISAPRE</option>
            <option value="DIPRECA/CAPREDENA">DIPRECA/CAPREDENA</option>
            <option value="PARTICULAR">PARTICULAR</option>
          </select>
        </div>
        <div className="flex flex-col justify-center gap-2 pt-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="pertenece_pie" checked={!!formData.salud.pertenece_pie} onChange={(e) => handleNestedChange(e, 'salud')} /> Pertenece a PIE
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="beneficio_junaeb_alimentacion" checked={!!formData.salud.beneficio_junaeb_alimentacion} onChange={(e) => handleNestedChange(e, 'salud')} /> Beneficio JUNAEB
          </label>
        </div>
        <div className="flex flex-col md:col-span-2">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Detalle Diagnóstico (Si aplica)</label>
          <textarea 
            name="diagnostico_pie" 
            value={formData.salud.diagnostico_pie}
            onChange={(e) => handleNestedChange(e, 'salud')} 
            disabled={!formData.salud.pertenece_pie}
            className={`p-2 border rounded w-full h-12 md:h-20 text-sm outline-none focus:border-slate-400 uppercase ${!formData.salud.pertenece_pie ? 'bg-slate-50 cursor-not-allowed opacity-50' : 'bg-white'}`}
          />
        </div>
      </div>

      {/* Sección Electivos (Basado en el nuevo script) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-4"><h3 className="font-bold text-xl text-slate-700 border-b pb-1">6. Plan Electivo {getSelectedLevelName() ? `- ${getSelectedLevelName()}` : ''}</h3></div>
        
        {getSelectedLevelName().includes('1° MEDIO') && (
          <>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-600 mb-1">Clase de Religión</label>
              <select name="religion" value={formData.electivos.religion} onChange={(e) => handleNestedChange(e, 'electivos')} className="p-2 border rounded bg-white uppercase">
                <option value="">SELECCIONE OPCIÓN...</option>
                {electivosDB.filter(e => e.nombre_categoria === 'Religión').map(e => (
                  <option key={e.id_electivo} value={e.id_electivo}>{e.nombre_electivo}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-600 mb-1">Artes</label>
              <select name="artes" value={formData.electivos.artes} onChange={(e) => handleNestedChange(e, 'electivos')} className="p-2 border rounded bg-white uppercase">
                <option value="">SELECCIONE OPCIÓN...</option>
                {electivosDB.filter(e => e.nombre_categoria === 'Artes').map(e => (
                  <option key={e.id_electivo} value={e.id_electivo}>{e.nombre_electivo}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {(getSelectedLevelName().includes('3° MEDIO') || getSelectedLevelName().includes('4° MEDIO')) && (
          <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-600 mb-1">Especialidad</label>
              <select name="especialidad" value={formData.electivos.especialidad} onChange={(e) => handleNestedChange(e, 'electivos')} disabled={getSelectedLevelName().includes('4° MEDIO')} className="p-2 border rounded bg-white uppercase disabled:bg-slate-50">
                <option value="">SELECCIONE ESPECIALIDAD...</option>
                {electivosDB.filter(e => e.nombre_categoria === 'Especialidad').map(e => (
                  <option key={e.id_electivo} value={e.id_electivo}>{e.nombre_electivo}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-slate-600 mb-1">Formación Diferenciada (Historia / Ed. Física)</label>
              <select name="formacion_diferenciada" value={formData.electivos.formacion_diferenciada} onChange={(e) => handleNestedChange(e, 'electivos')} disabled={getSelectedLevelName().includes('4° MEDIO')} className="p-2 border rounded bg-white uppercase disabled:bg-slate-50">
                <option value="">SELECCIONE OPCIÓN...</option>
                {electivosDB.filter(e => e.nombre_categoria === 'Formación Diferenciada').map(e => (
                  <option key={e.id_electivo} value={e.id_electivo}>{e.nombre_electivo}</option>
                ))}
              </select>
            </div>
            {getSelectedLevelName().includes('4° MEDIO') && (
              <p className="md:col-span-2 text-xs text-orange-600 font-medium">Nota: En 4° Medio no se permite cambiar la especialidad seleccionada en el año anterior.</p>
            )}
          </div>
        )}

        {getSelectedLevelName().includes('2° MEDIO') || getSelectedLevelName().includes('4° MEDIO') ? (
          <div className="md:col-span-4 bg-slate-50 p-4 rounded text-slate-500 italic text-sm">
            {getSelectedLevelName().includes('2° MEDIO') 
              ? "En Segundo Medio no se requiere selección de electivos." 
              : "En Cuarto Medio se mantienen los electivos seleccionados en Tercero Medio."}
          </div>
        ) : null}
        
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