from django.http import HttpResponse
from forceDirected.models import User
import json
# Create your views here.
def index(request):
    users = User.objects.all()
    response = ', '.join([" ".join([str(getattr(p, f.name)) for f in p._meta.fields]) for p in users])
    return HttpResponse(response)
