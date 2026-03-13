Resumen completo de la sesion
1. Error handling backend → frontend (objetivo inicial)
Archivo	Cambio
config.py:35	Nuevo setting environment (default "development")
main.py:63-103	Exception handler para ValidationError → 422, handler general en dev → 500 con traceback completo, ambos con CORS headers
2. Investigacion y fix del "Failed to fetch"
Se descubrieron 3 problemas encadenados:

Token JWT expirado + MSAL refresh crasheaba sin try/catch → "Failed to fetch" genérico
CORS bloqueaba respuestas 500 — el backend crasheaba pero la respuesta no tenía headers CORS → browser no podía leer el error
short_description > 200 chars — Pydantic lanzaba ValidationError que no era HTTPException → 500 sin CORS → "Failed to fetch"
Archivo	Cambio
api.client.ts:19-25	try/catch en MSAL token refresh para que no crashee
SkillDetailsForm.tsx:115	console.error en catch + mejor extraccion del error message en rama else
3. Ampliacion de short_description a 600 chars
Archivo	Cambio
constants.py	Fuente unica de verdad: DISPLAY_NAME_MAX_LENGTH = 150, SHORT_DESCRIPTION_MAX_LENGTH = 600, MAX_TAGS_PER_SKILL = 10
skill_create_request.py	max_length desde constantes (antes era 200 literal)
skill_update_request.py	Idem
skill.py	Modelo SQLAlchemy usa constantes
frontmatter_service.py:65-73	Importa constante, trunca a 597+"..." si excede 600
migracion Alembic	ALTER COLUMN VARCHAR(200) → VARCHAR(600) (ya aplicada)
SkillDetailsForm.tsx:28	MAX_SHORT_DESCRIPTION = 600 (antes 200)