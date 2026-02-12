from django.db import models
from django.contrib.auth.models import User
import random
import string

class Department(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Office(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Position(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


def generate_employee_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True)
    office = models.ForeignKey(Office, on_delete=models.SET_NULL, null=True)
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True)
    employee_code = models.CharField(max_length=50, unique=True, blank=True)
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    biography = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    
    def save(self, *args, **kwargs):
        if not self.employee_code:
            while True:
                code = generate_employee_code()
                if not Employee.objects.filter(employee_code=code).exists():
                    self.employee_code = code
                    break
        super().save(*args, **kwargs)
        
        
    def __str__(self):
        return self.name
