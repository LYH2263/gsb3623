from __future__ import annotations

import os
import subprocess
import tempfile
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
COUNT_SCRIPT = """
from django.contrib.auth import get_user_model
from knowledge.models import KnowledgeNode, KnowledgeRelation
from documents.models import Document, DocumentVersion
User = get_user_model()
print(
    "users={users},nodes={nodes},relations={relations},documents={documents},versions={versions}".format(
        users=User.objects.count(),
        nodes=KnowledgeNode.objects.count(),
        relations=KnowledgeRelation.objects.count(),
        documents=Document.objects.count(),
        versions=DocumentVersion.objects.count(),
    )
)
""".strip()


def run(cmd: list[str], env: dict[str, str] | None = None) -> None:
    merged_env = os.environ.copy()
    if env:
        merged_env.update(env)
    subprocess.run(cmd, check=True, cwd=BASE_DIR, env=merged_env)


def collect_counts(env: dict[str, str]) -> dict[str, int]:
    merged_env = os.environ.copy()
    merged_env.update(env)
    result = subprocess.run(
        ["python3", "manage.py", "shell", "-c", COUNT_SCRIPT],
        check=True,
        cwd=BASE_DIR,
        env=merged_env,
        capture_output=True,
        text=True,
    )
    text = result.stdout.strip().splitlines()
    if not text:
        raise RuntimeError("无法读取迁移计数输出")
    latest = text[-1]
    parts = latest.split(",")
    counts = {}
    for part in parts:
        key, value = part.split("=")
        counts[key] = int(value)
    return counts


def assert_counts_equal(sqlite_counts: dict[str, int], mysql_counts: dict[str, int]) -> None:
    if sqlite_counts != mysql_counts:
        raise RuntimeError(
            "迁移数据校验失败：SQLite 与 MySQL 计数不一致\n"
            f"SQLite: {sqlite_counts}\nMySQL: {mysql_counts}"
        )


def main() -> None:
    with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as tmp:
        dump_path = tmp.name

    sqlite_env = {"KGM_DB_ENGINE": "sqlite"}
    mysql_env = {
        "KGM_DB_ENGINE": "mysql",
        "KGM_MYSQL_DB": os.environ.get("KGM_MYSQL_DB", "knowledge_graph"),
        "KGM_MYSQL_USER": os.environ.get("KGM_MYSQL_USER", "kgm"),
        "KGM_MYSQL_PASSWORD": os.environ.get("KGM_MYSQL_PASSWORD", "kgm_pwd"),
        "KGM_MYSQL_HOST": os.environ.get("KGM_MYSQL_HOST", "127.0.0.1"),
        "KGM_MYSQL_PORT": os.environ.get("KGM_MYSQL_PORT", "3306"),
    }

    try:
        print("[1/5] 从 SQLite 导出数据...")
        run(
            [
                "python3",
                "manage.py",
                "dumpdata",
                "--natural-foreign",
                "--natural-primary",
                "--output",
                dump_path,
            ],
            sqlite_env,
        )

        print("[2/5] 初始化 MySQL 迁移...")
        run(["python3", "manage.py", "migrate"], mysql_env)

        print("[3/5] 导入 MySQL 数据...")
        run(["python3", "manage.py", "loaddata", dump_path], mysql_env)

        print("[4/5] 执行迁移前后数据完整性校验...")
        sqlite_counts = collect_counts(sqlite_env)
        mysql_counts = collect_counts(mysql_env)
        assert_counts_equal(sqlite_counts, mysql_counts)
        print(f"SQLite 计数: {sqlite_counts}")
        print(f"MySQL 计数: {mysql_counts}")

        print("[5/5] 迁移完成并通过完整性校验。")
    finally:
        if os.path.exists(dump_path):
            os.remove(dump_path)


if __name__ == "__main__":
    main()
