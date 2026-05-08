const db = require('../config/db');

class Matricula {
    static async create(data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { alumno, apoderado, apoderado_suplente, direccion, salud, electivos } = data;

            // 1. Insertar o Actualizar Alumno (Lógica de Upsert)
            const sqlAlumno = `
                INSERT INTO alumnos (rut_estudiante, rut_provisorio, nombres, nombre_social, apellido_paterno, apellido_materno, email, telefono, nacionalidad, etnia, fecha_nacimiento, sexo, id_nivel) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                rut_provisorio=VALUES(rut_provisorio), nombres=VALUES(nombres), nombre_social=VALUES(nombre_social), 
                apellido_paterno=VALUES(apellido_paterno), apellido_materno=VALUES(apellido_materno), 
                email=VALUES(email), telefono=VALUES(telefono), id_nivel=VALUES(id_nivel),
                id_alumno=LAST_INSERT_ID(id_alumno)
            `;
            const [resAlumno] = await connection.execute(sqlAlumno, [
                alumno.rut_estudiante, alumno.rut_provisorio || null, alumno.nombres, alumno.nombre_social || null, alumno.apellido_paterno, alumno.apellido_materno || null, alumno.email || null, alumno.telefono || null, alumno.nacionalidad || 'CHILE - CL', alumno.etnia || 'NO PERTENECE', alumno.fecha_nacimiento || null, alumno.sexo, alumno.id_nivel
            ]);
            
            // Si se actualizó una fila existente, LAST_INSERT_ID nos devuelve el ID original
            const id_alumno = resAlumno.insertId;

            // 2. Insertar o Actualizar Dirección
            if (direccion && direccion.id_comuna) {
                const sqlDir = `INSERT INTO direcciones_alumnos (id_alumno, calle_pasaje, numero, sector, id_comuna) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE calle_pasaje=VALUES(calle_pasaje), numero=VALUES(numero), sector=VALUES(sector), id_comuna=VALUES(id_comuna)`;
                await connection.execute(sqlDir, [id_alumno, direccion.calle_pasaje, direccion.numero, direccion.sector, direccion.id_comuna]);
            }

            // 3. Insertar o Actualizar Expediente Médico
            if (salud) {
                const sqlSalud = `INSERT INTO expediente_medico (id_alumno, sistema_salud, pertenece_pie, diagnostico_pie, beneficio_junaeb_alimentacion) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE sistema_salud=VALUES(sistema_salud), pertenece_pie=VALUES(pertenece_pie), diagnostico_pie=VALUES(diagnostico_pie), beneficio_junaeb_alimentacion=VALUES(beneficio_junaeb_alimentacion)`;
                await connection.execute(sqlSalud, [
                    id_alumno, salud.sistema_salud, salud.pertenece_pie || 0, salud.diagnostico_pie || null, salud.beneficio_junaeb_alimentacion || 0
                ]);
            }

            // 4. Insertar Apoderados y Relaciones
            const insertarApoderado = async (apoData, titular) => {
                if (!apoData.rut_apoderado) return;

                // Intentar insertar apoderado (o ignorar si ya existe)
                const sqlApo = `INSERT INTO apoderados (rut_apoderado, nombres, apellidos, email, telefono) 
                                VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id_apoderado=LAST_INSERT_ID(id_apoderado)`;
                const [resApo] = await connection.execute(sqlApo, [
                    apoData.rut_apoderado, apoData.nombres, apoData.apellidos || null, apoData.email || null, apoData.telefono || null
                ]);
                
                const id_apoderado = resApo.insertId;

                // Crear relación con el alumno
                const sqlRel = `INSERT INTO detalle_apoderados_alumno (id_alumno, id_apoderado, id_parentesco, es_titular) VALUES (?, ?, ?, ?)`;
                await connection.execute(sqlRel, [id_alumno, id_apoderado, apoData.id_parentesco, titular]);
            };

            // Procesar Apoderado Titular
            if (apoderado) {
                await insertarApoderado(apoderado, 1);
            }

            // Procesar Apoderado Suplente (si se enviaron datos)
            if (apoderado_suplente && apoderado_suplente.rut_apoderado) {
                await insertarApoderado(apoderado_suplente, 0);
            }

            // 5. Insertar Selección de Electivos (Nueva funcionalidad)
            if (electivos) {
                const sqlElectivo = `INSERT INTO alumno_electivos (id_alumno, id_electivo, anio_lectivo) VALUES (?, ?, ?)`;
                const anioActual = 2026; // Definido según el contexto del sistema
                
                // Filtramos los electivos seleccionados (IDs que no vengan vacíos)
                const seleccionados = Object.values(electivos).filter(id => id !== '');
                
                for (const id_electivo of seleccionados) {
                    await connection.execute(sqlElectivo, [id_alumno, id_electivo, anioActual]);
                }
            }

            await connection.commit();
            return id_alumno;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async getReporte() {
        const [rows] = await db.execute('SELECT * FROM vista_reporte_matricula');
        return rows;
    }

    static async getStats() {
        // Obtener total general
        const [totalRes] = await db.execute('SELECT COUNT(*) as total FROM alumnos');
        
        // Obtener distribución por niveles
        const sqlNiveles = `
            SELECT n.nombre_nivel as name, COUNT(a.id_alumno) as value
            FROM niveles n
            LEFT JOIN alumnos a ON n.id_nivel = a.id_nivel
            GROUP BY n.nombre_nivel
        `;
        const [nivelesRes] = await db.execute(sqlNiveles);
        
        return {
            totalMatriculados: totalRes[0].total,
            distribucionNiveles: nivelesRes
        };
    }
}

module.exports = Matricula;