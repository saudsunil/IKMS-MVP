from django.urls import path
from . import views

urlpatterns = [
    path('', views.article_list, name='article_list'),
    path('<int:id>/', views.article_detail, name='article_detail'),
    path('create/', views.write_article, name='write_article'),
    path('edit-article/<int:id>/', views.edit_article, name='edit_article'),
    path('get-latest-draft/', views.get_latest_draft),

]
