from django.urls import path
from . import views

urlpatterns = [
    path('add/<int:article_id>/', views.add_comment, name='add_comment'),
    path('reply/<int:comment_id>/', views.reply_comment, name='reply_comment'),
    path('edit/<int:comment_id>/', views.edit_comment),
    path('edit-reply/<int:reply_id>/', views.edit_reply),
]