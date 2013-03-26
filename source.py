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
            cur.execute("SELECT * FROM user;")

            users = {}

            for row in cur :

                user_id = row[0]
                user_name = row[1]

                if user_id not in users:
                    users[user_id] = {"name" : user_name,
                                      "user_id" : user_id}

            def format(user_tuple):
                user = user_tuple[1]
                return {"name" : user["name"],
                        "user_id" : user["user_id"],
                        "type" : "User",
                        "children" : []}

            users_formatted = map(format, users.iteritems())

            response_body = { "name" : "root",
                              "children" : users_formatted,
                            }

            status = '200 OK'
            response_body = json.dumps(response_body)

        except mdb.Error, e:
            response_body = "Error %d: %s" % (e.args[0], e.args[1])
            status = '500 Internal Server Error'

        finally:
            if con:
                con.close()

    elif user and job:
        try:
            cur.execute("SELECT * FROM user LEFT JOIN log ON user.user_id = log.user_id where user.user_id = %s AND log.page = %s;" % (user,job))

            jobs = []

            for row in cur :

                user_id = row[0]
                user_name = row[1]
                type = row[12]


                job = { "link" : row[14],
                        "log_id" : row[9],
                      }

                jobs.append(job)

            status = '200 OK'
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
            cur.execute("SELECT * FROM user LEFT JOIN log ON user.user_id = log.user_id where user.user_id = %s" % user)

            types = {}

            for row in cur :

                type = row[12]

                if type not in types:
                    types[type] = { "name" : type }

            def format(types_tuple):
                type = types_tuple[1]

                return { "name" : type["name"],
                         "type" : "Type",
                         "children" : [],
                       }

            types_formatted = map(format, types.iteritems())

            status = '200 OK'
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
