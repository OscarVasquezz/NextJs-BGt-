--
-- PostgreSQL database dump
--

\restrict JRR2U7LpLuvjLAlMPBzRdo5aqAnT94f5XMCdfJRp5gBYvrQL0QrJDejhFQK4jrb

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: tipos_cambio; Type: TABLE; Schema: public; Owner: oz
--

CREATE TABLE public.tipos_cambio (
    id integer NOT NULL,
    fecha_consulta timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_tipo_cambio date NOT NULL,
    tipo_cambio numeric(10,4) NOT NULL,
    origen_api character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tipos_cambio OWNER TO oz;

--
-- Name: tipos_cambio_id_seq; Type: SEQUENCE; Schema: public; Owner: oz
--

CREATE SEQUENCE public.tipos_cambio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tipos_cambio_id_seq OWNER TO oz;

--
-- Name: tipos_cambio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: oz
--

ALTER SEQUENCE public.tipos_cambio_id_seq OWNED BY public.tipos_cambio.id;


--
-- Name: tipos_cambio id; Type: DEFAULT; Schema: public; Owner: oz
--

ALTER TABLE ONLY public.tipos_cambio ALTER COLUMN id SET DEFAULT nextval('public.tipos_cambio_id_seq'::regclass);


--
-- Name: tipos_cambio tipos_cambio_pkey; Type: CONSTRAINT; Schema: public; Owner: oz
--

ALTER TABLE ONLY public.tipos_cambio
    ADD CONSTRAINT tipos_cambio_pkey PRIMARY KEY (id);


--
-- Name: idx_fecha_consulta; Type: INDEX; Schema: public; Owner: oz
--

CREATE INDEX idx_fecha_consulta ON public.tipos_cambio USING btree (fecha_consulta);


--
-- Name: idx_fecha_tipo_cambio; Type: INDEX; Schema: public; Owner: oz
--

CREATE INDEX idx_fecha_tipo_cambio ON public.tipos_cambio USING btree (fecha_tipo_cambio);


--
-- PostgreSQL database dump complete
--

\unrestrict JRR2U7LpLuvjLAlMPBzRdo5aqAnT94f5XMCdfJRp5gBYvrQL0QrJDejhFQK4jrb

