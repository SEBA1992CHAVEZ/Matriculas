const db = require('../config/db');

class Matricula {
    static async create(data) {
        const connection = await db.getConnection();
        try {
            await connection.beginTransaction();

            const { alumno, apoderado, apoderado_suplente, direccion, salud, electivos } = data;

            // Obtener un curso por defecto (Letra A) para el nivel seleccionado
            // Ya que el script SQL usa id_curso en la tabla alumnos
            const [cursoDefecto] = await connection.execute(
                'SELECT id_curso FROM cursos WHERE id_nivel = ? AND letra = "A" AND anio_lectivo = YEAR(CURDATE()) LIMIT 1',
                [alumno.id_nivel]
            );

            const id_curso = cursoDefecto.length > 0 ? cursoDefecto[0].id_curso : null;

            // 1. Insertar o Actualizar Alumno (Lógica de Upsert)
            const sqlAlumno = `
                INSERT INTO alumnos (rut_estudiante, rut_provisorio, nombres, nombre_social, apellido_paterno, apellido_materno, email, telefono, nacionalidad, etnia, fecha_nacimiento, sexo, id_curso)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                rut_provisorio=VALUES(rut_provisorio), nombres=VALUES(nombres), nombre_social=VALUES(nombre_social), 
                apellido_paterno=VALUES(apellido_paterno), apellido_materno=VALUES(apellido_materno), 
                email=VALUES(email), telefono=VALUES(telefono), id_curso=VALUES(id_curso),
                id_alumno=LAST_INSERT_ID(id_alumno)
            `;
            const [resAlumno] = await connection.execute(sqlAlumno, [
                alumno.rut_estudiante, alumno.rut_provisorio || null, alumno.nombres, alumno.nombre_social || null, alumno.apellido_paterno, alumno.apellido_materno || null, alumno.email || null, alumno.telefono || null, alumno.nacionalidad || 'Chile - CL', alumno.etnia || 'No pertenece', alumno.fecha_nacimiento || null, alumno.sexo, id_curso
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
                const sqlSalud = `
                    INSERT INTO expediente_medico (
                        id_alumno, contacto_emergencia_nombre, contacto_emergencia_fono, sistema_salud, consultorio_clinica,
                        estatura_cm, peso_kg, talla_ropa, calzado, medicamentos,
                        contraindicaciones, alergias, enfermedad_cronica, observaciones_medicas, problemas_visuales,
                        problemas_auditivos, problemas_cardiacos, problemas_dentales, problemas_columna, pertenece_pie,
                        pie_documentacion, diagnostico_pie, pie_fecha_ingreso, pie_fecha_alta, beneficio_junaeb_alimentacion,
                        beneficio_junaeb_utiles, beneficio_dental, beneficio_movilizacion, beneficio_uniforme
                    ) VALUES (
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?, ?,
                        ?, ?, ?, ?
                    )
                    ON DUPLICATE KEY UPDATE
                        contacto_emergencia_nombre=VALUES(contacto_emergencia_nombre),
                        contacto_emergencia_fono=VALUES(contacto_emergencia_fono),
                        sistema_salud=VALUES(sistema_salud),
                        consultorio_clinica=VALUES(consultorio_clinica),
                        estatura_cm=VALUES(estatura_cm),
                        peso_kg=VALUES(peso_kg),
                        talla_ropa=VALUES(talla_ropa),
                        calzado=VALUES(calzado),
                        medicamentos=VALUES(medicamentos),
                        contraindicaciones=VALUES(contraindicaciones),
                        alergias=VALUES(alergias),
                        enfermedad_cronica=VALUES(enfermedad_cronica),
                        observaciones_medicas=VALUES(observaciones_medicas),
                        problemas_visuales=VALUES(problemas_visuales),
                        problemas_auditivos=VALUES(problemas_auditivos),
                        problemas_cardiacos=VALUES(problemas_cardiacos),
                        problemas_dentales=VALUES(problemas_dentales),
                        problemas_columna=VALUES(problemas_columna),
                        pertenece_pie=VALUES(pertenece_pie),
                        pie_documentacion=VALUES(pie_documentacion),
                        diagnostico_pie=VALUES(diagnostico_pie),
                        pie_fecha_ingreso=VALUES(pie_fecha_ingreso),
                        pie_fecha_alta=VALUES(pie_fecha_alta),
                        beneficio_junaeb_alimentacion=VALUES(beneficio_junaeb_alimentacion),
                        beneficio_junaeb_utiles=VALUES(beneficio_junaeb_utiles),
                        beneficio_dental=VALUES(beneficio_dental),
                        beneficio_movilizacion=VALUES(beneficio_movilizacion),
                        beneficio_uniforme=VALUES(beneficio_uniforme)
                `;

                const valoresSalud = [
                    id_alumno, // 1
                    salud.contacto_emergencia_nombre || null, // 2
                    salud.contacto_emergencia_fono || null, // 3
                    salud.sistema_salud, // 4
                    salud.consultorio_clinica || null, // 5
                    salud.estatura_cm || null, // 6
                    salud.peso_kg || null, // 7
                    salud.talla_ropa || null, // 8
                    salud.calzado || null, // 9
                    salud.medicamentos || null, // 10
                    salud.contraindicaciones || null, // 11
                    salud.alergias || null, // 12
                    salud.enfermedad_cronica || null, // 13
                    salud.observaciones_medicas || null, // 14
                    salud.problemas_visuales || 0, // 15
                    salud.problemas_auditivos || 0, // 16
                    salud.problemas_cardiacos || 0, // 17
                    salud.problemas_dentales || 0, // 18
                    salud.problemas_columna || 0, // 19
                    salud.pertenece_pie || 0, // 20
                    salud.pie_documentacion || 0, // 21
                    salud.diagnostico_pie || null, // 22
                    salud.pie_fecha_ingreso || null, // 23
                    salud.pie_fecha_alta || null, // 24
                    salud.beneficio_junaeb_alimentacion || 0, // 25
                    salud.beneficio_junaeb_utiles || 0, // 26
                    salud.beneficio_dental || 0, // 27
                    salud.beneficio_movilizacion || 0, // 28
                    salud.beneficio_uniforme || 0 // 29
                ];

                await connection.execute(sqlSalud, valoresSalud);
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
                const sqlRel = `INSERT INTO detalle_apoderados_alumno (id_alumno, id_apoderado, id_parentesco, es_titular) VALUES (?, ?, ?, ?)
                                ON DUPLICATE KEY UPDATE id_parentesco=VALUES(id_parentesco), es_titular=VALUES(es_titular)`;
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

                // Limpiamos electivos previos para este año antes de insertar los nuevos
                // Esto permite actualizar la matrícula sin errores de duplicidad
                await connection.execute('DELETE FROM alumno_electivos WHERE id_alumno = ? AND anio_lectivo = ?', [id_alumno, anioActual]);
                
                // Filtramos los electivos seleccionados (IDs que no vengan vacíos)
                const seleccionados = Object.values(electivos).filter(id => id != null && id !== '');
                
                for (const id_electivo of seleccionados) {
                    await connection.execute(sqlElectivo, [id_alumno, id_electivo, anioActual]);
                }
            }

            // 6. Insertar Autorizaciones (Nueva tabla en Dump20260505.sql)
            if (data.autorizaciones) {
                const sqlAut = `
                    INSERT INTO autorizaciones_alumnos (
                        id_alumno, autoriza_actividades, autoriza_imagen, 
                        acepta_reglamento_beneficios, acepta_reglamento_interno
                    ) VALUES (?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                    autoriza_actividades=VALUES(autoriza_actividades),
                    autoriza_imagen=VALUES(autoriza_imagen),
                    acepta_reglamento_beneficios=VALUES(acepta_reglamento_beneficios),
                    acepta_reglamento_interno=VALUES(acepta_reglamento_interno)
                `;
                await connection.execute(sqlAut, [
                    id_alumno,
                    data.autorizaciones.autoriza_actividades || 0,
                    data.autorizaciones.autoriza_imagen || 0,
                    data.autorizaciones.acepta_reglamento_beneficios || 0,
                    data.autorizaciones.acepta_reglamento_interno || 0
                ]);
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
        
        // Obtener distribución por niveles (uniendo a través de cursos según el script definitivo)
        const sqlNiveles = `
            SELECT n.nombre_nivel as name, COUNT(a.id_alumno) as value
            FROM niveles n
            LEFT JOIN cursos c ON n.id_nivel = c.id_nivel
            LEFT JOIN alumnos a ON c.id_curso = a.id_curso
            GROUP BY n.id_nivel, n.nombre_nivel
        `;
        const [nivelesRes] = await db.execute(sqlNiveles);
        
        return {
            totalMatriculados: totalRes[0].total,
            distribucionNiveles: nivelesRes
        };
    }
}

module.exports = Matricula;