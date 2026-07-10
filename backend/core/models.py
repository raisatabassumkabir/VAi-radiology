from django.db import models

class PriorityChoices(models.TextChoices):
    LOW = 'Low', 'Low'
    MEDIUM = 'Medium', 'Medium'
    HIGH = 'High', 'High'

class StatusChoices(models.TextChoices):
    TODO = 'To Do', 'To Do'
    IN_PROGRESS = 'In Progress', 'In Progress'
    DONE = 'Done', 'Done'

class Task(models.Model):
    title = models.CharField(max_length=255)
    priority = models.CharField(max_length=10, choices=PriorityChoices.choices)
    status = models.CharField(max_length=20, choices=StatusChoices.choices)
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
