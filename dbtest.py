#!/usr/bin/python
# -*- coding: utf-8 -*-

import MySQLdb as mdb
import sys

con = None

try:
    con = mdb.connect('localhost', 'coge', '123coge321', 'coge');

    cur = con.cursor()
    cur.execute("SELECT * FROM user")

    row = cur.fetchone()

    data = ""

    while row is not None:
        data = data + ("<td>" + " ".join((str(x) for x in row)) + "</td>")
        row = cur.fetchone()

    print data

except mdb.Error, e:
    print "Error %d: %s" % (e.args[0], e.args[1])
    sys.exit(1);

finally:
    if con:
        con.close()
