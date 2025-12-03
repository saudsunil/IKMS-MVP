

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
        return JsonResponse({"success": False, "errors": "You are not allowed to write articles."})

    if request.method == "POST":
        form = ArticleForm(request.POST, request.FILES)
        action = request.POST.get("action", "draft")  # default to draft

        if form.is_valid():
            article = form.save(commit=False)
            article.author = employee

            # Set status
            if action == "publish":
                if not article.title or not article.content:
                    return JsonResponse({
                        "success": False,
                        "errors": "Title and content required for publishing"
                    })
                article.status = Article.PUBLISHED
            else:
                article.status = Article.DRAFT

            article.save()

            # Response for frontend
            if action == "draft":
                return JsonResponse({
                    "success": True,
                    "draft_id": article.id,
                    "message": "Draft saved"
                })
            else:
                return JsonResponse({
                    "success": True,
                    "redirect": reverse("homepage"),
                    "message": "Published successfully"
                })

        # Invalid form
        return JsonResponse({"success": False, "errors": form.errors})

    else:
        form = ArticleForm()

    return render(request, "base.html", {"form": form, "employee": employee})


def article_list(request):
    articles = Article.objects.filter(status="published").order_by('-created_at')
    return render(request, "articles/list.html", {"articles": articles})



def article_detail(request, id):
    article = get_object_or_404(Article, id=id)
    return render(request, "articles/detail.html", {"article": article})