--
-- PostgreSQL database dump
--

\restrict PhBigBa1Z8JgrmNQwPYmwGdFNKosClRWFf9XwskBrmuOLYCGZyste3NYYquK38A

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievements (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255) NOT NULL,
    icon character varying(10) NOT NULL,
    color character varying(20) NOT NULL,
    requirement_type character varying(50) NOT NULL,
    requirement_value character varying(100) NOT NULL
);


--
-- Name: aves; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aves (
    id_ave integer NOT NULL,
    nombre_comun character varying(100) NOT NULL,
    nombre_cientifico character varying(100) NOT NULL,
    familia character varying(100),
    estado_conservacion character varying(50)
);


--
-- Name: aves_id_ave_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.aves_id_ave_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: aves_id_ave_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.aves_id_ave_seq OWNED BY public.aves.id_ave;


--
-- Name: avistamientos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.avistamientos (
    id_avistamiento integer NOT NULL,
    id_usuario integer,
    id_ave integer,
    id_ubicacion integer,
    notas text,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estado_moderacion character varying(50) DEFAULT 'Pendiente'::character varying
);


--
-- Name: avistamientos_id_avistamiento_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.avistamientos_id_avistamiento_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: avistamientos_id_avistamiento_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.avistamientos_id_avistamiento_seq OWNED BY public.avistamientos.id_avistamiento;


--
-- Name: sightings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sightings (
    id integer NOT NULL,
    user_id integer,
    user_name character varying(100),
    bird_name character varying(100) NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    location_name character varying(255),
    description text,
    image_url character varying(500),
    status character varying(20) DEFAULT 'pending'::character varying,
    sighted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ai_source character varying(30) DEFAULT NULL::character varying,
    ai_confidence numeric(5,2) DEFAULT NULL::numeric,
    ai_raw_label character varying(150) DEFAULT NULL::character varying,
    ai_status character varying(20) DEFAULT 'skipped'::character varying
);


--
-- Name: sightings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.sightings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sightings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.sightings_id_seq OWNED BY public.sightings.id;


--
-- Name: ubicaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ubicaciones (
    id_ubicacion integer NOT NULL,
    nombre_sitio character varying(150) NOT NULL,
    latitud numeric(10,6) NOT NULL,
    longitud numeric(10,6) NOT NULL,
    municipio character varying(100)
);


--
-- Name: ubicaciones_id_ubicacion_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ubicaciones_id_ubicacion_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ubicaciones_id_ubicacion_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ubicaciones_id_ubicacion_seq OWNED BY public.ubicaciones.id_ubicacion;


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    id integer NOT NULL,
    user_id integer,
    achievement_id character varying(50),
    unlocked_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: user_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_achievements_id_seq OWNED BY public.user_achievements.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    profile_image character varying(500),
    last_name character varying(100),
    cedula character varying(20)
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id_usuario integer NOT NULL,
    nombre character varying(100) NOT NULL,
    correo character varying(100) NOT NULL,
    contrasena_hash character varying(255) NOT NULL,
    rol character varying(50) DEFAULT 'Registrado'::character varying
);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_usuario_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_usuario_seq OWNED BY public.usuarios.id_usuario;


--
-- Name: aves id_ave; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aves ALTER COLUMN id_ave SET DEFAULT nextval('public.aves_id_ave_seq'::regclass);


--
-- Name: avistamientos id_avistamiento; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avistamientos ALTER COLUMN id_avistamiento SET DEFAULT nextval('public.avistamientos_id_avistamiento_seq'::regclass);


--
-- Name: sightings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sightings ALTER COLUMN id SET DEFAULT nextval('public.sightings_id_seq'::regclass);


--
-- Name: ubicaciones id_ubicacion; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ubicaciones ALTER COLUMN id_ubicacion SET DEFAULT nextval('public.ubicaciones_id_ubicacion_seq'::regclass);


