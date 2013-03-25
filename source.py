import MySQLdb as mdb
import json

def application(environ, start_response):

    con = None

    try:
        con = mdb.connect('localhost', 'coge', '123coge321', 'coge');

        cur = con.cursor()
        cur.execute("SELECT * FROM user LEFT JOIN log ON user.user_id = log.user_id LIMIT 500;")

        users = {}

        for row in cur :

            name = row[2]
            type = row[12]

            if name not in users:
                users[name] = { "name" : name,
                                "type" : "User",
                                "children" : {},
                              }

            if type not in users[name]["children"]:
                users[name]["children"][type] = { "name" : type,
                                                  "type" : "Job",
                                                  "children" : [],
                                                }

            job = { "link" : row[14],
                    "log_id" : row[9],
                  }

            users[name]["children"][type]["children"].append(job)

        def format(user_tuple):
            user = user_tuple[1]

            def format_types(types_tuple):
                return types_tuple[1]

            return {"name" : user["name"],
                    "children" : map(format_types, user["children"].iteritems())}

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

    response_headers = [('Content-Type', 'application/json')]
    start_response(status, response_headers)

    return response_body
