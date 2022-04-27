/*
SQLyog Ultimate v11.33 (64 bit)
MySQL - 5.1.72-community : Database - sgc
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*Table structure for table `autotanques` */

DROP TABLE IF EXISTS `autotanques`;

CREATE TABLE `autotanques` (
  `id_autotanque` int(10) NOT NULL AUTO_INCREMENT,
  `no_autotanque` int(11) DEFAULT NULL,
  `tag` varchar(10) DEFAULT NULL,
  `no_economico` varchar(16) DEFAULT NULL,
  `no_serie` varchar(32) DEFAULT NULL,
  `combustible` int(11) DEFAULT NULL,
  `placas` varchar(16) DEFAULT NULL,
  `marca` varchar(16) DEFAULT NULL,
  `modelo` varchar(16) DEFAULT NULL,
  `capacidad` int(11) DEFAULT NULL,
  `max_servicios` int(11) DEFAULT NULL,
  `dias` int(11) DEFAULT NULL,
  `entrada` datetime DEFAULT NULL,
  `salida` datetime DEFAULT NULL,
  `activo` int(1) DEFAULT NULL,
  `kms` int(10) DEFAULT NULL,
  `liq_type` int(11) DEFAULT NULL,
  `id_equipo` int(11) NOT NULL,
  `activarPorcentaje` int(11) DEFAULT NULL,
  `minimoPorcentaje` decimal(10,0) DEFAULT NULL,
  PRIMARY KEY (`id_autotanque`,`id_equipo`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `autotanques` */

/*Table structure for table `cliente` */

DROP TABLE IF EXISTS `cliente`;

CREATE TABLE `cliente` (
  `id_Cliente` int(10) NOT NULL AUTO_INCREMENT,
  `num_Ruta` int(10) NOT NULL,
  `cuenta` bigint(13) DEFAULT NULL,
  `Nombre` varchar(32) DEFAULT NULL,
  `Domicilio` varchar(32) DEFAULT NULL,
  `Colonia` varchar(32) DEFAULT NULL,
  `CP` varchar(6) DEFAULT NULL,
  `Ciudad` varchar(32) DEFAULT NULL,
  `RFC` varchar(20) DEFAULT NULL,
  `Telefono` varchar(20) DEFAULT NULL,
  `Derechos` varchar(4) DEFAULT NULL,
  `Contador` int(10) DEFAULT NULL,
  `Comentario1` varchar(32) DEFAULT NULL,
  `Comentario2` varchar(32) DEFAULT NULL,
  `id_precio` int(11) DEFAULT NULL,
  `id_impuesto` int(11) DEFAULT NULL,
  `GPS` varchar(26) DEFAULT NULL,
  `Tiempo_inicio` time DEFAULT NULL,
  `Tiempo_fin` time DEFAULT NULL,
  `CURP` varchar(32) DEFAULT NULL,
  `Reservado` int(10) DEFAULT NULL,
  `Saldo` float(8,2) DEFAULT NULL,
  `Activo` tinyint(1) DEFAULT NULL,
  `PrecioComer` varchar(9) DEFAULT NULL,
  `Tipo_Carga` int(1) NOT NULL,
  `fechahora_carga` datetime DEFAULT NULL,
  `id_autotanque_carga` int(11) DEFAULT NULL,
  `Confirmado` int(1) NOT NULL,
  `id_categoria` int(1) NOT NULL,
  `usaDomAlterno` char(1) NOT NULL,
  `Calendarizado` char(1) NOT NULL,
  `datosCalendar` varchar(40) DEFAULT NULL,
  `recordId` int(5) NOT NULL,
  `num_fact` int(1) NOT NULL,
  `observacion1` varchar(35) DEFAULT NULL,
  `observacion2` varchar(35) DEFAULT NULL,
  `observacion3` varchar(35) DEFAULT NULL,
  `observacion4` varchar(35) DEFAULT NULL,
  `observacion5` varchar(35) DEFAULT NULL,
  `observacion6` varchar(35) DEFAULT NULL,
  `observacion7` varchar(35) DEFAULT NULL,
  `observacion8` varchar(35) DEFAULT NULL,
  `observacion9` varchar(35) DEFAULT NULL,
  `observacion10` varchar(35) DEFAULT NULL,
  `posicion` int(11) NOT NULL,
  `estatus` int(11) NOT NULL,
  PRIMARY KEY (`id_Cliente`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `cliente` */

/*Table structure for table `cmd_nota` */

DROP TABLE IF EXISTS `cmd_nota`;

CREATE TABLE `cmd_nota` (
  `id_comando` int(11) NOT NULL AUTO_INCREMENT,
  `comando` char(3) NOT NULL,
  PRIMARY KEY (`id_comando`)
) ENGINE=MyISAM AUTO_INCREMENT=89 DEFAULT CHARSET=latin1;

/*Data for the table `cmd_nota` */

insert  into `cmd_nota`(`id_comando`,`comando`) values (2,'^02'),(3,'^03'),(4,'^04'),(5,'^05'),(6,'^06'),(7,'^07'),(8,'^08'),(9,'^09'),(10,'^0A'),(11,'^0B'),(12,'^0C'),(13,'^0D'),(14,'^0E'),(15,'^0F'),(16,'^10'),(17,'^11'),(18,'^12'),(19,'^13'),(20,'^14'),(21,'^15'),(22,'^16'),(23,'^17'),(24,'^18'),(25,'^19'),(26,'^1A'),(27,'^1B'),(28,'^1C'),(29,'^1D'),(30,'^1E'),(31,'^1F'),(32,'^20'),(33,'^21'),(34,'^22'),(35,'^23'),(36,'^24'),(37,'^25'),(38,'^26'),(39,'^27'),(40,'^28'),(41,'^29'),(42,'^2A'),(43,'^2B'),(44,'^2C'),(45,'^2D'),(46,'^2E'),(47,'^2F'),(48,'^30'),(49,'^31'),(50,'^32'),(51,'^33'),(52,'^34'),(53,'^35'),(54,'^36'),(55,'^37'),(56,'^38'),(57,'^39'),(58,'^3A'),(59,'^3B'),(60,'^3C'),(61,'^3D'),(62,'^3E'),(63,'^3F'),(64,'^40'),(65,'^42'),(66,'^43'),(67,'^47'),(68,'^48'),(69,'^49'),(70,'^4A'),(71,'^4B'),(72,'^4C'),(73,'^4D'),(74,'^4E'),(75,'^4F'),(76,'^50'),(77,'^51'),(78,'^52'),(79,'^53'),(80,'^55'),(81,'^56'),(82,'^57'),(83,'^58'),(84,'^59'),(85,'^5C'),(86,'^5D'),(87,'^5E'),(88,'^60');

/*Table structure for table `cmd_nota_equipo` */

DROP TABLE IF EXISTS `cmd_nota_equipo`;

CREATE TABLE `cmd_nota_equipo` (
  `id_comando` int(11) NOT NULL,
  `id_equipo` int(11) NOT NULL,
  `texto_editor` varchar(50) DEFAULT NULL,
  `descripcion` varchar(80) DEFAULT NULL,
  `tamaño` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_comando`,`id_equipo`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `cmd_nota_equipo` */

insert  into `cmd_nota_equipo`(`id_comando`,`id_equipo`,`texto_editor`,`descripcion`,`tamaño`) values (3,2,'KT','Kilogramos totales',7),(4,2,'CIUDAD CLIENTE','Ciudad del cliente',32),(5,2,'#UNI','Número de unidad',4),(6,2,'IDUSR','Identificador de usuario',6),(7,2,'NOMBRE USUARIO','Nombre de usuario',30),(12,2,'TELEFONO CLIENTE','Telefono del cliente',20),(13,2,'CTA. CLIENTE','Número de cuenta del cliente',12),(15,2,'NOMBRE CLIENTE','Nombre del cliente',32),(16,2,'RFC CLIENTE','RFC del cliente',20),(17,2,'DIRECCION CLIENTE','Dirección del cliente',32),(18,2,'COLONIA CLIENTE','Colonia del cliente',32),(19,2,'TIPO PAGO','Tipo de pago',8),(20,2,'OBSERVACIONES 1','Observaciones referentes al cliente',32),(21,2,'OBSERVACIONES 2','Observaciones referentes al cliente 2',32),(23,2,'CURP CLIENTE','Curp del cliente',32),(24,2,'HRINIC','Hora de inicio de servicio',8),(25,2,'HRFIN','Hora de fin de servicio',8),(26,2,'FECINI','Fecha de inicio de servicio',10),(27,2,'FECFIN','Fecha de fin de servicio',10),(28,2,'TEMP','Temperatura',4),(29,2,'VOLSC','Volumen sin compensar',8),(30,2,'VOLCOMP','Volumen compensado',7),(31,2,'P.U.','Precio unitario',9),(32,2,'TOTAL IMPUEST','Total del impuesto',13),(33,2,'SUBTOTAL','Costo sin IVA(Subtotal)',13),(34,2,'TOTAL','Total (Subtotal + Total Impuesto)',13),(36,2,'FCV','Factor de compensación volumetrica',5),(37,2,'$','Simbolo monetario',3),(40,2,'DENSID','Densidad',6),(44,2,'TOTAL EN TEXTO VOL','Total en texto',140),(45,2,'IA','Impuesto aplicado',4),(46,2,'FECHA','Fecha actual del equipo',8),(47,2,'HORA','Hora actual del equipo',8),(48,2,'AS','Alarmas del servicio',2),(49,2,'NP','Número de precio',2),(50,2,'NI','Número de impuesto',2),(51,2,'ST','Servicios totales',4),(52,2,'LT','Litros totales',9),(54,2,'#EVT','Consecutivo del evento',4),(55,2,'HREVT','Hora del evento',6),(56,2,'FECEVT','Fecha del evento',6),(57,2,'IDE','Identificador del evento',3),(58,2,'DATOS EVENTOS','Datos del evento',47),(59,2,'EVTOT','Eventos totales',4),(60,2,'VOLSRV','Volumen del servicio',9),(61,2,'#SER','Consecutivo del servicio',4),(62,2,'#CTASER','Número de cuenta del servicio',12),(64,2,'DURACSRV','Duración del servicio',8),(65,2,'RUTA','Ruta del Autotanque',8),(66,2,'CP','Codigo Postal del Cliente',6),(67,2,'GPS','Localizacion GPS',19),(68,2,'ODOM','Odometro',6),(69,2,'NCS','Numero de control de servicio',10),(70,2,'OBSERVACION 1','Observacion 1 del cliente',35),(71,2,'OBSERVACION 2','Observacion 2 del cliente',35),(72,2,'OBSERVACION 3','Observacion 3 del cliente',35),(73,2,'OBSERVACION 4','Observacion 4 del cliente',35),(74,2,'OBSERVACION 5','Observacion 5 del cliente',35),(75,2,'OBSERVACION 6','Observacion 6 del cliente',35),(76,2,'OBSERVACION 7','Observacion 7 del cliente',35),(77,2,'OBSERVACION 8','Observacion 8 del cliente',35),(78,2,'OBSERVACION 9','Observacion 9 del cliente',35),(79,2,'OBSERVACION 10','Observacion 10 del cliente',35),(80,2,'SALDO CTE','Saldo del cliente',11),(81,2,'#SE2','Consecutivo de servicio 2',4),(82,2,'PPE','Precio producto extra',9),(83,2,'SUBTOTAL PPE','Subtotal precio producto extra',13),(84,2,'SUBTOTAL PU','Subtotal precio unitario',13),(85,2,'TOTAL','Total de masa',13),(86,2,'SUBTOTAL','Subtotal de masa',13),(87,2,'IMPUESTOS','Impuestos de masa',13),(88,2,'TOTAL EN TEXTO MASA','Total en texto (Masa)',140);

/*Table structure for table `combustible` */

DROP TABLE IF EXISTS `combustible`;

CREATE TABLE `combustible` (
  `id_combustible` int(11) NOT NULL AUTO_INCREMENT,
  `combustible` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_combustible`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

/*Data for the table `combustible` */

insert  into `combustible`(`id_combustible`,`combustible`) values (1,'Otro'),(2,'Gas LP'),(3,'Gasolina'),(4,'Diesel');

/*Table structure for table `det_perfiles` */

DROP TABLE IF EXISTS `det_perfiles`;

CREATE TABLE `det_perfiles` (
  `id_perfil` int(11) NOT NULL,
  `id_modulo` int(11) NOT NULL,
  `acceso` int(1) DEFAULT NULL,
  PRIMARY KEY (`id_perfil`,`id_modulo`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `det_perfiles` */

insert  into `det_perfiles`(`id_perfil`,`id_modulo`,`acceso`) values (1,1501,1),(1,1502,1),(1,1503,1),(1,1504,1),(1,1505,1),(1,1401,1),(1,1402,1),(1,1403,1),(1,1404,1),(1,101,1),(1,102,1),(1,103,1),(1,104,1),(1,105,1),(1,1101,1),(1,1102,1),(1,1103,1),(1,1104,1),(1,1105,1),(1,1106,1),(1,1107,1),(1,1201,1),(1,1202,1),(1,1203,1),(1,1204,1),(1,1205,1),(1,1206,1),(1,1207,1),(1,1208,1),(1,1209,1),(1,1210,1),(1,1211,1),(1,1212,1),(1,1213,1),(1,1214,1),(1,1215,1),(1,1217,1),(1,1218,1),(1,1219,1),(1,1220,1),(1,1221,1),(1,1222,1),(1,1223,1),(1,1301,1),(1,1701,1),(1,1702,1);

/*Table structure for table `equipo` */

DROP TABLE IF EXISTS `equipo`;

CREATE TABLE `equipo` (
  `id_equipo` int(11) NOT NULL AUTO_INCREMENT,
  `equipo` varchar(30) NOT NULL,
  `id_plugin` int(11) DEFAULT NULL,
  `tabla_ev` varchar(30) DEFAULT NULL,
  `tabla_sr` varchar(30) DEFAULT NULL,
  `nota` int(1) DEFAULT NULL,
  `ext_nota` char(3) DEFAULT NULL,
  PRIMARY KEY (`id_equipo`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

/*Data for the table `equipo` */

insert  into `equipo`(`id_equipo`,`equipo`,`id_plugin`,`tabla_ev`,`tabla_sr`,`nota`,`ext_nota`) values (1,'Otro',NULL,NULL,NULL,0,NULL),(2,'Ri505A',11,'Ri505_evento','Ri505_servicio',1,'i5');

/*Table structure for table `licenciascliente` */

DROP TABLE IF EXISTS `licenciascliente`;

CREATE TABLE `licenciascliente` (
  `cliente_id` int(10) NOT NULL AUTO_INCREMENT,
  `ip` varchar(32) NOT NULL,
  `descripcion` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`cliente_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `licenciascliente` */

insert  into `licenciascliente`(`cliente_id`,`ip`,`descripcion`) values (1,'127.0.0.1','Host local');

/*Table structure for table `log` */

DROP TABLE IF EXISTS `log`;

CREATE TABLE `log` (
  `id_log` int(11) NOT NULL AUTO_INCREMENT,
  `ts_evento` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `id_evento` int(11) DEFAULT NULL,
  `data` varchar(64) NOT NULL,
  PRIMARY KEY (`id_log`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=latin1;

/*Data for the table `log` */

insert  into `log`(`id_log`,`ts_evento`,`id_evento`,`data`) values (1,'2022-04-04 17:54:46',19,''),(2,'2022-04-04 17:55:59',23,''),(3,'2022-04-04 17:56:16',19,''),(4,'2022-04-04 17:56:31',1,''),(5,'2022-04-04 17:56:47',3,'administrador, 1111'),(6,'2022-04-04 17:56:54',2,'1-administrador'),(7,'2022-04-12 10:00:59',19,''),(8,'2022-04-12 13:50:40',19,'');

/*Table structure for table `modulos` */

DROP TABLE IF EXISTS `modulos`;

CREATE TABLE `modulos` (
  `id_modulo` int(11) NOT NULL AUTO_INCREMENT,
  `id_plugin` int(11) DEFAULT NULL,
  `modulo` varchar(64) DEFAULT NULL,
  `img` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id_modulo`)
) ENGINE=MyISAM AUTO_INCREMENT=1703 DEFAULT CHARSET=latin1;

/*Data for the table `modulos` */

insert  into `modulos`(`id_modulo`,`id_plugin`,`modulo`,`img`) values (1501,15,'ServidorClientes','ServidorSGC00'),(1502,15,'ServidorLicencia','ServidorSGC01'),(1503,15,'ServidorComunicacion','ServidorSGC02'),(1504,15,'ServidorPlugins','ServidorSGC03'),(1505,15,'ServidorConfiguración','ServidorSGC04'),(1401,14,'CRBConfiguración',''),(1402,14,'CRBRespaldo',''),(1403,14,'CRBRestauración',''),(1404,14,'CRBMantenimiento',''),(106,1,'GeneralReportesGerencial',''),(105,1,'GeneralReportes','SGC04'),(104,1,'GeneralEditorNotas','SGC03'),(103,1,'GeneralAutotanques','SGC02'),(102,1,'GeneralUsuarios','SGC01'),(101,1,'GeneralConfiguracion','SGC00'),(107,1,'GeneralReportesOperacion',''),(108,1,'GeneralReportesVentas',''),(1101,11,'Ri505AConfiguracion','AT500'),(1102,11,'Ri505ARelaciones','AT501'),(1103,11,'Ri505ACarga y Descarga','AT502'),(1104,11,'Ri505ARegistro','AT503'),(1105,11,'Ri505AGPRS','AT504'),(1107,11,'Ri505AReporte de Liquidacion','AT505'),(1201,12,'Ri505A EquipoImprimir reporte de eventos',NULL),(1202,12,'Ri505A EquipoImprimir reporte de servicios',NULL),(1203,12,'Ri505A EquipoSeleccionar clientes',NULL),(1204,12,'Ri505A EquipoRequiere password',NULL),(1205,12,'Ri505A EquipoEstablecer flujos',NULL),(1206,12,'Ri505A EquipoModificar precios e impuestos',NULL),(1207,12,'Ri505A EquipoNumero de unidad',NULL),(1208,12,'Ri505A EquipoModificar hora y fecha',NULL),(1209,12,'Ri505A EquipoIngresar pda',NULL),(1210,12,'Ri505A EquipoConfigurar masico',NULL),(1211,12,'Ri505A EquipoConfigurar tiempo de fin de servicio',NULL),(1212,12,'Ri505A EquipoEstablecer factores de calibracion',NULL),(1213,12,'Ri505A EquipoEstablecer densidad',NULL),(1214,12,'Ri505A EquipoConsultar estado del masico, Opciones GPS',NULL),(1215,12,'Ri505A EquipoReiniciar contadores',NULL),(1217,12,'Ri505A EquipoEstablecer unidades',NULL),(1218,12,'Ri505A EquipoEstablecer idioma',NULL),(1219,12,'Ri505A EquipoEstablecer direccion de flujo',NULL),(1220,12,'RI505A EquipoMostrar Punto Decimal',NULL),(1221,12,'Ri505A EquipoTiempo de apagado impresora,Selección de impresora',NULL),(1222,12,'Ri505A EquipoInicio y fin de ruta',NULL),(1223,12,'Ri505A EquipoImprimir reporte de clientes',NULL),(1301,13,'Ri505A PdaAcceso a Pda',NULL),(1701,17,'SincRFConfiguracion','SinRF00'),(1702,17,'SincRFSincronizacion RF','SinRF01'),(901,9,'Troya2MonitoreoGeneral','TRY00'),(902,9,'Troya2MonitoreoIndividual','TRY00'),(903,9,'Troya2Mantenimiento','TRY01'),(904,9,'Troya2Configuracion','TRY02'),(905,9,'Troya2Parametros de Llenado',''),(906,9,'Troya2Calibracion y ajuste',''),(907,9,'Troya2Tecla Rapida',''),(908,9,'Troya2Datos Generales',''),(909,9,'Troya2Clasificaciones',''),(910,9,'Troya2Calibracion a cero con restricción',''),(911,9,'Troya2Calibracion a cero sin restricción','');

/*Table structure for table `pda` */

DROP TABLE IF EXISTS `pda`;

CREATE TABLE `pda` (
  `id_pda` int(11) NOT NULL AUTO_INCREMENT,
  `tag` varchar(16) DEFAULT NULL,
  `serial` varchar(12) DEFAULT NULL,
  PRIMARY KEY (`id_pda`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `pda` */

insert  into `pda`(`id_pda`,`tag`,`serial`) values (1,'PDA Generica','111111111111');

/*Table structure for table `perfiles` */

DROP TABLE IF EXISTS `perfiles`;

CREATE TABLE `perfiles` (
  `id_perfil` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` char(32) DEFAULT NULL,
  PRIMARY KEY (`id_perfil`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `perfiles` */

insert  into `perfiles`(`id_perfil`,`nombre`) values (1,'Administrador');

/*Table structure for table `plugins` */

DROP TABLE IF EXISTS `plugins`;

CREATE TABLE `plugins` (
  `id_plugin` int(11) NOT NULL AUTO_INCREMENT,
  `plugin` varchar(50) NOT NULL,
  `activo` int(1) DEFAULT NULL,
  `modulos` int(1) DEFAULT NULL,
  `version` varchar(20) NOT NULL,
  PRIMARY KEY (`id_plugin`)
) ENGINE=MyISAM AUTO_INCREMENT=18 DEFAULT CHARSET=latin1;

/*Data for the table `plugins` */

insert  into `plugins`(`id_plugin`,`plugin`,`activo`,`modulos`,`version`) values (15,'Servidor',1,1,'HUN Update 01'),(14,'CRB',0,1,''),(1,'General',1,1,'HUN Update 04'),(11,'Ri505A',1,1,'HUN Update 05'),(12,'Ri505A Equipo',0,1,''),(13,'Ri505A Pda',0,1,''),(17,'SincRF',1,1,'HUN Update 15'),(9,'Troya2',1,1,'2.13.5');

/*Table structure for table `respaldo` */

DROP TABLE IF EXISTS `respaldo`;

CREATE TABLE `respaldo` (
  `id_respaldo` int(11) NOT NULL AUTO_INCREMENT,
  `archivo` varchar(40) DEFAULT NULL,
  `fechahora` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_respaldo`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `respaldo` */

/*Table structure for table `ri505_alarma` */

DROP TABLE IF EXISTS `ri505_alarma`;

CREATE TABLE `ri505_alarma` (
  `idRi505_Alarma` int(10) NOT NULL,
  `descripcion` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`idRi505_Alarma`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_alarma` */

insert  into `ri505_alarma`(`idRi505_Alarma`,`descripcion`) values (1,'Módulo abierto'),(2,'Error en válvula'),(3,'Batería baja'),(4,'Error en alimentación principal'),(5,'Error de impresora'),(6,'Error en sensor'),(7,'Unidad fuera de servicio'),(8,'Falla posición'),(9,'GPS falla'),(10,'GPS fuera');

/*Table structure for table `ri505_autotanque_evento` */

DROP TABLE IF EXISTS `ri505_autotanque_evento`;

CREATE TABLE `ri505_autotanque_evento` (
  `idRi505_autotanque_evento` int(10) NOT NULL AUTO_INCREMENT,
  `id_autotanque` int(10) NOT NULL,
  `idRi505_Evento` int(10) NOT NULL,
  `consecutivo` int(11) NOT NULL,
  `ts` datetime NOT NULL,
  `data` varchar(45) DEFAULT NULL,
  `gps` varchar(26) DEFAULT NULL,
  PRIMARY KEY (`idRi505_autotanque_evento`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_autotanque_evento` */

/*Table structure for table `ri505_autotanque_ruta` */

DROP TABLE IF EXISTS `ri505_autotanque_ruta`;

CREATE TABLE `ri505_autotanque_ruta` (
  `id_autotanque` int(10) NOT NULL,
  `num_ruta` int(10) NOT NULL,
  PRIMARY KEY (`id_autotanque`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_autotanque_ruta` */

/*Table structure for table `ri505_categorias` */

DROP TABLE IF EXISTS `ri505_categorias`;

CREATE TABLE `ri505_categorias` (
  `id_categoria` int(4) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(100) NOT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_categorias` */

/*Table structure for table `ri505_cltdomfact` */

DROP TABLE IF EXISTS `ri505_cltdomfact`;

CREATE TABLE `ri505_cltdomfact` (
  `id_Cliente` int(10) NOT NULL,
  `Nombre2` varchar(32) NOT NULL,
  `Domicilio2` varchar(32) NOT NULL,
  `Colonia2` varchar(32) NOT NULL,
  `CP2` varchar(6) NOT NULL,
  `Ciudad2` varchar(32) NOT NULL,
  `Telefono2` varchar(20) NOT NULL,
  PRIMARY KEY (`id_Cliente`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_cltdomfact` */

/*Table structure for table `ri505_evento` */

DROP TABLE IF EXISTS `ri505_evento`;

CREATE TABLE `ri505_evento` (
  `idRi505_Evento` int(10) NOT NULL,
  `Descripcion` varchar(150) DEFAULT NULL,
  `Datos` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`idRi505_Evento`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_evento` */

insert  into `ri505_evento`(`idRi505_Evento`,`Descripcion`,`Datos`) values (0,'Inicialización de Registro',''),(1,'Sin uso 1',''),(2,'Inicialización de sensor',''),(3,'Reset de Registro',''),(4,'Reset de Registro COP',''),(5,'Reset de Registro por bajo voltaje',''),(6,'Reset externo de Registro',''),(7,'Fallo del reloj de Registro',''),(8,'Sin uso 8',''),(9,'Sin uso 9',''),(10,'Sin uso A',''),(11,'Sin uso B',''),(12,'Sin uso C',''),(13,'Sin uso D',''),(14,'Sin uso E',''),(15,'Reset del sensor COP',''),(16,'Reset del sensor por bajo voltaje',''),(17,'Reset externo del sensor',''),(18,'Reset del sensor por instrucción ilegal',''),(19,'Caja de Distribuidor abierto',''),(20,'Caja de Distribuidor cerrado',''),(21,'Caja de Registro abierto',''),(22,'Caja de Registro cerrado',''),(23,'Caja de sensor abierta',''),(24,'Caja de sensor cerrada',''),(25,'Sin uso 19',''),(26,'Sin uso 1A',''),(27,'Fallo de comunicación con sensor',''),(28,'Tag inválido',''),(29,'Password inválido de usuario','Usuario(6)'),(30,'Cambio de hora','Usuario(6), HoraNueva(6)'),(31,'Cambio de fecha','Usuario(6), FechaNueva(6)'),(32,'Cambio de precio','Usuario(6), Indice(2), PrecioAnt(8), PrecioNuev(8)'),(33,'Cambio de impuestos','Usuario(6), Indice(1), ImpAnt(3), ImpNuev(3)'),(34,'Cambio de número de unidad','Usuario(6), NumAnt(4), NumNuev(4)'),(35,'Cambio de flujo mínimo','Usuario(6), FlujoAnt(4), FlujoNuev(4)'),(36,'Cambio de flujo máximo','Usuario(6), FlujoAnt(4), FlujoNuev(4)'),(37,'Cambio de factor A','Usuario(6), FactorAnt(4), FactorNuev(4)'),(38,'Cambio de factor B','Usuario(6), FactorAnt(4), FactorNuev(4)'),(39,'Cambio de factor de calibración MFM','Usuario(6), FactorAnt(4), FactorNuev(4)'),(40,'Se agregó una PDA','Usuario(6)'),(41,'Generación de reporte de eventos','Usuario(6)'),(42,'Generación de reporte de servicios','Usuario(6)'),(43,'Cambio de tiempo de fin de servicio','Usuario(6), TiempoAnt-seg(2), TiempoNuev-seg(2)'),(44,'Inicialización de contadores','Usuario(6)'),(45,'Cambio de densidad mínima','Usuario(6), DensAnt(4), DensAnt(4)'),(46,'Cambio de densidad máxima','Usuario(6), DensAnt(4), DensAnt(4)'),(47,'Cambio del sentido de giro','Usuario (6), Sentido(1)'),(48,'Sin uso 30',''),(49,'Sin uso 31',''),(50,'Sin uso 32',''),(51,'Sin uso 33','Error(2)'),(52,'Voltaje bajo en la batería','Error(2)'),(53,'Voltaje bajo en la alimentación principal','Error(2)'),(54,'Sin uso 36',''),(55,'Sin uso 37',''),(56,'Sin uso 38',''),(57,'Sin uso 39',''),(58,'Falta papel en la impresora','Usuario(6),Tipo de Impresion(1)'),(59,'Falta impresora',''),(60,'No hay nota de venta',''),(61,'Sin uso 3D',''),(62,'Despresurización de manguera',''),(63,'Autocalibración','Medición del Equipo(8)'),(64,'Fallo de comunicación en BusPC',''),(65,'Fallo de comunicación con MFM',''),(66,'Inicialización del medidor másico',''),(67,'Error de densidad durante servicio MFM','Densidad(5)'),(68,'Error de flujo durante servicio MFM','Flujo(5)'),(69,'Sin uso 45',''),(70,'Sin uso 46',''),(71,'Error de servicio sin inicio MFM',''),(72,'Fin de servicio sin inicio MFM',''),(73,'No comunicación con sensor D+',''),(74,'Inicialización del sensor DP',''),(75,'Error de densidad durante servicio DP','Densidad(5)'),(76,'Error de flujo durante servicio DP','Flujo(5)'),(77,'Error de servicio sin inicio DP',''),(78,'Fin de servicio sin inicio','Volumen(8)'),(79,'Recuperación de comunicación con D+',''),(80,'Cambio de hora (externo)','HoraAnt(6), HoraNuev(6))'),(81,'Cambio de fecha (externo)','FechaAnt(6), FechaNuev(6)'),(82,'Cambio de precio (externo)','Indice(2), PrecioAnt(8), PrecioNuev(8)'),(83,'Cambio de impuesto (externo)','Indice(2), ImpAnt(3), ImpNuev(3)'),(84,'Cambio de flujo mínimo (externo)',''),(85,'Cambio de flujo máximo (externo)',''),(86,'Cambio de factor A (externo)',''),(87,'Cambio de factor B (externo)',''),(88,'Cambio de factor de calibración de MFM (externo)',''),(89,'Se agregó una PDA (externo)',''),(90,'Cambio de tiempo de impresión (externo)',''),(91,'Inicialización de contadores (externo)',''),(92,'Cambio de densidad mínima (externo)',''),(93,'Cambio de densidad máxima (externo)',''),(94,'Cambio de nota (externo)',''),(95,'Cambio de factor P','Usuario (6), FactorAnt (1), FactorNuev (1)'),(96,'Cambio de tiempo de apagado de impresora','Usuario (6), TiempoAnt-min (2), TiempoNuev-min (2)'),(97,'Cambio de unidad de medición del MFM','Usuario (6), Unidad(1)'),(98,'Zering hecho al MFM','Usuario (6)'),(99,'Cambio de modelo del GPS','Usuario (6), Modelo(1)'),(100,'Precio unitario incorrecto','Cuenta (12)'),(102,'Inicio de ruta','Km(6), %Tanque(2E2D), GPS(19), Totalizadores Vol/Masa(8/8)'),(103,'Fin de ruta','Km(6), %Tanque(2E2D), GPS(19), Totalizadores Vol/Masa(8/8)'),(104,'Cancelación de servicio','Codigo de cancelacion (2), Cuenta (12)'),(105,'Cambio de impresora [0-290, 1-295, 2-Ninguna, 3-220]','Usuario(6), Impresora(1)'),(106,'GENCA','OK-Aceptado, PF-Fallo, TO-Tiempo'),(253,'Falla de comunicación RF',''),(254,'Falla de comunicación pc - pda','');

/*Table structure for table `ri505_formapago` */

DROP TABLE IF EXISTS `ri505_formapago`;

CREATE TABLE `ri505_formapago` (
  `IdFormaPago` smallint(4) NOT NULL,
  `Nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`IdFormaPago`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_formapago` */

insert  into `ri505_formapago`(`IdFormaPago`,`Nombre`) values (0,'Contado'),(1,'Credito'),(2,'Tarjeta'),(3,'Cortesia'),(4,'Prepago'),(5,'Otros');

/*Table structure for table `ri505_gprs_config` */

DROP TABLE IF EXISTS `ri505_gprs_config`;

CREATE TABLE `ri505_gprs_config` (
  `id_autotanque` int(10) NOT NULL,
  `id_gprsmodule` int(10) NOT NULL,
  `date_last_cut` date DEFAULT NULL,
  `time_last_cut` time DEFAULT NULL,
  `state_cut` int(1) NOT NULL,
  `config_evt` int(1) NOT NULL,
  `config_srv` int(1) NOT NULL,
  `config_bc_evt` int(1) NOT NULL,
  `config_bc_srv` int(1) NOT NULL,
  PRIMARY KEY (`id_autotanque`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_gprs_config` */

/*Table structure for table `ri505_impuesto` */

DROP TABLE IF EXISTS `ri505_impuesto`;

CREATE TABLE `ri505_impuesto` (
  `id_impuesto` int(11) NOT NULL,
  `impuesto` double DEFAULT NULL,
  PRIMARY KEY (`id_impuesto`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_impuesto` */

insert  into `ri505_impuesto`(`id_impuesto`,`impuesto`) values (0,0),(1,0),(2,0),(3,0),(4,0),(5,0),(6,0),(7,0),(8,0),(9,0);

/*Table structure for table `ri505_liquidacion` */

DROP TABLE IF EXISTS `ri505_liquidacion`;

CREATE TABLE `ri505_liquidacion` (
  `id_liquidacion` int(11) NOT NULL AUTO_INCREMENT,
  `id_autotanque` int(11) NOT NULL,
  `no_evt_crit` int(11) NOT NULL,
  `no_evt_ncrit` int(11) NOT NULL,
  `no_srv_cred` int(11) NOT NULL,
  `no_srv_cont` int(11) NOT NULL,
  `no_srv_otros` int(11) NOT NULL,
  `total_srv_cred` float NOT NULL,
  `total_srv_cont` float NOT NULL,
  `total_srv_otros` float NOT NULL,
  `fecha_liquidacion` datetime NOT NULL,
  `operador` varchar(50) NOT NULL,
  `id_liquidador` int(11) NOT NULL,
  `fecha_inicio_ruta` datetime NOT NULL,
  `fecha_fin_ruta` datetime NOT NULL,
  `no_evt_fr` datetime NOT NULL,
  `no_srv_fr` datetime NOT NULL,
  `total_inicio` varchar(8) NOT NULL,
  `total_fin` varchar(8) NOT NULL,
  `km_inicio` varchar(6) NOT NULL,
  `km_fin` varchar(6) NOT NULL,
  `tanque_inicio` float NOT NULL,
  `tanque_fin` float NOT NULL,
  `gps_inicio` varchar(25) NOT NULL,
  `gps_fin` varchar(25) NOT NULL,
  PRIMARY KEY (`id_liquidacion`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_liquidacion` */

/*Table structure for table `ri505_odometro` */

DROP TABLE IF EXISTS `ri505_odometro`;

CREATE TABLE `ri505_odometro` (
  `id_odometro` int(10) NOT NULL AUTO_INCREMENT,
  `id_autotanque` int(10) NOT NULL,
  `Hora` time NOT NULL,
  `Fecha` date NOT NULL,
  `TotalOdo` int(11) NOT NULL,
  PRIMARY KEY (`id_odometro`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_odometro` */

/*Table structure for table `ri505_pda_autotanque` */

DROP TABLE IF EXISTS `ri505_pda_autotanque`;

CREATE TABLE `ri505_pda_autotanque` (
  `id_PDA` int(10) NOT NULL,
  `id_autotanque` int(10) NOT NULL,
  PRIMARY KEY (`id_PDA`,`id_autotanque`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_pda_autotanque` */

/*Table structure for table `ri505_pda_usuario` */

DROP TABLE IF EXISTS `ri505_pda_usuario`;

CREATE TABLE `ri505_pda_usuario` (
  `id_PDA` int(10) NOT NULL,
  `id_autotanque` int(10) NOT NULL,
  `id_usr` int(10) NOT NULL,
  PRIMARY KEY (`id_PDA`,`id_autotanque`,`id_usr`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_pda_usuario` */

/*Table structure for table `ri505_posicion_disponible` */

DROP TABLE IF EXISTS `ri505_posicion_disponible`;

CREATE TABLE `ri505_posicion_disponible` (
  `id_posicion` int(10) NOT NULL AUTO_INCREMENT,
  `posicion` int(11) DEFAULT NULL,
  `no_autotanque` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_posicion`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_posicion_disponible` */

/*Table structure for table `ri505_precio` */

DROP TABLE IF EXISTS `ri505_precio`;

CREATE TABLE `ri505_precio` (
  `id_precio` int(11) NOT NULL,
  `precio` double DEFAULT NULL,
  PRIMARY KEY (`id_precio`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_precio` */

insert  into `ri505_precio`(`id_precio`,`precio`) values (0,0),(1,0),(2,0),(3,0),(4,0),(5,0),(6,0),(7,0),(8,0),(9,0),(10,0),(11,0),(12,0),(13,0),(14,0),(15,0),(16,0),(17,0),(18,0),(19,0),(20,0),(21,0),(22,0),(23,0),(24,0),(25,0),(26,0),(27,0),(28,0),(29,0),(30,0),(31,0),(32,0),(33,0),(34,0),(35,0),(36,0),(37,0),(38,0),(39,0),(40,0),(41,0),(42,0),(43,0),(44,0),(45,0),(46,0),(47,0),(48,0),(49,0);

/*Table structure for table `ri505_servicio` */

DROP TABLE IF EXISTS `ri505_servicio`;

CREATE TABLE `ri505_servicio` (
  `id_servicio` int(10) NOT NULL AUTO_INCREMENT,
  `id_autotanque` int(10) NOT NULL,
  `consecutivo` int(11) NOT NULL,
  `consecutivo2` int(11) DEFAULT NULL,
  `id_Cliente` int(10) NOT NULL,
  `num_ruta` int(10) NOT NULL,
  `ts1` datetime DEFAULT NULL,
  `ts2` datetime DEFAULT NULL,
  `volumen` float(7,1) DEFAULT NULL,
  `gps` varchar(26) DEFAULT NULL,
  `formapago` int(11) DEFAULT NULL,
  `id_usr` int(11) DEFAULT NULL,
  `impuesto` float(2,1) DEFAULT NULL,
  `precio` float(5,4) DEFAULT NULL,
  `alarmas` varchar(4) NOT NULL,
  `odometro` int(10) DEFAULT NULL,
  `precio_str` varchar(10) DEFAULT NULL,
  `precioComer` varchar(9) DEFAULT NULL,
  `num_control` varchar(10) DEFAULT NULL,
  `masa_o_volumen` float(7,1) DEFAULT NULL,
  `densidad` varchar(6) DEFAULT NULL,
  `temperatura` varchar(5) DEFAULT NULL,
  `validador` char(2) DEFAULT NULL,
  `fechahora` datetime DEFAULT NULL,
  `unidad_config` char(2) DEFAULT NULL,
  `total_volumen` int(11) NOT NULL,
  `total_masa` int(11) NOT NULL,
  PRIMARY KEY (`id_servicio`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_servicio` */

/*Table structure for table `ri505_servicio_alarma` */

DROP TABLE IF EXISTS `ri505_servicio_alarma`;

CREATE TABLE `ri505_servicio_alarma` (
  `id_servicio` int(10) NOT NULL,
  `idRi505_Alarma` int(10) NOT NULL,
  PRIMARY KEY (`id_servicio`,`idRi505_Alarma`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_servicio_alarma` */

/*Table structure for table `ri505_servicio_alarma_carburacion` */

DROP TABLE IF EXISTS `ri505_servicio_alarma_carburacion`;

CREATE TABLE `ri505_servicio_alarma_carburacion` (
  `id_servicio` int(10) NOT NULL,
  `idRi505_Alarma` int(10) NOT NULL,
  PRIMARY KEY (`id_servicio`,`idRi505_Alarma`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_servicio_alarma_carburacion` */

/*Table structure for table `ri505_servicio_carburacion` */

DROP TABLE IF EXISTS `ri505_servicio_carburacion`;

CREATE TABLE `ri505_servicio_carburacion` (
  `id_servicio` int(10) NOT NULL AUTO_INCREMENT,
  `id_autotanque` int(10) NOT NULL,
  `consecutivo` int(11) NOT NULL,
  `consecutivo2` int(11) DEFAULT NULL,
  `id_Cliente` int(10) NOT NULL,
  `num_ruta` int(10) NOT NULL,
  `ts1` datetime DEFAULT NULL,
  `ts2` datetime DEFAULT NULL,
  `volumen` float(7,1) DEFAULT NULL,
  `gps` varchar(26) DEFAULT NULL,
  `formapago` int(11) DEFAULT NULL,
  `id_usr` int(11) DEFAULT NULL,
  `impuesto` float(2,1) DEFAULT NULL,
  `precio` float(5,4) DEFAULT NULL,
  `alarmas` varchar(4) NOT NULL,
  `odometro` int(10) DEFAULT NULL,
  `precio_str` varchar(10) DEFAULT NULL,
  `precioComer` varchar(9) DEFAULT NULL,
  `num_control` varchar(10) DEFAULT NULL,
  `masa_o_volumen` float(7,1) DEFAULT NULL,
  `densidad` varchar(6) DEFAULT NULL,
  `temperatura` varchar(5) DEFAULT NULL,
  `validador` char(2) DEFAULT NULL,
  `fechahora` datetime DEFAULT NULL,
  `unidad_config` char(2) DEFAULT NULL,
  `total_volumen` int(11) NOT NULL,
  `total_masa` int(11) NOT NULL,
  PRIMARY KEY (`id_servicio`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_servicio_carburacion` */

/*Table structure for table `ri505_servicio_noid` */

DROP TABLE IF EXISTS `ri505_servicio_noid`;

CREATE TABLE `ri505_servicio_noid` (
  `id_servicio_noid` int(10) NOT NULL AUTO_INCREMENT,
  `id_autotanque` int(10) NOT NULL,
  `consecutivo` int(11) NOT NULL,
  `consecutivo2` int(11) DEFAULT NULL,
  `cuenta` int(10) NOT NULL,
  `num_ruta` int(10) NOT NULL,
  `ts1` datetime DEFAULT NULL,
  `ts2` datetime DEFAULT NULL,
  `volumen` float(7,1) DEFAULT NULL,
  `gps` varchar(26) DEFAULT NULL,
  `formapago` int(11) DEFAULT NULL,
  `id_usr` int(11) DEFAULT NULL,
  `impuesto` float(2,1) DEFAULT NULL,
  `precio` float(5,4) DEFAULT NULL,
  `alarmas` varchar(4) NOT NULL,
  `odometro` int(10) DEFAULT NULL,
  `precio_str` varchar(10) DEFAULT NULL,
  `precioComer` varchar(9) DEFAULT NULL,
  `num_control` varchar(10) DEFAULT NULL,
  `masa_o_volumen` float(7,1) DEFAULT NULL,
  `densidad` varchar(6) DEFAULT NULL,
  `temperatura` varchar(5) DEFAULT NULL,
  `validador` char(2) DEFAULT NULL,
  `fechahora` datetime DEFAULT NULL,
  `unidad_config` char(2) DEFAULT NULL,
  `total_volumen` int(11) NOT NULL,
  `total_masa` int(11) NOT NULL,
  PRIMARY KEY (`id_servicio_noid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_servicio_noid` */

/*Table structure for table `ri505_servicio_noid_carburacion` */

DROP TABLE IF EXISTS `ri505_servicio_noid_carburacion`;

CREATE TABLE `ri505_servicio_noid_carburacion` (
  `id_servicio_noid` int(10) NOT NULL AUTO_INCREMENT,
  `id_autotanque` int(10) NOT NULL,
  `consecutivo` int(11) NOT NULL,
  `consecutivo2` int(11) DEFAULT NULL,
  `cuenta` int(10) NOT NULL,
  `num_ruta` int(10) NOT NULL,
  `ts1` datetime DEFAULT NULL,
  `ts2` datetime DEFAULT NULL,
  `volumen` float(7,1) DEFAULT NULL,
  `gps` varchar(26) DEFAULT NULL,
  `formapago` int(11) DEFAULT NULL,
  `id_usr` int(11) DEFAULT NULL,
  `impuesto` float(2,1) DEFAULT NULL,
  `precio` float(5,4) DEFAULT NULL,
  `alarmas` varchar(4) NOT NULL,
  `odometro` int(10) DEFAULT NULL,
  `precio_str` varchar(10) DEFAULT NULL,
  `precioComer` varchar(9) DEFAULT NULL,
  `num_control` varchar(10) DEFAULT NULL,
  `masa_o_volumen` float(7,1) DEFAULT NULL,
  `densidad` varchar(6) DEFAULT NULL,
  `temperatura` varchar(5) DEFAULT NULL,
  `validador` char(2) DEFAULT NULL,
  `fechahora` datetime DEFAULT NULL,
  `unidad_config` char(2) DEFAULT NULL,
  `total_volumen` int(11) NOT NULL,
  `total_masa` int(11) NOT NULL,
  PRIMARY KEY (`id_servicio_noid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `ri505_servicio_noid_carburacion` */

/*Table structure for table `ruta` */

DROP TABLE IF EXISTS `ruta`;

CREATE TABLE `ruta` (
  `num_Ruta` int(10) NOT NULL AUTO_INCREMENT,
  `Nombre` varchar(32) DEFAULT NULL,
  `Descripcion` varchar(255) DEFAULT NULL,
  `GPS1` varchar(20) DEFAULT NULL,
  `GPS2` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`num_Ruta`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `ruta` */

insert  into `ruta`(`num_Ruta`,`Nombre`,`Descripcion`,`GPS1`,`GPS2`) values (1,'Publico_General','Ruta de Publico en General insertada por el sistema',NULL,NULL);

/*Table structure for table `sgc_config` */

DROP TABLE IF EXISTS `sgc_config`;

CREATE TABLE `sgc_config` (
  `id_config` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `tipo` varchar(20) DEFAULT NULL,
  `valor` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_config`,`nombre`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

/*Data for the table `sgc_config` */

insert  into `sgc_config`(`id_config`,`nombre`,`tipo`,`valor`) values (1,'empresa','String','TEST'),(2,'planta','String','SGC MATRIZ'),(3,'tagRi505A','INTEGER(1)','1');

/*Table structure for table `sgc_eventos` */

DROP TABLE IF EXISTS `sgc_eventos`;

CREATE TABLE `sgc_eventos` (
  `id_evento` int(11) NOT NULL AUTO_INCREMENT,
  `descripcion` varchar(50) DEFAULT NULL,
  `datos` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_evento`)
) ENGINE=MyISAM AUTO_INCREMENT=24 DEFAULT CHARSET=latin1;

/*Data for the table `sgc_eventos` */

insert  into `sgc_eventos`(`id_evento`,`descripcion`,`datos`) values (14,'Reasignación de tag de usuario','Usuario, Tag'),(1,'Inicio de SGC',''),(2,'Inicio de sesión SGC','Usuario'),(3,'Inicio de sesión SGC fallido','Usuario, Contraseña'),(4,'Cierre de sesión SGC','Usuario'),(5,'Creación de perfil','Perfil'),(6,'Creación de usuario','Usuario, Perfil'),(7,'Cierre de SGC',''),(8,'Plugin cargado en SGC','Plugin'),(9,'Modificación de usuario','Usuario, Perfil'),(10,'Modificación de perfil','Perfil'),(11,'Modificación de configuración de base de datos',''),(12,'Modificación de configuración de reporteador',''),(13,'Asignación tag de usuario','Usuario, Tag'),(15,'Creación de autotanque','Autotanque'),(16,'Modificación de autotanque','Autotanque'),(17,'Asignación tag de auotanque','Autotanque, Tag'),(18,'Reasignación de tag de autotanque','Autotanque, Tag'),(19,'Inicio de SGC Servidor',''),(20,'Inicio de sesión Servidor','Usuario'),(21,'Inicio de sesión Servidor fallido','Usuario, Contraseña'),(22,'Cierre de sesión Servidor','Usuario'),(23,'Cierre de SGC Servidor','');

/*Table structure for table `syncrf_autsearch` */

DROP TABLE IF EXISTS `syncrf_autsearch`;

CREATE TABLE `syncrf_autsearch` (
  `idSyncRF_AutSearch` int(10) NOT NULL AUTO_INCREMENT,
  `id_autotanque` int(10) NOT NULL,
  `estado` tinyint(1) DEFAULT NULL,
  `carga_cliente` tinyint(1) DEFAULT NULL,
  `carga_precio` tinyint(1) DEFAULT NULL,
  `ultima_carga` varchar(50) DEFAULT NULL,
  `ultima_carga_precio` varchar(50) DEFAULT NULL,
  `estado_bus` int(10) DEFAULT NULL,
  `num_clientes` int(10) DEFAULT NULL,
  `indices_clientes` varchar(20) DEFAULT NULL,
  `cargar_usuarios` tinyint(1) DEFAULT NULL,
  `cargar_factura` tinyint(1) DEFAULT NULL,
  `cargar_configuracion` tinyint(1) DEFAULT NULL,
  `ultima_cargar_usuarios` varchar(50) DEFAULT NULL,
  `ultima_cargar_factura` varchar(50) DEFAULT NULL,
  `ultima_cargar_configuracion` varchar(50) DEFAULT NULL,
  `carburacion` tinyint(1) DEFAULT NULL,
  `version` varchar(30) DEFAULT NULL,
  `equipamiento` varchar(10) DEFAULT NULL,
  `ultima_accion_ERP` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`idSyncRF_AutSearch`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `syncrf_autsearch` */

/*Table structure for table `syncrf_configuracion` */

DROP TABLE IF EXISTS `syncrf_configuracion`;

CREATE TABLE `syncrf_configuracion` (
  `idSyncRF_Configuracion` int(10) NOT NULL AUTO_INCREMENT,
  `Config` varchar(20) NOT NULL,
  `Valor` varchar(45) NOT NULL,
  PRIMARY KEY (`idSyncRF_Configuracion`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

/*Data for the table `syncrf_configuracion` */

insert  into `syncrf_configuracion`(`idSyncRF_Configuracion`,`Config`,`Valor`) values (1,'opt','3'),(2,'server_can','-1'),(3,'server_sysId','-1'),(4,'server_mac','-1'),(5,'server_baudrate','-1'),(6,'server_encrypt','-1');

/*Table structure for table `syncrf_eventos` */

DROP TABLE IF EXISTS `syncrf_eventos`;

CREATE TABLE `syncrf_eventos` (
  `id_evento` int(11) NOT NULL AUTO_INCREMENT,
  `id_evento_cat` int(11) NOT NULL,
  `id_dispositivo` int(11) NOT NULL,
  `fechahora` datetime NOT NULL,
  `descripcion` varchar(150) NOT NULL,
  `datos` varchar(150) NOT NULL,
  PRIMARY KEY (`id_evento`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `syncrf_eventos` */

/*Table structure for table `syncrf_movimiento` */

DROP TABLE IF EXISTS `syncrf_movimiento`;

CREATE TABLE `syncrf_movimiento` (
  `id_movimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_autotanque` int(11) NOT NULL,
  `no_autotanque` int(11) NOT NULL,
  `fechahora` datetime NOT NULL,
  `fechahoraServ` datetime DEFAULT NULL,
  `densidad` decimal(10,0) NOT NULL,
  `temperatura` varchar(5) NOT NULL,
  `totalRi` bigint(15) NOT NULL,
  `totalizador` bigint(15) NOT NULL,
  `odometro` int(11) NOT NULL,
  `gps` varchar(19) NOT NULL,
  `totalBand` tinyint(1) NOT NULL,
  `volumen` decimal(10,0) NOT NULL,
  `totalizadorF` decimal(10,0) NOT NULL,
  `totalizadorI` decimal(10,0) NOT NULL,
  `consecutivo` int(11) NOT NULL,
  `masa` decimal(10,0) NOT NULL,
  PRIMARY KEY (`id_movimiento`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `syncrf_movimiento` */

/*Table structure for table `syncrf_movimiento_carburacion` */

DROP TABLE IF EXISTS `syncrf_movimiento_carburacion`;

CREATE TABLE `syncrf_movimiento_carburacion` (
  `id_movimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_autotanque` int(11) NOT NULL,
  `no_autotanque` int(11) NOT NULL,
  `fechahora` datetime NOT NULL,
  `fechahoraServ` datetime DEFAULT NULL,
  `densidad` decimal(10,0) NOT NULL,
  `temperatura` varchar(5) NOT NULL,
  `totalRi` bigint(15) NOT NULL,
  `totalizador` bigint(15) NOT NULL,
  `odometro` int(11) NOT NULL,
  `gps` varchar(19) NOT NULL,
  `totalBand` tinyint(1) NOT NULL,
  `volumen` decimal(10,0) NOT NULL,
  `totalizadorF` decimal(10,0) NOT NULL,
  `totalizadorI` decimal(10,0) NOT NULL,
  `consecutivo` int(11) NOT NULL,
  `masa` decimal(10,0) NOT NULL,
  PRIMARY KEY (`id_movimiento`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `syncrf_movimiento_carburacion` */

/*Table structure for table `tabla` */

DROP TABLE IF EXISTS `tabla`;

CREATE TABLE `tabla` (
  `id_tabla` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  `campo_busq` varchar(20) DEFAULT NULL,
  `campo_msj` varchar(20) DEFAULT NULL,
  `msj` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_tabla`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

/*Data for the table `tabla` */

insert  into `tabla`(`id_tabla`,`nombre`,`campo_busq`,`campo_msj`,`msj`) values (1,'usuarios','id_usr','login','Usuario:'),(2,'autotanques','id_autotanque','no_autotanque','Autotanque:'),(3,'cliente','id_cliente','cuenta','Cliente:');

/*Table structure for table `tag` */

DROP TABLE IF EXISTS `tag`;

CREATE TABLE `tag` (
  `id_tag` int(11) NOT NULL AUTO_INCREMENT,
  `tag` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_tag`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `tag` */

insert  into `tag`(`id_tag`,`tag`) values (1,'');

/*Table structure for table `tag_asignado` */

DROP TABLE IF EXISTS `tag_asignado`;

CREATE TABLE `tag_asignado` (
  `id_tag_asignado` int(11) NOT NULL AUTO_INCREMENT,
  `id_tag` int(11) DEFAULT NULL,
  `id_asignado` int(11) DEFAULT NULL,
  `id_tabla` int(11) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `asignado` int(1) DEFAULT NULL,
  PRIMARY KEY (`id_tag_asignado`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `tag_asignado` */

/*Table structure for table `try_log` */

DROP TABLE IF EXISTS `try_log`;

CREATE TABLE `try_log` (
  `id_logoperacion` int(11) NOT NULL AUTO_INCREMENT,
  `id_terminal` int(11) DEFAULT NULL,
  `fecha_hora` datetime NOT NULL,
  `accion` varchar(100) NOT NULL,
  PRIMARY KEY (`id_logoperacion`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `try_log` */

/*Table structure for table `try_servicio` */

DROP TABLE IF EXISTS `try_servicio`;

CREATE TABLE `try_servicio` (
  `id_servicio` int(10) NOT NULL AUTO_INCREMENT,
  `servicio` int(11) NOT NULL,
  `id_terminal` int(11) NOT NULL,
  `fecha_hora` datetime DEFAULT NULL,
  `id_tipocilindro` int(11) NOT NULL,
  `peso_inicial` double NOT NULL,
  `peso_programado` double NOT NULL,
  `peso_manguera` double NOT NULL,
  `peso_total` double NOT NULL,
  `peso_final` double NOT NULL,
  `kilos_aplicados` double NOT NULL,
  `error` varchar(100) NOT NULL,
  `orden` int(11) NOT NULL,
  `tiempo` time NOT NULL,
  `factora` varchar(4) NOT NULL,
  `factorc` varchar(5) NOT NULL,
  PRIMARY KEY (`id_servicio`,`id_terminal`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Data for the table `try_servicio` */

/*Table structure for table `try_tipocilindro` */

DROP TABLE IF EXISTS `try_tipocilindro`;

CREATE TABLE `try_tipocilindro` (
  `id_tipocilindro` int(11) NOT NULL AUTO_INCREMENT,
  `id_clasificacion` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `pi_maximo` double NOT NULL,
  `pi_minimo` double NOT NULL,
  `pp_maximo` double NOT NULL,
  `pp_minimo` double NOT NULL,
  `ka_minimo` double NOT NULL,
  `ka_maximo` double NOT NULL,
  `aplicacion` int(11) NOT NULL,
  `pf` double NOT NULL,
  `rango_ley` double NOT NULL,
  `tara` double NOT NULL,
  `desviacion_izq_tara` double NOT NULL,
  `desviacion_der_tara` double NOT NULL,
  PRIMARY KEY (`id_tipocilindro`)
) ENGINE=MyISAM AUTO_INCREMENT=49 DEFAULT CHARSET=latin1;

/*Data for the table `try_tipocilindro` */

insert  into `try_tipocilindro`(`id_tipocilindro`,`id_clasificacion`,`nombre`,`pi_maximo`,`pi_minimo`,`pp_maximo`,`pp_minimo`,`ka_minimo`,`ka_maximo`,`aplicacion`,`pf`,`rango_ley`,`tara`,`desviacion_izq_tara`,`desviacion_der_tara`) values (1,1,'50kg',0,0,99.9,89.1,0,0,0,0,0,0,0,0),(2,2,'45kg',0,0,89,73,0,0,0,0,0,0,0,0),(3,3,'30kg',0,0,72.9,45.1,0,0,0,0,0,0,0,0),(4,4,'20kg',0,0,45,30.1,0,0,0,0,0,0,0,0),(5,5,'15kg',0,0,30,24.6,0,0,0,0,0,0,0,0),(6,6,'10kg',0,0,24.5,16.4,0,0,0,0,0,0,0,0),(7,7,'6kg',0,0,16.3,13.6,0,0,0,0,0,0,0,0),(8,8,'5kg',0,0,13.5,11.6,0,0,0,0,0,0,0,0),(9,9,'4kg',0,0,11.5,8.6,0,0,0,0,0,0,0,0),(10,10,'2kg',0,0,8.5,0,0,0,0,0,0,0,0,0),(11,1,'50kg',0,0,0,0,0,0,0,0,0,0,0,0),(12,1,'50Kg Fracaso',0,0,0,0,0,0,1,0,0,0,0,0),(13,1,'50kg Relleno',0,0,0,0,0,0,-1,0,0,0,0,0),(15,2,'45kg',39.59,36.27,86.29,78.67,39.93,49.09,0,82.44,0.01,37.93,0.01,0.01),(16,2,'45kg Fracasos',39.59,36.27,86.29,78.67,0,49.09,-1,82.44,0.01,37.93,0.01,0.01),(17,2,'45kg Relleno',86.29,39.6,86.29,78.67,0.01,49.09,1,82.44,0.01,37.93,0.01,0.01),(19,3,'30kg',33.63,22.29,56.75,56.5,22.18,35.48,0,56.6,0.01,26.6,0.05,0.05),(20,3,'30kg Fracaso',33.63,22.29,56.75,56.5,0,35.48,-1,56.6,0.01,26.6,0.05,0.05),(21,3,'30kg Relleno',56.75,34,56.75,56.5,0.01,35.48,1,56.6,0.01,26.6,0.05,0.05),(22,3,'30kg micro',27.27,20.98,54.97,52.58,22.33,36.37,0,53.3,0.01,23.3,0.05,0.05),(23,3,'30kg micro fracaso',27.27,20.98,54.97,52.58,0,36.37,-1,53.3,0.01,23.3,0.05,0.05),(24,3,'30kg micro Relleno',54.57,28,54.97,52.58,0.01,36.37,1,53.3,0.01,23.3,0.05,0.05),(26,4,'20kg',24.63,16.87,41.89,39.09,14.56,24.06,0,40.06,0.01,20.75,0.01,0.01),(27,4,'20kg Fracaso',24.63,16.87,41.89,39.09,0,24.06,-1,40.06,0.01,20.75,0.01,0.01),(28,4,'20kg Rellenos',41.89,24.7,41.89,39.09,0.01,24.06,1,40.06,0.01,20.75,0.01,0.01),(30,5,'15kg',23.17,9.68,28.61,23.41,1.66,17.3,0,25.9,0.01,16.42,0.01,0.01),(31,5,'15kg Fracaso',23.17,9.68,28.61,23.41,0,17.3,-1,25.9,0.01,16.42,0.01,0.01),(32,5,'15kg Relleno',28.61,23.18,28.61,23.41,0.01,17.3,1,25.9,0.01,16.42,0.01,0.01),(34,6,'10kg',17.12,7.02,23.62,17.7,2.2,13.8,0,20.07,0.01,12.07,0.01,0.01),(35,6,'10kg Fracaso',17.12,7.02,23.62,17.7,0,13.8,-1,20.07,0.01,12.07,0.01,0.01),(36,6,'10kg Relleno',23.62,17.13,23.62,17.7,0.01,13.8,1,20.07,0.01,12.07,0.01,0.01),(37,7,'6kg',14.8,6.36,18.65,15.08,0.41,10.65,0,16.11,0.01,10.58,0.01,0.01),(38,7,'6kg Fracaso',14.8,6.36,18.65,15.08,0,10.65,-1,16.11,0.01,10.58,0.01,0.01),(39,7,'6kg Relleno',18.65,14.9,18.65,15.08,0.01,10.65,1,16.11,0.01,10.58,0.01,0.01),(40,8,'5kg',12,5.4,16.16,12,1.2,8.69,0,14.25,0.01,9.3,0.01,0.01),(41,8,'5kg Fracaso',12,5.4,16.16,12,0,8.69,-1,14.25,0.01,9.3,0.01,0.01),(42,8,'5kg Relleno',16.16,12.1,16.16,12,0.01,8.69,1,14.25,0.01,9.3,0.01,0.01),(43,9,'4kg',8.3,4,11.9,8.1,0.59,5.9,0,9.51,0.01,6.26,0.01,0.01),(44,9,'4kg Fracaso',8.3,4,11.9,8.1,0,5.9,-1,9.51,0.01,6.26,0.01,0.01),(45,9,'4kg Relleno',11,8.4,11.9,8.1,0.01,5.9,1,9.51,0.01,6.26,0.01,0.01),(46,10,'2kg',5.22,0,8.32,2.54,0,6,0,7.79,0.01,4.89,0.01,0.01),(47,10,'2kg Fracaso',5.22,0,8.32,2.54,0,6,-1,7.79,0.01,4.89,0.01,0.01),(48,10,'2kg Relleno',8.32,5.3,8.32,2.54,0.01,6,1,7.79,0.01,4.89,0.01,0.01);

/*Table structure for table `usuarios` */

DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE `usuarios` (
  `id_usr` int(11) NOT NULL AUTO_INCREMENT,
  `id_perfil` int(11) DEFAULT NULL,
  `login` varchar(16) NOT NULL,
  `password` blob NOT NULL,
  `nombre` varchar(32) NOT NULL,
  `apellidos` varchar(32) NOT NULL,
  `activo` int(1) DEFAULT NULL,
  PRIMARY KEY (`id_usr`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Data for the table `usuarios` */

insert  into `usuarios`(`id_usr`,`id_perfil`,`login`,`password`,`nombre`,`apellidos`,`activo`) values (1,1,'Administrador','ÚGs1Å¯ÈB±†wOÛ/','Administrador','Administrador',1);

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