--
-- Name: user_achievements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements ALTER COLUMN id SET DEFAULT nextval('public.user_achievements_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: usuarios id_usuario; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id_usuario SET DEFAULT nextval('public.usuarios_id_usuario_seq'::regclass);


--
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.achievements (id, name, description, icon, color, requirement_type, requirement_value) FROM stdin;
first_sighting	Observador Novato	Realizó su primer avistamiento aprobado.	🔭	#3b82f6	total_count	1
five_sightings	Descubridor de Especies	Contribuyó con 5 avistamientos aprobados.	🌿	#10b981	total_count	5
ten_sightings	Fotógrafo Experto	Un experto con 10 o más avistamientos.	📷	#f59e0b	total_count	10
cotorra_protector	Protector de la Cotorra	Reportó y ayudó a documentar la Cotorra Margariteña en peligro.	🦜	#ec4899	bird_name	Cotorra Margariteña
mangrove_fan	Explorador de Manglares	Registró aves en ecosistemas de manglar.	🌳	#06b6d4	type	Manglares
migradora_tracker	Rastreador de Migradoras	Registró aves migratorias de paso por la isla.	✈️	#8b5cf6	type	Migratoria
restinga_sentinel	Guardián de La Restinga	Registró avistamientos en el P.N. Laguna de La Restinga.	🚣	#0284c7	type	Laguna de La Restinga
copey_climber	Conquistador del Copey	Exploró y documentó especies en la selva nublada de Cerro El Copey.	⛰️	#15803d	type	Cerro El Copey
macanao_ranger	Ránger de Macanao	Recorrió el ecosistema xerófilo de la Península de Macanao.	🌵	#d97706	type	Península de Macanao
flamenco_watcher	Almirante del Flamenco	Fotografió y registró un Flamenco del Caribe en las salinas.	🦩	#f43f5e	bird_name	Flamenco
ibis_collector	Coleccionista de Corocoras	Documentó la deslumbrante Corocora Roja en humedales.	🪶	#e11d48	bird_name	Corocora
pelican_patrol	Patrullero de Pelícanos	Observó al Pelícano Pardo pescando en las costas margariteñas.	🌊	#0ea5e9	bird_name	Pelícano
cardenal_seeker	Buscador del Cardenalito	Visualizó al Cardenal Coriano en los espinares.	🔴	#dc2626	bird_name	Cardenal
turpial_master	Maestro del Turpial	Registró al Ave Nacional Turpial en su hábitat natural.	🎶	#eab308	bird_name	Turpial
osprey_guardian	Ojo de Águila Pescadora	Documentó un ave rapaz cazando en aguas salobres.	🦅	#78350f	bird_name	Águila Pescadora
colibri_whisperer	Susurrador de Colibríes	Fotografió al fugaz Colibrí Anteado o Esmeralda.	🌸	#a855f7	bird_name	Colibrí
guacharaca_sound	Eco de la Guacharaca	Registró el emblemático canto de la Guacharaca culirroja.	📢	#b45309	bird_name	Guacharaca
twenty_five_sightings	Naturalista Consagrado	Alcanzó los 25 avistamientos aprobados en la plataforma.	🎖️	#6366f1	total_count	25
fifty_sightings	Leyenda Ornitho-NE	Alcanzó la impresionante cifra de 50 avistamientos registrados.	👑	#eab308	total_count	50
night_owl	Vigía Nocturno	Documentó una lechuza o ave de hábitos crepusculares.	🦉	#475569	bird_name	Lechuza
coastal_wader	Caminante de Salinas	Registró aves playeras y garzas en la franja intermareal.	🏝️	#06b6d4	type	Costeras
interior_explorer	Explorador del Bosque Húmedo	Documentó aves de interior y montaña.	🌲	#166534	type	De Interior
photo_master	Maestro de la Fotografía	Subió 15 avistamientos con fotografías nítidas y detalladas.	📸	#f97316	total_count	15
chick_protector	Guardián del Nido	Reportó avistamientos con información sobre reproducción y crías.	🪹	#84cc16	type	Nidificación
pico_tijera	Señor de las Olas	Registró al singular Pico de Tijera rasgando el agua.	✂️	#0f766e	bird_name	Pico de Tijera
zamuro_cleaner	Limpiador Ecológico	Documentó el rol vital del Zamuro en el ecosistema.	🖤	#334155	bird_name	Zamuro
parakeet_chatter	Simpatía del Perico	Registró un grupo de Pericos Cara Sucia o Ñángaros.	🦜	#10b981	bird_name	Perico
gaviota_breeze	Brisa del Golfo	Identificó Gaviotas Guanaguanare o Charranes en vuelo.	🕊️	#38bdf8	bird_name	Gaviota
community_hero	Héroe de la Biodiversidad	Realizó reportes constantes validados por la comunidad.	🌟	#f59e0b	total_count	30
master_orotologia	Gran Ornitólogo de NE	El máximo galardón para los mayores defensores de la avifauna.	🏆	#eab308	total_count	40
\.


--
-- Data for Name: aves; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.aves (id_ave, nombre_comun, nombre_cientifico, familia, estado_conservacion) FROM stdin;
1	Cotorra Cabeciamarilla	Amazona barbadensis	Psittacidae	Vulnerable
2	Gonzalito Margariteño	Icterus nigrogularis helioeides	Icteridae	Preocupación Menor
3	Flamenco del Caribe	Phoenicopterus ruber	Phoenicopteridae	Preocupación Menor
4	Gavilán Habado	Rupornis magnirostris	Accipitridae	Comunes
5	Soldadito	Himantopus mexicanus	Recurvirostridae	Comunes
7	Colibri Anteado	Leucippus fallax	Trochilidae	Preocupación Menor
9	Espatula Rosada	Platalea ajaja	Threskiornithidae	Comunes
10	Pelícano Pardo	Pelecanus occidentalis	Pelecanidae	Comunes
11	Garceta Nívea	Egretta thula	Ardeidae	Comunes
12	Águila Pescadora	Pandion haliaetus	Pandionidae	Comunes
13	Cuclillo Canela	Coccyzus melacoryphus	Cuculidae	Preocupación Menor
14	Zarapito Trinador	Numenius hudsonicus	Scolopacidae	Comunes
15	Agujeta Gris	Limnodromus griseus	Scolopacidae	Comunes
16	Charrán Común-Gaviotin	Sterna hirundo	Laridae	Comunes
17	Gaviota Guanaguanare	Leucophaeus atricilla	Laridae	Comunes
18	Rascón de Manglar-Cotara	Rallus longirostris	Rallidae	Comunes
19	Charrán Patinegro	Thalasseus sandvicensis	Laridae	Comunes
20	Caracara Carancho	Caracara plancus	Falconidae	Comunes
21	Esmeralda Coliazul	Chlorostilbon mellisugus	Trochilidae	Preocupación Menor
22	Garceta Tricolor	Egretta tricolor	Ardeidae	Preocupación Menor
23	Tijereta Sabanera	Tyrannus savana	Tyrannidae	Preocupación Menor
24	Paloma Bravía	Columba livia	Columbidae	Preocupación Menor
25	Zamuro	Coragyps atratus	Cathartidae	Preocupación Menor
26	Cormorán Biguá	Nannopterum brasilianum	Phalacrocoracidae	Preocupación Menor
27	Tangara Azuleja	Thraupis episcopus	Thraupidae	Preocupación Menor
28	Carpintero Coronirrojo	Melanerpes rubricapillus	Picidae	Preocupación Menor
29	Diamante Cebra	Taeniopygia guttata	Estrildidae	Introducida
30	Pato Negro	Cairina moschata	Anatidae	Preocupación Menor
31	Semillero Pechirrufo	Sporophila minuta	Thraupidae	Preocupación Menor
32	Bienteveo Rayado	Myiodynastes maculatus	Tyrannidae	Preocupación Menor
33	Garrapatero Asurcado	Crotophaga sulcirostris	Cuculidae	Preocupación Menor
34	Porrón Acollarado	Aythya collaris	Anatidae	Preocupación Menor (Migratorio)
35	Varillero Capuchino	Chrysomus icterocephalus	Icteridae	Preocupación Menor
36	Paloma Isleña	Patagioenas squamosa	Columbidae	Preocupación Menor
37	Aguja Canela	Limosa fedoa	Scolopacidae	Preocupación Menor (Migratorio)
38	Añapero Ñacundá	Chordeiles nacunda	Caprimulgidae	Preocupación Menor
39	Reinita Amarilla	Setophaga aestiva	Parulidae	Preocupación Menor
40	Cardenilla Enmascarada	Paroaria nigrogenis	Thraupidae	Preocupación Menor
41	Paloma Colorada	Patagioenas cayennensis	Columbidae	Preocupación Menor
42	Martinete Coronado	Nyctanassa violacea	Ardeidae	Preocupación Menor
\.


--
-- Data for Name: avistamientos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.avistamientos (id_avistamiento, id_usuario, id_ave, id_ubicacion, notas, fecha, estado_moderacion) FROM stdin;
1	2	1	1	Observado grupo de 5 cotorras alimentándose de frutos de cardón.	2026-06-01 08:30:00	Aprobado
2	2	2	3	Un macho cantando cerca del sendero principal.	2026-06-02 10:15:00	Aprobado
3	2	3	2	Avistamiento de una pequeña colonia alimentándose en la laguna.	2026-06-03 17:00:00	Aprobado
\.


--
-- Data for Name: sightings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sightings (id, user_id, user_name, bird_name, latitude, longitude, location_name, description, image_url, status, sighted_at, created_at, ai_source, ai_confidence, ai_raw_label, ai_status) FROM stdin;
1	3	ray	Águila Pescadora	11.07367	-63.940301	La firestone	locura 	/uploads/bird-1782882124022-784309332.jfif	approved	2026-07-01 01:02:04.225976	2026-07-01 01:02:04.225976	\N	\N	\N	failed
2	4	frai	Reinita Amarilla	11.063765	-63.935194	La vecindad	muy bonita	/uploads/bird-1782888459190-403389366.png	approved	2026-07-01 02:47:39.30134	2026-07-01 02:47:39.30134	\N	\N	\N	failed
3	3	ray	Guacamaya	11.072185	-63.914938	santa ana 	estaba esperando esa foto	/uploads/bird-1782968083087-816420625.jfif	approved	2026-07-02 00:54:43.263656	2026-07-02 00:54:43.263656	\N	\N	\N	failed
4	3	ray	Pelícano Pardo	10.957579	-64.309502	manglillo	descansando jajaja	/uploads/bird-1782970952829-111558358.jfif	approved	2026-07-02 01:42:32.956674	2026-07-02 01:42:32.956674	\N	\N	\N	failed
5	3	ray	Flamenco del Caribe	11.09271	-63.963304	juan griego	vean esto amigos	/uploads/bird-1782972274542-833457450.jfif	approved	2026-07-02 02:04:34.551532	2026-07-02 02:04:34.551532	\N	\N	\N	failed
6	4	frai	Flamenco del Caribe	10.973993	-64.400654	tan lejos de su habitat	en la playita	/uploads/bird-1782975297483-713789269.jfif	approved	2026-07-02 02:54:57.502457	2026-07-02 02:54:57.502457	\N	\N	\N	failed
\.


--
-- Data for Name: ubicaciones; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ubicaciones (id_ubicacion, nombre_sitio, latitud, longitud, municipio) FROM stdin;
1	Península de Macanao	11.025000	-64.300000	Península de Macanao
2	Laguna de la Restinga	10.983333	-64.166667	Tubores
3	Cerro El Copey	10.999167	-63.901389	Arismendi
\.


--
-- Data for Name: user_achievements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_achievements (id, user_id, achievement_id, unlocked_at) FROM stdin;
1	3	first_sighting	2026-07-02 01:43:23.762098
2	3	mangrove_fan	2026-07-02 01:43:23.77237
3	3	migradora_tracker	2026-07-02 01:43:23.773803
4	4	first_sighting	2026-07-02 02:55:29.312211
5	4	mangrove_fan	2026-07-02 02:55:29.318326
6	4	migradora_tracker	2026-07-02 02:55:29.321813
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password_hash, role, created_at, profile_image, last_name, cedula) FROM stdin;
1	Administrador	admin@avistarne.com	$2b$10$.Kurzu9/nmJESRBpkL.gyudhzM2uHaUWtebtpj1r/bwLXNyqlDgpu	admin	2026-06-25 00:40:39.906871	\N	\N	\N
2	Test User	testuser@example.com	$2b$10$d9n8uWrUNhhvIvsRgL94p.AUYtBYJFSYjt.xPqFS2l8M7FcYYz4s.	user	2026-06-25 00:43:32.45253	\N	Test	V-12345678
3	ray	ray@gmail.com	$2b$10$d8KjoHto6boViGaOhzJbmuUsgYnoJ4j.F1TiGe8CDo0PJMNHuLGZK	user	2026-06-30 19:02:07.739987	\N	last	14548562
4	frai	frai@gmail.com	$2b$10$Peepu21l1zrfUlw1z7kbN.e7uci4jlgIZtZBvdhXpmpIXHH87hjJG	user	2026-07-01 01:22:11.709831	\N	delpino	28492542
5	Test User	testuser123@example.com	$2b$10$PclIOufB.E92GksP/te27.8kg2Ag3n0UtV1CuDLwcE9BQggeWtJJG	user	2026-07-02 01:18:04.730714	\N	\N	\N
6	Test	testuser_999@example.com	$2b$10$Sk6M8QRB/H/Zza.NEzdbM.AVkviPpxi0QkMzyaBa7foohBMC/3uD.	user	2026-07-02 01:59:18.12614	\N	User	V-99999999
7	Test	testuser1122@gmail.com	$2b$10$3v1XLwr0ENFx/xdnnx1/OOVClgJCujvOvP/zSeynlDhRb2SIKfpO.	user	2026-07-02 02:21:17.51043	\N	User	V-11223344
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id_usuario, nombre, correo, contrasena_hash, rol) FROM stdin;
1	Administrador Avistar	admin@avistar.ne	pbkdf2:sha256:260000$adminhash$123456	Admin
2	Biólogo de Campo	biologo@avistar.ne	pbkdf2:sha256:260000$biologohash$123456	Registrado
\.


