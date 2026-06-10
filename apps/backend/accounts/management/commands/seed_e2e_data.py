from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from documents.models import Document, DocumentVersion
from knowledge.models import KnowledgeNode, KnowledgeRelation

User = get_user_model()


class Command(BaseCommand):
    help = "创建 e2e 初始数据（可重复执行）"

    def add_arguments(self, parser):
        parser.add_argument("--silent", action="store_true")

    def handle(self, *args, **options):
        silent = options["silent"]

        admin_user, _ = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@example.com",
                "role": User.ROLE_ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.role = User.ROLE_ADMIN
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.is_active = True
        admin_user.set_password("Admin123!")
        admin_user.save()

        normal_user, _ = User.objects.get_or_create(
            username="alice",
            defaults={"email": "alice@example.com", "role": User.ROLE_USER},
        )
        normal_user.role = User.ROLE_USER
        normal_user.is_active = True
        normal_user.set_password("Alice123!")
        normal_user.save()

        other_user, _ = User.objects.get_or_create(
            username="bob",
            defaults={"email": "bob@example.com", "role": User.ROLE_USER},
        )
        other_user.role = User.ROLE_USER
        other_user.is_active = True
        other_user.set_password("Bob12345!")
        other_user.save()

        node1, _ = KnowledgeNode.objects.get_or_create(
            title="Django",
            defaults={
                "description": "Python Web 框架",
                "node_type": "技术",
                "created_by": admin_user,
            },
        )
        node2, _ = KnowledgeNode.objects.get_or_create(
            title="Vue",
            defaults={
                "description": "前端框架",
                "node_type": "技术",
                "created_by": admin_user,
            },
        )

        KnowledgeRelation.objects.get_or_create(
            source_node=node1,
            target_node=node2,
            defaults={
                "relation_type": "关联",
                "weight": 1.0,
                "description": "全栈搭配",
                "created_by": admin_user,
            },
        )

        doc, _ = Document.objects.get_or_create(
            title="Django 入门",
            defaults={
                "content": "# Django 入门\n\n这是初始文档。",
                "node": node1,
                "created_by": admin_user,
            },
        )
        if not DocumentVersion.objects.filter(document=doc).exists():
            DocumentVersion.objects.create(
                document=doc,
                content=doc.content,
                version_number=1,
                created_by=admin_user,
            )

        if not silent:
            self.stdout.write(self.style.SUCCESS("e2e seed 数据准备完成"))
