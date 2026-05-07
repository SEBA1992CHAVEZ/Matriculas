const db = require('../config/db');

class Matricula {
    static async create(data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { alumno, apoderado, apoderado_suplente, direccion, salud } = data;

            // 1. Insertar Alumno
            const sqlAlumno = `INSERT INTO alumnos (rut_estudiante, rut_provisorio, nombres, nombre_social, apellido_paterno, apellido_materno, email, telefono, nacionalidad, etnia, fecha_nacimiento, sexo, id_curso) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const [resAlumno] = await connection.execute(sqlAlumno, [
                alumno.rut_estudiante, alumno.rut_provisorio || null, alumno.nombres, alumno.nombre_social || null, alumno.apellido_paterno, alumno.apellido_materno || null, alumno.email || null, alumno.telefono || null, alumno.nacionalidad || 'Chile - CL', alumno.etnia || 'No pertenece', alumno.fecha_nacimiento || null, alumno.sexo, alumno.id_curso
            ]);
            const id_alumno = resAlumno.insertId;

            // 2. Insertar Dirección
            if (direccion && direccion.id_comuna) {
                const sqlDir = `INSERT INTO direcciones_alumnos (id_alumno, calle_pasaje, numero, sector, id_comuna) VALUES (?, ?, ?, ?, ?)`;
                await connection.execute(sqlDir, [id_alumno, direccion.calle_pasaje, direccion.numero, direccion.sector, direccion.id_comuna]);
            }

            // 3. Insertar Expediente Médico
            if (salud) {
                const sqlSalud = `INSERT INTO expediente_medico (id_alumno, sistema_salud, pertenece_pie, diagnostico_pie, beneficio_junaeb_alimentacion) VALUES (?, ?, ?, ?, ?)`;
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
}

module.exports = Matricula;