from django import forms
from .models import Employee

class EmployeeEditForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = ['employee_code', 'name', 'email', 'phone', 'department', 'office', 'position', 'biography', 'profile_image']
        widgets = {
            'employee_code': forms.TextInput(attrs={'readonly': 'readonly', 'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'department': forms.Select(attrs={'class': 'form-control'}),
            'office': forms.Select(attrs={'class': 'form-control'}),
            'position': forms.Select(attrs={'class': 'form-control'}),
            'biography': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'profile_image': forms.FileInput(attrs={'class': 'd-none', 'id': 'profile_image_input'}),
        }
