const db = require('../config/db');

class Comuna {
    static async getAll() {
        const sql = `SELECT * FROM comunas ORDER BY nombre_comuna`;
        const res = await db.query(sql);
        return res.rows;
    }

    static async getById(id) {
        const res = await db.query('SELECT * FROM comunas WHERE id_comuna = $1', [id]);
        return res.rows[0];
    }

    static async create(data) {
        const { nombre_comuna, region } = data;
        const sql = 'INSERT INTO comunas (nombre_comuna, region) VALUES ($1, $2) RETURNING id_comuna';
        const res = await db.query(sql, [nombre_comuna, region]);
        return res.rows[0].id_comuna;
    }

    static async update(id, data) {
        const { nombre_comuna, region } = data;
        const sql = 'UPDATE comunas SET nombre_comuna = $1, region = $2 WHERE id_comuna = $3';
        await db.query(sql, [nombre_comuna, region, id]);
    }

    static async delete(id) {
        await db.query('DELETE FROM comunas WHERE id_comuna = $1', [id]);
    }
}

module.exports = Comuna;