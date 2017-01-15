

--
-- ENUM
-- 
CREATE TYPE sex          AS ENUM ('F','M');
CREATE TYPE root_familly AS ENUM ('gueudelot','guibert','guyomard','letot');
CREATE TYPE log_type     AS ENUM ('error','warning','message');
CREATE TYPE module_type  AS ENUM ('absg','citation','immt','forum','agpa','agenda','web3g','cultureg','gtheque','wikig','olympiages','grenier','birthday');






--
-- TABLES
--


CREATE TABLE public.absg_current_data
(
    key character varying(255) COLLATE pg_catalog."C.UTF-8",
    value character varying(255) COLLATE pg_catalog."C.UTF-8",
    CONSTRAINT absg_current_data_pkey PRIMARY KEY (key)
)
WITH ( OIDS=FALSE );
ALTER TABLE public.absg_current_data OWNER TO absg;



CREATE TABLE public.absg_daily_presence
(
    datetime timestamp without time zone,
    user_id integer NOT NULL,
    CONSTRAINT absg_daily_presence_pkey PRIMARY KEY (datetime, user_id)
)
WITH ( OIDS=FALSE );
ALTER TABLE public.absg_daily_presence OWNER TO absg;



CREATE TABLE public.absg_logs
(
    user_id integer NOT NULL,
    datetime timestamp without time zone NOT NULL,
    type log_type NOT NULL,
    module module_type NOT NULL,
    message character varying(255) NOT NULL COLLATE pg_catalog."C.UTF-8",
    url character varying(255) COLLATE pg_catalog."C.UTF-8",
    CONSTRAINT absg_logs_pkey PRIMARY KEY (datetime, user_id)
)
WITH ( OIDS=FALSE );
ALTER TABLE public.absg_logs OWNER TO absg;



CREATE TABLE public.absg_ranks
(
    code character varying(2) NOT NULL COLLATE pg_catalog."C.UTF-8",
    title character varying(20) NOT NULL COLLATE pg_catalog."C.UTF-8",
    g_note integer NOT NULL,
    CONSTRAINT absg_ranks_pkey PRIMARY KEY (code)
)
WITH ( OIDS=FALSE );
ALTER TABLE public.absg_ranks OWNER TO absg;



CREATE SEQUENCE public.absg_users_id_seq
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;
ALTER TABLE public.absg_users_id_seq OWNER TO absg;
CREATE TABLE public.absg_users
(
    id integer NOT NULL,
    people_id integer,
    username character varying(25) NOT NULL COLLATE pg_catalog."C.UTF-8",
    username_clean character varying(25) COLLATE pg_catalog."C.UTF-8",
    password character varying(255) COLLATE pg_catalog."C.UTF-8",
    auth character varying(255) COLLATE pg_catalog."C.UTF-8",
    noteg character varying(255) COLLATE pg_catalog."C.UTF-8",
    rank character varying(2) COLLATE pg_catalog."C.UTF-8",
    session_data text COLLATE pg_catalog."C.UTF-8",
    CONSTRAINT absg_users_pkey PRIMARY KEY (id)
)
WITH ( OIDS=FALSE );
ALTER TABLE public.absg_users OWNER TO absg;



CREATE SEQUENCE public.agenda_people_seq
    INCREMENT 1
    MINVALUE 1
    MAXVALUE 9223372036854775807
    START 1
    CACHE 1;
ALTER TABLE public.agenda_people_seq OWNER TO absg;
CREATE TABLE public.agenda_people
(
    people_id integer NOT NULL,
    firstname character varying(255) COLLATE pg_catalog."C.UTF-8",
    firstname2 character varying(255) COLLATE pg_catalog."C.UTF-8",
    lastname character varying(255) COLLATE pg_catalog."C.UTF-8",
    nickname character varying(255) COLLATE pg_catalog."C.UTF-8",
    sex sex,
    birthday timestamp without time zone NOT NULL,
    deathday timestamp without time zone NOT NULL,
    address character varying(255) COLLATE pg_catalog."C.UTF-8",
    city character varying(255) COLLATE pg_catalog."C.UTF-8",
    country character varying(255) COLLATE pg_catalog."C.UTF-8",
    phone character varying(255) COLLATE pg_catalog."C.UTF-8",
    mobilephone character varying(255) COLLATE pg_catalog."C.UTF-8",
    email character varying(255) COLLATE pg_catalog."C.UTF-8",
    skype character varying(255) COLLATE pg_catalog."C.UTF-8",
    website character varying(255) COLLATE pg_catalog."C.UTF-8",
    rootfamilly root_familly,
    CONSTRAINT agenda_people_pkey PRIMARY KEY (people_id)
)
WITH ( OIDS=FALSE );
ALTER TABLE public.agenda_people OWNER TO absg;




















