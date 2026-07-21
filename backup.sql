--
-- PostgreSQL database dump
--

\restrict 4oRcxZN2No3z6L4HlpdIct8YF4KLf98170miC5XtDEWFHA0i6ka35hec7Hu8cHV

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Buyer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Buyer" (
    id integer NOT NULL,
    name text NOT NULL,
    mobile text NOT NULL,
    address text NOT NULL,
    gst text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Buyer" OWNER TO postgres;

--
-- Name: Buyer_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Buyer_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Buyer_id_seq" OWNER TO postgres;

--
-- Name: Buyer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Buyer_id_seq" OWNED BY public."Buyer".id;


--
-- Name: Company; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Company" (
    id integer DEFAULT 1 NOT NULL,
    "companyName" text NOT NULL,
    "gstNumber" text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    pincode text NOT NULL,
    phone text,
    email text,
    website text,
    "bankName" text,
    "accountName" text,
    "accountNumber" text,
    "ifscCode" text,
    branch text,
    "upiId" text,
    logo text,
    signature text,
    terms text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "panNumber" text
);


ALTER TABLE public."Company" OWNER TO postgres;

--
-- Name: Purchase; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Purchase" (
    id integer NOT NULL,
    "supplierId" integer NOT NULL,
    "vehicleId" integer NOT NULL,
    material text NOT NULL,
    quantity double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Purchase" OWNER TO postgres;

--
-- Name: Purchase_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Purchase_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Purchase_id_seq" OWNER TO postgres;

--
-- Name: Purchase_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Purchase_id_seq" OWNED BY public."Purchase".id;


--
-- Name: Sale; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Sale" (
    id integer NOT NULL,
    "buyerId" integer NOT NULL,
    "invoiceNo" text NOT NULL,
    "invoiceDate" timestamp(3) without time zone NOT NULL,
    "vehicleNo" text NOT NULL,
    "ewayBillNo" text,
    "shipToAddress" text,
    quantity double precision NOT NULL,
    rate double precision NOT NULL,
    amount double precision NOT NULL,
    "gstPercent" double precision NOT NULL,
    "gstAmount" double precision NOT NULL,
    total double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Sale" OWNER TO postgres;

--
-- Name: Sale_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Sale_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Sale_id_seq" OWNER TO postgres;

--
-- Name: Sale_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Sale_id_seq" OWNED BY public."Sale".id;


--
-- Name: Supplier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Supplier" (
    id integer NOT NULL,
    name text NOT NULL,
    mobile text NOT NULL,
    village text NOT NULL,
    gst text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Supplier" OWNER TO postgres;

--
-- Name: Supplier_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Supplier_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Supplier_id_seq" OWNER TO postgres;

--
-- Name: Supplier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Supplier_id_seq" OWNED BY public."Supplier".id;


--
-- Name: Vehicle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Vehicle" (
    id integer NOT NULL,
    "vehicleNumber" text NOT NULL,
    "ownerName" text NOT NULL,
    "vehicleType" text NOT NULL,
    status text DEFAULT 'Active'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Vehicle" OWNER TO postgres;

--
-- Name: Vehicle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Vehicle_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Vehicle_id_seq" OWNER TO postgres;

--
-- Name: Vehicle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Vehicle_id_seq" OWNED BY public."Vehicle".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: Buyer id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Buyer" ALTER COLUMN id SET DEFAULT nextval('public."Buyer_id_seq"'::regclass);


--
-- Name: Purchase id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Purchase" ALTER COLUMN id SET DEFAULT nextval('public."Purchase_id_seq"'::regclass);


--
-- Name: Sale id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale" ALTER COLUMN id SET DEFAULT nextval('public."Sale_id_seq"'::regclass);


--
-- Name: Supplier id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Supplier" ALTER COLUMN id SET DEFAULT nextval('public."Supplier_id_seq"'::regclass);


--
-- Name: Vehicle id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vehicle" ALTER COLUMN id SET DEFAULT nextval('public."Vehicle_id_seq"'::regclass);


--
-- Data for Name: Buyer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Buyer" (id, name, mobile, address, gst, "createdAt") FROM stdin;
1	Aman Timbers	7665770077	Ardi Amba Near New Bus Stand, Partapur Dist. Banswara, Rajasthan 327024	08AOBPS0402F1ZF	2026-07-13 14:13:06.143
\.


