from django.conf.urls import patterns, include, url
from forceDirected.views import index, source

urlpatterns = patterns(
    '',
    url(r'^$', index, name='index'),
    url(r'^source', source, name='source'),
)
