# See https://docs.gunicorn.org/en/stable/settings.html
import multiprocessing

user = 'nginx'
# certfile = '/etc/ssl/certs/bundle.crt'
# keyfile = '/etc/ssl/private/key.key'

wsgi_app = 'wsgi:app'

bind = 'localhost:6002'

workers = 1
worker_class = "eventlet"

reload = True
debug = True