--
-- Data for Name: Company; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Company" (id, "companyName", "gstNumber", address, city, state, pincode, phone, email, website, "bankName", "accountName", "accountNumber", "ifscCode", branch, "upiId", logo, signature, terms, "createdAt", "updatedAt", "panNumber") FROM stdin;
1	SS GREEN FUELS	08NMUPS9313F1Z3	Kh. No. 3516,3522 Garhi-Parsoliya Road 	Garhi	Rajasthan	327022	+91 8949185698	office@ssgreenfuels.in	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-07-13 10:11:38.242	2026-07-13 18:13:26.804	\N
\.


--
-- Data for Name: Purchase; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Purchase" (id, "supplierId", "vehicleId", material, quantity, "createdAt") FROM stdin;
1	1	1	Firewood	10531	2026-07-13 10:13:20.526
2	2	2	Neem	5457	2026-07-14 10:16:51.392
\.


--
-- Data for Name: Sale; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Sale" (id, "buyerId", "invoiceNo", "invoiceDate", "vehicleNo", "ewayBillNo", "shipToAddress", quantity, rate, amount, "gstPercent", "gstAmount", total, "createdAt") FROM stdin;
2	1	2026-27/002	2026-07-14 00:00:00	RJ27CG0853	8758 6465 6566	Ardi Amba Near New Bus Stand, Partapur Dist. Banswara, Rajasthan 327022	24200	9.5	229900	5	11495	241395	2026-07-14 17:20:58.02
1	1	2026-27/001	2026-07-13 00:00:00	RJ03UB0002	4686 8867 6499	Ardi Amba Near New Bus Stand, Partapur Dist. Banswara, Rajasthan 327022	21824	10	218240	5	10912	229152	2026-07-13 14:13:35.137
\.


--
-- Data for Name: Supplier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Supplier" (id, name, mobile, village, gst, "createdAt") FROM stdin;
1	AMAN TIMBERS	7665770077	PARTAPUR	08AOBPS0402F1ZF	2026-07-13 10:12:55.618
2	HARISH CHARPOTA	9950585835	PARTAPUR	URP	2026-07-14 10:16:35.142
\.


--
-- Data for Name: Vehicle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Vehicle" (id, "vehicleNumber", "ownerName", "vehicleType", status, "createdAt") FROM stdin;
1	RJ03UB0002	JASMEET KAUR		Active	2026-07-13 10:13:07.988
2	HR26AM0728	PRABHJYOT SINGH		Active	2026-07-14 10:16:07.111
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a440558f-5fb7-4922-af2c-a917a7c163c6	3943b13c504cf48c2c1a2c09e6a83e362fed30817031ff6ec5f9583fa2ddc970	2026-07-13 15:40:10.956133+05:30	20260713101010_add_company_settings	\N	\N	2026-07-13 15:40:10.647333+05:30	1
\.


--
-- Name: Buyer_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Buyer_id_seq"', 1, true);


--
-- Name: Purchase_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Purchase_id_seq"', 2, true);


--
-- Name: Sale_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Sale_id_seq"', 2, true);


--
-- Name: Supplier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Supplier_id_seq"', 2, true);


--
-- Name: Vehicle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Vehicle_id_seq"', 2, true);


--
-- Name: Buyer Buyer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Buyer"
    ADD CONSTRAINT "Buyer_pkey" PRIMARY KEY (id);


--
-- Name: Company Company_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_pkey" PRIMARY KEY (id);


--
-- Name: Purchase Purchase_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_pkey" PRIMARY KEY (id);


--
-- Name: Sale Sale_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_pkey" PRIMARY KEY (id);


--
-- Name: Supplier Supplier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Supplier"
    ADD CONSTRAINT "Supplier_pkey" PRIMARY KEY (id);


--
-- Name: Vehicle Vehicle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vehicle"
    ADD CONSTRAINT "Vehicle_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Sale_invoiceNo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Sale_invoiceNo_key" ON public."Sale" USING btree ("invoiceNo");


--
-- Name: Vehicle_vehicleNumber_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Vehicle_vehicleNumber_key" ON public."Vehicle" USING btree ("vehicleNumber");


--
-- Name: Purchase Purchase_supplierId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES public."Supplier"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Purchase Purchase_vehicleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Purchase"
    ADD CONSTRAINT "Purchase_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES public."Vehicle"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Sale Sale_buyerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Sale"
    ADD CONSTRAINT "Sale_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES public."Buyer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 4oRcxZN2No3z6L4HlpdIct8YF4KLf98170miC5XtDEWFHA0i6ka35hec7Hu8cHV

