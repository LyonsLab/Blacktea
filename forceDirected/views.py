from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from django.db.models import Count
import json

from .models import User, Log

# Create your views here.
def index(request):
    return render(request, 'forceDirected/index.html', "text/html")

def users(request):
    users = [user.__json__() for user in User.objects.all()]

    response = { "name" : "root",
                 "children" : users
               }

    return HttpResponse(json.dumps(response), "text/json")

def user_details(request, user_id):
    details = Log.objects.filter(user=user_id).values('page', 'user').annotate(count=Count('link'))

    response = []
    for detail in details:
        response.append({ "name" : detail['page'],
                          "user_id" : detail['user'],
                          "type" : "Type",
                          "size" : detail['count'],
                          "children" : []
                        })


    return HttpResponse(json.dumps(response), "text/json")

def job(request, user_id, job):
    details = Log.objects.filter(user=user_id, page=job).values('page', 'user', 'link', 'time', 'log_id')

    response = []
    for detail in details:
        response.append({ "name" : detail['page'],
                          "user_id" : detail['user'],
                          "type" : "Job",
                          "link" : detail['link'],
                          "date" : str(detail['time']),
                          "log_id" : detail['log_id'],
                        })


    return HttpResponse(json.dumps(response), "text/json")
