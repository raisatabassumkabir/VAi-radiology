from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from datetime import date
from .models import Task, PriorityChoices, StatusChoices

class TaskAPITestCase(TestCase):
    """
    Test suite for the Task API.
    """
    def setUp(self) -> None:
        self.client = APIClient()
        self.task_list_url = reverse('task-list')
        
        # Create some test tasks
        self.task1 = Task.objects.create(
            title="Task One",
            priority=PriorityChoices.LOW,
            status=StatusChoices.TODO,
            due_date=date(2026, 7, 6),
            tags=["tag1", "tag2"]
        )
        self.task2 = Task.objects.create(
            title="Task Two",
            priority=PriorityChoices.HIGH,
            status=StatusChoices.IN_PROGRESS,
            due_date=date(2026, 7, 7),
            tags=["tag3"]
        )
        self.task3 = Task.objects.create(
            title="Task Three",
            priority=PriorityChoices.MEDIUM,
            status=StatusChoices.DONE,
            due_date=date(2026, 7, 6),
            tags=["tag1"]
        )

    def test_get_all_tasks(self) -> None:
        """
        Verify that GET /api/tasks/ returns all tasks.
        """
        response = self.client.get(self.task_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

    def test_filter_tasks_by_date(self) -> None:
        """
        Verify that GET /api/tasks/?date=2026-07-06 returns only tasks on that date.
        """
        response = self.client.get(self.task_list_url, {'date': '2026-07-06'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return task1 and task3 (2 tasks total)
        self.assertEqual(len(response.data), 2)
        titles = [task['title'] for task in response.data]
        self.assertIn("Task One", titles)
        self.assertIn("Task Three", titles)
        self.assertNotIn("Task Two", titles)

    def test_filter_tasks_by_invalid_date_format(self) -> None:
        """
        Verify that GET /api/tasks/?date=invalid-date returns HTTP 400 with validation error.
        """
        response = self.client.get(self.task_list_url, {'date': 'invalid-date'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date', response.data)
        self.assertIn('Invalid date format', response.data['date'])

    def test_filter_tasks_by_out_of_range_date(self) -> None:
        """
        Verify that GET /api/tasks/?date=2026-02-30 (invalid day) returns HTTP 400.
        """
        response = self.client.get(self.task_list_url, {'date': '2026-02-30'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('date', response.data)
