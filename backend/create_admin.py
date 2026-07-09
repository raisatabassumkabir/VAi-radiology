import os
import django

# Set up Django environment so we can access the database
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_project.settings')
django.setup()

from django.contrib.auth.models import User

# Check if the admin account already exists in the cloud SQLite file
if not User.objects.filter(username='admin').exists():
    print("Creating automagic cloud superuser 'admin'...")
    User.objects.create_superuser('admin', 'admin@epic.com', 'epicstudio2026')
    print("Cloud superuser created successfully! 🎉")
else:
    print("Cloud superuser 'admin' already exists. Skipping...")
