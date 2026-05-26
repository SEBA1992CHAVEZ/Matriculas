const db = require('../config/db');

class Apoderado {
    /**
     * Obtiene todos los apoderados, opcionalmente filtrados por el ID de un alumno.
     * Si se proporciona id_alumno, también incluye el parentesco y si es titular.
     * @param {number} [id_alumno] - ID del alumno para filtrar apoderados relacionados.
     * @returns {Promise<Array>} Lista de apoderados.
     */
    static async getAll(id_alumno = null) {
        let sql = `
            SELECT 
                a.id_apoderado, a.rut_apoderado, a.nombres, a.apellidos, a.telefono
        `;
        let params = [];

        if (id_alumno) {
            sql += `, da.es_titular, p.relacion as parentesco_nombre, da.id_parentesco
                    FROM apoderados a
                    JOIN detalle_apoderados_alumno da ON a.id_apoderado = da.id_apoderado
                    JOIN parentescos p ON da.id_parentesco = p.id_parentesco
                    WHERE da.id_alumno = $1`;
            params.push(id_alumno);
        } else {
            sql += ` FROM apoderados a`;
        }
        sql += ` ORDER BY a.apellidos, a.nombres`;

        const res = await db.query(sql, params);
        return res.rows;
    }

    /**
     * Obtiene un apoderado por su ID.
     * @param {number} id - ID del apoderado.
     * @returns {Promise<Object|undefined>} El apoderado encontrado o undefined.
     */
    static async getById(id) {
        const res = await db.query('SELECT * FROM apoderados WHERE id_apoderado = $1', [id]);
        return res.rows[0];
    }

    /**
     * Crea un nuevo apoderado.
     * @param {Object} data - Datos del apoderado (rut_apoderado, nombres, apellidos, telefono).
     * @returns {Promise<number>} ID del apoderado creado.
     */
    static async create(data) {
        const { rut_apoderado, nombres, apellidos, telefono } = data;
        const sql = `INSERT INTO apoderados (rut_apoderado, nombres, apellidos, telefono) VALUES ($1, $2, $3, $4) RETURNING id_apoderado`;
        const res = await db.query(sql, [rut_apoderado, nombres, apellidos || null, telefono || null]);
        return res.rows[0].id_apoderado;
    }

    /**
     * Actualiza un apoderado existente.
     * @param {number} id - ID del apoderado a actualizar.
     * @param {Object} data - Datos a actualizar (nombres, apellidos, telefono).
     */
    static async update(id, data) {
        const { nombres, apellidos, telefono } = data;
        const sql = `UPDATE apoderados SET nombres = $1, apellidos = $2, telefono = $3 WHERE id_apoderado = $4`;
        await db.query(sql, [nombres, apellidos || null, telefono || null, id]);
    }

    /**
     * Elimina un apoderado por su ID.
     * @param {number} id - ID del apoderado a eliminar.
     */
    static async delete(id) {
        await db.query('DELETE FROM apoderados WHERE id_apoderado = $1', [id]);
    }

    /**
     * Asocia un apoderado a un alumno.
     * @param {number} id_alumno - ID del alumno.
     * @param {number} id_apoderado - ID del apoderado.
     * @param {number} id_parentesco - ID del parentesco.
     * @param {boolean} es_titular - Indica si es el apoderado titular.
     */
    static async associateToAlumno(id_alumno, id_apoderado, id_parentesco, es_titular) {
        const sql = `INSERT INTO detalle_apoderados_alumno (id_alumno, id_apoderado, id_parentesco, es_titular) VALUES ($1, $2, $3, $4)`;
        await db.query(sql, [id_alumno, id_apoderado, id_parentesco, es_titular]);
    }
}

module.exports = Apoderado;