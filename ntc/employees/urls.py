from django.urls import path
from . import views

urlpatterns = [
    path('<int:id>/', views.profile, name='employee_profile'),
    path('', views.employee_list, name='employee_list'),
    path('edit-profile/', views.edit_profile, name='edit_profile'),
    path('employee/delete-profile-image/', views.delete_profile_image, name='delete_profile_image'),
]