--
-- DATA
--

INSERT INTO public.absg_current_data (key, value) VALUES
('agpa_phase_boundaries', '1/1-24/12-26/12-27/12-28/12-30/12'),
('log_last_autocheck', '1484437405'),
('site_offline', ''),
('stat_max_user_date', '1381760130'),
('stat_max_user_online', '8'),
('stat_max_visitor_by_day', '19'),
('stat_max_visitor_date', '1387926000');



INSERT INTO public.absg_ranks (code, title, g_note) VALUES
('00', 'Fi G', 0),
('01', 'G nèse', 2),
('02', 'G né', 4),
('03', 'G volue', 6),
('04', 'Miti G', 8),
('05', 'Emer G', 10),
('06', 'Boue G', 12),
('07', 'G''sperd', 14),
('08', 'G zite', 16),
('09', 'Soula G', 18),
('10', 'G ponge', 20),
('11', 'G xplore', 22),
('12', 'G latine', 24),
('13', 'G touffe', 26),
('14', 'G trip', 28),
('15', 'G ricanne', 30),
('16', 'Ah ! L''G ri !', 32),
('17', 'New zehr G', 34),
('18', 'G orgie', 36),
('19', 'G néreux', 38),
('20', 'G tset', 40),
('21', 'T.G.V.', 42),
('22', 'Herr G', 44),
('23', 'G ronimo', 46),
('24', 'Absolument G', 48),
('25', 'G''ssy James', 50),
('26', 'Ma G llan', 52),
('27', 'Fort G', 54),
('28', 'Agré G', 56),
('29', 'Enra G', 58),
('30', 'Pur G', 60),
('31', 'Super G', 62),
('32', 'G ant', 64),
('33', 'G néral', 66),
('34', 'Ma G sté', 68),
('35', 'Au sommet du G3', 70),
('36', 'Apo G', 72),
('37', 'Hé G monie', 74),
('38', 'G zu', 76),
('39', 'Saint G', 78),
('40', 'Divinement G', 80),
('41', 'G rare', 90),
('A', 'Grand Gourou', 0),
('B', 'Vice Gourou', 0),
('C', 'Potes à G', 0),
('D', 'Mascotte', 0),
('E', 'Rang G ?', 0);


INSERT INTO public.absg_users (id, people_id, username, username_clean) VALUES
(1, 1, 'Zaffa', 'zaffa'),
(2, 2, 'Olive', 'olive'),
(3, 3, 'Frédo', 'fredo'),
(4, 4, 'Manouel', 'manouel'),
(5, 5, 'Flo', 'flo'),
(6, 6, 'Gérard', 'gerard'),
(7, 7, 'Thomas', 'thomas'),
(8, 8, 'AL1', 'al1'),
(9, 9, 'Bébé Ma''anne', 'bebe ma''anne'),
(10, 10, 'Seb', 'seb'),
(11, 11, 'Athos', 'athos'),
(12, 12, 'Annie', 'annie'),
(13, 13, 'Poupette', 'poupette'),
(14, 14, 'Die Mittlere', 'die mittlere'),
(15, 15, 'Sylve', 'sylve'),
(16, 16, 'Jul6M3', 'jul6m3'),
(17, 17, 'Phébus', 'phebus'),
(18, 18, 'Fannette', 'fannette'),
(19, 19, 'Vati', 'vati'),
(20, 20, 'Marie', 'marie'),
(21, 21, 'Marie-Cécile', 'marie-cecile'),
(22, 22, 'Isa', 'isa'),
(23, 23, 'Marceau', 'marceau'),
(24, 24, 'Eugénie', 'eugenie'),
(25, 25, 'Pierre', 'pierre'),
(26, 26, 'Gaston', 'gaston'),
(27, 27, 'Émie', 'emie'),
(28, 28, 'Augustin', 'augustin'),
(29, 29, 'Lucien', 'lucien'),
(30, 30, 'Margot', 'margot'),
(31, 31, 'Maya', 'maya'),
(32, 32, 'Gaspar', 'gaspar'),
(33, 33, 'Daphné', 'daphne'),
(35, 35, 'Louison', 'louison'),
(36, 47, 'Camille', 'camille');
