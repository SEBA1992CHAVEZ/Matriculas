const db = require('../config/db');

class Curso {
    static async getAll() {
        const sql = `
            SELECT c.*, n.nombre_nivel
            FROM cursos c
            JOIN niveles n ON c.id_nivel = n.id_nivel
            ORDER BY n.nombre_nivel, c.letra
        `;
        const res = await db.query(sql);
        return res.rows;
    }

    static async create(data) {
        const { id_nivel, letra, anio_lectivo } = data;
        const sql = `
            INSERT INTO cursos (id_nivel, letra, anio_lectivo)
            VALUES ($1, $2, $3) RETURNING id_curso
        `;
        const res = await db.query(sql, [id_nivel, letra, anio_lectivo]);
        return res.rows[0].id_curso;
    }

    static async update(id, data) {
        const { id_nivel, letra, anio_lectivo } = data;
        const sql = `
            UPDATE cursos 
            SET id_nivel = $1, letra = $2, anio_lectivo = $3
            WHERE id_curso = $4
        `;
        await db.query(sql, [id_nivel, letra, anio_lectivo, id]);
    }

    static async delete(id) {
        await db.query('DELETE FROM cursos WHERE id_curso = $1', [id]);
    }
}

module.exports = Curso;