from django.conf.urls import patterns, include, url
from singleDirected.views import index, user, job

urlpatterns = patterns(
    '',
    url(r'^\d+$', index, name='index'),
    url(r'^root/(?P<user_id>\d+)', user, name='user'),
    url(r'^user/(?P<user_id>\d+)/type/(?P<job>[a-zA-Z\._]+)$', job, name='job'),
)
