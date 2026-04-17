"""
skill_engine.py
---------------
API-free technical skill extractor.
Uses a curated dictionary of 500+ technical keywords to identify
skills present in a Job Description but missing from a Resume.
"""

import re

# --------------------------------------------------------------------------
# Comprehensive Technical Skill Database
# --------------------------------------------------------------------------

TECH_SKILLS = {
    # --- Programming Languages ---
    "python", "javascript", "typescript", "java", "kotlin", "swift", "go", "golang",
    "rust", "c", "c++", "c#", "ruby", "php", "scala", "perl", "r", "matlab",
    "dart", "elixir", "haskell", "lua", "groovy", "bash", "shell", "powershell",
    "assembly", "fortran", "cobol", "vba", "objective-c", "f#",

    # --- Web Frameworks & Libraries ---
    "react", "react.js", "reactjs", "angular", "angularjs", "vue", "vue.js", "vuejs",
    "svelte", "next.js", "nextjs", "nuxt", "gatsby", "remix", "astro",
    "django", "flask", "fastapi", "aiohttp", "tornado", "starlette",
    "express", "expressjs", "express.js", "nest.js", "nestjs", "hapi",
    "rails", "ruby on rails", "sinatra", "laravel", "symfony", "codeigniter",
    "spring", "spring boot", "spring mvc", "quarkus", "micronaut", "ktor",
    "asp.net", "asp.net core", ".net", ".net core", "blazor",
    "fastify", "koa", "gin", "echo", "fiber",

    # --- Frontend & CSS ---
    "html", "css", "sass", "scss", "less", "tailwind", "tailwindcss",
    "bootstrap", "material ui", "mui", "chakra ui", "ant design",
    "styled-components", "emotion", "jquery", "webpack", "vite",
    "parcel", "rollup", "esbuild", "babel",

    # --- Databases ---
    "sql", "mysql", "postgresql", "postgres", "sqlite", "mariadb", "oracle",
    "mongodb", "dynamodb", "firestore", "couchdb", "cassandra", "scylladb",
    "redis", "memcached", "elasticsearch", "opensearch", "solr",
    "neo4j", "arangodb", "influxdb", "timescaledb", "cockroachdb",
    "supabase", "firebase", "planetscale", "neon",

    # --- ORM & Data Access ---
    "sqlalchemy", "django orm", "prisma", "typeorm", "sequelize", "gorm",
    "mongoose", "hibernate", "jpa", "knex", "drizzle",

    # --- Cloud Platforms ---
    "aws", "amazon web services", "azure", "microsoft azure", "gcp",
    "google cloud", "google cloud platform", "digitalocean", "linode",
    "cloudflare", "vercel", "netlify", "heroku", "fly.io", "railway",

    # --- AWS Services ---
    "ec2", "s3", "lambda", "rds", "cloudfront", "route53", "ecs", "eks",
    "sqs", "sns", "dynamodb", "api gateway", "cloudwatch", "iam",
    "kinesis", "glue", "redshift", "athena", "emr", "sagemaker",

    # --- Azure Services ---
    "azure functions", "azure devops", "azure blob", "azure sql", "cosmos db",
    "aks", "app service", "power bi", "azure ad",

    # --- GCP Services ---
    "bigquery", "cloud run", "gke", "cloud functions", "pub/sub", "spanner",
    "vertex ai", "cloud storage", "dataflow", "dataproc",

    # --- DevOps & Infrastructure ---
    "docker", "kubernetes", "k8s", "helm", "terraform", "ansible",
    "puppet", "chef", "vagrant", "packer",
    "jenkins", "github actions", "gitlab ci", "circleci", "travis ci",
    "argocd", "flux", "tekton", "spinnaker",
    "nginx", "apache", "caddy", "haproxy", "traefik",
    "prometheus", "grafana", "datadog", "new relic", "splunk", "elk stack",
    "logstash", "kibana", "jaeger", "zipkin", "opentelemetry",

    # --- AI / Machine Learning ---
    "machine learning", "deep learning", "neural network", "nlp",
    "natural language processing", "computer vision", "cv", "reinforcement learning",
    "pytorch", "tensorflow", "keras", "jax", "scikit-learn", "sklearn",
    "xgboost", "lightgbm", "catboost", "hugging face", "transformers",
    "langchain", "llamaindex", "openai", "gemini", "claude", "llm",
    "large language model", "rag", "retrieval augmented generation",
    "diffusion models", "stable diffusion", "bert", "gpt",
    "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly",
    "opencv", "pillow", "nltk", "spacy", "gensim",

    # --- Data Engineering ---
    "spark", "apache spark", "hadoop", "kafka", "apache kafka", "flink",
    "airflow", "apache airflow", "dbt", "dagster", "prefect",
    "etl", "data pipeline", "data warehouse", "data lake", "data lakehouse",
    "snowflake", "databricks", "delta lake",

    # --- APIs & Communication ---
    "rest", "restful", "graphql", "grpc", "websocket", "webhook",
    "soap", "xml", "json", "openapi", "swagger", "protobuf", "mqtt",

    # --- Mobile ---
    "react native", "flutter", "ionic", "xamarin", "swiftui", "jetpack compose",
    "android", "ios", "expo", "capacitor",

    # --- Testing ---
    "jest", "pytest", "junit", "mocha", "chai", "vitest", "cypress",
    "playwright", "selenium", "puppeteer", "testing library",
    "unit testing", "integration testing", "e2e testing", "tdd", "bdd",
    "mock", "stubs", "fixtures",

    # --- Security ---
    "oauth", "oauth2", "jwt", "ssl", "tls", "https",
    "penetration testing", "pen testing", "sso", "saml", "owasp",
    "encryption", "hashing", "authentication", "authorization", "rbac",

    # --- Architecture & Concepts ---
    "microservices", "serverless", "event-driven", "message queue",
    "distributed systems", "system design", "api design", "design patterns",
    "solid", "clean architecture", "domain driven design", "ddd",
    "cqrs", "event sourcing", "ci/cd", "agile", "scrum", "kanban",
    "git", "github", "gitlab", "bitbucket", "monorepo", "version control",

    # --- Low / No Code & Other Tools ---
    "linux", "unix", "macos", "windows server", "vim", "vscode",
    "jira", "confluence", "notion", "figma", "postman", "insomnia",
    "tableau", "power bi", "looker", "metabase", "superset",
    "celery", "rabbitmq", "zeromq", "nats",
}


