-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-12-2022 a las 23:34:57
-- Versión del servidor: 10.4.25-MariaDB
-- Versión de PHP: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `ucm_cau`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ucm_aw_cau_avi_avisos`
--

CREATE TABLE `ucm_aw_cau_avi_avisos` (
  `idAviso` int(11) NOT NULL,
  `tipoAviso` int(11) NOT NULL,
  `observaciones` varchar(1000) NOT NULL,
  `fecha` varchar(20) NOT NULL DEFAULT current_timestamp(),
  `hora` varchar(10) NOT NULL,
  `idUser` int(11) NOT NULL,
  `categoriaAviso` varchar(50) NOT NULL,
  `idTecnicoAsignado` int(11) DEFAULT NULL,
  `comentariosTecnico` varchar(1000) NOT NULL,
  `resuelto` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `ucm_aw_cau_avi_avisos`
--

INSERT INTO `ucm_aw_cau_avi_avisos` (`idAviso`, `tipoAviso`, `observaciones`, `fecha`, `hora`, `idUser`, `categoriaAviso`, `idTecnicoAsignado`, `comentariosTecnico`, `resuelto`) VALUES
(40, 0, 'Esto es una sugerencia de certificado digital', '14-12-2022', '23:23', 13, 'Certificado digital de persona física', 15, '', 0),
(41, 1, 'No consigo que el blackboard collaborate me funciones. ', '14-12-2022', '23:28', 13, 'Blackboard Collaborate', 15, '', 0),
(42, 2, 'Gracias a todos por formar parte de esta comunidad', '14-12-2022', '23:29', 13, 'Toda la Universidad', NULL, '', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ucm_aw_cau_usu_usuarios`
--

CREATE TABLE `ucm_aw_cau_usu_usuarios` (
  `idUser` int(11) NOT NULL,
  `correo` varchar(30) NOT NULL,
  `password` varchar(16) NOT NULL,
  `nombre` varchar(25) NOT NULL,
  `imagen` varchar(1000) NOT NULL DEFAULT './public/img/fotoDefecto.png',
  `perfil_universitario` int(11) NOT NULL,
  `esTecnico` tinyint(1) NOT NULL,
  `numEmp` varchar(8) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL,
  `fecha` varchar(50) NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `ucm_aw_cau_usu_usuarios`
--

INSERT INTO `ucm_aw_cau_usu_usuarios` (`idUser`, `correo`, `password`, `nombre`, `imagen`, `perfil_universitario`, `esTecnico`, `numEmp`, `activo`, `fecha`) VALUES
(13, 'usu@ucm.es', 'Hola1234?', 'FedeProfe', '16102021-_DSC2453.jpg', 2, 0, NULL, 1, '2022-12-14 22:31:20'),
(14, 'tec@ucm.es', 'Hola1234?', 'CrisTecnico', 'fotoDefecto.png', 1, 1, '1234-abc', 0, '2022-12-14 22:48:32'),
(15, 'tec2@ucm.es', 'Hola1234?', 'RichTecnico', '16102021-_DSC2462.jpg', 1, 1, '1234-bcd', 1, '2022-12-14 22:49:54'),
(16, 'tec3@ucm.es', 'Hola1234?', 'Jose Tecnico', 'fotoDefecto.png', 1, 1, '1234-efg', 1, '2022-12-14 22:51:37');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indices de la tabla `ucm_aw_cau_avi_avisos`
--
ALTER TABLE `ucm_aw_cau_avi_avisos`
  ADD PRIMARY KEY (`idAviso`),
  ADD KEY `idUser` (`idUser`);

--
-- Indices de la tabla `ucm_aw_cau_usu_usuarios`
--
ALTER TABLE `ucm_aw_cau_usu_usuarios`
  ADD PRIMARY KEY (`idUser`),
  ADD UNIQUE KEY `esTec` (`numEmp`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `ucm_aw_cau_avi_avisos`
--
ALTER TABLE `ucm_aw_cau_avi_avisos`
  MODIFY `idAviso` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT de la tabla `ucm_aw_cau_usu_usuarios`
--
ALTER TABLE `ucm_aw_cau_usu_usuarios`
  MODIFY `idUser` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `ucm_aw_cau_avi_avisos`
--
ALTER TABLE `ucm_aw_cau_avi_avisos`
  ADD CONSTRAINT `ucm_aw_cau_avi_avisos_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `ucm_aw_cau_usu_usuarios` (`idUser`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
