from django.urls import path
from . import views

urlpatterns = [
    path('', views.article_list, name='article_list'),
    path('create/', views.write_article, name='write_article'),
    path('get-latest-draft/', views.get_latest_draft),
    path('delete/<int:id>/', views.delete_article, name='delete_article')


]
