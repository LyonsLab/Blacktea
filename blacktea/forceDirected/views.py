from django.http import HttpResponse
from django.shortcuts import render
import json

from forceDirected.models import User

# Create your views here.
def index(request):
    return render(request, 'forceDirected/index.html', "text/html")

def source(request):
    users = [user.__json__() for user in User.objects.all()]

    response = { "name" : "root",
                 "children" : users
               }
    response = json.dumps(response)
    return HttpResponse(response, "text/json")
