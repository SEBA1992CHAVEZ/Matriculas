const db = require('../config/db');

class Comuna {
    static async getAll() {
        const sql = `SELECT * FROM comunas ORDER BY nombre_comuna`;
        const [rows] = await db.execute(sql);
        return rows;
    }

    static async getById(id) {
        const [rows] = await db.execute('SELECT * FROM comunas WHERE id_comuna = ?', [id]);
        return rows[0];
    }

    static async create(data) {
        const { nombre_comuna, region } = data;
        const sql = 'INSERT INTO comunas (nombre_comuna, region) VALUES (?, ?)';
        const [result] = await db.execute(sql, [nombre_comuna, region]);
        return result.insertId;
    }

    static async update(id, data) {
        const { nombre_comuna, region } = data;
        const sql = 'UPDATE comunas SET nombre_comuna = ?, region = ? WHERE id_comuna = ?';
        await db.execute(sql, [nombre_comuna, region, id]);
    }

    static async delete(id) {
        await db.execute('DELETE FROM comunas WHERE id_comuna = ?', [id]);
    }
}

module.exports = Comuna;