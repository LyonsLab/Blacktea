from cgi import parse_qs, escape
import simplejson
import urllib

def application(environ, start_response):

    d = parse_qs(environ['QUERY_STRING'])

    # Response_body has now more than one string
    response_body = ['The Begining\n',
                    '*' * 30 + '\n',
                    '\n'.join(['%s: %s' % (k, v) for (k, v) in d.items()]),
                    '\n' + '*' * 30,
                    '\nThe End']

    status = '200 OK'
    response_headers = [('Content-Type', 'text/plain')]
    start_response(status, response_headers)

    return response_body
