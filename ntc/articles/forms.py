from django import forms
from .models import Article

class ArticleForm(forms.ModelForm):
    class Meta:
        model = Article
        fields = ['title', 'content', 'cover_image', 'category']
        widgets = {
            'title': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Title'}),
            'content': forms.Textarea(attrs={'class': 'form-control', 'placeholder': 'Write your article...', 'rows': 4}),
            'category': forms.Select(attrs={'class': 'form-select'}),
        }

    # Make all fields optional (for draft saving)
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.required = False
        self.fields['category'].choices = Article.CATEGORY_CHOICES
        self.fields['category'].widget.choices = Article.CATEGORY_CHOICES