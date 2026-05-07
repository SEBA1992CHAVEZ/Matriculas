const db = require('../config/db');

class Curso {
    static async getAll() {
        const sql = `
            SELECT c.*, n.nombre_nivel
            FROM cursos c
            JOIN niveles n ON c.id_nivel = n.id_nivel
            ORDER BY n.nombre_nivel, c.letra
        `;
        const [rows] = await db.execute(sql);
        return rows;
    }

    static async create(data) {
        const { id_nivel, letra, anio_lectivo } = data;
        const sql = `
            INSERT INTO cursos (id_nivel, letra, anio_lectivo)
            VALUES (?, ?, ?)
        `;
        const [result] = await db.execute(sql, [id_nivel, letra, anio_lectivo]);
        return result.insertId;
    }

    static async update(id, data) {
        const { id_nivel, letra, anio_lectivo } = data;
        const sql = `
            UPDATE cursos 
            SET id_nivel = ?, letra = ?, anio_lectivo = ?
            WHERE id_curso = ?
        `;
        await db.execute(sql, [id_nivel, letra, anio_lectivo, id]);
    }

    static async delete(id) {
        await db.execute('DELETE FROM cursos WHERE id_curso = ?', [id]);
    }
}

module.exports = Curso;