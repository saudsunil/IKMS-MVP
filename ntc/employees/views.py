from django.shortcuts import render, get_object_or_404
from articles.models import Employee

def profile(request, id):
    employee = get_object_or_404(Employee, id=id)
    return render(request, 'employees/profile.html', {'employee': employee})

def employee_list(request):
    employees = Employee.objects.all()
    return render(request, 'employees/list.html', {'employees': employees})


