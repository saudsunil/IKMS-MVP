from django.contrib import admin
from .models import Department, Office, Position, Employee

admin.site.register(Department)
admin.site.register(Office)
admin.site.register(Position)
admin.site.register(Employee)
