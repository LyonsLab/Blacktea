from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from django.db.models import Count
import json

from singleDirected.models import User, Log

# Create your views here.
def index(request):
    return render(request, 'singleDirected/index.html', {"BASE_URL" : "/rchasman/standalone/"}, content_type="text/html")

def user(request, user_id):
    users = User.objects.get(user_id = user_id).__dict__
    size = Log.objects.filter(user=user_id).count()
    details = Log.objects.filter(user=user_id).values('page', 'user').annotate(size=Count('link'))

    children = []
    for detail in details:
        children.append({ "name" : detail['page'],
                    "user_id" : detail['user'],
                    "type" : "Type",
                    "size" : detail['size'],
                    "children" : []
                    })

    response = { "name" : users['user_name'],
                 "user_id" : user_id,
                 "type" : "User",
                 "size" : size,
                 "children" : children
               }

    return HttpResponse(json.dumps(response), "text/json")

def job(request, user_id, job):
    details = Log.objects.filter(user=user_id, page=job).values()

    response = []
    for detail in details:
        response.append({ "name" : detail['page'],
                    "user_id" : detail['user_id'],
                    "type" : "Job",
                    "link" : detail['link'],
                    "date" : str(detail['time']),
                    "log_id" : detail['log_id'],
                    })


    return HttpResponse(json.dumps(response), "text/json")
