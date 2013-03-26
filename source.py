import MySQLdb as mdb
import json
from cgi import parse_qs, escape

def application(environ, start_response):

    # Get the passed params of the AJAX request
    d = parse_qs(environ['QUERY_STRING'])

    user = d.get('user', [''])[0]
    job = d.get('job', [''])[0]

    # Connection info
    con = mdb.connect('localhost', 'coge', '123coge321', 'coge');
    cur = con.cursor()

    response_body = ''
    status = '200 OK'

    if user == '' and job == '':
        try:
            cur.execute("SELECT *, (SELECT count(page) FROM log where user_id = user.user_id) AS count from user;")

            users = {}

            for row in cur :

                user_id = row[0]
                user_name = row[1]
                user_email = row[4]
                user_date = row[7]
                user_size = row[9]

                if user_id not in users:
                    users[user_id] = {"name" : user_name,
                                      "user_id" : user_id,
                                      "email" : user_email,
                                      "size" : user_size,
                                      "date" : str(user_date),
                                     }

            def format(user_tuple):
                user = user_tuple[1]
                return {"name" : user["name"],
                        "user_id" : user["user_id"],
                        "email" : user["email"],
                        "size" : user["size"],
                        "date" : user["date"],
                        "type" : "User",
                        "children" : []}

            users_formatted = map(format, users.iteritems())

            response_body = { "name" : "root",
                              "children" : users_formatted,
                            }

            response_body = json.dumps(response_body)

        except mdb.Error, e:
            response_body = "Error %d: %s" % (e.args[0], e.args[1])
            status = '500 Internal Server Error'

        finally:
            if con:
                con.close()

    elif user and job:
        try:
            cur.execute("SELECT * FROM log where log.user_id = %s AND log.page like %s GROUP BY link;" % (user, job));

            jobs = []

            for row in cur :

                job = { "link" : row[5],
                        "date" : str(row[1]),
                        "type" : "Job",
                        "log_id" : row[0],
                      }

                jobs.append(job)

            response_body = json.dumps(jobs)

        except mdb.Error, e:
            response_body = "Error %d: %s" % (e.args[0], e.args[1])
            status = '500 Internal Server Error'

        finally:
            if con:
                con.close()


    # When passed a only a user arg, return a tree of jobs that user has run.
    else:
        try:
            cur.execute("SELECT page, count(distinct link) AS count FROM log where user_id = %s group by page;" % user)

            types = {}

            for row in cur :

                if row[0] is not None:
                    type = row[0]
                    size = row[1]
                else:
                    response_body = {}
                    break

                # print >> environ['wsgi.errors'], row[0]

                if type not in types:
                    types[type] = { "name" : type,
                                    "size" : size,
                                  }

            def format(types_tuple):
                type = types_tuple[1]

                return { "name" : type["name"],
                         "type" : "Type",
                         "size" : type["size"],
                         "user_id" : user,
                         "children" : [],
                       }

            types_formatted = map(format, types.iteritems())

            response_body = json.dumps(types_formatted)

        except mdb.Error, e:
            response_body = "Error %d: %s" % (e.args[0], e.args[1])
            status = '500 Internal Server Error'

        finally:
            if con:
                con.close()

    response_headers = [('Content-Type', 'application/json')]
    start_response(status, response_headers)

    return response_body
