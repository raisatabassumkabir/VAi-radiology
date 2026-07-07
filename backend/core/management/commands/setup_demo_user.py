from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Creates a demo user for the 404 Project Not Found application'

    def handle(self, *args, **kwargs):
        email = 'demo@epic.com'
        password = 'Warrior123!'
        
        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Demo user {email} already exists.'))
            return
            
        # We also need a username, we'll just use the email prefix
        username = 'demo_user'
        user = User.objects.create_user(username=username, email=email, password=password)
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created demo user!'))
        self.stdout.write(self.style.SUCCESS(f'Email: {email}'))
        self.stdout.write(self.style.SUCCESS(f'Password: {password}'))
