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
                s.sistema_salud, s.pertenece_pie, s.diagnostico_pie, s.beneficio_junaeb_alimentacion,
                (SELECT id_apoderado FROM detalle_apoderados_alumno WHERE id_alumno = a.id_alumno AND es_titular = 1 LIMIT 1) as id_apoderado_titular
            FROM alumnos a
            LEFT JOIN direcciones_alumnos d ON a.id_alumno = d.id_alumno
            LEFT JOIN expediente_medico s ON a.id_alumno = s.id_alumno
            WHERE a.rut_estudiante = ?
        `;
        const [rows] = await db.execute(sql, [rut]);
        if (rows.length === 0) return null;

        const student = rows[0];
        // Formatear fecha para el input date (YYYY-MM-DD)
        if (student.fecha_nacimiento) student.fecha_nacimiento = student.fecha_nacimiento.toISOString().split('T')[0];
        return student;
    }
}

module.exports = Alumno;
