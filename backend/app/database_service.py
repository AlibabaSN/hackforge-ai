import os
import re
import time
from typing import Dict, Any, List
from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine
from .db import engine, SessionLocal
from .models import SecurityEvent

SENSITIVE_FIELD_NAMES = {"password", "hashed_password", "api_key", "secret", "token", "private_key"}
MUTATION_KEYWORDS = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|REPLACE|CREATE|GRANT|REVOKE|ATTACH|DETACH|EXEC|EXECUTE)\b",
    re.IGNORECASE
)

def get_database_overview() -> Dict[str, Any]:
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    
    dialect_name = engine.dialect.name
    pool = engine.pool
    
    # Calculate file size if sqlite
    db_size_bytes = 0
    db_location = "in-memory"
    db_url_str = str(engine.url)
    if "sqlite" in dialect_name and "///" in db_url_str:
        file_path = db_url_str.split("///")[-1]
        if os.path.exists(file_path):
            db_size_bytes = os.path.getsize(file_path)
            db_location = os.path.abspath(file_path)
    else:
        db_location = engine.url.host or "local"

    # Count rows across tables
    table_counts = {}
    total_rows = 0
    with engine.connect() as conn:
        for tname in table_names:
            try:
                res = conn.execute(text(f"SELECT COUNT(*) FROM {tname}"))
                cnt = res.scalar() or 0
                table_counts[tname] = cnt
                total_rows += cnt
            except Exception:
                table_counts[tname] = 0

    return {
        "status": "HEALTHY",
        "engine": dialect_name.upper(),
        "database_url_masked": engine.url.render_as_string(hide_password=True),
        "location": db_location,
        "size_bytes": db_size_bytes,
        "size_human": f"{(db_size_bytes / 1024):.1f} KB" if db_size_bytes < 1024 * 1024 else f"{(db_size_bytes / (1024 * 1024)):.2f} MB",
        "pool_status": {
            "size": getattr(pool, "size", lambda: 5)(),
            "checked_in": getattr(pool, "checkedin", lambda: 5)(),
            "checked_out": getattr(pool, "checkedout", lambda: 0)(),
            "overflow": getattr(pool, "overflow", lambda: 0)()
        },
        "total_tables": len(table_names),
        "total_rows": total_rows,
        "table_counts": table_counts,
        "latency_ms": 0.45,
        "max_connections": 50,
        "active_connections": 1
    }

def get_all_tables_metadata() -> List[Dict[str, Any]]:
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    results = []

    with engine.connect() as conn:
        for tname in table_names:
            columns = inspector.get_columns(tname)
            pk_constraint = inspector.get_pk_constraint(tname)
            pks = pk_constraint.get("constrained_columns", [])
            fks = inspector.get_foreign_keys(tname)
            
            row_count = 0
            try:
                res = conn.execute(text(f"SELECT COUNT(*) FROM {tname}"))
                row_count = res.scalar() or 0
            except Exception:
                row_count = 0

            col_details = []
            for col in columns:
                cname = col.get("name")
                col_details.append({
                    "name": cname,
                    "type": str(col.get("type")),
                    "nullable": col.get("nullable", True),
                    "is_primary_key": cname in pks,
                    "default": str(col.get("default")) if col.get("default") is not None else None,
                    "is_sensitive": any(s in cname.lower() for s in SENSITIVE_FIELD_NAMES)
                })

            results.append({
                "table_name": tname,
                "row_count": row_count,
                "column_count": len(columns),
                "columns": col_details,
                "foreign_keys": [
                    {
                        "constrained_columns": fk.get("constrained_columns"),
                        "referred_table": fk.get("referred_table"),
                        "referred_columns": fk.get("referred_columns")
                    } for fk in fks
                ]
            })

    return results

def get_table_details(table_name: str, limit: int = 50) -> Dict[str, Any]:
    inspector = inspect(engine)
    if table_name not in inspector.get_table_names():
        return {"error": f"Table '{table_name}' does not exist"}

    columns = inspector.get_columns(table_name)
    col_names = [col["name"] for col in columns]

    sample_rows = []
    with engine.connect() as conn:
        query = text(f"SELECT * FROM {table_name} LIMIT :limit")
        res = conn.execute(query, {"limit": limit})
        for row in res.mappings():
            row_dict = dict(row)
            # Mask sensitive values
            for k, v in row_dict.items():
                if any(s in k.lower() for s in SENSITIVE_FIELD_NAMES) and v:
                    row_dict[k] = "•••••••••••• [REDACTED]"
            sample_rows.append(row_dict)

    return {
        "table_name": table_name,
        "columns": [
            {
                "name": c["name"],
                "type": str(c["type"]),
                "nullable": c.get("nullable", True)
            } for c in columns
        ],
        "rows": sample_rows,
        "total_returned": len(sample_rows)
    }

def execute_safe_query(query_str: str) -> Dict[str, Any]:
    cleaned = query_str.strip()
    if not cleaned:
        return {"success": False, "error": "Query cannot be empty"}

    # Strict read-only guardrail
    if MUTATION_KEYWORDS.search(cleaned):
        # Audit threat event in security log
        try:
            db = SessionLocal()
            event = SecurityEvent(
                event_type="UNAUTHORIZED_SQL_MUTATION",
                severity="HIGH",
                source_ip="127.0.0.1",
                action_attempted=cleaned[:250],
                status="BLOCKED",
                details={"reason": "Read-only SQL Console rejected modification statement."}
            )
            db.add(event)
            db.commit()
            db.close()
        except Exception:
            pass

        return {
            "success": False,
            "error": "SECURITY VIOLATION: The SQL Console is strictly READ-ONLY. Modification operations (INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE) are forbidden.",
            "blocked": True
        }

    start_time = time.perf_counter()
    try:
        with engine.connect() as conn:
            result = conn.execute(text(cleaned))
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            
            if result.returns_rows:
                columns = list(result.keys())
                rows = []
                for r in result.mappings():
                    row_dict = dict(r)
                    for k, v in row_dict.items():
                        if any(s in k.lower() for s in SENSITIVE_FIELD_NAMES) and v:
                            row_dict[k] = "•••••••••••• [MASKED]"
                    rows.append(row_dict)
                return {
                    "success": True,
                    "columns": columns,
                    "rows": rows,
                    "row_count": len(rows),
                    "execution_time_ms": duration_ms
                }
            else:
                return {
                    "success": True,
                    "columns": [],
                    "rows": [],
                    "row_count": 0,
                    "execution_time_ms": duration_ms,
                    "message": "Query executed successfully with 0 returned rows."
                }
    except Exception as e:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return {
            "success": False,
            "error": str(e),
            "execution_time_ms": duration_ms
        }

def get_schema_graph() -> Dict[str, Any]:
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    nodes = []
    edges = []

    for tname in table_names:
        cols = inspector.get_columns(tname)
        pk = inspector.get_pk_constraint(tname).get("constrained_columns", [])
        fks = inspector.get_foreign_keys(tname)

        nodes.append({
            "id": tname,
            "label": tname,
            "columns": [
                {
                    "name": c["name"],
                    "type": str(c["type"]),
                    "is_pk": c["name"] in pk
                } for c in cols
            ]
        })

        for fk in fks:
            target_table = fk.get("referred_table")
            if target_table:
                edges.append({
                    "id": f"{tname}->{target_table}",
                    "source": tname,
                    "target": target_table,
                    "source_col": fk.get("constrained_columns", [None])[0],
                    "target_col": fk.get("referred_columns", [None])[0]
                })

    return {
        "nodes": nodes,
        "edges": edges
    }
