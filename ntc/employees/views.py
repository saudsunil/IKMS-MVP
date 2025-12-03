
from django.shortcuts import render, get_object_or_404
from articles.models import Employee

from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from .models import Employee
from django.contrib.auth.decorators import login_required
from .forms import EmployeeEditForm


def profile(request, id):
    employee = get_object_or_404(Employee, id=id)
    return render(request, 'employees/profile.html', {'employee': employee})

def employee_list(request):
    employees = Employee.objects.all()
    return render(request, 'employees/list.html', {'employees': employees})




    


@login_required
def edit_profile(request):
    try:
        employee = request.user.employee
    except Employee.DoesNotExist:
        return redirect('homepage')

    if request.method == 'POST':
        form = EmployeeEditForm(request.POST, request.FILES, instance=employee)
        if form.is_valid():
            form.save()
            return redirect('homepage')
    else:
        form = EmployeeEditForm(instance=employee)

    return render(request, 'employees/edit_profile.html', {'form': form})



@login_required
def delete_profile_image(request):
    employee = request.user.employee  # Assuming OneToOneField from User to Employee
    if employee.profile_image:
        employee.profile_image.delete(save=True)  # deletes file and clears field
    return JsonResponse({'status': 'success'})

from django.http import JsonResponse
