from django.db import models

class Task(models.Model):
    PRIORITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ]
    STATUS_CHOICES = [
        ('To Do', 'To Do'),
        ('In Progress', 'In Progress'),
        ('Done', 'Done'),
    ]
    
    title = models.CharField(max_length=255)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    due_date = models.DateField()
    tags = models.JSONField(default=list)

    def __str__(self):
        return self.title

def default_polygons():
    return []

class AnnotatedImage(models.Model):
    image = models.ImageField(upload_to='annotated_images/')
    polygons = models.JSONField(default=default_polygons)

    def __str__(self):
        return f"AnnotatedImage {self.id}"
