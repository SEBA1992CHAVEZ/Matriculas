const db = require('../config/db');

class Alumno {
    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM alumnos'); 
        return rows;
    }

    static async create(data) {
        const { rut_estudiante, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, id_nivel } = data;
        const sql = `INSERT INTO alumnos (rut_estudiante, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, id_nivel) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [rut_estudiante, nombres, apellido_paterno, apellido_materno || null, fecha_nacimiento || null, sexo || null, id_nivel || null]);
        return result.insertId;
    }

    static async getFullDataByRut(rut) {
        const sql = `
            SELECT 
                a.*, 
                d.calle_pasaje, d.numero, d.sector, d.id_comuna,
                c.id_nivel, n.nombre_nivel,
                s.contacto_emergencia_nombre, s.contacto_emergencia_fono, s.sistema_salud,
                s.consultorio_clinica, s.estatura_cm, s.peso_kg, s.talla_ropa, s.calzado, 
                s.medicamentos, s.contraindicaciones, s.alergias, s.enfermedad_cronica, 
                s.observaciones_medicas, s.problemas_visuales, s.problemas_auditivos, 
                s.problemas_cardiacos, s.problemas_dentales, s.problemas_columna, 
                s.pertenece_pie, s.pie_documentacion, s.diagnostico_pie, 
                s.pie_fecha_ingreso, s.pie_fecha_alta,
                s.beneficio_junaeb_alimentacion, s.beneficio_junaeb_utiles, 
                s.beneficio_dental, s.beneficio_movilizacion, s.beneficio_uniforme,
                aut.autoriza_actividades, aut.autoriza_imagen, aut.acepta_reglamento_beneficios, aut.acepta_reglamento_interno,
                -- Datos Apoderado Titular
                ap1.rut_apoderado as apo_tit_rut, ap1.nombres as apo_tit_nom, ap1.apellidos as apo_tit_ape, 
                ap1.email as apo_tit_mail, ap1.telefono as apo_tit_tel, da1.id_parentesco as apo_tit_par,
                -- Datos Apoderado Suplente
                ap2.rut_apoderado as apo_sup_rut, ap2.nombres as apo_sup_nom, ap2.apellidos as apo_sup_ape, 
                ap2.email as apo_sup_mail, ap2.telefono as apo_sup_tel, da2.id_parentesco as apo_sup_par
            FROM alumnos a
            LEFT JOIN direcciones_alumnos d ON a.id_alumno = d.id_alumno
            LEFT JOIN expediente_medico s ON a.id_alumno = s.id_alumno
            LEFT JOIN cursos c ON a.id_curso = c.id_curso
            LEFT JOIN niveles n ON c.id_nivel = n.id_nivel
            LEFT JOIN autorizaciones_alumnos aut ON a.id_alumno = aut.id_alumno
            LEFT JOIN detalle_apoderados_alumno da1 ON a.id_alumno = da1.id_alumno AND da1.es_titular = 1
            LEFT JOIN apoderados ap1 ON da1.id_apoderado = ap1.id_apoderado
            LEFT JOIN detalle_apoderados_alumno da2 ON a.id_alumno = da2.id_alumno AND da2.es_titular = 0
            LEFT JOIN apoderados ap2 ON da2.id_apoderado = ap2.id_apoderado
            WHERE a.rut_estudiante = ?
        `;
        const [rows] = await db.execute(sql, [rut]);
        if (rows.length === 0) return null;

        const student = rows[0];
        
        // Formatear todas las fechas para que el input type="date" las reconozca
        const formatDate = (date) => date ? new Date(date).toISOString().split('T')[0] : '';
        student.fecha_nacimiento = formatDate(student.fecha_nacimiento);
        student.pie_fecha_ingreso = formatDate(student.pie_fecha_ingreso);
        student.pie_fecha_alta = formatDate(student.pie_fecha_alta);
        console.log("Datos del alumno formateados en backend:", student); // DEBUG

        return student;
    }
}

module.exports = Alumno;
