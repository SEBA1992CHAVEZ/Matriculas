const db = require('../config/db');

class Matricula {
    static async create(data) {
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const d = data;

            const nivelId = parseInt(d.id_nivel) || 1;

            // Obtener un curso por defecto (Letra A) para el nivel seleccionado
            // Si el JSON ya trae id_curso, lo usamos directamente.
            const cursoDefectoRes = await client.query(
                "SELECT id_curso FROM cursos WHERE id_nivel = $1 AND letra = 'A' AND anio_lectivo = EXTRACT(YEAR FROM CURRENT_DATE) LIMIT 1",
                [nivelId]
            );

            let id_curso = parseInt(d.id_curso) || (cursoDefectoRes.rows.length > 0 ? cursoDefectoRes.rows[0].id_curso : null);
            if (!id_curso) {
                throw new Error(`No se encontró un curso disponible (Letra A) para el nivel seleccionado. Verifique la configuración de cursos.`);
            }

            // 1. Insertar o Actualizar Alumno (Lógica de Upsert)
            const sqlAlumno = `
                INSERT INTO alumnos (rut_estudiante, rut_provisorio, nombres, nombre_social, apellido_paterno, apellido_materno, email, telefono, nacionalidad, etnia, fecha_nacimiento, sexo, id_curso)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                ON CONFLICT (rut_estudiante) DO UPDATE SET 
                rut_provisorio=EXCLUDED.rut_provisorio, nombres=EXCLUDED.nombres, nombre_social=EXCLUDED.nombre_social,
                apellido_paterno=EXCLUDED.apellido_paterno, apellido_materno=EXCLUDED.apellido_materno, 
                email=EXCLUDED.email, telefono=EXCLUDED.telefono, id_curso=EXCLUDED.id_curso,
                nacionalidad=EXCLUDED.nacionalidad, etnia=EXCLUDED.etnia, fecha_nacimiento=EXCLUDED.fecha_nacimiento,
                sexo=EXCLUDED.sexo, updated_at=CURRENT_TIMESTAMP
                RETURNING id_alumno
            `;
            const resAlumno = await client.query(sqlAlumno, [
                d.rut_estudiante, d.rut_provisorio || null, d.nombres, d.nombre_social || null, 
                d.apellido_paterno, d.apellido_materno || null, d.email || null, d.telefono || null, 
                d.nacionalidad || 'Chile - CL', d.etnia || 'No pertenece', d.fecha_nacimiento || null, 
                d.sexo, id_curso
            ]);

            const id_alumno = resAlumno.rows[0].id_alumno;

            // 2. Insertar o Actualizar Dirección
            if (d.id_comuna) {
                const sqlDir = `INSERT INTO direcciones_alumnos (id_alumno, calle_pasaje, numero, sector, id_comuna) 
                                VALUES ($1, $2, $3, $4, $5) 
                                ON CONFLICT (id_alumno) DO UPDATE SET 
                                calle_pasaje=EXCLUDED.calle_pasaje, numero=EXCLUDED.numero, sector=EXCLUDED.sector, id_comuna=EXCLUDED.id_comuna`;
                await client.query(sqlDir, [id_alumno, d.calle_pasaje || null, d.numero || null, d.sector || null, d.id_comuna]);
            }

            // 3. Insertar o Actualizar Expediente Médico
            if (d.sistema_salud) {
                const sqlSalud = `
                    INSERT INTO expediente_medico (
                        id_alumno, contacto_emergencia_nombre, contacto_emergencia_fono, sistema_salud, consultorio_clinica,
                        estatura_cm, peso_kg, talla_ropa, calzado, medicamentos,
                        contraindicaciones, alergias, enfermedad_cronica, observaciones_medicas, problemas_visuales,
                        problemas_auditivos, problemas_cardiacos, problemas_dentales, problemas_columna, pertenece_pie,
                        pie_documentacion, diagnostico_pie, pie_fecha_ingreso, pie_fecha_alta, beneficio_junaeb_alimentacion,
                        beneficio_junaeb_utiles, beneficio_dental, beneficio_movilizacion, beneficio_uniforme
                    ) VALUES (
                        $1, $2, $3, $4, $5,
                        $6, $7, $8, $9, $10,
                        $11, $12, $13, $14, $15,
                        $16, $17, $18, $19, $20,
                        $21, $22, $23, $24, $25,
                        $26, $27, $28, $29
                    )
                    ON CONFLICT (id_alumno) DO UPDATE SET
                        contacto_emergencia_nombre=EXCLUDED.contacto_emergencia_nombre,
                        contacto_emergencia_fono=EXCLUDED.contacto_emergencia_fono,
                        sistema_salud=EXCLUDED.sistema_salud,
                        consultorio_clinica=EXCLUDED.consultorio_clinica,
                        estatura_cm=EXCLUDED.estatura_cm,
                        peso_kg=EXCLUDED.peso_kg,
                        talla_ropa=EXCLUDED.talla_ropa,
                        calzado=EXCLUDED.calzado,
                        medicamentos=EXCLUDED.medicamentos,
                        contraindicaciones=EXCLUDED.contraindicaciones,
                        alergias=EXCLUDED.alergias,
                        enfermedad_cronica=EXCLUDED.enfermedad_cronica,
                        observaciones_medicas=EXCLUDED.observaciones_medicas,
                        problemas_visuales=EXCLUDED.problemas_visuales,
                        problemas_auditivos=EXCLUDED.problemas_auditivos,
                        problemas_cardiacos=EXCLUDED.problemas_cardiacos,
                        problemas_dentales=EXCLUDED.problemas_dentales,
                        problemas_columna=EXCLUDED.problemas_columna,
                        pertenece_pie=EXCLUDED.pertenece_pie,
                        pie_documentacion=EXCLUDED.pie_documentacion,
                        diagnostico_pie=EXCLUDED.diagnostico_pie,
                        pie_fecha_ingreso=EXCLUDED.pie_fecha_ingreso,
                        pie_fecha_alta=EXCLUDED.pie_fecha_alta,
                        beneficio_junaeb_alimentacion=EXCLUDED.beneficio_junaeb_alimentacion,
                        beneficio_junaeb_utiles=EXCLUDED.beneficio_junaeb_utiles,
                        beneficio_dental=EXCLUDED.beneficio_dental,
                        beneficio_movilizacion=EXCLUDED.beneficio_movilizacion,
                        beneficio_uniforme=EXCLUDED.beneficio_uniforme
                `;

                const valoresSalud = [
                    id_alumno, // 1
                    d.contacto_emergencia_nombre || null, // 2
                    d.contacto_emergencia_fono || null, // 3
                    d.sistema_salud, // 4
                    d.consultorio_clinica || null, // 5
                    d.estatura_cm || null, // 6
                    d.peso_kg || null, // 7
                    d.talla_ropa || null, // 8
                    d.calzado || null, // 9
                    d.medicamentos || null, // 10
                    d.contraindicaciones || null, // 11
                    d.alergias || null, // 12
                    d.enfermedad_cronica || null, // 13
                    d.observaciones_medicas || null, // 14
                    !!d.problemas_visuales, // 15
                    !!d.problemas_auditivos, // 16
                    !!d.problemas_cardiacos, // 17
                    !!d.problemas_dentales, // 18
                    !!d.problemas_columna, // 19
                    !!d.pertenece_pie, // 20
                    !!d.pie_documentacion, // 21
                    d.diagnostico_pie || null, // 22
                    d.pie_fecha_ingreso || null, // 23
                    d.pie_fecha_alta || null, // 24
                    !!d.beneficio_junaeb_alimentacion, // 25
                    !!d.beneficio_junaeb_utiles, // 26
                    !!d.beneficio_dental, // 27
                    !!d.beneficio_movilizacion, // 28
                    !!d.beneficio_uniforme // 29
                ];

                await client.query(sqlSalud, valoresSalud);
            }

            // 4. Insertar Apoderados y Relaciones
            const insertarApoderado = async (rut, nom, ape, tel, mail, par, titular) => {
                if (!rut) return;

                const sqlApo = `INSERT INTO apoderados (rut_apoderado, nombres, apellidos, email, telefono) 
                                VALUES ($1, $2, $3, $4, $5) 
                                ON CONFLICT (rut_apoderado) DO UPDATE SET nombres=EXCLUDED.nombres, apellidos=EXCLUDED.apellidos 
                                RETURNING id_apoderado`;
                const resApo = await client.query(sqlApo, [
                    rut, nom, ape || null, mail || null, tel || null
                ]);
                
                const id_apoderado = resApo.rows[0].id_apoderado;

                const sqlRel = `INSERT INTO detalle_apoderados_alumno (id_alumno, id_apoderado, id_parentesco, es_titular) 
                                VALUES ($1, $2, $3, $4)
                                ON CONFLICT (id_alumno, id_apoderado) DO UPDATE SET id_parentesco=EXCLUDED.id_parentesco, es_titular=EXCLUDED.es_titular`;
                await client.query(sqlRel, [id_alumno, id_apoderado, parseInt(par) || null, !!titular]);
            };

            // Procesar Apoderado Titular
            if (d.rut_apoderado) {
                await insertarApoderado(
                    d.rut_apoderado, 
                    d.nombres_apoderado, 
                    d.apellidos_apoderado, 
                    d.telefono_apoderado, 
                    d.email_apoderado, 
                    d.id_parentesco, 
                    d.es_titular
                );
            }

            // 5. Insertar Selección de Electivos (Nueva funcionalidad)
            if (d.electivos && Array.isArray(d.electivos)) {
                const anioActual = new Date().getFullYear();
                const sqlElectivo = `INSERT INTO alumno_electivos (id_alumno, id_electivo, anio_lectivo) VALUES ($1, $2, $3)`;

                // Limpiamos electivos previos para este año antes de insertar los nuevos
                await client.query('DELETE FROM alumno_electivos WHERE id_alumno = $1 AND anio_lectivo = $2', [id_alumno, anioActual]);
                
                for (const electivo of d.electivos) {
                    if (electivo.id_electivo) {
                        await client.query(sqlElectivo, [id_alumno, electivo.id_electivo, electivo.anio_lectivo || anioActual]);
                    }
                }
            }

            // 6. Insertar Autorizaciones (Nueva tabla en Dump20260505.sql)
            if (d.acepta_reglamento_interno !== undefined) {
                const sqlAut = `
                    INSERT INTO autorizaciones_alumnos (
                        id_alumno, autoriza_actividades, autoriza_imagen, 
                        acepta_reglamento_beneficios, acepta_reglamento_interno
                    ) VALUES ($1, $2, $3, $4, $5)
                    ON CONFLICT (id_alumno) DO UPDATE SET
                    autoriza_actividades=EXCLUDED.autoriza_actividades,
                    autoriza_imagen=EXCLUDED.autoriza_imagen,
                    acepta_reglamento_beneficios=EXCLUDED.acepta_reglamento_beneficios,
                    acepta_reglamento_interno=EXCLUDED.acepta_reglamento_interno
                `;
                await client.query(sqlAut, [
                    id_alumno,
                    !!d.autoriza_actividades,
                    !!d.autoriza_imagen,
                    !!d.acepta_reglamento_beneficios,
                    !!d.acepta_reglamento_interno
                ]);
            }

            await client.query('COMMIT');
            return id_alumno;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async getReporte() {
        const res = await db.query('SELECT * FROM vista_consolidada_matricula');
        return res.rows;
    }

    static async getStats() {
        const totalRes = await db.query('SELECT COUNT(*) as total FROM alumnos');
        
        const sqlNiveles = `
            SELECT n.nombre_nivel as name, COUNT(a.id_alumno) as value
            FROM niveles n
            LEFT JOIN cursos c ON n.id_nivel = c.id_nivel
            LEFT JOIN alumnos a ON c.id_curso = a.id_curso
            GROUP BY n.id_nivel, n.nombre_nivel
        `;
        const nivelesRes = await db.query(sqlNiveles);
        
        return {
            totalMatriculados: parseInt(totalRes.rows[0].total),
            distribucionNiveles: nivelesRes.rows
        };
    }
}

module.exports = Matricula;