from django.db import models
from employees.models import Employee

class Article(models.Model):
    DRAFT = 'draft'
    PUBLISHED = 'published'

    STATUS_CHOICES = [
        (DRAFT, 'Draft'),
        (PUBLISHED, 'Published'),
    ]
    CATEGORY_CHOICES = [
        ('none', 'Select Article Type'),
        ('experience', 'Employee Experience'),
        ('samrika', 'Samrika'),
        ('general', 'General'),
    ]

    author = models.ForeignKey(Employee, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    content = models.TextField()
    cover_image = models.ImageField(upload_to='articles/', blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=DRAFT)
    category=models.CharField(max_length=50,choices=CATEGORY_CHOICES,blank=True,null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
