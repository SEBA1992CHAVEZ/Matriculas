const db = require('../config/db');

class Alumno {
    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM alumnos'); 
        return rows;
    }

    static async create(data) {
        const { rut_estudiante, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, id_curso } = data;
        const sql = `INSERT INTO alumnos (rut_estudiante, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, sexo, id_curso) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.execute(sql, [rut_estudiante, nombres, apellido_paterno, apellido_materno || null, fecha_nacimiento || null, sexo || null, id_curso || null]);
        return result.insertId;
    }
}

module.exports = Alumno;
