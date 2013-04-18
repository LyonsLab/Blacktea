Blacktea
========

Analytics and Data Visualizations

Django 5.1.1 Backend, Served by Apache. Frontend is Built on M. Bostock's D3.js Library.

##Dependencies##
None for now.

##Config/Install##
Configure blacktea/setttings.py for your box and then run `python manage.py collectstatic`.

##Endpoints##
###Rendered Endpoints###
`/` - Force directed graph of all users around a root node.

`/standalone/<user_id>` - Force directed graph of the specified user  &lt;user_id> as the root node.

###Data Endpoints###
All endpoints return a JSON object, the endpoints of these objects and their descriptions are described below.

####All Users####
`/root` - A generic root node with children being an array of user objects pulled from the database.

`/user/<user_id>` - An array of all page/job type objects for the user specified by  &lt;user_id>.

`/user/<user_id/type/<page_name>` - An array of all individual page/job objects ran by the user specified by  &lt;user_id> and the page type specified by  &lt;page_name>.

####Single User####
`/standalone/root/<user_id>/` - An array of all page/job objects ran by the user specified by  &lt;user_id>.

`/standalone/root/<user_id>/<page_name>/<page_name>/.../` - An array of all page job/objects that are explicitly stated by  &lt;page_name> in the URI. Example: http://geco.iplantcollaborative.org/blacktea/standalone/root/1/gevo/synmap/cogeblast/

`/standalone/user/<user_id>/type/<page_name>` - An array of all individual page/job objects ran by the user specified by  &lt;user_id> and the page type specified by  &lt;page_name>.
