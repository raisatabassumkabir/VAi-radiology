# pyrefly: ignore [missing-import]
from django.contrib import admin
from .models import Task, AnnotatedImage

# Register your models here so they show up in the Admin dashboard
admin.site.register(Task)
admin.site.register(AnnotatedImage)
