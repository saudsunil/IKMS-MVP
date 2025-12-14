from django import template

register = template.Library()

@register.filter
def all_replies_flat(comment):
    result = []

    def collect(c):
        if c is None:
            return
        # c must have comment_set
        children = getattr(c, "comment_set", None)
        if not children:
            return

        for child in children.all():
            result.append(child)
            collect(child)

    collect(comment)
    return result