--
-- Name: aves_id_ave_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.aves_id_ave_seq', 48, true);


--
-- Name: avistamientos_id_avistamiento_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.avistamientos_id_avistamiento_seq', 1, true);


--
-- Name: sightings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sightings_id_seq', 6, true);


--
-- Name: ubicaciones_id_ubicacion_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ubicaciones_id_ubicacion_seq', 1, false);


--
-- Name: user_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_achievements_id_seq', 6, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: usuarios_id_usuario_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_usuario_seq', 1, false);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: aves aves_nombre_cientifico_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aves
    ADD CONSTRAINT aves_nombre_cientifico_key UNIQUE (nombre_cientifico);


--
-- Name: aves aves_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aves
    ADD CONSTRAINT aves_pkey PRIMARY KEY (id_ave);


--
-- Name: avistamientos avistamientos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avistamientos
    ADD CONSTRAINT avistamientos_pkey PRIMARY KEY (id_avistamiento);


--
-- Name: sightings sightings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sightings
    ADD CONSTRAINT sightings_pkey PRIMARY KEY (id);


--
-- Name: ubicaciones ubicaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ubicaciones
    ADD CONSTRAINT ubicaciones_pkey PRIMARY KEY (id_ubicacion);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_user_id_achievement_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id);


--
-- Name: users users_cedula_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_cedula_key UNIQUE (cedula);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id_usuario);


--
-- Name: idx_sightings_ai_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sightings_ai_source ON public.sightings USING btree (ai_source);


--
-- Name: idx_sightings_ai_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sightings_ai_status ON public.sightings USING btree (ai_status);


--
-- Name: avistamientos avistamientos_id_ave_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avistamientos
    ADD CONSTRAINT avistamientos_id_ave_fkey FOREIGN KEY (id_ave) REFERENCES public.aves(id_ave) ON DELETE CASCADE;


--
-- Name: avistamientos avistamientos_id_ubicacion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avistamientos
    ADD CONSTRAINT avistamientos_id_ubicacion_fkey FOREIGN KEY (id_ubicacion) REFERENCES public.ubicaciones(id_ubicacion) ON DELETE CASCADE;


--
-- Name: avistamientos avistamientos_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.avistamientos
    ADD CONSTRAINT avistamientos_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE;


--
-- Name: sightings sightings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sightings
    ADD CONSTRAINT sightings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_achievements user_achievements_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict PhBigBa1Z8JgrmNQwPYmwGdFNKosClRWFf9XwskBrmuOLYCGZyste3NYYquK38A

