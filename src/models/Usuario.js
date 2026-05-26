const db = require('../config/db');

class Usuario {
    static async getAll() {
        const sql = `
            SELECT u.id_usuario, u.username, u.nombre_real, u.id_role, r.nombre_role
            FROM usuarios u
            JOIN roles r ON u.id_role = r.id_role
        `;
        const res = await db.query(sql);
        return res.rows;
    }

    static async create(data) {
        const { username, password_hash, nombre_real, id_role } = data;

        const sql = `
            INSERT INTO usuarios (username, password_hash, nombre_real, id_role)
            VALUES ($1, $2, $3, $4) RETURNING id_usuario
        `;
        const res = await db.query(sql, [
            username, password_hash, nombre_real || null, id_role
        ]);
        return res.rows[0].id_usuario;
    }

    static async getByUsername(username) {
        const sql = 'SELECT * FROM usuarios WHERE username = $1';
        const res = await db.query(sql, [username]);
        return res.rows[0];
    }

    static async saveResetToken(id, token, expires) {
        const sql = 'UPDATE usuarios SET reset_token = $1, reset_expires = $2 WHERE id_usuario = $3';
        await db.query(sql, [token, expires, id]);
    }

    static async getByResetToken(token) {
        const sql = 'SELECT * FROM usuarios WHERE reset_token = $1 AND reset_expires > NOW()';
        const res = await db.query(sql, [token]);
        return res.rows[0];
    }

    static async updatePassword(id, newPasswordHash) {
        const sql = `
            UPDATE usuarios 
            SET password_hash = $1, reset_token = NULL, reset_expires = NULL 
            WHERE id_usuario = $2`;
        await db.query(sql, [newPasswordHash, id]);
    }
}

module.exports = Usuario;