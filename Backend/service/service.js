const { Service, sequelize } = require("../models"); // Requiere el modelo 'Service' y la instancia de sequelize para las transacciones
const storeDTO = require("../http/request/service/storeDTO"); // DTO para validar los datos del servicio en la operación de almacenamiento
const updateDTO = require("../http/request/service/updateDTO"); // DTO para validar los datos del servicio en la operación de actualización
const idDTO = require("../http/request/service/idDTO"); // DTO para validar los identificadores de servicios
const { Op, Sequelize } = require("sequelize");
const jsonResponse = require('../http/response/jsonResponse'); // Agregar esta línea al inicio del archivo

class ServiceService {

    // Método para almacenar un nuevo servicio
    static async store(data) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos con sequelize
        console.log("Service Data: ", data);

        try {
            // Valida los datos de entrada usando storeDTO (con Joi)
            await storeDTO.validateAsync(data, { abortEarly: false });

            // Convertir equipo vacío a null
            const equipoValue = data.equipo === "" ? null : data.equipo;

            // Crea un nuevo servicio en la base de datos usando los campos correspondientes
            const newService = await Service.create({
                nombreResponsableEgreso: data.nombreResponsableEgreso, // Se asigna el campo 'nombreResponsableEgreso'
                cargoSolicitante: data.cargoSolicitante, // Se asigna el campo 'cargoSolicitante'
                informe: data.informe, // Se asigna el campo 'informe'
                cargoResponsableEgreso: data.cargoResponsableEgreso, // Se asigna el campo 'cargoResponsableEgreso'
                oficinaSolicitante: data.oficinaSolicitante, // Se asigna el campo 'oficinaSolicitante'
                fechaRegistro: data.fechaRegistro, // Se asigna el campo 'fechaRegistro'
                equipo: data.equipo, // Se asigna el campo 'equipo'
                problema: data.problema, // Se asigna el campo 'problema'
                telefonoResponsableEgreso: data.telefonoResponsableEgreso, // Se asigna el campo 'telefonoResponsableEgreso'
                gestion: data.gestion, // Se asigna el campo 'gestion'
                telefonoSolicitante: data.telefonoSolicitante, // Se asigna el campo 'telefonoSolicitante'
                tecnicoAsignado: data.tecnicoAsignado, // Se asigna el campo 'tecnicoAsignado'
                observaciones: data.observaciones, // Se asigna el campo 'observaciones'
                tipoResponsableEgreso: data.tipoResponsableEgreso, // Se asigna el campo 'tipoResponsableEgreso'
                estado: data.estado, // Se asigna el campo 'estado'
                tipoSolicitante: data.tipoSolicitante, // Se asigna el campo 'tipoSolicitante'
                fechaTerminado: data.fechaTerminado, // Se asigna el campo 'fechaTerminado'
                oficinaResponsableEgreso: data.oficinaResponsableEgreso, // Se asigna el campo 'oficinaResponsableEgreso'
                numero: data.numero, // Se asigna el campo 'numero'
                fechaInicio: data.fechaInicio, // Se asigna el campo 'fechaInicio'
                fechaEgreso: data.fechaEgreso, // Se asigna el campo 'fechaEgreso'
                ciSolicitante: data.ciSolicitante, // Se asigna el campo 'ciSolicitante'
                nombreSolicitante: data.nombreSolicitante, // Se asigna el campo 'nombreSolicitante'
                tipo: data.tipo, // Se asigna el campo 'tipo'
                tecnicoRegistro: data.tecnicoRegistro, // Se asigna el campo 'tecnicoRegistro'
                tecnicoEgreso: data.tecnicoEgreso, // Se asigna el campo 'tecnicoEgreso'
                ciResponsableEgreso: data.ciResponsableEgreso // Se asigna el campo 'ciResponsableEgreso'
            });

            await DB.commit(); // Confirma la transacción

            return newService; // Retorna el nuevo servicio

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para mostrar un servicio por su ID
    static async show(id) {
        try {
            // Valida el ID del servicio
            await idDTO.validateAsync({ servicios_id: id });

            // Busca el servicio por su ID (campo servicios_id)
            const service = await Service.findByPk(id);

            return service; // Retorna el servicio

        } catch (error) {
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para actualizar un servicio por su ID
    static async update(data, id) {
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos
        console.log("Service Data: ", data);
        console.log("Service ID: ", id);

        try {
            data.servicios_id = id; // Asigna el ID al objeto de datos

            // Valida los datos de entrada usando updateDTO
            await updateDTO.validateAsync(data, { abortEarly: false });

            // Convertir equipo vacío a null
            const equipoValue = data.equipo === "" ? null : data.equipo;

            // Actualiza los campos del servicio con los datos proporcionados
            const updatedService = await Service.update({
                nombreResponsableEgreso: data.nombreResponsableEgreso,
                cargoSolicitante: data.cargoSolicitante,
                informe: data.informe,
                cargoResponsableEgreso: data.cargoResponsableEgreso,
                oficinaSolicitante: data.oficinaSolicitante,
                fechaRegistro: data.fechaRegistro,
                equipo: data.equipo,
                problema: data.problema,
                telefonoResponsableEgreso: data.telefonoResponsableEgreso,
                gestion: data.gestion,
                telefonoSolicitante: data.telefonoSolicitante,
                tecnicoAsignado: data.tecnicoAsignado,
                observaciones: data.observaciones,
                tipoResponsableEgreso: data.tipoResponsableEgreso,
                estado: data.estado,
                tipoSolicitante: data.tipoSolicitante,
                fechaTerminado: data.fechaTerminado,
                oficinaResponsableEgreso: data.oficinaResponsableEgreso,
                numero: data.numero,
                fechaInicio: data.fechaInicio,
                fechaEgreso: data.fechaEgreso,
                ciSolicitante: data.ciSolicitante,
                nombreSolicitante: data.nombreSolicitante,
                tipo: data.tipo,
                tecnicoRegistro: data.tecnicoRegistro,
                tecnicoEgreso: data.tecnicoEgreso,
                ciResponsableEgreso: data.ciResponsableEgreso
            }, { where: { servicios_id: id } }); // Condición para actualizar el registro por ID

            await DB.commit(); // Confirma la transacción

            return updatedService; // Retorna el servicio actualizado

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    // Método para eliminar un servicio por su ID
    static async destroy(id) {
        console.log("Service Destroy ID: ", id);
        const DB = await sequelize.transaction(); // Inicia una transacción de base de datos
        
        try {
            // Valida el ID del servicio
            await idDTO.validateAsync({ servicios_id: id });

            // Elimina el servicio por su ID (campo servicios_id)
            await Service.destroy({ where: { servicios_id: id } });

            await DB.commit(); // Confirma la transacción
            

        } catch (error) {
            await DB.rollback(); // Deshace los cambios si hay un error
            throw error; // Lanza el error para manejarlo
        }
    }

    static async paginate(queryParams) {
        try {
            const { 
                page = 1, 
                limit = 10, 
                search = '', 
                sort = 'fechaRegistro',
                order = 'DESC'
            } = queryParams;

            // Asegurar que order sea un string y convertirlo a mayúsculas
            const orderDirection = (order || 'DESC').toString().toUpperCase();
            
            // Decodificar el término de búsqueda y eliminar espacios extra
            const decodedSearch = decodeURIComponent(search).trim();
            
            // Construir las condiciones de búsqueda
            const whereConditions = {};
            if (decodedSearch) {
                whereConditions[Op.or] = [
                    { nombreSolicitante: { [Op.iLike]: `%${decodedSearch}%` } },
                    { problema: { [Op.iLike]: `%${decodedSearch}%` } },
                    { estado: { [Op.iLike]: `%${decodedSearch}%` } }  // Agregamos búsqueda por estado
                ];
            }

            // Realizar la consulta
            const { count, rows } = await Service.findAndCountAll({
                where: whereConditions,
                order: [[sort, orderDirection]],
                limit: parseInt(limit),
                offset: (parseInt(page)) * parseInt(limit),
                raw: true
            });

            return { 
                count, 
                rows,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit)
            };
        } catch (error) {
            console.error('Error en paginación:', error);
            throw error;
        }
    }
    
    static async getServicesByTypeAndTechnician(req, res) {
        console.log('Service: getServicesByTypeAndTechnician called');
        try {
            const { 
                tipo, 
                tecnicoAsignado, 
                estado,  
                page = 1, 
                limit = 100, 
                search = '' 
            } = req.query;
            
            console.log('Query params:', { tipo, tecnicoAsignado, estado, page, limit, search });
            
            const whereConditions = {};
            
            if (tipo) {
                whereConditions.tipo = decodeURIComponent(tipo).trim();
            }

            if (tecnicoAsignado && tecnicoAsignado !== 'null') {
                whereConditions.tecnicoAsignado = parseInt(tecnicoAsignado, 10);
            }

            // Decodificar y limpiar el estado antes de usarlo en la consulta
            if (estado && estado !== 'null' && estado !== 'undefined') {
                whereConditions.estado = {
                    [Op.iLike]: decodeURIComponent(estado).trim()
                };
            }

            console.log('Where conditions:', whereConditions);

            const { count, rows } = await Service.findAndCountAll({
                where: whereConditions,
                order: [['fechaRegistro', 'DESC']],
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit),
                raw: true
            });

            return jsonResponse.successResponse(
                res,
                200,
                "Services retrieved successfully",
                {
                    total: count,
                    perPage: parseInt(limit),
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    data: rows
                }
            );
        } catch (error) {
            console.error("Service Error:", error);
            return jsonResponse.errorResponse(res, 500, error.message);
        }
    }

    static async getServicesByDateRangeAndFilters(req, res) {
        try {
            const {
                fechaInicio,
                fechaFin,
                tipo,
                tecnicoAsignado,
                estado,
                page = 1,
                limit = 10
            } = req.query;

            console.log('Query params:', { fechaInicio, fechaFin, tipo, tecnicoAsignado, estado, page, limit });

            const whereConditions = {};

            // Agregar filtro de rango de fechas si se proporcionan
            if (fechaInicio && fechaFin) {
                whereConditions.fechaRegistro = {
                    [Op.between]: [
                        decodeURIComponent(fechaInicio).trim(),
                        decodeURIComponent(fechaFin).trim()
                    ]
                };
            }

            // Agregar filtro de tipo si se proporciona
            if (tipo && tipo !== 'null' && tipo !== 'undefined') {
                whereConditions.tipo = {
                    [Op.iLike]: `%${decodeURIComponent(tipo).trim()}%`
                };
            }

            // Agregar filtro de técnico si se proporciona
            if (tecnicoAsignado && tecnicoAsignado !== 'null') {
                whereConditions.tecnicoAsignado = parseInt(tecnicoAsignado, 10);
            }

            // Agregar filtro de estado si se proporciona
            if (estado && estado !== 'null' && estado !== 'undefined') {
                whereConditions.estado = {
                    [Op.iLike]: `%${decodeURIComponent(estado).trim()}%`
                };
            }

            console.log('Where conditions:', whereConditions);

            const { count, rows } = await Service.findAndCountAll({
                where: whereConditions,
                order: [['fechaRegistro', 'DESC']],
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit),
                raw: true
            });

            return jsonResponse.successResponse(
                res,
                200,
                "Services filtered successfully",
                {
                    total: count,
                    perPage: parseInt(limit),
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    data: rows
                }
            );
        } catch (error) {
            console.error("Service Error:", error);
            if (error.isJoi) {
                return jsonResponse.validationResponse(
                    res,
                    409,
                    "Validation error",
                    error.details.map(err => err.message)
                );
            }
            return jsonResponse.errorResponse(res, 500, error.message);
        }
    }

    static async getServiceMetrics(params) {
        try {
            const { fechaInicio, fechaFin, tipo, tecnicoAsignado, estado } = params;
            const whereConditions = {};

            // Agregar filtros según los parámetros recibidos
            if (fechaInicio && fechaFin) {
                whereConditions.fechaRegistro = {
                    [Op.between]: [
                        decodeURIComponent(fechaInicio).trim(),
                        decodeURIComponent(fechaFin).trim()
                    ]
                };
            }

            if (tipo && tipo !== 'null' && tipo !== 'undefined') {
                whereConditions.tipo = {
                    [Op.iLike]: `%${decodeURIComponent(tipo).trim()}%`
                };
            }

            if (tecnicoAsignado && tecnicoAsignado !== 'null') {
                whereConditions.tecnicoAsignado = parseInt(tecnicoAsignado, 10);
            }

            if (estado && estado !== 'null' && estado !== 'undefined') {
                whereConditions.estado = {
                    [Op.iLike]: `%${decodeURIComponent(estado).trim()}%`
                };
            }

            // 1. Distribución por tipo de servicio
            const serviciosPorTipo = await Service.findAll({
                attributes: [
                    'tipo',
                    [sequelize.fn('COUNT', sequelize.col('servicios_id')), 'cantidad'],
                    [
                        sequelize.literal('ROUND(CAST(COUNT(*) AS DECIMAL) * 100 / NULLIF((SELECT COUNT(*) FROM servicios), 0), 2)'),
                        'porcentaje'
                    ]
                ],
                where: whereConditions,
                group: ['tipo'],
                order: [[sequelize.fn('COUNT', sequelize.col('servicios_id')), 'DESC']]
            });

            // 2. Métricas por técnico
            const metricasPorTecnico = await Service.findAll({
                attributes: [
                    'tecnicoAsignado',
                    [sequelize.fn('COUNT', sequelize.col('servicios_id')), 'total_servicios'],
                    [
                        sequelize.literal(`SUM(CASE WHEN estado = 'TERMINADO' THEN 1 ELSE 0 END)`),
                        'servicios_completados'
                    ],
                    [
                        sequelize.literal(`
                            EXTRACT(EPOCH FROM AVG(
                                CASE 
                                    WHEN "fechaTerminado" IS NOT NULL AND "fechaInicio" IS NOT NULL 
                                    THEN GREATEST("fechaTerminado"::timestamp, "fechaInicio"::timestamp) - 
                                         LEAST("fechaTerminado"::timestamp, "fechaInicio"::timestamp)
                                END
                            ))
                        `),
                        'tiempo_promedio_resolucion'
                    ]
                ],
                where: {
                    ...whereConditions,
                    tecnicoAsignado: { [Op.not]: null }
                },
                group: ['tecnicoAsignado']
            });

            // 3. Tiempo promedio de resolución por tipo
            const tiempoResolucionPorTipo = await Service.findAll({
                attributes: [
                    'tipo',
                    [
                        sequelize.literal(`
                            EXTRACT(EPOCH FROM AVG(
                                CASE 
                                    WHEN "fechaTerminado" IS NOT NULL AND "fechaInicio" IS NOT NULL 
                                    THEN GREATEST("fechaTerminado"::timestamp, "fechaInicio"::timestamp) - 
                                         LEAST("fechaTerminado"::timestamp, "fechaInicio"::timestamp)
                                END
                            ))
                        `),
                        'tiempo_promedio'
                    ],
                    [sequelize.fn('COUNT', sequelize.col('servicios_id')), 'total_servicios']
                ],
                where: {
                    ...whereConditions,
                    fechaTerminado: { [Op.not]: null },
                    fechaInicio: { [Op.not]: null }
                },
                group: ['tipo']
            });

            // 4. Resumen general
            const resumenGeneral = await Service.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('servicios_id')), 'total_servicios'],
                    [
                        sequelize.literal(`SUM(CASE WHEN estado = 'TERMINADO' THEN 1 ELSE 0 END)`),
                        'servicios_terminados'
                    ],
                    [
                        sequelize.literal(`
                            EXTRACT(EPOCH FROM AVG(
                                CASE 
                                    WHEN "fechaTerminado" IS NOT NULL AND "fechaInicio" IS NOT NULL 
                                    THEN GREATEST("fechaTerminado"::timestamp, "fechaInicio"::timestamp) - 
                                         LEAST("fechaTerminado"::timestamp, "fechaInicio"::timestamp)
                                END
                            ))
                        `),
                        'tiempo_promedio_general'
                    ]
                ],
                where: whereConditions
            });

            // Procesar y formatear los datos para los gráficos
            const chartData = {
                resumen: {
                    total_servicios: parseInt(resumenGeneral[0].dataValues.total_servicios) || 0,
                    servicios_terminados: parseInt(resumenGeneral[0].dataValues.servicios_terminados) || 0,
                    tiempo_promedio_general: parseFloat(resumenGeneral[0].dataValues.tiempo_promedio_general) / 3600 || 0
                },
                distribucionTipos: {
                    labels: serviciosPorTipo.map(item => item.tipo || 'Sin tipo'),
                    data: serviciosPorTipo.map(item => ({
                        tipo: item.tipo || 'Sin tipo',
                        cantidad: parseInt(item.get('cantidad')) || 0,
                        porcentaje: parseFloat(item.get('porcentaje')) || 0
                    }))
                },
                rendimientoTecnicos: await Promise.all(metricasPorTecnico.map(async item => {
                    const tecnico = await sequelize.models.User.findByPk(item.tecnicoAsignado);
                    return {
                        tecnico: tecnico ? `${tecnico.nombres} ${tecnico.apellidos}` : `Técnico ${item.tecnicoAsignado}`,
                        total_servicios: parseInt(item.get('total_servicios')) || 0,
                        completados: parseInt(item.get('servicios_completados')) || 0,
                        tiempo_promedio: parseFloat(item.get('tiempo_promedio_resolucion')) / 3600 || 0
                    };
                })),
                tiemposResolucion: tiempoResolucionPorTipo.map(item => ({
                    tipo: item.tipo || 'Sin tipo',
                    tiempo_promedio_horas: parseFloat(item.get('tiempo_promedio')) / 3600 || 0,
                    total_servicios: parseInt(item.get('total_servicios')) || 0
                }))
            };

            return chartData;
        } catch (error) {
            console.error("Error al obtener métricas de servicios:", error);
            throw error;
        }
    }
}

module.exports = ServiceService;
