const db = require('../config/db');

class Nivel {
    static async getAll() {
        const [rows] = await db.execute('SELECT * FROM niveles ORDER BY nombre_nivel');
        return rows;
    }

    static async create(data) {
        const { nombre_nivel } = data;
        const sql = 'INSERT INTO niveles (nombre_nivel) VALUES (?)';
        const [result] = await db.execute(sql, [nombre_nivel]);
        return result.insertId;
    }

    static async update(id, data) {
        const { nombre_nivel } = data;
        const sql = 'UPDATE niveles SET nombre_nivel = ? WHERE id_nivel = ?';
        await db.execute(sql, [nombre_nivel, id]);
    }

    static async delete(id) {
        await db.execute('DELETE FROM niveles WHERE id_nivel = ?', [id]);
    }
}

module.exports = Nivel;