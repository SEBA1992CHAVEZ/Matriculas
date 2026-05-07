const db = require('../config/db');

class Usuario {
    static async getAll() {
        const sql = `
            SELECT u.id_usuario, u.username, u.nombre_real, u.id_role, r.nombre_role
            FROM usuarios u
            JOIN roles r ON u.id_role = r.id_role
        `;
        const [rows] = await db.execute(sql);
        return rows;
    }

    static async create(data) {
        const { username, password_hash, nombre_real, id_role } = data;

        const sql = `
            INSERT INTO usuarios (username, password_hash, nombre_real, id_role)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await db.execute(sql, [
            username, password_hash, nombre_real || null, id_role
        ]);
        return result.insertId;
    }

    static async getByUsername(username) {
        const sql = 'SELECT * FROM usuarios WHERE username = ?';
        const [rows] = await db.execute(sql, [username]);
        return rows[0];
    }

    static async saveResetToken(id, token, expires) {
        const sql = 'UPDATE usuarios SET reset_token = ?, reset_expires = ? WHERE id_usuario = ?';
        await db.execute(sql, [token, expires, id]);
    }

    static async getByResetToken(token) {
        const sql = 'SELECT * FROM usuarios WHERE reset_token = ? AND reset_expires > NOW()';
        const [rows] = await db.execute(sql, [token]);
        return rows[0];
    }

    static async updatePassword(id, newPasswordHash) {
        const sql = `
            UPDATE usuarios 
            SET password_hash = ?, reset_token = NULL, reset_expires = NULL 
            WHERE id_usuario = ?`;
        await db.execute(sql, [newPasswordHash, id]);
    }
}

module.exports = Usuario;