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
from django.db import transaction, IntegrityError


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








def signup_view(request):
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        email= request.POST.get('email', '').strip()
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirm_password')
        
        if password != confirm_password:
            return render(request, 'core/signup.html', {'error': 'Passwords do not match'})
        
        if User.objects.filter(username=username).exists():
            return render(request, 'core/signup.html', {'error': 'Username already exists. Please choose another'})
        
        if User.objects.filter(email=email).exists():
            return render(request, 'core/signup.html', {'error': 'Sorry email already in use. Please use a different email address'})
        
        try:
            with transaction.atomic():
                 user = User.objects.create_user(
                     username=username,
                     password=password,
                     email=email
                 )
                
                 
        except IntegrityError as e:
            print("INTEGRITY ERROR >>>", e)
            return render(request, 'core/signup.html', {
                'error': 'Email or employee code already exists'
            })
            
        except Exception as e:
            print("SIGNUP ERROR >>>", e)
            return render(request, 'core/signup.html', {
                'error': 'An error occurred during registration. Please try again.'
            })
            
        login(request, user)
        return redirect('edit_profile')
    return render(request, 'core/signup.html')
        
        
def logout_view(request):
    logout(request)  # logs out the user
    return redirect('login')  # redirect to homepage


