
from django.shortcuts import render, get_object_or_404
from articles.models import Employee

from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from .models import Employee
from django.contrib.auth.decorators import login_required
from .forms import EmployeeEditForm


from articles.models import Article

def profile(request, id):
    employee = get_object_or_404(Employee, id=id)
    articles = Article.objects.filter(author=employee, status=Article.PUBLISHED).order_by('-created_at').prefetch_related(
        'comments',
        'comments__author',
    )

 
    
    #add a 'top_comments' property dynamically (for compatibility with template)
    for article in articles:
     article.top_comments = article.comments.filter(parent__isnull=True).order_by('-created_at')
    
    return render(request, 'employees/profile.html', {
        'employee': employee,
        'articles': articles
    })

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
            return redirect('employee_profile', id=employee.id)
    else:
        form = EmployeeEditForm(instance=employee)

    return render(request, 'employees/edit_profile.html', {'form': form})



@login_required
def delete_profile_image(request):
    employee = request.user.employee  # Assuming OneToOneField from User to Employee
    if employee.profile_image:
        employee.profile_image.delete(save=True)  # deletes file and clears field
    return JsonResponse({'status': 'success'})


