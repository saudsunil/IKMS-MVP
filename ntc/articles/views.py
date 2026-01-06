

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Article
from .forms import ArticleForm
from django.utils import timezone
from django.http import JsonResponse
from django.urls import reverse

@login_required
def write_article(request):
    employee = getattr(request.user, "employee", None)
    if not employee:
        return JsonResponse({"success": False, "errors": "Not allowed"})

    if request.method != "POST":
        return JsonResponse({"success": False}, status=400)

    action = request.POST.get("action", "draft")
    draft_id = request.POST.get("draft_id")

    if draft_id:
        try:
            article = Article.objects.get(id=draft_id, author=employee)
        except Article.DoesNotExist:
            article = Article(author=employee)
    else:
        article = Article(author=employee)

    form = ArticleForm(request.POST, request.FILES, instance=article)

    if not form.is_valid():
        return JsonResponse({"success": False, "errors": form.errors})

    article = form.save(commit=False)
    article.author = employee

    if action == "publish":
        if not article.title.strip() or not article.content.strip():
            return JsonResponse({
                "success": False,
                "errors": "Title and content required"
            })
        article.status = Article.PUBLISHED
    else:
        article.status = Article.DRAFT

    article.save()
    form.save_m2m()

    return JsonResponse({
        "success": True,
        "draft_id": article.id,
        "message": "Published" if action == "publish" else "Draft saved"
    })


@login_required
def get_latest_draft(request):
    employee = getattr(request.user, "employee", None)

    # 🔒 SAFETY CHECK
    if not employee:
        return JsonResponse({
            "success": False,
            "reason": "User has no employee profile"
        })

    article = (
        Article.objects
        .filter(author=employee, status=Article.DRAFT)
        .order_by('-id')
        .first()
    )

    if not article:
        return JsonResponse({'success': False})

    images = []
    if article.cover_image:
        images.append(article.cover_image.url)

    return JsonResponse({
        'success': True,
        'id': article.id,
        'title': article.title or '',
        'content': article.content or '',
        'category': article.category or '',
        'images': images,
    })


def article_list(request):
    articles = Article.objects.filter(status="published").order_by('-created_at')
    return render(request, "articles/list.html", {"articles": articles})



def article_detail(request, id):
    article = get_object_or_404(Article, id=id)
    return render(request, "articles/detail.html", {"article": article})



@login_required
def edit_article(request, id):
    article = get_object_or_404(Article, id=id, author=request.user.employee)
    if request.method == 'POST':
        form= ArticleForm(request.POST, request.FILES, instance=article)
        if form.is_valid():
            return redirect('employee_profile', request.user.employee.id)
        else:
            form =ArticleForm(instance=article)
            
        return render(request, 'articles/edit_article.html', {'form': form})