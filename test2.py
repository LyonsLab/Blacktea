import MySQLdb as mdb
import sys

con = None

try:
    con = mdb.connect('localhost', 'coge', '123coge321', 'coge');

    cur = con.cursor()
    cur.execute("SELECT * FROM user")

    row = cur.fetchone()
    print "".join((str(x) for x in row))

except mdb.Error, e:
    print "Error %d: %s" % (e.args[0], e.args[1])

finally:
    if con:
        con.close()
        sys.exit(1)
