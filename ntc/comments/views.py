from django.shortcuts import get_object_or_404, redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import Comment
from articles.models import Article
from django.views.decorators.csrf import csrf_exempt
import json
from django.views.decorators.http import require_POST
from django.utils import timezone




@login_required

@login_required
def add_comment(request, article_id):
    if request.method != "POST":
        return JsonResponse({"success": False, "error": "Invalid request"}, status=400)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)

    body = data.get('body', '').strip()
    if not body:
        return JsonResponse({"success": False, "error": "Empty comment"})

    article = get_object_or_404(Article, id=article_id)
    author = request.user.employee

    comment = Comment.objects.create(
        article=article,
        author=author,
        body=body
    )

    return JsonResponse({
        "success": True,
        "id": comment.id,
        "username": getattr(author, "name", str(author)),
        "profile_image": author.profile_image.url if author.profile_image else "",
        "body": comment.body,
        "created_at": comment.created_at.isoformat(),
        "parent": None,              # MAIN COMMENT
        "parent_author": "",         # No parent
    })


@login_required
@require_POST
def reply_comment(request, comment_id):
    """
    Accepts either form-encoded or JSON body. Prevents near-duplicate replies
    from being created by the same author with identical text within 5 seconds.
    """
    parent = get_object_or_404(Comment, id=comment_id)
    article = parent.article
    author = request.user.employee

    # support both JSON and form-encoded payloads
    body = ""
    if request.content_type and "application/json" in request.content_type:
        try:
            payload = json.loads(request.body.decode("utf-8") or "{}")
            body = (payload.get("body") or "").strip()
        except json.JSONDecodeError:
            body = ""
    else:
        body = (request.POST.get("body") or "").strip()

    if not body:
        return JsonResponse({"success": False, "error": "Empty reply not allowed"}, status=400)

    # Prevent duplicate replies within short window (increase window to 5s)
    recent_reply = Comment.objects.filter(
        article=article, parent=parent, author=author, body=body
    ).order_by("-created_at").first()

    if recent_reply and (timezone.now() - recent_reply.created_at).total_seconds() < 5:
        return JsonResponse({"success": False, "error": "Duplicate reply detected"}, status=400)

    reply = Comment.objects.create(
        article=article,
        author=author,
        parent=parent,
        body=body
    )

    return JsonResponse({
        "success": True,
        "id": reply.id,
        "author": author.name,
        "profile_image": author.profile_image.url if getattr(author, "profile_image", None) else "",
        "body": reply.body,
        "created_at": reply.created_at.isoformat(),
        "parent": parent.id,
        "parent_author": parent.author.name, 
         "parent_body": parent.body
    })


@login_required
def delete_comment(request, comment_id):
    if request.method == "POST":
        comment = get_object_or_404(Comment, id=comment_id)

        # Optional: only allow author or admin to delete
        if comment.author != request.user.employee and not request.user.is_superuser:
            return JsonResponse({"success": False, "error": "Permission denied"}, status=403)

        comment.delete()
        return JsonResponse({"success": True})

    return JsonResponse({"success": False, "error": "Invalid request"}, status=400)
