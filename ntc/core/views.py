from django.shortcuts import render, redirect
from articles.models import Article, Employee
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.conf import settings
import random
import string
from articles.forms import ArticleForm

from django.http import JsonResponse

# homepage view
def homepage(request):
    articles = Article.objects.filter(status='published').order_by('-created_at')

    employee = None
    if request.user.is_authenticated:
        employee = getattr(request.user, 'employee', None)

        form = ArticleForm()  # ADD THIS
    else:
        form = None
    for article in articles:
        article.top_comments = article.comments.filter(parent__isnull=True).order_by('-created_at')
    return render(request, 'core/home.html', {
        'articles': articles,
        'employee': employee,
        'form': form,      # ADD THIS
    })



# Login view


def login_view(request):
    error = None
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)  # <-- logs the user in
            return redirect('homepage')
        else:
            error = "Invalid username or password"
    return render(request, 'core/login.html', {'error': error})

# Signup view


def signup_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        confirm_password = request.POST['confirm_password']
        email = request.POST['email']

        if password != confirm_password:
            return render(request, 'core/signup.html', {'error': 'Passwords do not match'})

        if User.objects.filter(username=username).exists():
            return render(request, 'core/signup.html', {'error': 'Username already exists'})

        # 1️⃣ Create User
        user = User.objects.create_user(username=username, password=password, email=email)

        # 2️⃣ Generate unique employee code
        emp_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        
        # 3️⃣ Create Employee linked to this user
        Employee.objects.create(
            user=user,
            name=username,        # default name is username; can edit later
            email=email,
            employee_code=emp_code
        )

        # 4️⃣ Send email to user with employee code
        send_mail(
            'Your Employee Code',
            f'Hello {username}, your employee code is {emp_code}.',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=True,
        )

        # 5️⃣ Authenticate and login the user immediately
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            return redirect('homepage')

    return render(request, 'core/signup.html')

def logout_view(request):
    logout(request)  # logs out the user
    return redirect('homepage')  # redirect to homepag




# @login_required
# def edit_profile(request):
#     try:
#         employee = request.user.employee
#     except Employee.DoesNotExist:
#         return redirect('homepage')

#     if request.method == 'POST':
#         form = EmployeeEditForm(request.POST, request.FILES, instance=employee)
#         if form.is_valid():
#             form.save()
#             return redirect('homepage')
#     else:
#         form = EmployeeEditForm(instance=employee)

#     return render(request, 'core/edit_profile.html', {'form': form})



# @login_required
# def delete_profile_image(request):
#     employee = request.user.employee  # Assuming OneToOneField from User to Employee
#     if employee.profile_image:
#         employee.profile_image.delete(save=True)  # deletes file and clears field
#     return JsonResponse({'status': 'success'})