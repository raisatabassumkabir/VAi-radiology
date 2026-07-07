from rest_framework import viewsets, serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from datetime import datetime
from django.db.models import QuerySet
from .models import Task, AnnotatedImage
from .serializers import TaskSerializer, AnnotatedImageSerializer

class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        if not email or not password:
            return Response({'error': 'Please provide email and password'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
            
        if not user.check_password(password):
            return Response({'error': 'Invalid email or password'}, status=status.HTTP_401_UNAUTHORIZED)
            
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})

class TaskViewSet(viewsets.ModelViewSet):
    """
    A viewset that provides default list, create, retrieve, update, and destroy actions for Task.
    Supports filtering by 'date' query parameter with format YYYY-MM-DD.
    """
    permission_classes = [AllowAny] # Temporarily AllowAny for testing
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def get_queryset(self) -> QuerySet[Task]:
        """
        Optionally restricts the returned tasks to a given date,
        by filtering against a `date` query parameter in the URL.
        """
        queryset = super().get_queryset()
        date_str = self.request.query_params.get('date', None)
        
        if date_str is not None:
            try:
                # Validate the date format
                parsed_date = datetime.strptime(date_str, "%Y-%m-%d").date()
                queryset = queryset.filter(due_date=parsed_date)
            except ValueError:
                # Robust validation error with HTTP 400
                raise serializers.ValidationError({
                    "date": "Invalid date format or value. Please use YYYY-MM-DD (e.g. 2026-07-06)."
                })
        
        return queryset

class AnnotatedImageViewSet(viewsets.ModelViewSet):
    """
    A viewset that provides default list, create, retrieve, update, and destroy actions for AnnotatedImage.
    """
    permission_classes = [AllowAny] # Temporarily AllowAny for testing
    queryset = AnnotatedImage.objects.all()
    serializer_class = AnnotatedImageSerializer
