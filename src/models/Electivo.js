const db = require('../config/db');

class Electivo {
    static async getAll() {
        const sql = `
            SELECT e.id_electivo, e.nombre_electivo, c.nombre_categoria, e.nivel_aplicacion
            FROM electivos e
            JOIN categorias_electivos c ON e.id_categoria = c.id_categoria
            ORDER BY c.nombre_categoria, e.nombre_electivo
        `;
        const [rows] = await db.execute(sql);
        return rows;
    }
}

module.exports = Electivo;