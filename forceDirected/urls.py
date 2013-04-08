from django.conf.urls import patterns, include, url
from forceDirected.views import index, users, user, job

urlpatterns = patterns(
    '',
    url(r'^$', index, name='index'),
    url(r'^users', users, name='users'),
    url(r'^user/(?P<user_id>\d+)/type/(?P<job>[a-zA-Z\._]+)$', job, name='job'),
    url(r'^user/(?P<user_id>\d+)$', user, name='user'),
)
