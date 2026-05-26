const db = require('../config/db');

class Nivel {
    static async getAll() {
        const res = await db.query('SELECT * FROM niveles ORDER BY nombre_nivel');
        return res.rows;
    }

    static async create(data) {
        const { nombre_nivel } = data;
        const sql = 'INSERT INTO niveles (nombre_nivel) VALUES ($1) RETURNING id_nivel';
        const res = await db.query(sql, [nombre_nivel]);
        return res.rows[0].id_nivel;
    }

    static async update(id, data) {
        const { nombre_nivel } = data;
        const sql = 'UPDATE niveles SET nombre_nivel = $1 WHERE id_nivel = $2';
        await db.query(sql, [nombre_nivel, id]);
    }

    static async delete(id) {
        await db.query('DELETE FROM niveles WHERE id_nivel = $1', [id]);
    }
}

module.exports = Nivel;