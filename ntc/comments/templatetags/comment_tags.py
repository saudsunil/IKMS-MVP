# from django import template

# register = template.Library()

# @register.filter
# def all_replies_flat(comment):
#     result = []

#     def collect(c):
#         if c is None:
#             return
#         # c must have comment_set
#         children = getattr(c, "comment_set", None)
#         if not children:
#             return

#         for child in children.all():
#             result.append(child)
#             collect(child)

#     collect(comment)
#     return result

from django import template

register = template.Library()

@register.filter
def all_replies_flat(comment):
    """
    Return all flat replies that belong to this top-level comment
    """
    return comment.replies.all().order_by("created_at")
