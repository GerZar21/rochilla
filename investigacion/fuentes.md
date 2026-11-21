# Fuentes del contenido clínico (rehabilitación del LCA)

Investigación del 21 nov 2026. El contenido de `protocolo.json` está parafraseado; los códigos entre paréntesis son los de ese fichero.

## Fuentes leídas de verdad

| Código | Fuente | Qué se leyó | URL |
|---|---|---|---|
| ASP2023 | Aspetar CPG rehabilitación tras reconstrucción de LCA (Kotsifaki et al., BJSM 2023;57:500-514) | Texto completo (acceso abierto en PMC): todas las recomendaciones, criterios para correr y para volver | https://pmc.ncbi.nlm.nih.gov/articles/PMC11785408 |
| MOON2015 | MOON ACL Rehabilitation Guidelines (Wright et al., Sports Health 2015) | PDF con las fases 0-5 completo (copia alojada por Vanderbilt). El artículo de PMC solo en parte (las fases están en su apéndice) | PDF: https://www.vumc.org/sports-medicine/sites/vumc.org.sports-medicine/files/public_files/documents/MOON%20VSM%20ACL%20Guidelines.pdf · Artículo: https://pmc.ncbi.nlm.nih.gov/articles/PMC4482298 |
| MEL2 | Melbourne ACL Rehabilitation Guide 2.0 (Cooper & Hughes) | PDF completo de 32 páginas (copia alojada por una clínica, no la web de los autores) | https://omniafisioterapia.com/wp-content/uploads/2023/08/ACL-Guide-Melbourne-Oficial.pdf |
| NHS_MEL | St George's NHS, Patient Passport ACLR (basado en Melbourne 2.0) | Completo; sirve de contraste | https://www.stgeorges.nhs.uk/wp-content/uploads/2025/10/THE_ACL_01.pdf |
| JOSPT2017 | JOSPT CPG Knee Ligament Sprain (Logerstedt et al., 2017;47(11):A1-A47) | Resumen de recomendaciones y partes del texto | https://www.orthopt.org/uploads/content_files/files/Knee%20Ligament%20Sprain%20CPG%20-%202017.pdf |
| DO_5A | Delaware-Oslo ACL Cohort, algoritmo y resultados a 5 años (JBJS) | Texto completo (manuscrito en PMC) | https://pmc.ncbi.nlm.nih.gov/articles/PMC8376754 |
| DO_CONS | Consenso de criterios de éxito tras lesión/reconstrucción (Delaware-Oslo, BJSM) | Texto completo | https://pmc.ncbi.nlm.nih.gov/articles/PMC3900606 |

## Fuentes leídas solo en parte

| Código | Fuente | Limitación | URL |
|---|---|---|---|
| KANON2010 / 2015 / 2023 | Ensayo KANON, 2, 5 y 11 años | Solo los resúmenes (PubMed vía Europe PMC). El protocolo de rehabilitación detallado no se pudo leer | https://pubmed.ncbi.nlm.nih.gov/20660401/ · https://pubmed.ncbi.nlm.nih.gov/25926596/ · https://pubmed.ncbi.nlm.nih.gov/38320141/ |
| COPER_FITZ | Criterios de «potencial coper» (Fitzgerald, 2000) | No leída; umbrales extraídos de resúmenes de búsqueda. Verificar en el original | sin URL verificada |
| KOOS_WEB | Web oficial del KOOS | Solo la información de licencia | https://www.koos.nu |

## Qué no se pudo leer y por qué

- **Web oficial de los autores de Melbourne:** no se localizó; se usó una copia en PDF alojada por una clínica (aparenta ser la versión 2.0 oficial) y se contrastó con el folleto del NHS.
- **Texto original del artículo MOON de Sports Health y su apéndice:** PMC dio solo el artículo; las fases salieron del PDF de Vanderbilt, que se presenta como las guías MOON.
- **Protocolo detallado de KANON y de Eitzen (programa neuromuscular):** de pago o sin versión pública accesible; marcado «a criterio del fisio».
- **Señales de alarma:** ninguna de las guías leídas las desarrolla; las de `senales_de_alarma` llevan `NO_GUIAS` (conocimiento clínico general) y deben revisarlas el cirujano y el fisio.
- **Cuestionarios (ACL-RSI, IKDC, KOOS):** nº de ítems, escala y licencias no se pudieron confirmar de fuente primaria en todos los casos; ver `cuestionarios` en el JSON. PubMed bloqueó la lectura directa (cookies/captcha, no se saltó).
- La guía JOSPT es la **revisión de 2017** (no hay revisión de 2022 localizada); la propia guía preveía revisarla en 2021.

## Dónde las guías discrepan

1. **Tiempo hasta la vuelta al deporte:** MOON ~5-6 meses (sin evidencia antes de 4); Melbourne y NHS mínimo 9 meses; Aspetar sin tiempo fijo.
2. **Umbrales de simetría (LSI) para volver:** MOON 85 %, Delaware-Oslo ≥90 %, consenso >90 %, Melbourne >95 % (más ≥ datos preoperatorios), Aspetar 100 % isocinético a 60°/s para deportes de pivote y >90 % en salto.
3. **Inicio de carrera:** MOON la incluye en la fase 3 (semanas 7-12); Aspetar propone criterios (flexión 95 %, extensión completa, derrame ausente/traza, LSI cuádriceps >80 %, pogos sin dolor) y dice que no hay evidencia sobre 8, 12 o 16 semanas; Melbourne la sitúa en su fase 3, tras superar la fase 2.
4. **Cadena abierta del cuádriceps:** MOON, arco corto ligero hasta la semana 6 y 90-40° en su fase 2; Aspetar, 90-45° desde la semana 4.
5. **Flexión para avanzar de la fase 1:** MOON 110° activa; Melbourne 125° o más pasiva.
6. **Derrame:** MOON «mínimo»; Melbourne «leve» en el texto pero «cero» en la tabla de criterios.
7. **Ayudas físicas:** Aspetar recomienda NMES muy temprana, JOSPT la da como grado A durante 6-8 semanas, MOON la deja opcional.
8. **Marcha y CPM:** JOSPT permite la CPM (grado C); Aspetar y MOON la desaconsejan.
9. **Injerto:** ninguna guía da un protocolo distinto completo; Aspetar solo fija prensa desde la semana 3 con isquiotibiales.
10. **Preparación psicológica:** Melbourne exige ACL-RSI >90; JOSPT solo lo recomienda como opcional; MOON usa la pregunta 10 del IKDC.