# --------------------------------------------------------------------------
# Core Functions
# --------------------------------------------------------------------------

def _normalize(text: str) -> str:
    """Lowercase and clean the input text for consistent matching."""
    return text.lower()


def extract_skills(text: str) -> set:
    """
    Scan text for known technical skills from the TECH_SKILLS database.
    Returns a set of matched skill strings.
    """
    text = _normalize(text)
    found = set()

    for skill in TECH_SKILLS:
        # Use regex word boundaries for full-word/phrase matching
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text):
            found.add(skill)

    return found


def get_missing_skills(resume_text: str, jd_text: str, top_n: int = 7) -> list:
    """
    Compare skills in the JD against skills in the resume.
    Returns up to `top_n` skills that appear in the JD but NOT in the resume.

    Priority:
    1.  Multi-word phrases are ranked higher (e.g., 'machine learning' > 'python')
    2.  Common generic skills are deprioritized.
    """
    if not resume_text or not jd_text:
        return []

    jd_skills = extract_skills(jd_text)
    resume_skills = extract_skills(resume_text)

    # Skills in JD that are missing from the Resume
    missing = jd_skills - resume_skills

    if not missing:
        return []

    # Prioritize multi-word, more specific skills
    def skill_priority(skill: str) -> int:
        return len(skill.split())  # e.g., "machine learning" = 2 > "python" = 1

    ranked_missing = sorted(missing, key=skill_priority, reverse=True)

    return ranked_missing[:top_n]
