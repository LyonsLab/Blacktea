from django.conf.urls import patterns, include, url
from forceDirected.views import index, users, user_details, job 

urlpatterns = patterns(
    '',
    url(r'^$', index, name='index'),
    url(r'^root', users, name='users'),
    url(r'^user/(?P<user_id>\d+)/type/(?P<job>[a-zA-Z\._]+)$', job, name='job'),
    url(r'^user/(?P<user_id>\d+)$', user_details, name='user_details'),
)
