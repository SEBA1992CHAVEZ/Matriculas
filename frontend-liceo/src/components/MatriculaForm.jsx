import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Importar componentes auxiliares
import FormField from './common/FormField';
import Section from './common/Section';
import CheckboxField from './common/CheckboxField';

const MatriculaForm = () => {
  const [electivosDB, setElectivosDB] = useState([]);
  const [nivelesDB, setNivelesDB] = useState([]);
  const [comunasDB, setComunasDB] = useState([]);
  const [step, setStep] = useState('rut'); 
  const [isExistingStudent, setIsExistingStudent] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

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
      sistema_salud: 'FONASA', consultorio_clinica: '',
      estatura_cm: '', peso_kg: '', talla_ropa: '', calzado: '',
      medicamentos: '', contraindicaciones: '', alergias: '', enfermedad_cronica: '',
      // Patologías (Nombres exactos del SQL)
      problemas_visuales: 0, problemas_auditivos: 0, problemas_cardiacos: 0, problemas_dentales: 0, problemas_columna: 0, 
      contacto_emergencia_nombre: '', contacto_emergencia_fono: '',
      // Beneficios
      pertenece_pie: 0, pie_documentacion: 0, diagnostico_pie: '', pie_fecha_ingreso: '', pie_fecha_alta: '',
      beneficio_junaeb_alimentacion: 0, beneficio_junaeb_utiles: 0,
      beneficio_dental: 0, beneficio_movilizacion: 0, beneficio_uniforme: 0,
      observaciones_medicas: ''
    },
    electivos: { religion: '', artes: '', especialidad: '', formacion_diferenciada: '' },
    autorizaciones: {
      autoriza_actividades: 0,
      autoriza_imagen: 0,
      acepta_reglamento_beneficios: 0,
      acepta_reglamento_interno: 0
    }
  };

  const [formData, setFormData] = useState(initialFormState);

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
        if (electivosRes.data.success) setElectivosDB(electivosRes.data.data);
        if (nivelesRes.data.success) setNivelesDB(nivelesRes.data.data);
        if (comunasRes.data.success) setComunasDB(comunasRes.data.data);
      } catch (err) {
        console.error("Error cargando datos iniciales:", err);
      }
    };
    fetchData();
  }, []);

  const handleSearchRut = async (e) => {
    e.preventDefault();
    setLoadingSearch(true);
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
          apoderado: {
            ...prev.apoderado, rut_apoderado: d.apo_tit_rut || '', nombres: d.apo_tit_nom || '', apellidos: d.apo_tit_ape || '', email: d.apo_tit_mail || '', telefono: d.apo_tit_tel || '', id_parentesco: d.apo_tit_par || ''
          },
          apoderado_suplente: {
            ...prev.apoderado_suplente, rut_apoderado: d.apo_sup_rut || '', nombres: d.apo_sup_nom || '', apellidos: d.apo_sup_ape || '', email: d.apo_sup_mail || '', telefono: d.apo_sup_tel || '', id_parentesco: d.apo_sup_par || '', has_suplente: d.apo_sup_rut ? 1 : 0
          },
          direccion: { calle_pasaje: d.calle_pasaje || '', numero: d.numero || '', sector: d.sector || '', id_comuna: d.id_comuna || '' },
          salud: { ...prev.salud, ...d },
          autorizaciones: { ...prev.autorizaciones, ...d }
        }));
      } else {
        setIsExistingStudent(false); setFormData({ ...initialFormState, 
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
        let clean = value.replace(/[^0-9kK]/g, "").toUpperCase();
        finalValue = clean.length > 1 ? clean.slice(0, -1) + "-" + clean.slice(-1) : clean;
      } else { finalValue = value.toUpperCase(); }
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

      // Aplanamos el objeto formData para que coincida con la validación del backend
      const dataToSend = {
        ...formData.alumno,
        ...formData.direccion,
        ...formData.salud,
        ...formData.autorizaciones,
        // Mapeamos manualmente para evitar colisiones (alumno y apoderado comparten keys como 'nombres', 'email', 'sexo')
        rut_apoderado: formData.apoderado.rut_apoderado,
        id_parentesco: formData.apoderado.id_parentesco,
        es_titular: formData.apoderado.es_titular,
        nombres_apoderado: formData.apoderado.nombres,
        apellidos_apoderado: formData.apoderado.apellidos,
        telefono_apoderado: formData.apoderado.telefono,
        email_apoderado: formData.apoderado.email,
        // Convertimos el objeto de electivos a un array de objetos (id_electivo, anio_lectivo)
        electivos: Object.values(formData.electivos)
          .filter(val => val !== '')
          .map(id => ({ id_electivo: parseInt(id), anio_lectivo: new Date().getFullYear() }))
      };

      const response = await axios.post(
        'http://localhost:3000/api/matriculas', dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) alert('Matrícula registrada exitosamente');
    } catch (err) { alert(err.response?.data?.message || 'Error al procesar matrícula'); }
  };

  // --- VISTA INICIAL: BÚSQUEDA DE RUT ---
  if (step === 'rut') {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white shadow-xl rounded-2xl border border-slate-100 max-w-2xl mx-auto mt-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-800">Admisión</h2>
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
        <h2 className="text-2xl font-bold text-slate-800">Formulario de Matrícula</h2>
        <button 
          type="button" 
          onClick={() => setStep('rut')} 
          className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold text-sm transition"
        >
          ← VOLVER / CAMBIAR RUT
        </button>
      </div>
      
      <Section title="1. Datos Personales del Estudiante" description="* Campos obligatorios">
        <FormField label="RUT Estudiante" name="rut_estudiante" value={formData.alumno.rut_estudiante} disabled section="alumno" onChange={handleNestedChange} className="bg-slate-50 font-bold text-blue-600" />
        
        <div className="flex flex-col">
          <CheckboxField label="RUT Provisorio" name="has_rut_provisorio" checked={formData.alumno.has_rut_provisorio} onChange={handleNestedChange} section="alumno" className="mb-1" />
          <FormField name="rut_provisorio" value={formData.alumno.rut_provisorio} placeholder={formData.alumno.has_rut_provisorio ? "IPE / PROVISORIO" : "N/A"} disabled={!formData.alumno.has_rut_provisorio || isExistingStudent} section="alumno" onChange={handleNestedChange} />
        </div>

        <FormField label="Nombres" name="nombres" value={formData.alumno.nombres} disabled={isExistingStudent} required section="alumno" onChange={handleNestedChange} />
        
        <div className="flex flex-col">
          <CheckboxField label="Nombre Social" name="has_nombre_social" checked={formData.alumno.has_nombre_social} onChange={handleNestedChange} section="alumno" className="mb-1" />
          <FormField name="nombre_social" value={formData.alumno.nombre_social} placeholder={formData.alumno.has_nombre_social ? "NOMBRE ELEGIDO" : "N/A"} disabled={!formData.alumno.has_nombre_social || isExistingStudent} section="alumno" onChange={handleNestedChange} />
        </div>

        <FormField label="Apellido Paterno" name="apellido_paterno" value={formData.alumno.apellido_paterno} disabled={isExistingStudent} required section="alumno" onChange={handleNestedChange} />
        <FormField label="Apellido Materno" name="apellido_materno" value={formData.alumno.apellido_materno} disabled={isExistingStudent} section="alumno" onChange={handleNestedChange} />
        
        <FormField label="Sexo" name="sexo" value={formData.alumno.sexo} type="select" disabled={isExistingStudent} required section="alumno" onChange={handleNestedChange} options={[{label: 'MASCULINO', value: 'MASCULINO'}, {label: 'FEMENINO', value: 'FEMENINO'}]} />
        <FormField label="Fecha Nacimiento" name="fecha_nacimiento" value={formData.alumno.fecha_nacimiento} type="date" disabled={isExistingStudent} section="alumno" onChange={handleNestedChange} />
        <FormField label="Email Alumno" name="email" type="email" section="alumno" onChange={handleNestedChange} />
        <FormField label="Teléfono Alumno" name="telefono" section="alumno" onChange={handleNestedChange} />
        <FormField label="Nacionalidad" name="nacionalidad" value={formData.alumno.nacionalidad} disabled={isExistingStudent} section="alumno" onChange={handleNestedChange} />
        <FormField label="Etnia" name="etnia" value={formData.alumno.etnia} section="alumno" onChange={handleNestedChange} />
        
        <FormField label="Nivel a Matricular" name="id_nivel" value={formData.alumno.id_nivel} type="select" required section="alumno" onChange={handleNestedChange} className="text-blue-600" options={nivelesDB.map(n => ({label: n.nombre_nivel, value: n.id_nivel}))} />
      </Section>

      <Section title="2. Información del Apoderado">
        <FormField label="RUT Apoderado" name="rut_apoderado" value={formData.apoderado.rut_apoderado} required section="apoderado" onChange={handleNestedChange} />
        <FormField label="Nombres" name="nombres" value={formData.apoderado.nombres} required section="apoderado" onChange={handleNestedChange} />
        <FormField label="Apellidos" name="apellidos" value={formData.apoderado.apellidos} section="apoderado" onChange={handleNestedChange} />
        <FormField label="Sexo" name="sexo" value={formData.apoderado.sexo} type="select" section="apoderado" onChange={handleNestedChange} options={[{label: 'FEMENINO', value: 'FEMENINO'}, {label: 'MASCULINO', value: 'MASCULINO'}]} />
        <FormField label="Email" name="email" type="email" value={formData.apoderado.email} section="apoderado" onChange={handleNestedChange} />
        <FormField label="Teléfono" name="telefono" value={formData.apoderado.telefono} section="apoderado" onChange={handleNestedChange} />
        <FormField label="Parentesco" name="id_parentesco" value={formData.apoderado.id_parentesco} type="select" required section="apoderado" onChange={handleNestedChange} options={[{label: 'MADRE', value: '1'}, {label: 'PADRE', value: '2'}, {label: 'TUTOR', value: '3'}]} />
      </Section>

      <Section title="3. Apoderado Suplente (Opcional)">
        <div className="md:col-span-4">
          <CheckboxField label="HABILITAR SUPLENTE" name="has_suplente" checked={formData.apoderado_suplente.has_suplente} onChange={handleNestedChange} section="apoderado_suplente" className="bg-blue-50 px-3 py-2 rounded font-bold text-blue-600 mb-4 inline-flex" />
        </div>
        <FormField label="RUT Suplente" name="rut_apoderado" value={formData.apoderado_suplente.rut_apoderado} disabled={!formData.apoderado_suplente.has_suplente} section="apoderado_suplente" onChange={handleNestedChange} />
        <FormField label="Nombres" name="nombres" value={formData.apoderado_suplente.nombres} disabled={!formData.apoderado_suplente.has_suplente} section="apoderado_suplente" onChange={handleNestedChange} />
        <FormField label="Apellidos" name="apellidos" value={formData.apoderado_suplente.apellidos} disabled={!formData.apoderado_suplente.has_suplente} section="apoderado_suplente" onChange={handleNestedChange} />
        <FormField label="Parentesco" name="id_parentesco" value={formData.apoderado_suplente.id_parentesco} type="select" disabled={!formData.apoderado_suplente.has_suplente} section="apoderado_suplente" onChange={handleNestedChange} options={[{label: 'MADRE', value: '1'}, {label: 'PADRE', value: '2'}, {label: 'ABUELO/A', value: '4'}]} />
      </Section>

      <Section title="4. Residencia del Alumno">
        <FormField label="Calle / Pasaje" name="calle_pasaje" value={formData.direccion.calle_pasaje} section="direccion" onChange={handleNestedChange} className="md:col-span-2" />
        <FormField label="Número" name="numero" value={formData.direccion.numero} section="direccion" onChange={handleNestedChange} />
        <FormField label="Sector" name="sector" value={formData.direccion.sector} disabled={isExistingStudent} section="direccion" onChange={handleNestedChange} />
        <FormField label="Comuna" name="id_comuna" value={formData.direccion.id_comuna} type="select" required section="direccion" onChange={handleNestedChange} options={comunasDB.map(c => ({label: c.nombre_comuna, value: c.id_comuna}))} />
      </Section>

      <Section title="5. Ficha de Salud y Beneficios">
        <FormField label="Sistema de Salud" name="sistema_salud" value={formData.salud.sistema_salud} type="select" section="salud" onChange={handleNestedChange} options={[{label: 'FONASA', value: 'FONASA'}, {label: 'ISAPRE', value: 'ISAPRE'}]} />
        <FormField label="Consultorio / Clínica" name="consultorio_clinica" value={formData.salud.consultorio_clinica} section="salud" onChange={handleNestedChange} />
        <FormField label="Contacto Emergencia" name="contacto_emergencia_nombre" value={formData.salud.contacto_emergencia_nombre} section="salud" onChange={handleNestedChange} />
        <FormField label="Teléfono Emergencia" name="contacto_emergencia_fono" value={formData.salud.contacto_emergencia_fono} section="salud" onChange={handleNestedChange} />
        
        <div className="flex flex-col md:col-span-1">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Estatura / Peso (CM/KG)</label>
          <div className="flex gap-2">
            <input name="estatura_cm" value={formData.salud.estatura_cm} placeholder="CM" onChange={(e) => handleNestedChange(e, 'salud')} className="w-1/2 p-2 border rounded" />
            <input name="peso_kg" value={formData.salud.peso_kg} placeholder="KG" onChange={(e) => handleNestedChange(e, 'salud')} className="w-1/2 p-2 border rounded" />
          </div>
        </div>

        <div className="flex flex-col md:col-span-1">
          <label className="text-xs font-bold text-slate-600 mb-1 uppercase">Talla / Calzado</label>
          <div className="flex gap-2">
            <input name="talla_ropa" value={formData.salud.talla_ropa} placeholder="S/M/L" onChange={(e) => handleNestedChange(e, 'salud')} className="w-1/2 p-2 border rounded uppercase" />
            <input name="calzado" value={formData.salud.calzado} placeholder="N°" onChange={(e) => handleNestedChange(e, 'salud')} className="w-1/2 p-2 border rounded" />
          </div>
        </div>

        <div className="md:col-span-4 bg-slate-50 p-4 rounded-lg">
          <p className="text-xs font-bold text-slate-500 uppercase mb-3">Patologías:</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {['visuales', 'auditivos', 'cardiacos', 'dentales', 'columna'].map(p => (
              <CheckboxField key={p} label={p.charAt(0).toUpperCase() + p.slice(1)} name={`problemas_${p}`} checked={formData.salud[`problemas_${p}`]} onChange={handleNestedChange} section="salud" disabled={isExistingStudent} />
            ))}
          </div>
        </div>

        <FormField label="Enfermedades / Medicamentos" name="enfermedad_cronica" value={formData.salud.enfermedad_cronica} type="textarea" section="salud" onChange={handleNestedChange} disabled={isExistingStudent} className="md:col-span-4" />
        
        <div className="flex flex-col justify-center gap-2 pt-4 border-t md:col-span-4">
          <CheckboxField label="Pertenece a PIE" name="pertenece_pie" checked={formData.salud.pertenece_pie} onChange={handleNestedChange} section="salud" disabled={isExistingStudent} />
          <CheckboxField label="Documentación PIE Completa" name="pie_documentacion" checked={formData.salud.pie_documentacion} onChange={handleNestedChange} section="salud" disabled={isExistingStudent} />
        </div>
        <FormField label="Diagnóstico PIE" name="diagnostico_pie" value={formData.salud.diagnostico_pie} type="textarea" section="salud" onChange={handleNestedChange} disabled={!formData.salud.pertenece_pie || isExistingStudent} className="md:col-span-2" />
        <FormField label="Ingreso PIE" name="pie_fecha_ingreso" type="date" section="salud" onChange={handleNestedChange} disabled={!formData.salud.pertenece_pie || isExistingStudent} />
      </Section>

      <Section title={`6. Plan Electivo ${getSelectedLevelName()}`}>
        {getSelectedLevelName().includes('1° MEDIO') && (
          <>
            <FormField label="Religión" name="religion" type="select" section="electivos" onChange={handleNestedChange} options={electivosDB.filter(e => e.nombre_categoria === 'Religión').map(e => ({label: e.nombre_electivo, value: e.id_electivo}))} />
            <FormField label="Artes" name="artes" type="select" section="electivos" onChange={handleNestedChange} options={electivosDB.filter(e => e.nombre_categoria === 'Artes').map(e => ({label: e.nombre_electivo, value: e.id_electivo}))} />
          </>
        )}
        {/* Otros niveles siguen patrón similar simplificado */}
      </Section>

      <div className="grid grid-cols-1 gap-4 mb-8 bg-slate-50 p-6 rounded-xl border-2 border-slate-100">
        <h3 className="font-bold text-xl text-slate-700 border-b pb-1">7. Autorizaciones</h3>
        <CheckboxField label="Autorizo participación en actividades extra-programáticas." name="autoriza_actividades" checked={formData.autorizaciones.autoriza_actividades} onChange={handleNestedChange} section="autorizaciones" disabled={isExistingStudent} />
        <CheckboxField label="Autorizo uso de imagen institucional." name="autoriza_imagen" checked={formData.autorizaciones.autoriza_imagen} onChange={handleNestedChange} section="autorizaciones" disabled={isExistingStudent} />
        <CheckboxField label="Acepto reglamento interno y de convivencia escolar. *" name="acepta_reglamento_interno" checked={formData.autorizaciones.acepta_reglamento_interno} onChange={handleNestedChange} section="autorizaciones" disabled={isExistingStudent} className="font-bold text-blue-900" />
      </div>

      <button type="submit" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition shadow-lg">FINALIZAR MATRÍCULA</button>
    </form>
  );
};

export default MatriculaForm;