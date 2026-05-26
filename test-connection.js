const db = require('./src/config/db');

async function testConnection() {
    console.log('--- Iniciando prueba de conexión ---');
    try {
        // 1. Probar consulta básica
        const res = await db.query('SELECT NOW() as current_time');
        console.log('✅ Conexión exitosa a PostgreSQL');
        console.log('🕒 Hora del servidor:', res.rows[0].current_time);

        // 2. Probar si las tablas del script están creadas
        const tables = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        console.log('📋 Tablas encontradas en la base de datos:');
        console.table(tables.rows);

    } catch (err) {
        console.error('❌ Error de conexión:', err.message);
        console.log('\nTip: Revisa que el archivo .env tenga DB_USER, DB_PASSWORD, DB_NAME, DB_HOST y DB_PORT correctos.');
    }
}

testConnection();