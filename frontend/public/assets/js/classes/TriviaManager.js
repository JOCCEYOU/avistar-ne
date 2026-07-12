export class TriviaManager {
    constructor() {
        this.questionsPool = [
            {
                question: "¿Cuál es la principal ave emblemática de la Península de Macanao que está amenazada por la pérdida de hábitat y la captura ilegal para mascotas?",
                options: [
                    "A) Cotorra Margariteña (Amazona barbadensis)",
                    "B) Guacharaca del Norte",
                    "C) Pelícanos Pardo (Alcatraz)"
                ],
                correct: 0,
                explanation: "La Cotorra Margariteña es el ave regional de Nueva Esparta en peligro crítico, protegida por programas de conservación en Macanao."
            },
            {
                question: "¿En qué Parque Nacional de Margarita se concentra la mayor población de Flamencos del Caribe y aves acuáticas filtradoras?",
                options: [
                    "A) Parque Nacional Cerro El Copey",
                    "B) Parque Nacional Laguna de La Restinga",
                    "C) Monumento Natural Las Tetas de Maria Guevara"
                ],
                correct: 1,
                explanation: "La Restinga es una albufera de manglares clave para la nidificación y alimentación de flamencos y garzas."
            },
            {
                question: "¿Cuál de las siguientes aves es famosa por su canto melodioso y vivos colores amarillo y negro?",
                options: [
                    "A) Zamuro",
                    "B) Turpial Venezolano (Icterus icterus)",
                    "C) Guanaguanare (Gaviota)"
                ],
                correct: 1,
                explanation: "El Turpial es el Ave Nacional de Venezuela y habita frecuentemente en bosques secos y jardines margariteños."
            },
            {
                question: "¿Qué tipo de dieta principal tiene el Pelícano Pardo (Alcatraz) en las costas insulares?",
                options: [
                    "A) Granívora (semillas)",
                    "B) Piscívora (peces pequeños mediante picadas en picada)",
                    "C) Insectívora"
                ],
                correct: 1,
                explanation: "Los pelícanos cazan lanzándose en picada espectacular desde el aire para atrapar peces de superficie."
            },
            {
                question: "¿Cuál es la función principal del ave Zamuro (Coragyps atratus) en el ecosistema insular?",
                options: [
                    "A) Polinizar flores de cactos",
                    "B) Limpiador ecológico o carroñero que elimina restos orgánicos",
                    "C) Dispersar semillas de mangles"
                ],
                correct: 1,
                explanation: "Los zamuros cumplen un rol sanitario vital previniendo focos de infección al consumir materia en descomposición."
            },
            {
                question: "¿Qué ave marina es conocida por robar el alimento a otras aves en pleno vuelo sobre el mar de Margarita?",
                options: [
                    "A) Tijereta de Mar o Fragata (Fregata magnificens)",
                    "B) Azulejo",
                    "C) Chirito"
                ],
                correct: 0,
                explanation: "La Fragata practica el cleptoparasitismo, persiguiendo a gaviotas y págalos para quitarles su presa."
            },
            {
                question: "¿Qué ave pequeña y muy territorial posee un plumaje azul brillante deslumbrante en senderos del Cerro El Copey?",
                options: [
                    "A) Azulejo Jardintero (Thraupis episcopus)",
                    "B) Corocora Roja",
                    "C) Caricare"
                ],
                correct: 0,
                explanation: "El Azulejo es muy popular en jardines y zonas montañosas por su llamativo tono celeste y gris azulado."
            },
            {
                question: "¿En qué lugar de Margarita habita la Cotorra Margariteña en la Quebrada de La Chica?",
                options: [
                    "A) Península de Macanao",
                    "B) Pampatar",
                    "C) Porlamar Centro"
                ],
                correct: 0,
                explanation: "La Quebrada de La Chica en Macanao es el principal santuario de reproducción de la cotorra."
            },
            {
                question: "¿Qué característica identifica a la Corocora Roja (Eudocimus ruber)?",
                options: [
                    "A) Intenso color rojo escarlata gracias a los carotenoides de los crustáceos que come",
                    "B) Copete amarillo brillante",
                    "C) Cola de tijera larga"
                ],
                correct: 0,
                explanation: "Su pigmentación proviene del consumo de camarones y cangrejos ricos en carotenoides."
            },
            {
                question: "¿Cuál de las siguientes aves es una rapaz nocturna observada en Margarita?",
                options: [
                    "A) Lechuza de los Campanarios (Tyto alba)",
                    "B) Colibrí Coliazul",
                    "C) Flamenco"
                ],
                correct: 0,
                explanation: "Las Lechuzas son cazadoras nocturnas fundamentales para el control biológico de roedores."
            },
            {
                question: "¿Qué zambullidor acuático es conocido en Margarita popularmente como 'Buzo'?",
                options: [
                    "A) Pato Aguja / Pato Buzo (Podilymbus podiceps)",
                    "B) Gavilán Habado",
                    "C) Gonzalito"
                ],
                correct: 0,
                explanation: "El zambullidor se sumerge hábilmente bajo el agua dulce o salobre para cazar pececillos."
            },
            {
                question: "¿Cuál es la principal característica del pico de la Platalea rosada (Espátula Rosada)?",
                options: [
                    "A) Pico plano en forma de cuchara o espátula",
                    "B) Pico corto y curvo como perico",
                    "C) Pico aserrado de rapaz"
                ],
                correct: 0,
                explanation: "Usa su pico espatulado barriendo de lado a lado en el agua para capturar pequeños invertebrados."
            },
            {
                question: "¿Qué alimento NO se le debe dar nunca a un pájaro herido o rescatado?",
                options: [
                    "A) Leche de vaca o productos lácteos",
                    "B) Agua en gotas",
                    "C) Semillas específicas de su especie"
                ],
                correct: 0,
                explanation: "Las aves no digieren la lactosa y la leche les causa deshidratación grave y diarrea mortal."
            },
            {
                question: "¿Qué pequeña ave colibrí es famosa en Margarita por libar el néctar de las flores volando suspendida?",
                options: [
                    "A) Colibrí Coliazul (Chlorostilbon mellisugus)",
                    "B) Caricare",
                    "C) Zarapito"
                ],
                correct: 0,
                explanation: "Los colibríes baten sus alas hasta 80 veces por segundo consumiendo energía de néctar floral."
            },
            {
                question: "¿Qué organización lidera el programa de conservación de la Cotorra Margariteña junto a la comunidad local?",
                options: [
                    "A) Provita",
                    "B) NASA",
                    "C) Greenpeace Internacional"
                ],
                correct: 0,
                explanation: "Provita lleva décadas protegiendo los nidos de cotorra con Ecoguardias en la Península de Macanao."
            },
            {
                question: "¿Cuál es el hábitat predilecto de la Garza Real (Ardea alba)?",
                options: [
                    "A) Humedales, manglares, salinas y orillas de playas",
                    "B) Cumbres secas sin agua",
                    "C) Cuevas profundas"
                ],
                correct: 0,
                explanation: "La Garza Real busca zonas húmedas donde pesca peces, ranas y crustáceos."
            },
            {
                question: "¿Cómo se llama el ave conocida como 'Gonzalito' por su vívido color naranja y vientre amarillo?",
                options: [
                    "A) Icterus nigrogularis",
                    "B) Phoenicopterus ruber",
                    "C) Tyto alba"
                ],
                correct: 0,
                explanation: "El Gonzalito es un pariente del turpial con hermosas tonalidades amarillentas."
            },
            {
                question: "¿Qué ave playera realiza largas migraciones intercontinentales haciendo parada en las salinas de Pampatar?",
                options: [
                    "A) Playero Blanco (Calidris alba) y Zarapito",
                    "B) Guacamaya Roja",
                    "C) Carpintero"
                ],
                correct: 0,
                explanation: "Los playeros migran miles de kilómetros desde Norteamérica descansando en costas venezolanas."
            },
            {
                question: "¿Cuál de las siguientes aves es una rapaz diurna con pecho barrado observada en colinas secas de Margarita?",
                options: [
                    "A) Gavilán Habado (Buteo nitidus)",
                    "B) Flamenco",
                    "C) Cotorra"
                ],
                correct: 0,
                explanation: "El Gavilán Habado planea sobre valles buscando pequeñas lagartijas y roedores."
            },
            {
                question: "¿Por qué los manglares de La Restinga son esenciales para la biodiversidad insular?",
                options: [
                    "A) Sirven de guardería natural para peces y sitio de anidación para aves acuáticas",
                    "B) Porque no producen oxígeno",
                    "C) Porque no tienen agua"
                ],
                correct: 0,
                explanation: "Los raíces del mangle filtran agua, absorben carbono y protegen a las crías de peces y aves."
            },
            {
                question: "¿Qué fruta silvestre consume comúnmente la Cotorra Margariteña en Macanao?",
                options: [
                    "A) Frutos de cactos como el Yatu y el Pitiguey",
                    "B) Manzanas importadas",
                    "C) Pescado frito"
                ],
                correct: 0,
                explanation: "El pitiguey y las bayas de cactos xerófilos proveen hidratación y nutrientes vitales a la cotorra."
            },
            {
                question: "¿Cuál es el ave de presa inteligente conocida por caminar por el suelo buscando alimento en Margarita?",
                options: [
                    "A) Caracara Crestado / Caricare (Caracara cheriway)",
                    "B) Colibrí",
                    "C) Azulejo"
                ],
                correct: 0,
                explanation: "El Caricare es muy adaptativo y busca alimento tanto volando como caminando en matorrales."
            },
            {
                question: "¿Qué ave diminuta construye nidos colgantes tejiendo fibras vegetales finas?",
                options: [
                    "A) Gonzalito y Mochuelo",
                    "B) Pelícano",
                    "C) Zamuro"
                ],
                correct: 0,
                explanation: "Los turpiales y gonzalitos son maestros tejedores de nidos colgantes muy elaborados."
            },
            {
                question: "¿Cuál de estas aves habita principalmente la selva nublada del Cerro El Copey?",
                options: [
                    "A) Carpintero de Lomo Rojo (Melanerpes rubricapillus)",
                    "B) Flamenco del Caribe",
                    "C) Alcatraz"
                ],
                correct: 0,
                explanation: "Los carpinteros aprovechan la madera suave de los árboles de selva para taladrar refugios."
            },
            {
                question: "¿Qué amenaza principal enfrentan las garzas en zonas turísticas sin regulación?",
                options: [
                    "A) Contaminación por plásticos y pérdida de humedales por construcciones",
                    "B) Exceso de vegetación",
                    "C) Falta de luz solar"
                ],
                correct: 0,
                explanation: "La basura plástica abandonada y el dragado sin control destruyen su hábitat alimentario."
            },
            {
                question: "¿Qué caracteriza al canto territorial de la Guacharaca del Norte?",
                options: [
                    "A) Un grito fuerte, rítmico y coral al amanecer y atardecer",
                    "B) Un silbido imperceptible",
                    "C) Un maullido"
                ],
                correct: 0,
                explanation: "Las guacharacas cantan en grupo con un estruendoso 'gua-cha-ra-ca' característico."
            },
            {
                question: "¿Qué especie de Perico habita en los cardonales secos de Margarita?",
                options: [
                    "A) Perico Cara Sucia (Eupsittula pertinax)",
                    "B) Pingüino",
                    "C) Cisne Cuello Negro"
                ],
                correct: 0,
                explanation: "El Perico Cara Sucia es muy abundante en los sectores áridos de la isla."
            },
            {
                question: "¿Cuál es el color distintivo del vientre de la Reinita Amarilla (Setophaga petechia)?",
                options: [
                    "A) Amarillo intenso con estrías rojizas en el pecho",
                    "B) Negro azabache",
                    "C) Azul rey"
                ],
                correct: 0,
                explanation: "La reinita es un pequeño trino migratorio y residente de gran belleza amarilla."
            },
            {
                question: "¿Qué instrumento ayuda a los observadores de aves a identificar especies a distancia?",
                options: [
                    "A) Binoculares o prismáticos de campo",
                    "B) Microcopio de laboratorio",
                    "C) Linterna submarina"
                ],
                correct: 0,
                explanation: "Los binoculares (ej. 8x42 o 10x42) son la herramienta esencial de todo avistador de aves."
            },
            {
                question: "¿Qué código de ética debe seguir un buen observador de aves?",
                options: [
                    "A) No alterar el hábitat, no acosar nidos y mantener distancia respetuosa",
                    "B) Gritar para que el ave vuele",
                    "C) Atrapar las aves con redes para fotos"
                ],
                correct: 0,
                explanation: "La observación ética garantiza que el ave no sufra estrés ni abandone a sus pichones."
            },
            {
                question: "¿Cuál es la época de reproducción de la Cotorra Margariteña?",
                options: [
                    "A) Entre marzo y agosto",
                    "B) Únicamente en diciembre",
                    "C) Todo el año sin parar"
                ],
                correct: 0,
                explanation: "Durante estos meses los Ecoguardias custodian los nidos para evitar el saqueo de pichones."
            },
            {
                question: "¿Qué tipo de bosque predomina en la Península de Macanao?",
                options: [
                    "A) Bosque seco xerófilo con cactus y matorrales espinosos",
                    "B) Selva amazónica tupida",
                    "C) Tundras heladas"
                ],
                correct: 0,
                explanation: "El ambiente semiárido de Macanao alberga especies altamente adaptadas a la escasez de agua."
            },
            {
                question: "¿Qué zancuda de plumaje blanco y patas negras con pies amarillos es muy común en playas de Margarita?",
                options: [
                    "A) Garceta Nívea (Egretta thula)",
                    "B) Guacamaya Azul",
                    "C) Aguilucho"
                ],
                correct: 0,
                explanation: "La Garceta Nívea es célebre por sus 'zapatillas amarillas' que mueve para espantar pececillos."
            },
            {
                question: "¿Qué significado tiene el concepto de 'Ciencia Ciudadana' en Avistar NE?",
                options: [
                    "A) Participación de la comunidad registrando datos reales para investigación y conservación",
                    "B) Experimentos secretos en laboratorios",
                    "C) Venta de productos"
                ],
                correct: 0,
                explanation: "Cualquier persona puede aportar fotografías y coordenadas valiosas para proteger las aves."
            },
            {
                question: "¿Qué ave marina realiza clavados verticales de alta velocidad sobre el oleaje mar afuera?",
                options: [
                    "A) Pájaro Bobo o Alcatraz / Gaviotín",
                    "B) Colibrí",
                    "C) Gonzalito"
                ],
                correct: 0,
                explanation: "Los gaviotines y alcatraces penetran la superficie marina como dardos a gran velocidad."
            },
            {
                question: "¿Cuál es la diferencia visible entre un ave joven y un adulto de Cotorra Margariteña?",
                options: [
                    "A) El iris de los jóvenes es oscuro y el de los adultos es de tono anaranjado intenso",
                    "B) Los jóvenes no tienen alas",
                    "C) Los adultos son morados"
                ],
                correct: 0,
                explanation: "El color del ojo (iris) cambia gradualmente de café oscuro a naranja maduro conforme crece."
            },
            {
                question: "¿Qué tipo de árbol de mangle forma tupidas raíces zancudas sobre la Laguna de La Restinga?",
                options: [
                    "A) Mangle Rojo (Rhizophora mangle)",
                    "B) Pino silvestre",
                    "C) Manzano"
                ],
                correct: 0,
                explanation: "El mangle rojo tiene raíces sumergidas que sirven de refugio y filtro de agua marina."
            },
            {
                question: "¿Qué pequeño fringílido cantor de pico cónico es muy observado en sembradíos y zonas rurales de la isla?",
                options: [
                    "A) Semillero / Espiguero (Sporophila)",
                    "B) Pelícano",
                    "C) Garza Morena"
                ],
                correct: 0,
                explanation: "Los semilleros se alimentan de espigas de hierba silvestre en campos abiertos."
            },
            {
                question: "¿Qué ave de presa de plumaje oscuro vuela en círculos sobre las montañas del Copey?",
                options: [
                    "A) Aguilucho / Gavilán Urbano",
                    "B) Pato",
                    "C) Flamenco"
                ],
                correct: 0,
                explanation: "Las rapaces aprovechan las térmicas (corrientes de aire caliente) para elevarse sin gastar energía."
            },
            {
                question: "¿Por qué NO debemos alimentar aves silvestres con pan o galletas procesadas?",
                options: [
                    "A) Carecen de nutrientes esenciales y les produce deformaciones óseas como el 'ala de ángel'",
                    "B) Les hace crecer los dientes",
                    "C) Porque vuelan más rápido"
                ],
                correct: 0,
                explanation: "La comida procesada genera desnutrición severa. Su dieta natural debe respetarse."
            },
            {
                question: "¿Qué especie de gaviota es muy abundante alrededor de los barcos pesqueros en La Isleta y El Guiache?",
                options: [
                    "A) Gaviota Guanaguanare (Larus atricilla)",
                    "B) Tucán",
                    "C) Cotorra"
                ],
                correct: 0,
                explanation: "El Guanaguanare sigue los peñeros de pescadores para atrapar carnada y descartes."
            },
            {
                question: "¿Cuál de estas islas vecinas pertenece también al Estado Nueva Esparta?",
                options: [
                    "A) Isla de Coche e Isla de Cubagua",
                    "B) Curazao",
                    "C) Aruba"
                ],
                correct: 0,
                explanation: "Nueva Esparta comprende las islas de Margarita, Coche y Cubagua con sus ecosistemas insulares."
            },
            {
                question: "¿Qué ave acuática posee un cuello muy largo en forma de 'S' y plumaje grisáceo elegante?",
                options: [
                    "A) Garza Morena (Ardea herodias)",
                    "B) Perico",
                    "C) Colibrí"
                ],
                correct: 0,
                explanation: "La Garza Morena es una de las zancudas más grandes observables en costas venezolanas."
            },
            {
                question: "¿Qué adaptación permite a las garzas caminar sobre el lodo blando de los manglares sin hundirse?",
                options: [
                    "A) Dedos largos y extendidos que distribuyen su peso corporal",
                    "B) Patas de goma",
                    "C) Aletas como pez"
                ],
                correct: 0,
                explanation: "Sus largos dedos actúan como raquetas sobre la superficie lodosa del humedal."
            },
            {
                question: "¿Cuál de las siguientes es una amenaza para los colibríes en zonas urbanas de Margarita?",
                options: [
                    "A) Ataque de gatos domésticos y uso de insecticidas químicos",
                    "B) Abundancia de flores",
                    "C) Exceso de agua dulce"
                ],
                correct: 0,
                explanation: "Los gatos domésticos son predadores no naturales que capturan colibríes vulnerables."
            },
            {
                question: "¿Qué pico corto y fuerte posee la Cotorra Margariteña para romper semillas duras?",
                options: [
                    "A) Pico ganchudo y potente de psitácido",
                    "B) Pico largo en forma de aguja",
                    "C) Pico espatulado"
                ],
                correct: 0,
                explanation: "Su pico curvado le da la fuerza suficiente para partir nueces y huesos de frutos de cactos."
            },
            {
                question: "¿Qué sonido o reclamo emite el Perico Cara Sucia en bandada?",
                options: [
                    "A) Cháchara escandalosa y aguda durante el vuelo",
                    "B) Maullido suave",
                    "C) Rugido"
                ],
                correct: 0,
                explanation: "Los pericos vuelan en grupos ruidosos avisándose sobre comida o depredadores."
            },
            {
                question: "¿Por qué es importante registrar la fecha y ubicación GPS exacta al reportar un ave?",
                options: [
                    "A) Permite mapear corredores biológicos y temporadas migratorias en el tiempo",
                    "B) Para que el ave reciba un mensaje",
                    "C) No tiene ninguna importancia"
                ],
                correct: 0,
                explanation: "Las coordenadas precisas permiten a científicos analizar patrones poblacionales y proteger zonas críticas."
            },
            {
                question: "¿Qué ave diminuta de tonos amarillos se observa frecuentemente buscando néctar en la flor del cují?",
                options: [
                    "A) Reinita Mielera (Coereba flaveola)",
                    "B) Pelícano",
                    "C) Guacharaca"
                ],
                correct: 0,
                explanation: "La Reinita Mielera (Reinita común) perfora la base de las flores para extraer su dulce néctar."
            },
            {
                question: "¿Qué estructura de protección ambiental resguarda el cima del Cerro El Copey?",
                options: [
                    "A) Parque Nacional Cerro El Copey - Jovito Villalba",
                    "B) Cantera de Piedra",
                    "C) Zona Industrial"
                ],
                correct: 0,
                explanation: "Decretado Parque Nacional para preservar la cuenca hidrográfica y la flora/fauna montañosa."
            },
            {
                question: "¿Cómo ayudan los árboles de la selva nublada de Copey al abastecimiento de agua dulce en Margarita?",
                options: [
                    "A) Atrapan la niebla en sus hojas alimentando manantiales y ríos de la isla",
                    "B) Evaporando todo el agua",
                    "C) Bloqueando las lluvias"
                ],
                correct: 0,
                explanation: "El fenómeno de lluvia horizontal en las cumbres abastece las reservas de agua insulares."
            },
            {
                question: "¿Qué ave marina posee una bolsa gular dilatadle bajo el pico para atrapar peces con agua?",
                options: [
                    "A) Pelícano Pardo",
                    "B) Zamuro",
                    "C) Turpial"
                ],
                correct: 0,
                explanation: "La bolsa gular actúa como una red que luego drena el agua para tragar el pez entero."
            },
            {
                question: "¿Qué tipo de vegetación es característica de la Laguna de Las Marites?",
                options: [
                    "A) Extensos manglares negros y rojos",
                    "B) Pinos y abetos",
                    "C) Campos de trigo"
                ],
                correct: 0,
                explanation: "Las Marites es otro sitio RAMSAR y Monumento Natural protegido por sus manglares."
            },
            {
                question: "¿Cuál es la envergadura aproximada de alas abiertas de un Alcatraz adulto?",
                options: [
                    "A) Alrededor de 2 metros de punta a punta",
                    "B) 10 centímetros",
                    "C) 5 metros"
                ],
                correct: 0,
                explanation: "Tienen alas largas y angostas diseñadas para planear eficientemente sobre la brisa marina."
            },
            {
                question: "¿Qué hábito alimenticio caracteriza a las Garzas Martinete?",
                options: [
                    "A) Crepusculares y nocturnas, cazando peces de noche",
                    "B) Solo comen frutas secas de día",
                    "C) Comen arena"
                ],
                correct: 0,
                explanation: "Los Martinetes tienen grandes ojos adaptados para divisar peces en la penumbra."
            },
            {
                question: "¿Qué diferencia al Flamenco del Caribe de otras aves playeras?",
                options: [
                    "A) Sus larguísimas patas rosadas, cuello esbelto y pico curvo filtrador",
                    "B) Que vuela marcha atrás",
                    "C) Que no tiene plumas"
                ],
                correct: 0,
                explanation: "Su silueta es inconfundible y su alimentación es por filtración de barro sumergido."
            },
            {
                question: "¿Qué especie de paloma silvestre de ojos anillados es común en valles de Margarita?",
                options: [
                    "A) Paloma Sabanera / Maraquera (Zenaida auriculata)",
                    "B) Perico",
                    "C) Guacamaya"
                ],
                correct: 0,
                explanation: "Muy abundante en áreas agrícolas y terrenos abiertos buscando granos de tierra."
            },
            {
                question: "¿Qué ave insectívora posee la cola partida en forma de tijera muy marcada en vuelo?",
                options: [
                    "A) Tijereta Sabanera (Tyrannus savana)",
                    "B) Pelícano",
                    "C) Cotorra"
                ],
                correct: 0,
                explanation: "La Tijereta captura insectos al vuelo realizando acrobacias aéreas impresionantes."
            },
            {
                question: "¿Qué debemos hacer si encontramos un pichón emplumado sano en el suelo bajo un árbol?",
                options: [
                    "A) Dejarlo en un arbusto cercano; sus padres están cerca alimentándolo",
                    "B) Llevárselo a casa de mascota",
                    "C) Darle pan con leche"
                ],
                correct: 0,
                explanation: "Los pichones volantones aprenden a volar en el suelo. Sus padres los cuidan a distancia."
            },
            {
                question: "¿Cuál de los siguientes refugios naturales es vital para la Cotorra Margariteña para anidar?",
                options: [
                    "A) Oquedades y huecos naturales en troncos viejos de árboles de Palo Sano y Yaití",
                    "B) Nidos en el barro del mar",
                    "C) Cañerías urbanas"
                ],
                correct: 0,
                explanation: "La cotorra no construye nidos de ramas; necesita huecos en árboles maduros xerófilos."
            },
            {
                question: "¿Qué ave de presa pequeña es conocida por cernirse en el aire inmóvil buscando lagartijas?",
                options: [
                    "A) Cernícalo Americano / Cernícalo (Falco sparverius)",
                    "B) Garza Real",
                    "C) Flamenco"
                ],
                correct: 0,
                explanation: "El Cernícalo bate las alas en un punto fijo del aire observando el suelo atentamente."
            },
            {
                question: "¿Qué pico fuerte y cónico posee el Cardenal Coriano / Cardenal?",
                options: [
                    "A) Pico grueso rojizo apto para romper semillas duras de cardón",
                    "B) Pico en forma de cuchara",
                    "C) Pico largo y delgado"
                ],
                correct: 0,
                explanation: "Su pico robusto es ideal para abrir frutos y semillas de zonas áridas."
            },
            {
                question: "¿Qué tipo de migración realizan aves como el Playero Semipalmeado que visita Margarita?",
                options: [
                    "A) Migración Neotropical desde el Ártico/Norteamérica hacia Sudamérica en invierno",
                    "B) Migración vertical de 1 metro",
                    "C) No migran"
                ],
                correct: 0,
                explanation: "Viajan miles de millas huyendo del frío ártico para alimentarse en playas caribeñas."
            },
            {
                question: "¿Cuál es el color de las patas del Flamenco del Caribe adulto?",
                options: [
                    "A) Rosado Intenso a bermellón con articulaciones marcadas",
                    "B) Azules brillante",
                    "C) Verdes esmeralda"
                ],
                correct: 0,
                explanation: "Las tonalidades rosadas se extienden por sus largas extremidades zancudas."
            },
            {
                question: "¿Qué especie de garza pequeña de color azul plomizo caza sigilosamente en manglares secos?",
                options: [
                    "A) Garcita Azul (Egretta caerulea)",
                    "B) Cotorra Margariteña",
                    "C) Zamuro"
                ],
                correct: 0,
                explanation: "Los juveniles de Garcita Azul son blancos y cambian a azul plomizo al ser adultos."
            },
            {
                question: "¿Qué zancuda de plumaje pardo manchado habita orillas lodosas de lagunas marianas?",
                options: [
                    "A) Corocora Marrón / Ibis Oscuro",
                    "B) Turpial",
                    "C) Azulejo"
                ],
                correct: 0,
                explanation: "Busca gusanillos y pequeños cangrejos en el limo usando su pico curvo."
            },
            {
                question: "¿Qué nombre recibe el área de conservación RAMSAR en la Laguna de La Restinga?",
                options: [
                    "A) Humedal de Importancia Internacional",
                    "B) Club náutico privado",
                    "C) Autopista marina"
                ],
                correct: 0,
                explanation: "La Convención RAMSAR protege humedales cruciales a nivel mundial para las aves migratorias."
            },
            {
                question: "¿Qué fruta cultivada en Margarita atrae a pericos y garrapateros en huertos locales?",
                options: [
                    "A) Mango, Lechosa y Guayaba",
                    "B) Manzanas de nieve",
                    "C) Uvas congeladas"
                ],
                correct: 0,
                explanation: "Los huertos frutales familiares son fuentes de alimento importantes en temporada de sequía."
            },
            {
                question: "¿Qué ave negra con pico grueso acanalado es famosa por andar en grupos sociables en potreros?",
                options: [
                    "A) Garrapatero Aní / Garrapatero (Crotophaga ani)",
                    "B) Flamenco",
                    "C) Colibrí"
                ],
                correct: 0,
                explanation: "Los garrapateros vuelan ruidosamente y se alimentan de garrapatas e insectos en el ganado."
            },
            {
                question: "¿Qué característica distingue al plumaje del Gonzalito?",
                options: [
                    "A) Capucha o máscara negra en la cara con cuerpo amarillo anaranjado",
                    "B) Plumaje rojo carmesí completo",
                    "C) Alas totalmente transparentes"
                ],
                correct: 0,
                explanation: "La máscara negra en su rostro resalta brillantemente sobre el amarillo del plumaje."
            },
            {
                question: "¿Qué ave marina posee una cola ahorquillada muy larga que abre y cierra como tijera en vuelo?",
                options: [
                    "A) Tijereta de Mar (Fragata)",
                    "B) Pato",
                    "C) Zamuro"
                ],
                correct: 0,
                explanation: "Usa su cola de tijera para realizar maniobras de vuelo giroscópicas sin esfuerzo."
            },
            {
                question: "¿Cuál es la ventaja adaptativa del pico en forma de gancho de las aves rapaces?",
                options: [
                    "A) Desgarrar carne fresca con precisión",
                    "B) Filtrar lodo",
                    "C) Chupar néctar de flores"
                ],
                correct: 0,
                explanation: "El pico ganchudo y afilado de águilas y gavilanes está diseñado para desgarrar presas."
            },
            {
                question: "¿Qué canto alegre suele emitir el Cristofué (Pitangus sulphuratus) al posarse en ramas?",
                options: [
                    "A) Su característico grito que suena '¡CRIS-TO-FUÉ!'",
                    "B) Un cacareo de gallina",
                    "C) Un mugido"
                ],
                correct: 0,
                explanation: "El Cristofué debe su nombre popular a la clara onomatopeya de su canto territorial."
            },
            {
                question: "¿Qué debemos hacer si presenciamos la venta ilegal de Cotorras Margariteñas en carreteras?",
                options: [
                    "A) Denunciar ante el Ministerio del Ecosocialismo (MINEC), Guardería Ambiental de la GNB o Provita",
                    "B) Comprar el ave para tenerla en jaula",
                    "C) Ignorar la situación"
                ],
                correct: 0,
                explanation: "Comprar aves silvestres fomenta el tráfico ilegal. La denuncia protege la especie."
            },
            {
                question: "¿Qué ave pequeña y activa recorre los troncos de los árboles buscando insectos bajo la corteza?",
                options: [
                    "A) Carpintero Habado",
                    "B) Pelícano",
                    "C) Flamenco"
                ],
                correct: 0,
                explanation: "Los carpinteros tienen garras adaptadas para trepar verticalmente en troncos."
            },
            {
                question: "¿Qué color tiene la cera o base del pico de la Cotorra Margariteña?",
                options: [
                    "A) Plumones blancos sobre la frente y cera clara",
                    "B) Azul neón",
                    "C) Negro brillante"
                ],
                correct: 0,
                explanation: "La mancha blanca sobre el pico (frente blanca) la diferencia de otras especies de amazonas."
            },
            {
                question: "¿Qué sonido producen los machos de Colibrí para atraer a las hembras en época de celo?",
                options: [
                    "A) Zumbidos rápidos de alas y trinos agudos repetitivos",
                    "B) Graznidos fuertes",
                    "C) Rugidos"
                ],
                correct: 0,
                explanation: "El batido de alas genera un zumbido sonoro ('hummingbird') característico."
            },
            {
                question: "¿Qué beneficio otorgan los frugívoros (aves que comen frutas) al bosque montañoso del Copey?",
                options: [
                    "A) Dispersan semillas en sus heces reforestando el bosque de forma natural",
                    "B) Destruyen los árboles",
                    "C) Secan los ríos"
                ],
                correct: 0,
                explanation: "Son los sembradores naturales del bosque garantizando la regeneración de plantas silvestre."
            },
            {
                question: "¿Qué tipo de patas poseen los patos y zambullidores acuáticos de la isla?",
                options: [
                    "A) Patas palmeadas con membrana entre los dedos para remar",
                    "B) Garras de rapaz con uñas curvas",
                    "C) Pezuñas"
                ],
                correct: 0,
                explanation: "La membrana palmeada funciona como remos eficaces para desplazarse en el agua."
            },
            {
                question: "¿Cuál es el mejor momento del día para observar la mayor actividad de aves en Margarita?",
                options: [
                    "A) Al amanecer (6:00 am - 9:00 am) y al atardecer (5:00 pm - 6:30 pm)",
                    "B) A las 12:00 del mediodía bajo pleno sol",
                    "C) A medianoche en oscuridad total"
                ],
                correct: 0,
                explanation: "Las aves están más activas buscando alimento en las horas frescas de la mañana y la tarde."
            },
            {
                question: "¿Qué ave playera posee un pico larguísimo y curvo hacia abajo para buscar gusanos profundos en la arena?",
                options: [
                    "A) Zarapito Trinchete (Numenius phaeopus)",
                    "B) Gonzalito",
                    "C) Perico"
                ],
                correct: 0,
                explanation: "Su largo pico curvo le permite sondear huecos profundos en la arena fangosa."
            },
            {
                question: "¿Qué ave posee un penacho o cresta despeinada en la cabeza y habita cerca de cañadas secas?",
                options: [
                    "A) Querrequerre o Guacharaca",
                    "B) Pelícano",
                    "C) Gaviota"
                ],
                correct: 0,
                explanation: "La cresta móvil se levanta cuando el ave está alerta o comunicándose."
            },
            {
                question: "¿Cuál es la principal fuente de proteína de las Garzas Blancas durante la temporada de lluvias?",
                options: [
                    "A) Renacuajos, pececillos e insectos acuáticos",
                    "B) Cocos secos",
                    "C) Piedras"
                ],
                correct: 0,
                explanation: "Aprovechan los charcos temporales y pozas para alimentarse de fauna acuática abundante."
            },
            {
                question: "¿Qué especie de paloma muy pequeña de color pardo grisáceo camina en parejas en poblados margariteños?",
                options: [
                    "A) Tortolita Mofletuda / Tortolita (Columbina passerina)",
                    "B) Águila Arpía",
                    "C) Flamenco"
                ],
                correct: 0,
                explanation: "La Tortolita es una de las aves más pequeñas y familiares en patios y aceras."
            },
            {
                question: "¿Qué adaptación le permite al Zamuro volar durante horas sin cansarse?",
                options: [
                    "A) Aprovecha las térmicas (corrientes de aire caliente ascendente) para planear sin aletear",
                    "B) Tiene motor incorporado",
                    "C) Nunca vuela"
                ],
                correct: 0,
                explanation: "El planeo térmico ahorra valiosa energía metabólica durante sus patrullajes."
            },
            {
                question: "¿Qué ave de vistoso copete y plumaje pardo habita en bosques secundarios cerca de La Asunción?",
                options: [
                    "A) Atrapamoscas Copetón (Myiarchus)",
                    "B) Pelícano",
                    "C) Zamuro"
                ],
                correct: 0,
                explanation: "Los atrapamoscas se posan en ramas elevadas y se lanzan en ráfaga a atrapar coleópteros."
            },
            {
                question: "¿Por qué el agua salobre de la Restinga favorece la presencia de microalgas y artemias?",
                options: [
                    "A) La mezcla de agua dulce de lluvia y salada del mar crea un ecosistema super nutritivo",
                    "B) Porque es agua clorada",
                    "C) Porque no tiene minerales"
                ],
                correct: 0,
                explanation: "La albufera salobre es un caldo de cultivo biológico repleto de pequeños crustáceos."
            },
            {
                question: "¿Qué ave diminuta posee el dorso de color verde esmeralda iridiscente que brilla bajo el sol?",
                options: [
                    "A) Colibrí Esmeralda",
                    "B) Zopilote",
                    "C) Gaviota"
                ],
                correct: 0,
                explanation: "La iridiscencia de sus plumas refleja la luz solar como piedras preciosas."
            },
            {
                question: "¿Qué hace un voluntario de Avistar NE al registrar un avistamiento en la plataforma?",
                options: [
                    "A) Sube una foto real con coordenadas GPS para validar la presencia de la especie",
                    "B) Borra las fotos de la galería",
                    "C) Apaga el servidor"
                ],
                correct: 0,
                explanation: "Cada aporte ciudadano enriquece el mapa interactivo de biodiversidad de Nueva Esparta."
            },
            {
                question: "¿Por qué el turismo sostenible de observación de aves (Aviturismo) beneficia a Margarita?",
                options: [
                    "A) Genera ingresos para las comunidades locales protegiendo la naturaleza sin destruirla",
                    "B) Fomenta la tala de árboles",
                    "C) Construye edificios en la playa"
                ],
                correct: 0,
                explanation: "El aviturismo demuestra que las aves vivas en su hábitat valen mucho más que en jaulas."
            },
            {
                question: "¿Qué tipo de vegetación rastrera protege las dunas de arena en las playas donde anidan aves playeras?",
                options: [
                    "A) Votana y Riñonada de playa (Ipomoea pes-caprae)",
                    "B) Arboles de pino",
                    "C) Césped sintético"
                ],
                correct: 0,
                explanation: "La vegetación de duna fija la arena evitando la erosión eólica sobre los nidos."
            },
            {
                question: "¿Qué garza mediana de color pardo estriado se camufla perfectamente entre los juncos y mangles?",
                options: [
                    "A) Huaco / Martinete Coronado (Nyctanassa violacea)",
                    "B) Guacamaya",
                    "C) Flamenco"
                ],
                correct: 0,
                explanation: "Su diseño mimético hace que parezca una rama seca mimetizada con el follaje."
            },
            {
                question: "¿Qué rapaz nocturna pequeña emite un ulular suave en los valles de San Juan Bautista?",
                options: [
                    "A) Mochuelo de Hoyo / Curtidor (Athene cunicularia)",
                    "B) Pelícano",
                    "C) Turpial"
                ],
                correct: 0,
                explanation: "El Mochuelo anida en cavidades del suelo y es un gran cazador de grillos y escorpiones."
            },
            {
                question: "¿Cuál es la función del plumaje denso e impermeable de las aves marinas?",
                options: [
                    "A) Repeler el agua de mar y aislar su cuerpo del frío acuático",
                    "B) Hacerlas más pesadas para hundirse",
                    "C) Cambiar de color diariamente"
                ],
                correct: 0,
                explanation: "Una glándula uropigial secreta aceites impermeabilizantes que impregnan sus plumas."
            },
            {
                question: "¿Qué especie de gavilán de plumaje gris ceniza habita en colinas secas de Macanao?",
                options: [
                    "A) Gavilán Gris (Buteo nitidus)",
                    "B) Flamenco",
                    "C) Perico"
                ],
                correct: 0,
                explanation: "Planea hábilmente entre los cactos monitoreando presas terrestres."
            },
            {
                question: "¿Qué debemos llevar siempre en una salida de avistamiento de aves?",
                options: [
                    "A) Guía de aves, cuaderno de notas, binoculares, agua y ropa de colores neutros",
                    "B) Cornetas con música a alto volumen",
                    "C) Luces de neón centellantes"
                ],
                correct: 0,
                explanation: "Los colores neutros (verde, caqui) evitan espantar a las aves en el sendero."
            },
            {
                question: "¿Qué vocalización hace el Turpial Venezolano al marcar su territorio?",
                options: [
                    "A) Un silbido aflautado claro y melodioso de varias notas",
                    "B) Un ladrido",
                    "C) Un gruñido"
                ],
                correct: 0,
                explanation: "Su canto melodioso es uno de los más hermosos y reconocibles del trópico."
            },
            {
                question: "¿Por qué las salinas de Pampatar y Coche atraen tanto a las aves migratorias?",
                options: [
                    "A) Abundan invertebrados salinos ricos en energía como la Artemia salina",
                    "B) Porque hay dulces y refrescos",
                    "C) Porque no hay aire"
                ],
                correct: 0,
                explanation: "La alta salinidad favorece a pequeños organismos que son superalimentos para Playeros y Flamencos."
            },
            {
                question: "¿Cuál de las siguientes acciones fortalece el futuro del ave Cotorra Margariteña?",
                options: [
                    "A) Proteger sus árboles de anidación, denunciar la venta ilegal y apoyar a la ciencia ciudadana",
                    "B) Comprar pichones en la vía",
                    "C) Talar los cardonales"
                ],
                correct: 0,
                explanation: "La conservación comunitaria es la única garantía para que la cotorra siga volando libre en Margarita."
            }
        ];

        this.questionsPerRound = 3;
        this.currentRoundQuestions = [];
        this.currentIndex = 0;
        this.score = 0;
        this.isAnswered = false;
    }

    init() {
        const container = document.getElementById('trivia-container');
        if (!container) return;
        this.startNewRound();
    }

    startNewRound() {
        // Mezclar las 100 preguntas de forma aleatoria (Fisher-Yates Shuffle)
        const shuffled = [...this.questionsPool].sort(() => 0.5 - Math.random());
        this.currentRoundQuestions = shuffled.slice(0, this.questionsPerRound);
        this.currentIndex = 0;
        this.score = 0;
        this.isAnswered = false;
        this.renderQuestion();
    }

    getContainers() {
        return Array.from(document.querySelectorAll('#trivia-container, #dashboard-trivia-container, .trivia-box-target'));
    }

    renderQuestion() {
        const containers = this.getContainers();
        if (containers.length === 0) return;

        const q = this.currentRoundQuestions[this.currentIndex];

        const htmlContent = `
            <!-- Encabezado de la Trivia -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
                <div style="font-size: 0.95rem; color: var(--text-muted); font-weight: 500;">
                    Pregunta <strong class="trivia-counter-num" style="font-size: 1.1rem;">${this.currentIndex + 1}</strong> de <strong class="trivia-counter-num" style="font-size: 1.1rem;">${this.questionsPerRound}</strong>
                </div>
                <div style="font-size: 1.05rem; font-weight: 700; color: #10b981; display: flex; align-items: center; gap: 0.5rem; background: rgba(16, 185, 129, 0.1); padding: 0.4rem 1rem; border-radius: 20px; border: 1px solid rgba(16, 185, 129, 0.2);">
                    <span>Puntos:</span> <span class="trivia-score-val">${this.score}</span>
                </div>
            </div>

            <!-- Pregunta -->
            <h3 class="trivia-question-title" style="font-size: 1.35rem; font-weight: 700; line-height: 1.45; margin-bottom: 2rem; position: relative; padding-right: 50px;">
                ${q.question}
                <div style="position: absolute; right: 0; top: -10px; width: 42px; height: 42px; border-radius: 50%; background: radial-gradient(circle, #0d382c 0%, #061510 100%); border: 1.5px solid #10b981; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C7.5 2 4 5.5 4 10C4 13.5 6 16.5 9 18V21C9 21.6 9.4 22 10 22H14C14.6 22 15 21.6 15 21V18C18 16.5 20 13.5 20 10C20 5.5 16.5 2 12 2Z" fill="#10b981"/>
                        <circle cx="9.5" cy="8.5" r="1.2" fill="#ffffff"/>
                        <circle cx="14.5" cy="8.5" r="1.2" fill="#ffffff"/>
                        <path d="M11 11.5L12 14L13 11.5Z" fill="#f59e0b"/>
                    </svg>
                </div>
            </h3>

            <!-- Opciones -->
            <div class="trivia-options-list" style="display: flex; flex-direction: column; gap: 1rem;">
                ${q.options.map((opt, idx) => `
                    <div class="trivia-option-btn" data-index="${idx}" style="border-radius: 14px; padding: 1.1rem 1.4rem; font-weight: 600; font-size: 1rem; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                        <span>${opt}</span>
                        <span class="trivia-arrow" style="font-size: 1.3rem; font-weight: bold; transition: transform 0.2s;">&rsaquo;</span>
                    </div>
                `).join('')}
            </div>

            <!-- Explicación (oculta al inicio) -->
            <div class="trivia-feedback-box" style="display: none; margin-top: 1.5rem; padding: 1rem 1.2rem; border-radius: 12px; font-size: 0.95rem; line-height: 1.5; animation: modalIn 0.3s ease;"></div>
        `;

        containers.forEach(container => {
            container.innerHTML = htmlContent;

            const optionBtns = container.querySelectorAll('.trivia-option-btn');
            optionBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const selectedIndex = parseInt(btn.getAttribute('data-index'), 10);
                    this.selectAnswer(selectedIndex);
                });
                btn.addEventListener('mouseenter', () => {
                    if (!this.isAnswered) {
                        btn.style.transform = 'translateX(6px)';
                    }
                });
                btn.addEventListener('mouseleave', () => {
                    if (!this.isAnswered) {
                        btn.style.transform = 'translateX(0)';
                    }
                });
            });
        });
    }

    selectAnswer(selectedIndex) {
        if (this.isAnswered) return;
        this.isAnswered = true;

        const q = this.currentRoundQuestions[this.currentIndex];
        const isCorrect = (selectedIndex === q.correct);

        if (isCorrect) {
            this.score += 100;
        }

        const containers = this.getContainers();
        containers.forEach(container => {
            const scoreVal = container.querySelector('.trivia-score-val');
            if (scoreVal) scoreVal.textContent = this.score;

            const optionBtns = container.querySelectorAll('.trivia-option-btn');
            const feedbackBox = container.querySelector('.trivia-feedback-box');

            optionBtns.forEach((btn, idx) => {
                btn.style.cursor = 'default';
                btn.style.transform = 'translateX(0)';
                if (idx === q.correct) {
                    btn.style.background = 'rgba(16, 185, 129, 0.25)';
                    btn.style.borderColor = '#10b981';
                    btn.style.color = '#34d399';
                    btn.innerHTML += ` <span style="margin-left:auto; color:#10b981;">✓</span>`;
                } else if (idx === selectedIndex && !isCorrect) {
                    btn.style.background = 'rgba(239, 68, 68, 0.25)';
                    btn.style.borderColor = '#ef4444';
                    btn.style.color = '#f87171';
                    btn.innerHTML += ` <span style="margin-left:auto; color:#ef4444;">✗</span>`;
                } else {
                    btn.style.opacity = '0.5';
                }
            });

            if (feedbackBox) {
                feedbackBox.style.display = 'block';
                if (isCorrect) {
                    feedbackBox.style.background = 'rgba(16, 185, 129, 0.15)';
                    feedbackBox.style.border = '1px solid rgba(16, 185, 129, 0.3)';
                    feedbackBox.style.color = '#34d399';
                    feedbackBox.innerHTML = `<strong>¡Correcto! 🎉</strong> ${q.explanation}`;
                } else {
                    feedbackBox.style.background = 'rgba(239, 68, 68, 0.15)';
                    feedbackBox.style.border = '1px solid rgba(239, 68, 68, 0.3)';
                    feedbackBox.style.color = '#f87171';
                    feedbackBox.innerHTML = `<strong>¡Ups! 💡</strong> ${q.explanation}`;
                }
            }
        });

        // Avanzar a la siguiente pregunta después de 2.2 segundos
        setTimeout(() => {
            this.currentIndex++;
            if (this.currentIndex < this.questionsPerRound) {
                this.isAnswered = false;
                this.renderQuestion();
            } else {
                this.renderEndScreen();
            }
        }, 2200);
    }

    renderEndScreen() {
        const containers = this.getContainers();
        if (containers.length === 0) return;

        const maxScore = this.questionsPerRound * 100;
        const percentage = Math.round((this.score / maxScore) * 100);
        const isAuth = window.authManager && window.authManager.isAuthenticated;

        let medalEmoji = '🏅';
        let titleMsg = '¡Gran Esfuerzo!';
        if (percentage === 100) {
            medalEmoji = '🏆';
            titleMsg = '¡Experto en Aves de Margarita!';
        } else if (percentage >= 60) {
            medalEmoji = '🥇';
            titleMsg = '¡Excelente Conocimiento!';
        }

        let guestMessage = '';
        if (!isAuth && percentage === 100) {
            guestMessage = `
                <div style="background: rgba(245, 158, 11, 0.1); border: 1.5px solid rgba(245, 158, 11, 0.25); border-radius: 12px; padding: 0.85rem 1rem; max-width: 500px; margin: 0 auto 2rem auto; color: #f59e0b; font-size: 0.9rem; text-align: center; backdrop-filter: blur(8px);">
                    🔑 ¡Hiciste una ronda perfecta! Inicia sesión o regístrate para registrar tu progreso y desbloquear la medalla de <strong>Rey de la Trivia 🧠</strong>.
                </div>
            `;
        }

        const endHtml = `
            <div style="text-align: center; padding: 2rem 1rem; animation: modalIn 0.4s ease;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">${medalEmoji}</div>
                <h3 style="font-size: 2rem; font-weight: 700; color: #ffffff; margin-bottom: 0.5rem;">${titleMsg}</h3>
                <p style="color: #94a3b8; font-size: 1.05rem; margin-bottom: 1.5rem;">
                    Obtuviste <strong style="color: #10b981; font-size: 1.3rem;">${this.score}</strong> de <strong>${maxScore}</strong> puntos posibles.
                </p>
                <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 12px; padding: 1rem; max-width: 500px; margin: 0 auto 2rem auto; color: #cbd5e1; font-size: 0.95rem;">
                    💡 Cada vez que juegas se seleccionan <strong>nuevas preguntas aleatorias</strong> de nuestro catálogo de 100 trivias educativas.
                </div>
                ${guestMessage}
                <button class="trivia-restart-btn btn btn-primary" style="padding: 0.85rem 2.2rem; font-size: 1.05rem; border-radius: 50px; display: inline-flex; align-items: center; gap: 0.6rem;">
                    🔄 Jugar Nueva Ronda (Nuevas Preguntas)
                </button>
            </div>
        `;

        containers.forEach(container => {
            container.innerHTML = endHtml;
            const btn = container.querySelector('.trivia-restart-btn');
            if (btn) {
                btn.addEventListener('click', () => this.startNewRound());
            }
        });

        // Desbloquear logro si el usuario está autenticado y tiene puntaje perfecto
        if (isAuth && percentage === 100) {
            if (window.api && typeof window.api.post === 'function') {
                window.api.post('/users/me/achievements/unlock', { achievementId: 'trivia_king' })
                    .then(res => {
                        if (res && res.newlyUnlocked) {
                            this.showAchievementUnlockBanner(res.achievement);
                            if (typeof window.loadNotifications === 'function') {
                                window.loadNotifications();
                            }
                        }
                    })
                    .catch(err => {
                        console.error('Error al desbloquear logro de trivia:', err);
                    });
            }
        }
    }

    showAchievementUnlockBanner(achievement) {
        // Eliminar cualquier banner previo existente
        const oldBanner = document.getElementById('achievement-unlock-banner-popup');
        if (oldBanner) oldBanner.remove();

        const banner = document.createElement('div');
        banner.id = 'achievement-unlock-banner-popup';
        banner.style.position = 'fixed';
        banner.style.top = '-150px';
        banner.style.left = '50%';
        banner.style.transform = 'translateX(-50%)';
        banner.style.width = '90%';
        banner.style.maxWidth = '450px';
        banner.style.background = 'rgba(15, 23, 42, 0.9)';
        banner.style.backdropFilter = 'blur(12px)';
        banner.style.webkitBackdropFilter = 'blur(12px)';
        banner.style.border = `1.5px solid ${achievement.color || '#a855f7'}`;
        banner.style.borderRadius = '16px';
        banner.style.padding = '1.2rem';
        banner.style.boxShadow = `0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${achievement.color}40`;
        banner.style.zIndex = '99999';
        banner.style.display = 'flex';
        banner.style.alignItems = 'center';
        banner.style.gap = '1.2rem';
        banner.style.transition = 'top 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        
        banner.innerHTML = `
            <div style="font-size: 2.5rem; background: rgba(255,255,255,0.08); width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: inset 0 0 10px rgba(255,255,255,0.1); flex-shrink: 0;">
                ${achievement.icon || '🏆'}
            </div>
            <div style="flex: 1; text-align: left;">
                <div style="font-size: 0.8rem; font-weight: 800; color: ${achievement.color || '#a855f7'}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.2rem;">
                    🏆 ¡Logro Desbloqueado!
                </div>
                <div style="font-size: 1.15rem; font-weight: 700; color: #ffffff; margin-bottom: 0.1rem;">
                    ${achievement.name}
                </div>
                <div style="font-size: 0.85rem; color: #94a3b8; line-height: 1.3;">
                    ${achievement.description}
                </div>
            </div>
            <button style="background: none; border: none; color: #64748b; font-size: 1.5rem; cursor: pointer; padding: 0.2rem; line-height: 1; transition: color 0.2s;" onclick="this.parentElement.style.top = '-150px'; setTimeout(() => this.parentElement.remove(), 600);">
                &times;
            </button>
        `;

        // Añadir efecto hover al botón de cerrar
        const closeBtn = banner.querySelector('button');
        closeBtn.onmouseenter = () => closeBtn.style.color = '#cbd5e1';
        closeBtn.onmouseleave = () => closeBtn.style.color = '#64748b';

        document.body.appendChild(banner);

        // Slide down
        setTimeout(() => {
            banner.style.top = '24px';
        }, 100);

        // Auto slide up and remove
        setTimeout(() => {
            if (banner.parentElement) {
                banner.style.top = '-150px';
                setTimeout(() => {
                    if (banner.parentElement) banner.remove();
                }, 600);
            }
        }, 6000);
    }
}
